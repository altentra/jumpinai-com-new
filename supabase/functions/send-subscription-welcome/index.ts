import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://jumpinai.com/images/jumpinai-logo-email.png" alt="JumpinAI" style="max-width: 150px; height: auto;" />
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

        <!-- Quick start guide -->
        <div style="background-color: #edf2f7; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #2d3748; margin: 0 0 20px 0; font-size: 20px; font-weight: bold;">⚡ Quick Start Guide:</h3>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #2d3748;">1. Explore Your Dashboard</strong><br>
            <span style="color: #4a5568; font-size: 14px;">Visit your Pro dashboard to see all available resources</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #2d3748;">2. Try Our Top Blueprints</strong><br>
            <span style="color: #4a5568; font-size: 14px;">Start with our most popular blueprints for immediate results</span>
          </div>
          
          <div style="margin-bottom: 0;">
            <strong style="color: #2d3748;">3. Join Our Community</strong><br>
            <span style="color: #4a5568; font-size: 14px;">Connect with other Pro members and share your wins</span>
          </div>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="https://www.jumpinai.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            🚀 Access Your Pro Dashboard
          </a>
        </div>

        <!-- Support -->
        <div style="background-color: #fffaf0; padding: 20px; border-radius: 8px; border-left: 4px solid #ed8936; margin-bottom: 30px;">
          <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">💬 Need Help Getting Started?</h4>
          <p style="color: #4a5568; margin: 0; font-size: 14px; line-height: 1.5;">
            As a Pro member, you get priority support! Email us at <a href="mailto:support@jumpinai.com" style="color: #667eea; text-decoration: none;">support@jumpinai.com</a> and we'll help you get the most out of your subscription.
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #718096; font-size: 14px; margin: 0 0 10px 0;">
            <strong>JumpinAI - Your Personalized AI Adaptation Studio</strong>
          </p>
          <p style="color: #a0aec0; font-size: 12px; margin: 0;">
            <a href="https://www.jumpinai.com" style="color: #374151; text-decoration: none;">Visit Website</a> | 
            <a href="https://www.jumpinai.com/dashboard/subscription" style="color: #374151; text-decoration: none; margin-left: 10px;">Manage Subscription</a>
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

serve(handler);