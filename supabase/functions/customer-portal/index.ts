import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Creates a Stripe Customer Portal session for the current user
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

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

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId: string;
    if (customers.data.length === 0) {
      // Create a Stripe customer for this user if one doesn't exist
      const created = await stripe.customers.create({
        email: userEmail,
        metadata: { supabase_user_id: user.id || '' },
      });
      customerId = created.id;
    } else {
      customerId = customers.data[0].id;
    }

    // Parse request body to get return URL information
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // No body provided, use defaults
    }
    
    const source = body.source || 'dashboard';
    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    // Determine return URL based on source
    let returnUrl = `${origin}/dashboard/subscription`;
    switch (source) {
      case 'pricing':
        returnUrl = `${origin}/pricing`;
        break;
      case 'dashboard-home':
        returnUrl = `${origin}/dashboard`;
        break;
      case 'dashboard-subscription':
        returnUrl = `${origin}/dashboard/subscription`;
        break;
      default:
        returnUrl = `${origin}/dashboard/subscription`;
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return new Response(JSON.stringify({ url: portalSession.url }), {
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
