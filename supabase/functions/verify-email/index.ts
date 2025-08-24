import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(
        `
        <html>
          <head>
            <title>Invalid Verification Link</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f3f4f6; }
              .container { max-width: 500px; margin: 100px auto; background: white; padding: 40px; border-radius: 10px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
              .error { color: #ef4444; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">Invalid Verification Link</h1>
              <p>The verification link is missing required parameters. Please check your email and try again.</p>
            </div>
          </body>
        </html>
        `,
        { status: 400, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    console.log('Processing verification for token:', token);

    // Find user by verification token
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('id, email_verification_token, email_verification_expires_at, email_verified')
      .eq('email_verification_token', token)
      .maybeSingle();

    if (findError) {
      console.error('Error finding profile:', findError);
      throw new Error('Database error while finding verification token');
    }

    if (!profile) {
      console.log('No profile found for token:', token);
      return new Response(
        `
        <html>
          <head>
            <title>Invalid Verification Link</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f3f4f6; }
              .container { max-width: 500px; margin: 100px auto; background: white; padding: 40px; border-radius: 10px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
              .error { color: #ef4444; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">Invalid Verification Link</h1>
              <p>This verification link is invalid or has already been used.</p>
            </div>
          </body>
        </html>
        `,
        { status: 404, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    // Check if already verified
    if (profile.email_verified) {
      console.log('Email already verified for user:', profile.id);
      return new Response(
        `
        <html>
          <head>
            <title>Email Already Verified</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f3f4f6; }
              .container { max-width: 500px; margin: 100px auto; background: white; padding: 40px; border-radius: 10px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
              .success { color: #10b981; }
              .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="success">Email Already Verified</h1>
              <p>Your email address has already been verified. You can now access all JumpinAI features.</p>
              <a href="/dashboard" class="btn">Go to Dashboard</a>
            </div>
          </body>
        </html>
        `,
        { status: 200, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    // Check if token has expired
    const expiresAt = new Date(profile.email_verification_expires_at);
    const now = new Date();
    
    if (now > expiresAt) {
      console.log('Token expired for user:', profile.id);
      return new Response(
        `
        <html>
          <head>
            <title>Verification Link Expired</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f3f4f6; }
              .container { max-width: 500px; margin: 100px auto; background: white; padding: 40px; border-radius: 10px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
              .warning { color: #f59e0b; }
              .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="warning">Verification Link Expired</h1>
              <p>This verification link has expired. Please request a new verification email from your account settings.</p>
              <a href="/dashboard/profile" class="btn">Go to Profile Settings</a>
            </div>
          </body>
        </html>
        `,
        { status: 410, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    // Mark email as verified and clear verification token
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        email_verified: true,
        email_verification_token: null,
        email_verification_expires_at: null
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Error updating profile verification status:', updateError);
      throw new Error('Failed to verify email');
    }

    console.log('Email successfully verified for user:', profile.id);

    // Return redirect response to dashboard
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Verified Successfully</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="refresh" content="3;url=https://www.jumpinai.com/dashboard/profile">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container { 
              max-width: 500px; 
              background: white; 
              padding: 40px; 
              border-radius: 16px; 
              text-align: center; 
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            .success { color: #059669; margin: 0; font-size: 24px; font-weight: 600; }
            .checkmark { font-size: 64px; color: #10b981; margin-bottom: 20px; animation: bounce 0.6s ease-in-out; }
            .message { color: #6b7280; font-size: 16px; line-height: 1.5; margin: 20px 0; }
            .redirect-info { color: #9ca3af; font-size: 14px; margin-top: 30px; }
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-10px); }
              60% { transform: translateY(-5px); }
            }
          </style>
          <script>
            // Redirect after 3 seconds
            setTimeout(function() {
              window.location.href = 'https://www.jumpinai.com/dashboard/profile';
            }, 3000);
          </script>
        </head>
        <body>
          <div class="container">
            <div class="checkmark">✅</div>
            <h1 class="success">Email Verified Successfully!</h1>
            <p class="message">Your email address has been verified. You now have full access to all JumpinAI features including purchases and subscriptions.</p>
            <div class="redirect-info">Redirecting you back to your dashboard in 3 seconds...</div>
          </div>
        </body>
      </html>
      `,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in verify-email function:", error);
    return new Response(
      `
      <html>
        <head>
          <title>Verification Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f3f4f6; }
            .container { max-width: 500px; margin: 100px auto; background: white; padding: 40px; border-radius: 10px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .error { color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Verification Error</h1>
            <p>An error occurred while verifying your email. Please try again later or contact support.</p>
          </div>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: { "Content-Type": "text/html", ...corsHeaders },
      }
    );
  }
};

serve(handler);