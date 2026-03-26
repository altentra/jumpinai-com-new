import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurchaseNotification {
  type: 'product' | 'subscription';
  customerEmail: string;
  customerName?: string;
  amount: number;
  currency: string;
  productName?: string;
  subscriptionTier?: string;
  orderId?: string;
  stripeSessionId?: string;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== Purchase notification function started ===");
    
    const notification: PurchaseNotification = await req.json();
    console.log("📧 Sending purchase notification:", notification);

    const { 
      type, 
      customerEmail, 
      customerName,
      amount, 
      currency, 
      productName, 
      subscriptionTier,
      orderId,
      stripeSessionId,
      timestamp 
    } = notification;

    // Format amount
    const formattedAmount = `${currency.toUpperCase()} $${(amount / 100).toFixed(2)}`;
    
    // Determine subject and content based on type
    let subject: string;
    let htmlContent: string;
    
    if (type === 'subscription') {
      subject = `🎉 New Pro Subscription - ${customerEmail}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <!-- Header with Logo -->
              <div style="text-align: center; padding: 30px 20px 20px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <img src="https://jumpinai.com/images/jumpinai-logo-email.png" alt="JumpinAI" style="max-width: 120px; height: auto; border-radius: 12px;" />
              </div>
              
              <!-- Content -->
              <div style="padding: 30px;">
                <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 20px 0; text-align: center;">🎉 New Pro Subscription!</h1>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px;">Customer Details:</h2>
                  <p style="margin: 5px 0; color: #333;"><strong>Email:</strong> ${customerEmail}</p>
                  ${customerName ? `<p style="margin: 5px 0; color: #333;"><strong>Name:</strong> ${customerName}</p>` : ''}
                  <p style="margin: 5px 0; color: #333;"><strong>Subscription Tier:</strong> ${subscriptionTier || 'JumpinAI Pro'}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Amount:</strong> ${formattedAmount}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Date:</strong> ${new Date(timestamp).toLocaleString()}</p>
                </div>
                
                <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
                  <p style="margin: 0; color: #059669; font-size: 14px;">
                    <strong>💰 Monthly Recurring Revenue Increased!</strong><br>
                    This customer will now have access to all Pro features including blueprints, advanced workflows, and premium prompts.
                  </p>
                </div>
                
                ${stripeSessionId ? `
                <div style="margin-top: 20px; padding: 15px; background-color: #f1f5f9; border-radius: 8px;">
                  <p style="margin: 0; font-size: 13px; color: #64748b;">
                    <strong>Stripe Session ID:</strong> ${stripeSessionId}
                  </p>
                </div>
                ` : ''}
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Questions? We're always here to help!</p>
                <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">Email us at <a href="mailto:info@jumpinai.com" style="color: #667eea; text-decoration: none;">info@jumpinai.com</a></p>
                <p style="margin: 0 0 5px 0; color: #999; font-size: 13px; font-weight: bold;">JumpinAI.</p>
                <p style="margin: 0 0 10px 0; color: #999; font-size: 12px;">Your Personalized AI Adaptation Studio.</p>
              </div>
              
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      subject = `🛒 New Product Purchase - ${productName}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <!-- Header with Logo -->
              <div style="text-align: center; padding: 30px 20px 20px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <img src="https://jumpinai.com/images/jumpinai-logo-email.png" alt="JumpinAI" style="max-width: 120px; height: auto; border-radius: 12px;" />
              </div>
              
              <!-- Content -->
              <div style="padding: 30px;">
                <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 20px 0; text-align: center;">🛒 New Product Purchase!</h1>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px;">Purchase Details:</h2>
                  <p style="margin: 5px 0; color: #333;"><strong>Customer:</strong> ${customerEmail}</p>
                  ${customerName ? `<p style="margin: 5px 0; color: #333;"><strong>Name:</strong> ${customerName}</p>` : ''}
                  <p style="margin: 5px 0; color: #333;"><strong>Product:</strong> ${productName || 'Digital Product'}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Amount:</strong> ${formattedAmount}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Date:</strong> ${new Date(timestamp).toLocaleString()}</p>
                  ${orderId ? `<p style="margin: 5px 0; color: #333;"><strong>Order ID:</strong> ${orderId}</p>` : ''}
                </div>
                
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; color: #92400e; font-size: 14px;">
                    <strong>💎 New Jump in AI Purchase!</strong><br>
                    Customer has purchased one of your AI workflow guides. They'll receive download access via email.
                  </p>
                </div>
                
                ${stripeSessionId ? `
                <div style="margin-top: 20px; padding: 15px; background-color: #f1f5f9; border-radius: 8px;">
                  <p style="margin: 0; font-size: 13px; color: #64748b;">
                    <strong>Stripe Session ID:</strong> ${stripeSessionId}
                  </p>
                </div>
                ` : ''}
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Questions? We're always here to help!</p>
                <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">Email us at <a href="mailto:info@jumpinai.com" style="color: #667eea; text-decoration: none;">info@jumpinai.com</a></p>
                <p style="margin: 0 0 5px 0; color: #999; font-size: 13px; font-weight: bold;">JumpinAI.</p>
                <p style="margin: 0 0 10px 0; color: #999; font-size: 12px;">Your Personalized AI Adaptation Studio.</p>
              </div>
              
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Send email notification to admin
    const emailResponse = await resend.emails.send({
      from: "JumpinAI Notifications <notifications@jumpinai.com>",
      to: ["info@jumpinai.com"],
      subject: subject,
      html: htmlContent,
    });

    console.log("✅ Purchase notification email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Purchase notification sent successfully",
        emailId: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error("💥 Error sending purchase notification:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Failed to send purchase notification",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
};

Deno.serve(handler);
