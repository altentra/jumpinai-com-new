import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    console.log('=== Auth Hook triggered ===');
    
    const payload = await req.json();
    console.log('Payload structure:', Object.keys(payload));
    console.log('Full payload:', JSON.stringify(payload, null, 2));
    
    // Extract user email and confirmation data
    let user_email, token_hash, redirect_to, email_action_type;
    
    if (payload.user && payload.email_data) {
      user_email = payload.user.email;
      token_hash = payload.email_data.token_hash;
      redirect_to = payload.email_data.redirect_to;
      email_action_type = payload.email_data.email_action_type;
      console.log('Using user/email_data structure');
    } else {
      console.log('Unknown payload structure');
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('Extracted:', { user_email, token_hash, email_action_type });

    // For now, just log the confirmation request - we'll add Resend later
    console.log(`Would send confirmation email to: ${user_email}`);
    console.log(`Confirmation link would be: https://cieczaajcgkgdgenfdzi.supabase.co/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Confirmation email would be sent',
      email: user_email
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 200, // Return 200 to avoid blocking signup
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});