import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpgradeEmailRequest {
  customerEmail: string;
  customerName?: string;
  oldPlan: string;
  newPlan: string;
  creditsAdded: number;
  proratedCharge: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== Subscription upgrade email function started ===");
    
    const { 
      customerEmail, 
      customerName, 
      oldPlan, 
      newPlan, 
      creditsAdded,
      proratedCharge 
    }: UpgradeEmailRequest = await req.json();
    
    console.log("📧 Sending upgrade confirmation to:", customerEmail);

    if (!customerEmail) {
      throw new Error("Customer email is required");
    }

    const upgradeHtml = `
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
        <div style="text-align: center; margin-bottom: 30px; padding: 30px 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px;">
          <h1 style="color: white; margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">🎉 Upgrade Successful!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 18px;">You're now on ${newPlan}</p>
        </div>

        <!-- Upgrade message -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #2d3748; margin: 0 0 15px 0; font-size: 24px;">Hi ${customerName || 'there'}! 🚀</h2>
          <p style="color: #4a5568; margin: 0 0 15px 0; line-height: 1.6; font-size: 16px;">
            Your subscription has been successfully upgraded from <strong>${oldPlan}</strong> to <strong>${newPlan}</strong>!
          </p>
          <p style="color: #4a5568; margin: 0; line-height: 1.6; font-size: 16px;">
            <strong>${creditsAdded} credits</strong> have been added to your account immediately, and you now have access to all the enhanced features of your new plan.
          </p>
        </div>

        <!-- Upgrade details -->
        <div style="background-color: #ecfdf5; padding: 25px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #10b981;">
          <h3 style="color: #065f46; margin: 0 0 20px 0; font-size: 20px; font-weight: bold;">✨ Your Upgrade Summary:</h3>
          
          <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
            <div style="margin-bottom: 10px;">
              <strong style="color: #2d3748;">Previous Plan:</strong> ${oldPlan}
            </div>
            <div style="margin-bottom: 10px;">
              <strong style="color: #2d3748;">New Plan:</strong> ${newPlan}
            </div>
            <div style="margin-bottom: 10px;">
              <strong style="color: #2d3748;">Credits Added:</strong> ${creditsAdded}
            </div>
            <div>
              <strong style="color: #2d3748;">Prorated Charge:</strong> $${(proratedCharge / 100).toFixed(2)}
            </div>
          </div>
          
          <p style="color: #065f46; margin: 0; font-size: 14px;">
            💡 Your next billing cycle will reflect the full ${newPlan} pricing.
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="https://www.jumpinai.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            🚀 Start Using Your Enhanced Plan
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

    const emailResponse = await resend.emails.send({
      from: "JumpinAI <welcome@jumpinai.com>",
      to: [customerEmail],
      subject: `🎉 Upgrade Confirmed - Welcome to ${newPlan}!`,
      html: upgradeHtml,
    });

    console.log("✅ Upgrade email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Upgrade email sent successfully",
        emailId: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error("💥 Error sending upgrade email:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Failed to send upgrade email",
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
