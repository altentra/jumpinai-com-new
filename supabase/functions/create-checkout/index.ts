import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Creates a Stripe Checkout session for JumpinAI Pro ($10/month)
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");

    // Get user from Supabase Auth token
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    const userEmail = user.email;

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Reuse existing customer or create via Checkout
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    const existingCustomerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Parse request body to get source information
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // No body provided, use defaults
    }
    
    const source = body.source || 'unknown';
    
    // Determine success and cancel URLs based on source
    let successUrl = `${origin}/subscription-success`;
    let cancelUrl = `${origin}/pricing`;
    
    switch (source) {
      case 'pricing':
        cancelUrl = `${origin}/pricing`;
        break;
      case 'dashboard-home':
        cancelUrl = `${origin}/dashboard`;
        break;
      case 'dashboard-subscription':
        cancelUrl = `${origin}/dashboard/subscription`;
        break;
      default:
        cancelUrl = `${origin}/pricing`;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: existingCustomerId,
      customer_email: existingCustomerId ? undefined : userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "JumpinAI Pro" },
            unit_amount: 1000, // $10.00
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        source: source,
        user_id: user.id,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
