import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY is not configured');
      throw new Error('Stripe configuration error');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Retrieving receipt for session:', sessionId);

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'subscription', 'invoice']
    });

    console.log('Session retrieved:', {
      mode: session.mode,
      payment_status: session.payment_status,
      hasPaymentIntent: !!session.payment_intent,
      hasSubscription: !!session.subscription,
      hasInvoice: !!session.invoice
    });

    let receiptUrl: string | null = null;

    // Handle one-time payments
    if (session.mode === 'payment' && session.payment_intent) {
      const paymentIntent = typeof session.payment_intent === 'string'
        ? await stripe.paymentIntents.retrieve(session.payment_intent, { expand: ['charges'] })
        : session.payment_intent;

      console.log('Payment intent retrieved:', {
        id: paymentIntent.id,
        chargesCount: paymentIntent.charges?.data?.length
      });

      // Get the charge's receipt URL
      if (paymentIntent.charges?.data?.[0]?.receipt_url) {
        receiptUrl = paymentIntent.charges.data[0].receipt_url;
        console.log('Found receipt URL from payment intent charge');
      }
    }
    // Handle subscriptions
    else if (session.mode === 'subscription') {
      // Try to get invoice first
      if (session.invoice) {
        const invoice = typeof session.invoice === 'string'
          ? await stripe.invoices.retrieve(session.invoice)
          : session.invoice;

        console.log('Invoice retrieved:', {
          id: invoice.id,
          hasHostedUrl: !!invoice.hosted_invoice_url,
          hasPdfUrl: !!invoice.invoice_pdf
        });

        // Prefer hosted invoice URL
        if (invoice.hosted_invoice_url) {
          receiptUrl = invoice.hosted_invoice_url;
          console.log('Found hosted invoice URL');
        } else if (invoice.invoice_pdf) {
          receiptUrl = invoice.invoice_pdf;
          console.log('Found invoice PDF URL');
        }

        // Fallback: try to get charge receipt from invoice
        if (!receiptUrl && invoice.charge) {
          const charge = await stripe.charges.retrieve(invoice.charge as string);
          if (charge.receipt_url) {
            receiptUrl = charge.receipt_url;
            console.log('Found receipt URL from invoice charge');
          }
        }
      }

      // If no invoice, try to get from payment intent
      if (!receiptUrl && session.payment_intent) {
        const paymentIntent = typeof session.payment_intent === 'string'
          ? await stripe.paymentIntents.retrieve(session.payment_intent, { expand: ['charges'] })
          : session.payment_intent;

        if (paymentIntent.charges?.data?.[0]?.receipt_url) {
          receiptUrl = paymentIntent.charges.data[0].receipt_url;
          console.log('Found receipt URL from subscription payment intent');
        }
      }
    }

    if (!receiptUrl) {
      console.error('No receipt URL found for session:', sessionId);
      return new Response(
        JSON.stringify({ error: 'Receipt not available' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Receipt URL found:', receiptUrl);

    return new Response(
      JSON.stringify({ receiptUrl }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error retrieving receipt:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to retrieve receipt' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
