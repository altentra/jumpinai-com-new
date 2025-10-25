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

    // Create a fresh Stripe price (product will be auto-created)
    console.log(`Processing credit package: ${creditPackage.name} - ${creditPackage.credits} credits for $${creditPackage.price_cents / 100}`);
    
    const price = await stripe.prices.create({
      currency: 'usd',
      unit_amount: creditPackage.price_cents,
      product_data: {
        name: `${creditPackage.name} - ${creditPackage.credits} credits`,
      },
    });
    
    const stripePriceId = price.id;
    console.log(`Created Stripe price: ${stripePriceId} - $${creditPackage.price_cents / 100}`);

    // Update database with stripe_price_id
    await supabase
      .from('credit_packages')
      .update({ 
        stripe_price_id: stripePriceId,
        updated_at: new Date().toISOString()
      })
      .eq('id', packageId);

    console.log(`Updated database with new price ID for ${creditPackage.name}`);

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
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/credit-purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/dashboard/subscription`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        package_id: packageId,
        credits: creditPackage.credits.toString(),
      },
    });

    // Create a virtual product record for this credit package if it doesn't exist
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('name', `${creditPackage.name}`)
      .maybeSingle();

    let productId = existingProduct?.id;

    if (!productId) {
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          name: creditPackage.name,
          description: `${creditPackage.credits} credits for AI transformation plans`,
          price: creditPackage.price_cents,
          file_path: 'virtual',
          file_name: 'credits_package',
          status: 'active'
        })
        .select('id')
        .single();

      if (!productError && newProduct) {
        productId = newProduct.id;
      }
    }

    // Record the pending order
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        user_email: user.email,
        product_id: productId,
        amount: creditPackage.price_cents,
        currency: 'usd',
        status: 'pending',
        stripe_session_id: session.id,
      });

    if (orderError) {
      console.error('Error creating order record:', orderError);
      // Continue anyway - the payment processing will handle it
    }

    // NOTE: Purchase notification will be sent via Stripe webhook
    // after payment is confirmed, not here at checkout creation

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