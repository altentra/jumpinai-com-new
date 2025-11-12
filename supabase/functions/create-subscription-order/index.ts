import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to create subscription order when subscription is successful
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Initialize Supabase with service role for database writes
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Missing session ID");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get the checkout session to get customer and subscription details
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });

    if (session.mode !== 'subscription' || !session.subscription) {
      throw new Error("Not a subscription session");
    }

    const subscription = session.subscription as Stripe.Subscription;
    const customer = session.customer as Stripe.Customer;
    const customerEmail = typeof customer === 'object' ? customer.email : null;

    if (!customerEmail) {
      throw new Error("No customer email found");
    }

    // Get subscription product for order tracking
    const { data: subscriptionProducts, error: productError } = await supabaseClient
      .from('products')
      .select('id')
      .eq('name', 'JumpinAI Pro Subscription')
      .single();

    if (productError || !subscriptionProducts) {
      console.error("Subscription product not found:", productError);
      throw new Error("Subscription product not found");
    }

    // Get user_id from email for better security
    let userId = null;
    try {
      const { data: users } = await supabaseClient.auth.admin.listUsers();
      const user = users.users.find(u => u.email === customerEmail);
      userId = user?.id || null;
    } catch (error) {
      console.warn("Could not fetch user_id for email:", customerEmail);
    }

    // Create order record for the subscription
    const { error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_email: customerEmail,
        user_id: userId,
        product_id: subscriptionProducts.id,
        amount: subscription.items.data[0].price.unit_amount || 1000, // Default to $10
        currency: subscription.currency || 'usd',
        status: 'paid',
        stripe_session_id: sessionId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (orderError) {
      console.error("Failed to create subscription order:", orderError);
      throw orderError;
    }

    console.log(`Created subscription order for ${customerEmail}, session: ${sessionId}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating subscription order:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});