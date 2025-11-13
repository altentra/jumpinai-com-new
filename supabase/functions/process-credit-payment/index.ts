import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID is required' }), {
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

    // Retrieve checkout session with expanded data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'payment_intent']
    });

    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ error: 'Payment not completed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Extract metadata
    const userId = session.metadata?.user_id;
    const userEmail = session.metadata?.user_email;
    const packageId = session.metadata?.package_id;
    const creditsAmount = parseInt(session.metadata?.credits || '0');

    if (!userId || !userEmail || !packageId || !creditsAmount) {
      console.error('Missing metadata in session:', session.metadata);
      return new Response(JSON.stringify({ error: 'Invalid session metadata' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Get package details
    const { data: creditPackage } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (!creditPackage) {
      return new Response(JSON.stringify({ error: 'Invalid credit package' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Add credits to user account
    const { error: creditsError } = await supabase.rpc('add_user_credits', {
      p_user_id: userId,
      p_credits: creditsAmount,
      p_description: `Purchased ${creditPackage.name}`,
      p_reference_id: sessionId
    });

    if (creditsError) {
      console.error('Error adding credits:', creditsError);
      return new Response(JSON.stringify({ error: 'Failed to add credits' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Update order status
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        stripe_payment_intent_id: session.payment_intent?.id || null
      })
      .eq('stripe_session_id', sessionId);

    if (orderError) {
      console.error('Error updating order:', orderError);
      // Don't fail the response since credits were added successfully
    }

    return new Response(JSON.stringify({
      success: true,
      credits_added: creditsAmount,
      package_name: creditPackage.name
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Payment processing error:', error);
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