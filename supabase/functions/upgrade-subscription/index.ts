import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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

    const { newPlanId } = await req.json();

    if (!newPlanId) {
      throw new Error('Missing newPlanId');
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

    // Get user's current subscription from subscribers table
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

    // Get the customer's active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: subscriber.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error('No active Stripe subscription found');
    }

    const currentSubscription = subscriptions.data[0];

    // Get current plan details for calculation
    const { data: currentPlanData } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', subscriber.subscription_tier)
      .single();

    // Calculate prorated amount and credit difference
    const priceDifference = newPlan.price_cents - (currentPlanData?.price_cents || 0);
    const creditDifference = newPlan.credits_per_month - (currentPlanData?.credits_per_month || 0);

    // Create or get the Stripe price for the new plan
    let stripePriceId = newPlan.stripe_price_id;
    
    if (!stripePriceId) {
      const price = await stripe.prices.create({
        currency: 'usd',
        unit_amount: newPlan.price_cents,
        recurring: { interval: 'month' },
        product_data: {
          name: newPlan.name,
          description: newPlan.description || undefined,
        },
      });
      
      stripePriceId = price.id;
      
      // Update the plan with the new Stripe price ID
      await supabase
        .from('subscription_plans')
        .update({ stripe_price_id: stripePriceId })
        .eq('id', newPlanId);
    }

    // Update the subscription in Stripe
    const updatedSubscription = await stripe.subscriptions.update(
      currentSubscription.id,
      {
        items: [{
          id: currentSubscription.items.data[0].id,
          price: stripePriceId,
        }],
        proration_behavior: 'always_invoice',
        metadata: {
          user_id: user.id,
          user_email: user.email || '',
          plan_id: newPlanId,
          plan_name: newPlan.name,
          credits_per_month: newPlan.credits_per_month.toString(),
          upgrade_credit_difference: creditDifference.toString(),
        },
      }
    );

    console.log('Subscription updated:', updatedSubscription.id);

    // Add the additional credits immediately
    if (creditDifference > 0) {
      const { error: creditsError } = await supabase.rpc('add_user_credits', {
        p_user_id: user.id,
        p_credits: creditDifference,
        p_description: `Upgrade to ${newPlan.name} - Additional credits`,
        p_reference_id: updatedSubscription.id,
      });

      if (creditsError) {
        console.error('Error adding upgrade credits:', creditsError);
      }
    }

    // Update subscriber info
    const subscriptionEnd = new Date(updatedSubscription.current_period_end * 1000);
    
    await supabase
      .from('subscribers')
      .update({
        subscribed: true,
        subscription_tier: newPlan.name,
        subscription_end: subscriptionEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        subscription: updatedSubscription,
        creditsAdded: creditDifference,
        message: `Successfully upgraded to ${newPlan.name}`,
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Upgrade subscription error:', error);
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
