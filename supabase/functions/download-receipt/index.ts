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
    console.log("Download receipt function called");
    const { sessionId } = await req.json();
    console.log("Session ID received:", sessionId);

    if (!sessionId) {
      console.error("No session ID provided");
      throw new Error("Session ID is required");
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY not found");
      throw new Error("Stripe configuration error");
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    console.log("Retrieving checkout session from Stripe...");
    // Get the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Session retrieved:", { id: session.id, payment_intent: session.payment_intent });
    
    if (!session.payment_intent) {
      console.error("No payment intent found for session:", sessionId);
      throw new Error("No payment intent found for this session");
    }

    console.log("Retrieving payment intent...");
    // Get the payment intent with expanded charges
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string, {
      expand: ['charges']
    });
    console.log("Payment intent retrieved:", { id: paymentIntent.id, charges_count: paymentIntent.charges?.data?.length });
    
    // Try to get charges directly if not available in payment intent
    let charges;
    if (!paymentIntent.charges || paymentIntent.charges.data.length === 0) {
      console.log("No charges in payment intent, fetching charges directly...");
      charges = await stripe.charges.list({
        payment_intent: paymentIntent.id,
        limit: 1
      });
      console.log("Direct charges fetch result:", { count: charges.data.length });
    } else {
      charges = paymentIntent.charges;
    }
    
    if (!charges || charges.data.length === 0) {
      console.error("No charges found for payment intent:", paymentIntent.id);
      throw new Error("No charges found for this payment");
    }

    const charge = charges.data[0];
    console.log("Charge found:", { id: charge.id, receipt_url: charge.receipt_url });
    
    if (!charge.receipt_url) {
      console.error("No receipt URL found for charge:", charge.id);
      throw new Error("Receipt not available for this charge");
    }

    console.log("Success! Receipt URL:", charge.receipt_url);
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