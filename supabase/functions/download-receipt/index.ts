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
    
    // Handle both one-time payments and subscription checkouts
    if (session.payment_intent) {
      console.log("Retrieving payment intent...");
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string, {
        expand: ['charges']
      });
      console.log("Payment intent retrieved:", { id: paymentIntent.id, charges_count: paymentIntent.charges?.data?.length });

      let charges;
      if (!paymentIntent.charges || paymentIntent.charges.data.length === 0) {
        console.log("No charges in payment intent, fetching charges directly...");
        charges = await stripe.charges.list({ payment_intent: paymentIntent.id, limit: 1 });
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
      return new Response(JSON.stringify({ receiptUrl: charge.receipt_url, success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Subscription flow: session.payment_intent is often null; use the invoice
    if (session.invoice) {
      console.log("Retrieving invoice for session", sessionId);
      const invoice = await stripe.invoices.retrieve(session.invoice as string);
      console.log("Invoice retrieved:", { id: invoice.id, hosted_invoice_url: invoice.hosted_invoice_url, invoice_pdf: (invoice as any).invoice_pdf });

      if (invoice.hosted_invoice_url) {
        console.log("Success! Hosted invoice URL:", invoice.hosted_invoice_url);
        return new Response(JSON.stringify({ receiptUrl: invoice.hosted_invoice_url, success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      if ((invoice as any).invoice_pdf) {
        console.log("Success! Invoice PDF URL:", (invoice as any).invoice_pdf);
        return new Response(JSON.stringify({ receiptUrl: (invoice as any).invoice_pdf, success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Fallback: get charge via invoice.payment_intent or invoice.charge
      if (invoice.payment_intent) {
        const pi = await stripe.paymentIntents.retrieve(invoice.payment_intent as string, { expand: ['charges'] });
        const ch = pi.charges?.data?.[0];
        if (ch?.receipt_url) {
          return new Response(JSON.stringify({ receiptUrl: ch.receipt_url, success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
      if ((invoice as any).charge) {
        const ch = await stripe.charges.retrieve((invoice as any).charge as string);
        if (ch.receipt_url) {
          return new Response(JSON.stringify({ receiptUrl: ch.receipt_url, success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }

      console.error("No receipt or invoice URL available for invoice:", invoice.id);
      throw new Error("Receipt not available for this invoice");
    }

    console.error("No payment intent or invoice found for session:", sessionId);
    throw new Error("No receipt available for this session");

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