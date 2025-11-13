import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  customerEmail: string;
  customerName?: string;
  subscriptionTier?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== Subscription welcome email function started ===");
    
    const { customerEmail, customerName, subscriptionTier }: WelcomeEmailRequest = await req.json();
    console.log("📧 Sending welcome email to:", customerEmail);

    if (!customerEmail) {
      throw new Error("Customer email is required");
    }

    // Create a beautiful welcome email
    const welcomeHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <!-- Logo -->
        <div style="text-align: center; padding: 32px 24px 24px 24px;">
          <img 
            src="https://jumpinai.com/logo.png" 
            alt="JumpinAI Logo" 
            style="width: 84px; height: 84px; display: block; border-radius: 12px; margin: 0 auto;"
          />
        </div>
        
        <!-- Header with gradient -->
        <div style="text-align: center; margin-bottom: 30px; padding: 30px 20px; background: linear-gradient(135deg, #374151 0%, #1f2937 100%); border-radius: 12px;">
          <h1 style="color: white; margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">Welcome to JumpinAI Pro!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 18px;">You're now part of our exclusive Pro community</p>
        </div>

        <!-- Welcome message -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #2d3748; margin: 0 0 15px 0; font-size: 24px;">Hi ${customerName || 'there'}! 🎉</h2>
          <p style="color: #4a5568; margin: 0 0 15px 0; line-height: 1.6; font-size: 16px;">
            Thank you for upgrading to <strong>${subscriptionTier || 'JumpinAI Pro'}</strong>! Your subscription is now active and you have unlimited access to all our premium AI resources.
          </p>
          <p style="color: #4a5568; margin: 0; line-height: 1.6; font-size: 16px;">
            You've just unlocked the complete toolkit that thousands of professionals use to master AI and transform their work.
          </p>
        </div>

        <!-- What's included -->
        <div style="background-color: #f7fafc; padding: 25px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #667eea;">
          <h3 style="color: #2d3748; margin: 0 0 20px 0; font-size: 20px; font-weight: bold;">🚀 What You Now Have Access To:</h3>
          
          <div style="margin-bottom: 15px;">
            <span style="color: #38a169; font-weight: bold; margin-right: 8px;">✓</span>
            <strong style="color: #2d3748;">Complete Blueprints Library</strong> - 50+ professional AI blueprints and templates
          </div>
          
          <div style="margin-bottom: 15px;">
            <span style="color: #38a169; font-weight: bold; margin-right: 8px;">✓</span>
            <strong style="color: #2d3748;">Advanced Workflows</strong> - Step-by-step workflows for complex AI implementations
          </div>
          
          <div style="margin-bottom: 15px;">
            <span style="color: #38a169; font-weight: bold; margin-right: 8px;">✓</span>
            <strong style="color: #2d3748;">Premium Prompt Collection</strong> - 300+ professional prompts for every use case
          </div>
          
          <div style="margin-bottom: 15px;">
            <span style="color: #38a169; font-weight: bold; margin-right: 8px;">✓</span>
            <strong style="color: #2d3748;">Custom Strategy Tools</strong> - Advanced tools for developing AI strategies
          </div>
          
          <div style="margin-bottom: 15px;">
            <span style="color: #38a169; font-weight: bold; margin-right: 8px;">✓</span>
            <strong style="color: #2d3748;">Priority Support</strong> - Get help faster with priority email support
          </div>
          
          <div style="margin-bottom: 0;">
            <span style="color: #38a169; font-weight: bold; margin-right: 8px;">✓</span>
            <strong style="color: #2d3748;">Monthly Training Sessions</strong> - Exclusive live training with AI experts
          </div>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="https://www.jumpinai.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            🚀 Access Your Pro Dashboard
          </a>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 18px; margin-top: 20px; text-align: center;">
          <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 13px;">Questions? We're always here to help!</p>
          <p style="margin: 0; color: #1f2937; font-size: 13px;">
            Email us at <a href="mailto:info@jumpinai.com" style="color: #3b82f6; text-decoration: none; font-weight: 600;">info@jumpinai.com</a>
          </p>
        </div>

        <div style="padding: 20px 24px; text-align: center; background: #f9fafb; margin-top: 14px; border-radius: 6px;">
          <p style="color: #111827; margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">
            JumpinAI.
          </p>
          <p style="color: #6b7280; margin: 0 0 14px 0; font-size: 13px;">
            Your Personalized AI Adaptation Studio.
          </p>
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            <a href="https://www.jumpinai.com/dashboard/subscription" style="color: #6b7280; text-decoration: underline;">Manage Subscription</a>
          </p>
        </div>
      </div>
    `;

    // Send welcome email to customer
    const emailResponse = await resend.emails.send({
      from: "JumpinAI Pro <welcome@jumpinai.com>",
      to: [customerEmail],
      subject: "🎉 Welcome to JumpinAI Pro - Your Premium Access is Now Active!",
      html: welcomeHtml,
    });

    console.log("✅ Welcome email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Welcome email sent successfully",
        emailId: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error("💥 Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Failed to send welcome email",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
};

Deno.serve(handler);