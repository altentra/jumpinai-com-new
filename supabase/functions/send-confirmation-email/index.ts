import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const generateConfirmationHTML = (token_hash: string, email_action_type: string, redirect_to: string, supabase_url: string, user_email: string) => {
  const confirmationUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to JumpinAI</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f0f23; color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a3e 0%, #0f0f23 100%);">
          <!-- Header -->
          <div style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 0 0 20px 20px;">
            <h1 style="margin: 0; font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
              JumpinAI
            </h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; color: #e0e7ff; opacity: 0.9;">
              Welcome to the future of AI
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px 0;">
              Confirm your email address
            </h2>
            
            <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Hi there! We're excited to have you join JumpinAI. To complete your registration and start your AI journey, please confirm your email address by clicking the button below.
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${confirmationUrl}" 
                 style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3); transition: all 0.3s ease;">
                Confirm Email Address
              </a>
            </div>

            <p style="color: #71717a; font-size: 14px; line-height: 1.5; margin: 30px 0 0 0;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #6366f1; font-size: 14px; word-break: break-all; margin: 10px 0;">
              ${confirmationUrl}
            </p>

            <div style="margin: 40px 0; padding: 20px; background: rgba(99, 102, 241, 0.1); border-radius: 12px; border-left: 4px solid #6366f1;">
              <p style="color: #a1a1aa; font-size: 14px; margin: 0; line-height: 1.5;">
                <strong style="color: #ffffff;">What's next?</strong><br>
                Once confirmed, you'll have access to our AI tools, prompts, and strategies to supercharge your productivity.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 30px; text-align: center; border-top: 1px solid #27272a;">
            <p style="color: #71717a; font-size: 14px; margin: 0 0 10px 0;">
              This email was sent to ${user_email}
            </p>
            <p style="color: #71717a; font-size: 12px; margin: 0;">
              If you didn't create an account with JumpinAI, you can safely ignore this email.
            </p>
            <div style="margin-top: 20px;">
              <p style="color: #52525b; font-size: 12px; margin: 0;">
                © 2024 JumpinAI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    const wh = new Webhook(hookSecret);
    
    const {
      user,
      email_data: { token_hash, redirect_to, email_action_type }
    } = wh.verify(payload, headers) as {
      user: { email: string };
      email_data: {
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
      };
    };

    const supabase_url = Deno.env.get('SUPABASE_URL') ?? '';
    const html = generateConfirmationHTML(token_hash, email_action_type, redirect_to, supabase_url, user.email);

    const { error } = await resend.emails.send({
      from: 'JumpinAI <onboarding@resend.dev>',
      to: [user.email],
      subject: '🚀 Welcome to JumpinAI - Confirm your email',
      html,
    });

    if (error) {
      console.error('Email sending error:', error);
      throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Error in send-confirmation-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});