import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Order ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('Processing order:', orderId);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (order.status === 'completed') {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Order already processed' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe not configured');
    }

    const stripe = new Stripe(stripeSecretKey, { 
      apiVersion: '2023-10-16',
      typescript: true 
    });

    // Verify payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
    
    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ 
        error: 'Payment not completed in Stripe' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('Payment verified, processing credits...');

    // Get package details from session metadata
    const creditsAmount = parseInt(session.metadata?.credits || '0');
    const packageName = session.metadata?.package_name || 'Credit Package';

    if (!creditsAmount) {
      console.error('No credits amount in session metadata');
      return new Response(JSON.stringify({ 
        error: 'Invalid session metadata' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Add credits to user account
    const { error: creditsError } = await supabase.rpc('add_user_credits', {
      p_user_id: order.user_id,
      p_credits: creditsAmount,
      p_description: `Purchased ${packageName}`,
      p_reference_id: order.stripe_session_id
    });

    if (creditsError) {
      console.error('Error adding credits:', creditsError);
      return new Response(JSON.stringify({ 
        error: 'Failed to add credits',
        details: creditsError.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log(`Added ${creditsAmount} credits to user ${order.user_id}`);

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        stripe_payment_intent_id: session.payment_intent as string
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
    }

    console.log('Order processed successfully');

    return new Response(JSON.stringify({
      success: true,
      credits_added: creditsAmount,
      package_name: packageName,
      order_id: orderId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Processing error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
