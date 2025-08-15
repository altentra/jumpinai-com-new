import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  console.log('=== Auth Hook triggered ===');
  
  try {
    const payload = await req.json();
    console.log('Payload structure:', Object.keys(payload));
    console.log('Full payload:', JSON.stringify(payload, null, 2));
    
    // Try to extract email data from various possible structures
    let user_email, token_hash, redirect_to, email_action_type;
    
    // Check for different payload structures
    if (payload.user && payload.email_data) {
      user_email = payload.user.email;
      token_hash = payload.email_data.token_hash;
      redirect_to = payload.email_data.redirect_to;
      email_action_type = payload.email_data.email_action_type;
      console.log('Using user/email_data structure');
    } else if (payload.email) {
      user_email = payload.email;
      token_hash = payload.token_hash;
      redirect_to = payload.redirect_to || '';
      email_action_type = payload.email_action_type || 'signup';
      console.log('Using direct structure');
    } else {
      console.log('Unknown payload structure, returning success anyway');
      return new Response(JSON.stringify({ success: true, message: 'Payload logged' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Extracted:', { user_email, token_hash, email_action_type });

    // Simple test email instead of complex HTML for now
    const { error } = await resend.emails.send({
      from: 'JumpinAI <onboarding@resend.dev>',
      to: [user_email],
      subject: 'Test - Confirm your email',
      html: `<h1>Test Email</h1><p>Click here: <a href="https://cieczaajcgkgdgenfdzi.supabase.co/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to || ''}">Confirm Email</a></p>`,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Email sent successfully to:', user_email);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});