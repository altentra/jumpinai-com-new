import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Checks current user's subscription in Stripe and upserts into subscribers table
serve(async (req) => {
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

    // Check for existing subscriber record with manual subscription
    const { data: existingSub } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("email", userEmail)
      .maybeSingle();
    
    const userId = existingSub?.user_id || user.id;

    // If manual subscription exists and is still valid, return it without checking Stripe
    if (existingSub?.subscribed && existingSub?.subscription_end) {
      const subEndDate = new Date(existingSub.subscription_end);
      const now = new Date();
      
      // If subscription hasn't expired, return the manual subscription
      if (subEndDate > now) {
        return new Response(JSON.stringify({
          subscribed: existingSub.subscribed,
          subscription_tier: existingSub.subscription_tier,
          subscription_end: existingSub.subscription_end,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    // Otherwise, check Stripe for active subscription
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });

    if (customers.data.length === 0) {
      await supabaseClient.from("subscribers").upsert(
        {
          email: userEmail,
          user_id: userId,
          stripe_customer_id: null,
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier: string | null = null;
    let subscriptionEnd: string | null = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      const price = subscription.items.data[0].price;
      const amount = price.unit_amount || 0;
      
      // Map Stripe prices to subscription tiers
      if (amount === 900) {
        subscriptionTier = "Starter Plan";
      } else if (amount === 2500) {
        subscriptionTier = "Pro Plan";
      } else if (amount === 4900) {
        subscriptionTier = "Growth Plan";
      } else {
        subscriptionTier = "Free Plan";
      }
    }

    await supabaseClient.from("subscribers").upsert(
      {
        email: userEmail,
        user_id: userId,
        stripe_customer_id: customerId,
        subscribed: hasActiveSub,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
    }), {
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
