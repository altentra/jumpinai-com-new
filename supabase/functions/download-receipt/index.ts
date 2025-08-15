import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session.payment_intent) {
      throw new Error("No payment intent found for this session");
    }

    // Get the payment intent to find the charge
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
    
    if (!paymentIntent.charges || paymentIntent.charges.data.length === 0) {
      throw new Error("No charges found for this payment");
    }

    const charge = paymentIntent.charges.data[0];
    
    if (!charge.receipt_url) {
      throw new Error("Receipt not available for this charge");
    }

    return new Response(JSON.stringify({ 
      receiptUrl: charge.receipt_url,
      success: true 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error downloading receipt:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});