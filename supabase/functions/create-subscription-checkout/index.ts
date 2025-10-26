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
    const { planId } = body;

    if (!planId) {
      return new Response(JSON.stringify({ error: 'Plan ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Fetch subscription plan details
    const { data: subscriptionPlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('active', true)
      .single();

    if (planError || !subscriptionPlan) {
      return new Response(JSON.stringify({ error: 'Invalid subscription plan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Don't allow checkout for free plan
    if (subscriptionPlan.price_cents === 0) {
      return new Response(JSON.stringify({ error: 'Free plan does not require checkout' }), {
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

    // Create a fresh Stripe price (product will be auto-created)
    console.log(`Processing subscription: ${subscriptionPlan.name} - $${subscriptionPlan.price_cents / 100}/month`);
    
    const price = await stripe.prices.create({
      currency: 'usd',
      unit_amount: subscriptionPlan.price_cents,
      recurring: { interval: 'month' },
      product_data: {
        name: `${subscriptionPlan.name} - ${subscriptionPlan.credits_per_month} monthly credits`,
      },
    });
    
    const stripePriceId = price.id;
    console.log(`Created Stripe price: ${stripePriceId} - $${subscriptionPlan.price_cents / 100}/month`);
    
    // Update database with the new price ID
    await supabase
      .from('subscription_plans')
      .update({ 
        stripe_price_id: stripePriceId,
        updated_at: new Date().toISOString()
      })
      .eq('id', planId);
    
    console.log(`Updated database with new price ID for ${subscriptionPlan.name}`);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/subscription-success?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(subscriptionPlan.name)}&credits=${subscriptionPlan.credits_per_month}`,
      cancel_url: `${req.headers.get('origin')}/dashboard/subscription`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        plan_id: planId,
        plan_name: subscriptionPlan.name,
        credits_per_month: subscriptionPlan.credits_per_month.toString(),
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          user_email: user.email,
          plan_id: planId,
          plan_name: subscriptionPlan.name,
          credits_per_month: subscriptionPlan.credits_per_month.toString(),
        },
      },
    });

    // Record the pending order for tracking (no product for subscriptions)
    await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        user_email: user.email,
        product_id: null, // Subscriptions are not products
        amount: subscriptionPlan.price_cents,
        currency: 'usd',
        status: 'pending',
        stripe_session_id: session.id,
        download_token: null, // No download for subscriptions
      });


    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Subscription checkout creation error:', error);
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