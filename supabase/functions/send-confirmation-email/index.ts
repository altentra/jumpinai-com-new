import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
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
      console.log('Unknown payload structure - not sending email');
      return new Response(JSON.stringify({ success: true, message: 'Payload structure not recognized' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('Extracted:', { user_email, token_hash, email_action_type });
    console.log('RESEND_API_KEY exists:', !!Deno.env.get("RESEND_API_KEY"));
    console.log('RESEND_API_KEY length:', Deno.env.get("RESEND_API_KEY")?.length || 0);

    const confirmationLink = `https://cieczaajcgkgdgenfdzi.supabase.co/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;
    console.log(`Sending confirmation email to: ${user_email}`);
    console.log(`Confirmation link: ${confirmationLink}`);

    // Send confirmation email via Resend
    console.log('About to call resend.emails.send...');
    
    try {
      const emailResponse = await resend.emails.send({
        from: "Jumpin AI <hello@jumpinai.com>",
        to: [user_email],
        subject: "Confirm your email address",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">Welcome to Jumpin AI!</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Confirm your email address</h2>
              <p style="color: #666; line-height: 1.6;">
                Thank you for signing up! Please click the button below to confirm your email address and activate your account.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationLink}" 
                   style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Confirm Email Address
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, you can copy and paste this link into your browser:<br>
                <a href="${confirmationLink}" style="color: #007bff; word-break: break-all;">${confirmationLink}</a>
              </p>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>If you didn't create an account with us, you can safely ignore this email.</p>
              <p>&copy; 2025 Jumpin AI. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      console.log('Resend response:', JSON.stringify(emailResponse, null, 2));

      if (emailResponse.error) {
        console.error('Resend API error:', emailResponse.error);
        throw new Error(`Resend API error: ${JSON.stringify(emailResponse.error)}`);
      }

      console.log('Confirmation email sent successfully:', emailResponse.data);

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Confirmation email sent successfully',
        email: user_email,
        emailId: emailResponse.data?.id
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
      
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      console.error('Email error stack:', emailError.stack);
      
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Failed to send email',
        details: emailError.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
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