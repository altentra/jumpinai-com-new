import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  userId: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { userId, email }: VerificationRequest = await req.json();

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: "Missing userId or email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate verification token and expiration (24 hours)
    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Update user profile with verification token
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        email_verification_token: verificationToken,
        email_verification_expires_at: expiresAt.toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw new Error('Failed to generate verification token');
    }

    // Create verification URL
    const verificationUrl = `${Deno.env.get("SUPABASE_URL").replace('//', '//').replace('supabase.co', 'supabase.co')}/functions/v1/verify-email?token=${verificationToken}`;

    // Send verification email
    const emailResponse = await resend.emails.send({
      from: "JumpinAI <noreply@jumpinai.com>",
      to: [email],
      subject: "Verify your email address - JumpinAI",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Verify Your Email</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Complete your JumpinAI account setup</p>
          </div>
          
          <div style="background: white; padding: 40px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Hello! Please verify your email address to complete your JumpinAI account setup and unlock all features.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        text-decoration: none; 
                        padding: 15px 30px; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: center;">
                This link will expire in 24 hours for security purposes.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">
              If you didn't create a JumpinAI account, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      throw new Error('Failed to send verification email');
    }

    console.log('Verification email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification email sent successfully',
        verificationId: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);