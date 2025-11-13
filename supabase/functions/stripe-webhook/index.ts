import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

const logoUrl = "https://jumpinai.com/images/jumpinai-logo-email.png";

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return new Response("Webhook not configured", { status: 500 });
  }

  try {
    const body = await req.text();
    
    // Verify webhook signature using async method for Deno
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    
    console.log("Webhook event received:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout completed:", session.id);

        // Get customer email
        const customerEmail = session.customer_email || 
          (session.customer_details?.email) || 
          session.metadata?.user_email;

        if (!customerEmail) {
          console.error("No customer email found");
          break;
        }

        // Check if this is a subscription upgrade
        if (session.metadata?.type === 'subscription_upgrade') {
          await handleSubscriptionUpgrade(session, customerEmail);
        } else if (session.mode === "subscription") {
          // Handle new subscription
          await handleSubscriptionSuccess(session, customerEmail);
        } else if (session.mode === "payment") {
          // Handle one-time payment (credits)
          await handlePaymentSuccess(session, customerEmail);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription event:", subscription.id);
        
        // Handle subscription updates after upgrade payment
        if (subscription.metadata?.upgrade_processed === 'true') {
          console.log("Subscription updated after upgrade");
          const userId = subscription.metadata?.user_id;
          const newPlanName = subscription.metadata?.plan_name;
          
          if (userId && newPlanName) {
            // Check if this is a manual subscription (protected)
            const { data: existing } = await supabase
              .from('subscribers')
              .select('manual_subscription')
              .eq('user_id', userId)
              .single();
            
            if (existing?.manual_subscription) {
              console.log('⚠️ Skipping update - manual subscription is protected');
              break;
            }
            
            // Set change source for audit log
            await supabase.rpc('set_config', {
              setting_name: 'app.change_source',
              setting_value: 'stripe_webhook'
            });
            
            // Update subscriber record
            await supabase
              .from('subscribers')
              .update({
                subscribed: true,
                subscription_tier: newPlanName,
                subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', userId);
            
            console.log(`✅ Updated subscription tier to ${newPlanName}`);
          }
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Invoice paid:", invoice.id);
        
        // Handle recurring subscription payments
        if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
          console.log("Processing recurring subscription payment");
          
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const customerEmail = typeof invoice.customer_email === 'string' 
            ? invoice.customer_email 
            : (await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer).email;
          
          if (!customerEmail) {
            console.error("No customer email found for recurring payment");
            break;
          }

          // Find user by email
          const { data: userData } = await supabase.auth.admin.listUsers();
          const user = userData?.users?.find(u => u.email === customerEmail);
          
          if (!user) {
            console.error("User not found for recurring payment:", customerEmail);
            break;
          }

          // Get plan details from subscription metadata
          const planName = subscription.metadata?.plan_name || "Subscription";
          const creditsPerMonth = parseInt(subscription.metadata?.credits_per_month || "0");

          if (creditsPerMonth > 0) {
            console.log(`Adding ${creditsPerMonth} recurring credits to user ${user.id}`);
            const { error: creditsError } = await supabase.rpc('add_user_credits', {
              p_user_id: user.id,
              p_credits: creditsPerMonth,
              p_description: `${planName} subscription renewal - ${creditsPerMonth} monthly credits`,
              p_reference_id: invoice.id
            });

            if (creditsError) {
              console.error('Error adding recurring credits:', creditsError);
            } else {
              console.log(`✅ Successfully added ${creditsPerMonth} recurring credits`);
            }
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});

async function handleSubscriptionSuccess(
  session: Stripe.Checkout.Session,
  customerEmail: string
) {
  try {
    const userId = session.metadata?.user_id;
    const planName = session.metadata?.plan_name || "Subscription";
    const creditsPerMonth = parseInt(session.metadata?.credits_per_month || "0");
    const amount = session.amount_total || 0;
    const customerName = customerEmail.split('@')[0];

    // **CRITICAL: Add monthly credits to user's balance**
    if (userId && creditsPerMonth > 0) {
      console.log(`Adding ${creditsPerMonth} subscription credits to user ${userId}`);
      const { error: creditsError } = await supabase.rpc('add_user_credits', {
        p_user_id: userId,
        p_credits: creditsPerMonth,
        p_description: `${planName} subscription - ${creditsPerMonth} monthly credits added`,
        p_reference_id: session.id
      });

      if (creditsError) {
        console.error('Error adding subscription credits:', creditsError);
      } else {
        console.log(`✅ Successfully added ${creditsPerMonth} credits to user ${userId}`);
      }
    }

    // Send welcome email to customer
    console.log("Sending subscription welcome email to:", customerEmail);
    await resend.emails.send({
      from: "JumpinAI <welcome@jumpinai.com>",
      to: [customerEmail],
      subject: `🎉 Welcome to ${planName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 32px 24px 24px 24px;">
            <img 
              src="https://jumpinai.com/logo.png" 
              alt="JumpinAI Logo" 
              style="width: 84px; height: 84px; display: block; border-radius: 12px; margin: 0 auto;"
            />
          </div>

          <div style="background: linear-gradient(135deg, #374151 0%, #1f2937 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${planName}! 🎉</h1>
            <p style="color: #d1d5db; margin: 10px 0 0 0; font-size: 16px;">Your subscription is now active</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 25px; border-radius: 8px;">
              <h2 style="color: #374151; margin-bottom: 20px;">Hi ${customerName}!</h2>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for subscribing to ${planName}! Your payment has been confirmed and <strong>${creditsPerMonth} credits</strong> have been added to your account.
              </p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
                <div style="font-size: 48px; font-weight: bold; color: #374151;">${creditsPerMonth}</div>
                <div style="font-size: 18px; color: #6b7280;">Credits Added to Your Account</div>
                <div style="font-size: 14px; color: #9ca3af; margin-top: 5px;">Renews monthly</div>
              </div>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="https://www.jumpinai.com/dashboard" 
                   style="background: linear-gradient(135deg, #374151 0%, #1f2937 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                  Start Using Your Credits Now
                </a>
              </div>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 18px; margin-top: 20px; text-align: center;">
            <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 13px;">Questions? We're always here to help!</p>
            <p style="margin: 0; color: #1f2937; font-size: 13px;">
              Email us at <a href="mailto:info@jumpinai.com" style="color: #3b82f6; text-decoration: none; font-weight: 600;">info@jumpinai.com</a>
            </p>
          </div>

          <div style="padding: 20px 24px; text-align: center; background: #f9fafb; margin-top: 14px; border-radius: 6px;">
            <p style="color: #111827; margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">
              JumpinAI.
            </p>
            <p style="color: #6b7280; margin: 0 0 14px 0; font-size: 13px;">
              Your Personalized AI Adaptation Studio.
            </p>
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              <a href="https://www.jumpinai.com/dashboard/subscription" style="color: #6b7280; text-decoration: underline;">Manage Subscription</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    // Send notification to admin
    console.log("Sending admin notification for subscription");
    await resend.emails.send({
      from: "JumpinAI Notifications <notifications@jumpinai.com>",
      to: ["info@jumpinai.com"],
      subject: `💰 New Subscription: ${planName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #059669; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">💰 New Subscription Payment Confirmed</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 25px; border-radius: 8px;">
              <h2 style="color: #374151; margin-bottom: 20px;">Subscription Details</h2>
              
              <div style="margin-bottom: 15px;">
                <strong>Customer:</strong> ${customerEmail}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Plan:</strong> ${planName}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Monthly Credits:</strong> ${creditsPerMonth}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Amount:</strong> $${(amount / 100).toFixed(2)}/month
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Stripe Session:</strong> ${session.id}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ Subscription emails sent successfully");
  } catch (error) {
    console.error("Error handling subscription:", error);
  }
}

async function handleSubscriptionUpgrade(
  session: Stripe.Checkout.Session,
  customerEmail: string
) {
  try {
    console.log('🔄 Processing subscription upgrade...');
    console.log('Session ID:', session.id);
    
    const userId = session.metadata?.user_id;
    const newPlanId = session.metadata?.new_plan_id;
    const newPlanName = session.metadata?.new_plan_name;
    const currentPlanName = session.metadata?.current_plan_name;
    const creditsToAdd = parseInt(session.metadata?.credits_to_add || "0");
    const newCreditsPerMonth = parseInt(session.metadata?.new_credits_per_month || "0");

    console.log(`Upgrading user ${userId} from ${currentPlanName} to ${newPlanName}`);

    if (!userId || !newPlanId) {
      console.error('Missing required upgrade metadata');
      return;
    }

    // Get user's current subscription
    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!subscriber || !subscriber.stripe_customer_id) {
      console.error('No active subscription found for user');
      return;
    }

    // Get the active Stripe subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: subscriber.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      console.error('No active Stripe subscription found');
      return;
    }

    const currentSubscription = subscriptions.data[0];

    // Get the new plan's Stripe price
    const { data: newPlan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', newPlanId)
      .single();

    if (!newPlan || !newPlan.stripe_price_id) {
      console.error('New plan or price not found');
      return;
    }

    // Update the Stripe subscription to the new plan
    console.log('Updating Stripe subscription...');
    const updatedSubscription = await stripe.subscriptions.update(
      currentSubscription.id,
      {
        items: [{
          id: currentSubscription.items.data[0].id,
          price: newPlan.stripe_price_id,
        }],
        proration_behavior: 'none', // We already charged the prorated amount
        metadata: {
          user_id: userId,
          user_email: customerEmail,
          plan_id: newPlanId,
          plan_name: newPlanName,
          credits_per_month: newCreditsPerMonth.toString(),
          upgrade_processed: 'true',
        },
      }
    );

    console.log('Stripe subscription updated:', updatedSubscription.id);

    // Add the upgrade credits immediately
    if (creditsToAdd > 0) {
      console.log(`Adding ${creditsToAdd} upgrade credits...`);
      const { error: creditsError } = await supabase.rpc('add_user_credits', {
        p_user_id: userId,
        p_credits: creditsToAdd,
        p_description: `Upgrade to ${newPlanName} - Additional credits`,
        p_reference_id: session.id,
      });

      if (creditsError) {
        console.error('Error adding upgrade credits:', creditsError);
      } else {
        console.log(`✅ Successfully added ${creditsToAdd} credits`);
      }
    }

    // Check if this is a manual subscription (protected)
    const { data: existingSub } = await supabase
      .from('subscribers')
      .select('manual_subscription')
      .eq('user_id', userId)
      .single();
    
    if (existingSub?.manual_subscription) {
      console.log('⚠️ Cannot upgrade - manual subscription is protected');
      throw new Error('Manual subscriptions cannot be upgraded through Stripe');
    }
    
    // Set change source for audit log
    await supabase.rpc('set_config', {
      setting_name: 'app.change_source',
      setting_value: 'stripe_webhook_upgrade'
    });
    
    // Update subscriber record
    const subscriptionEnd = new Date(updatedSubscription.current_period_end * 1000);
    await supabase
      .from('subscribers')
      .update({
        subscribed: true,
        subscription_tier: newPlanName,
        subscription_end: subscriptionEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    console.log(`✅ Subscription upgraded to ${newPlanName}`);

  } catch (error) {
    console.error("Error handling subscription upgrade:", error);
  }
}

async function handlePaymentSuccess(
  session: Stripe.Checkout.Session,
  customerEmail: string
) {
  try {
    console.log('🔄 Processing credit purchase payment...');
    console.log('Session ID:', session.id);
    console.log('Session metadata:', JSON.stringify(session.metadata));
    
    const userId = session.metadata?.user_id;
    const packageId = session.metadata?.package_id;
    const credits = parseInt(session.metadata?.credits || "0");
    const amount = session.amount_total || 0;
    const customerName = session.metadata?.user_email?.split('@')[0] || customerEmail.split('@')[0];

    console.log(`User ID: ${userId}, Credits: ${credits}, Amount: ${amount}`);

    if (!userId) {
      console.error('❌ CRITICAL: Missing user_id in session metadata');
      console.error('Session metadata:', session.metadata);
      return;
    }

    if (!credits || credits === 0) {
      console.error('❌ CRITICAL: Missing or zero credits in session metadata');
      console.error('Session metadata:', session.metadata);
      return;
    }

    // Get package name for better description
    const packageName = session.metadata?.package_name || 'Credit Package';
    
    // **CRITICAL: Add credits to user's account**
    console.log(`💰 Adding ${credits} credits to user ${userId}...`);
    const { data: rpcData, error: creditsError } = await supabase.rpc('add_user_credits', {
      p_user_id: userId,
      p_credits: credits,
      p_description: `${packageName} - ${credits} credits purchased`,
      p_reference_id: session.id
    });

    if (creditsError) {
      console.error('❌ ERROR adding credits:', creditsError);
      console.error('RPC error details:', JSON.stringify(creditsError));
      // Don't throw - still try to update order and send email
    } else {
      console.log(`✅ Successfully added ${credits} credits to user ${userId}`);
      console.log('RPC response:', rpcData);
    }

    // Update order status
    console.log(`📦 Updating order status for session ${session.id}...`);
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        stripe_payment_intent_id: session.payment_intent as string || null
      })
      .eq('stripe_session_id', session.id)
      .select();

    if (orderError) {
      console.error('❌ Error updating order:', orderError);
      console.error('Order error details:', JSON.stringify(orderError));
    } else {
      console.log('✅ Order updated successfully:', orderData);
    }

    // Send confirmation email to customer
    console.log("Sending payment confirmation email to:", customerEmail);
    await resend.emails.send({
      from: "JumpinAI <downloads@jumpinai.com>",
      to: [customerEmail],
      subject: `✅ Payment Confirmed - ${credits} Credits Added`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 32px 24px 24px 24px;">
            <img 
              src="https://jumpinai.com/logo.png" 
              alt="JumpinAI Logo" 
              style="width: 84px; height: 84px; display: block; border-radius: 12px; margin: 0 auto;"
            />
          </div>

          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Payment Confirmed! ✅</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your credits have been added</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 25px; border-radius: 8px;">
              <h2 style="color: #374151; margin-bottom: 20px;">Hi ${customerName}!</h2>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Your payment has been successfully processed and <strong>${credits} credits</strong> have been added to your account!
              </p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
                <div style="font-size: 48px; font-weight: bold; color: #374151;">${credits}</div>
                <div style="font-size: 18px; color: #6b7280;">Credits Added</div>
              </div>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="https://www.jumpinai.com/dashboard" 
                   style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                  Use Your Credits Now
                </a>
              </div>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 18px; margin-top: 20px; text-align: center;">
            <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 13px;">Questions? We're always here to help!</p>
            <p style="margin: 0; color: #1f2937; font-size: 13px;">
              Email us at <a href="mailto:info@jumpinai.com" style="color: #3b82f6; text-decoration: none; font-weight: 600;">info@jumpinai.com</a>
            </p>
          </div>

          <div style="padding: 20px 24px; text-align: center; background: #f9fafb; margin-top: 14px; border-radius: 6px;">
            <p style="color: #111827; margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">
              JumpinAI.
            </p>
            <p style="color: #6b7280; margin: 0; font-size: 13px;">
              Your Personalized AI Adaptation Studio.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    // Send notification to admin
    console.log("Sending admin notification for credit purchase");
    await resend.emails.send({
      from: "JumpinAI Notifications <notifications@jumpinai.com>",
      to: ["info@jumpinai.com"],
      subject: `💳 New Credit Purchase: ${credits} credits`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #059669; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">💳 New Credit Purchase Confirmed</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 25px; border-radius: 8px;">
              <h2 style="color: #374151; margin-bottom: 20px;">Purchase Details</h2>
              
              <div style="margin-bottom: 15px;">
                <strong>Customer:</strong> ${customerEmail}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Credits:</strong> ${credits}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Amount:</strong> $${(amount / 100).toFixed(2)}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Stripe Session:</strong> ${session.id}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ Payment confirmation emails sent successfully");
  } catch (error) {
    console.error("Error handling payment:", error);
  }
}
