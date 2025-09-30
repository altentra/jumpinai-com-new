import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user?.email) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Get request body
    const body = await req.json();
    const { packageId } = body;

    if (!packageId) {
      return new Response(JSON.stringify({ error: 'Package ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Fetch credit package details
    const { data: creditPackage, error: packageError } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', packageId)
      .eq('active', true)
      .single();

    if (packageError || !creditPackage) {
      return new Response(JSON.stringify({ error: 'Invalid credit package' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const stripe = new Stripe(stripeSecretKey, { 
      apiVersion: '2023-10-16',
      typescript: true 
    });

    // Find or create Stripe customer
    let customerId: string;
    const existingCustomers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({ email: user.email });
      customerId = newCustomer.id;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `JumpinAI ${creditPackage.name}`,
              description: `${creditPackage.credits} JumpinAI credits for generating AI transformation plans`,
            },
            unit_amount: creditPackage.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/dashboard/subscription`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        package_id: packageId,
        credits: creditPackage.credits.toString(),
      },
    });

    // Record the pending order
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        user_email: user.email,
        product_id: packageId, // Using package_id as product_id
        amount: creditPackage.price_cents,
        currency: 'usd',
        status: 'pending',
        stripe_session_id: session.id,
      });

    if (orderError) {
      console.error('Error creating order record:', orderError);
      // Continue anyway - the webhook will handle the credit addition
    }

    // Send purchase notification
    try {
      await supabase.functions.invoke('send-purchase-notification', {
        body: {
          user_email: user.email,
          product_name: creditPackage.name,
          amount: creditPackage.price_cents / 100,
          currency: 'usd'
        }
      });
    } catch (notificationError) {
      console.error('Error sending purchase notification:', notificationError);
      // Don't fail the checkout for notification errors
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Checkout creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: errorMessage 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});