import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user from the JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const { newPlanId, priceDifference, creditDifference } = await req.json();

    if (!newPlanId || priceDifference === undefined || creditDifference === undefined) {
      throw new Error('Missing required parameters');
    }

    // Get the new plan details
    const { data: newPlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', newPlanId)
      .single();

    if (planError || !newPlan) {
      throw new Error('Plan not found');
    }

    // Get user's current subscription
    const { data: subscriber, error: subError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError || !subscriber || !subscriber.stripe_customer_id) {
      throw new Error('No active subscription found');
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Create a one-time payment for the prorated amount
    const session = await stripe.checkout.sessions.create({
      customer: subscriber.stripe_customer_id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(priceDifference * 100), // Convert to cents
            product_data: {
              name: `Upgrade to ${newPlan.name}`,
              description: `Prorated upgrade charge (+${creditDifference} credits)`,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/subscription-success?upgrade=true&plan=${encodeURIComponent(newPlan.name)}&credits=${creditDifference}`,
      cancel_url: `${req.headers.get('origin')}/dashboard/subscription`,
      metadata: {
        type: 'subscription_upgrade',
        user_id: user.id,
        user_email: user.email || '',
        new_plan_id: newPlanId,
        new_plan_name: newPlan.name,
        current_plan_name: subscriber.subscription_tier,
        credits_to_add: creditDifference.toString(),
        new_credits_per_month: newPlan.credits_per_month.toString(),
      },
    });

    console.log('Created upgrade checkout session:', session.id);

    return new Response(
      JSON.stringify({
        success: true,
        url: session.url,
        sessionId: session.id,
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Create upgrade checkout error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 400,
      }
    );
  }
});
