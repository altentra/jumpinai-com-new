import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe not configured');
    }

    const stripe = new Stripe(stripeSecretKey, { 
      apiVersion: '2023-10-16',
      typescript: true 
    });

    const results = {
      subscriptionPlans: [] as any[],
      creditPackages: [] as any[]
    };

    // Sync Subscription Plans
    const { data: subscriptionPlans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('active', true)
      .neq('price_cents', 0); // Skip free plan

    if (plansError) {
      console.error('Error fetching subscription plans:', plansError);
      throw plansError;
    }

    for (const plan of subscriptionPlans || []) {
      console.log(`Syncing subscription plan: ${plan.name} - $${plan.price_cents / 100}`);
      
      let productId = plan.stripe_product_id;
      
      // Create or update Stripe product
      if (!productId) {
        const product = await stripe.products.create({
          name: `JumpinAI ${plan.name}`,
          description: `${plan.credits_per_month} credits per month`,
        });
        productId = product.id;
        console.log(`Created new Stripe product: ${productId}`);
      } else {
        // Update existing product
        await stripe.products.update(productId, {
          name: `JumpinAI ${plan.name}`,
          description: `${plan.credits_per_month} credits per month`,
        });
        console.log(`Updated Stripe product: ${productId}`);
      }

      // Create new price (Stripe prices are immutable, so we create a new one)
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: plan.price_cents,
        currency: 'usd',
        recurring: { interval: 'month' },
      });
      console.log(`Created new Stripe price: ${price.id} - $${plan.price_cents / 100}`);

      // Update database with new IDs
      const { error: updateError } = await supabase
        .from('subscription_plans')
        .update({ 
          stripe_product_id: productId,
          stripe_price_id: price.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', plan.id);

      if (updateError) {
        console.error(`Error updating plan ${plan.name}:`, updateError);
      }

      results.subscriptionPlans.push({
        name: plan.name,
        price: `$${plan.price_cents / 100}`,
        productId,
        priceId: price.id
      });
    }

    // Sync Credit Packages
    const { data: creditPackages, error: packagesError } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('active', true);

    if (packagesError) {
      console.error('Error fetching credit packages:', packagesError);
      throw packagesError;
    }

    for (const pkg of creditPackages || []) {
      console.log(`Syncing credit package: ${pkg.name} - $${pkg.price_cents / 100}`);
      
      // Create or update Stripe product
      let product;
      try {
        // Try to find existing product by name
        const existingProducts = await stripe.products.search({
          query: `name:'JumpinAI ${pkg.name}'`,
        });
        
        if (existingProducts.data.length > 0) {
          product = await stripe.products.update(existingProducts.data[0].id, {
            name: `JumpinAI ${pkg.credits} credits. ${pkg.name}.`,
            description: `${pkg.credits} credits for AI transformation plans`,
          });
          console.log(`Updated existing Stripe product: ${product.id}`);
        } else {
          product = await stripe.products.create({
            name: `JumpinAI ${pkg.credits} credits. ${pkg.name}.`,
            description: `${pkg.credits} credits for AI transformation plans`,
          });
          console.log(`Created new Stripe product: ${product.id}`);
        }
      } catch (err) {
        // If search fails, just create a new product
        product = await stripe.products.create({
          name: `JumpinAI ${pkg.credits} credits. ${pkg.name}.`,
          description: `${pkg.credits} credits for AI transformation plans`,
        });
        console.log(`Created new Stripe product: ${product.id}`);
      }

      // Create new price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: pkg.price_cents,
        currency: 'usd',
      });
      console.log(`Created new Stripe price: ${price.id} - $${pkg.price_cents / 100}`);

      // Update database with new IDs
      const { error: updateError } = await supabase
        .from('credit_packages')
        .update({ 
          stripe_price_id: price.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', pkg.id);

      if (updateError) {
        console.error(`Error updating package ${pkg.name}:`, updateError);
      }

      results.creditPackages.push({
        name: pkg.name,
        credits: pkg.credits,
        price: `$${pkg.price_cents / 100}`,
        productId: product.id,
        priceId: price.id
      });
    }

    console.log('Sync completed successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'All prices synced with Stripe successfully',
      results 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: 'Sync failed',
      details: errorMessage 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
