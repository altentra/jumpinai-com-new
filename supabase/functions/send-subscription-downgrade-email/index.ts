import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DowngradeEmailRequest {
  customerEmail: string;
  customerName?: string;
  currentPlan: string;
  newPlan: string;
  effectiveDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== Subscription downgrade email function started ===");
    
    const { 
      customerEmail, 
      customerName, 
      currentPlan, 
      newPlan, 
      effectiveDate 
    }: DowngradeEmailRequest = await req.json();
    
    console.log("📧 Sending downgrade confirmation to:", customerEmail);

    if (!customerEmail) {
      throw new Error("Customer email is required");
    }

    const downgradeHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <!-- Logo -->
        <div style="text-align: center; padding: 32px 24px 24px 24px;">
          <img 
            src="https://jumpinai.com/logo.png" 
            alt="JumpinAI Logo" 
            style="width: 84px; height: 84px; display: block; border-radius: 12px; margin: 0 auto;"
          />
        </div>
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; padding: 30px 20px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border-radius: 12px;">
          <h1 style="color: white; margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">Subscription Change Scheduled</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 18px;">Your plan will change to ${newPlan}</p>
        </div>

        <!-- Downgrade message -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #2d3748; margin: 0 0 15px 0; font-size: 24px;">Hi ${customerName || 'there'},</h2>
          <p style="color: #4a5568; margin: 0 0 15px 0; line-height: 1.6; font-size: 16px;">
            We've received your request to change your subscription from <strong>${currentPlan}</strong> to <strong>${newPlan}</strong>.
          </p>
          <p style="color: #4a5568; margin: 0; line-height: 1.6; font-size: 16px;">
            Your current plan will remain active until <strong>${new Date(effectiveDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>, and you'll continue to have full access to all features until then.
          </p>
        </div>

        <!-- Important information -->
        <div style="background-color: #fef3c7; padding: 25px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
          <h3 style="color: #92400e; margin: 0 0 20px 0; font-size: 20px; font-weight: bold;">⏰ Important Information:</h3>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #2d3748;">Current Plan:</strong> ${currentPlan} (active until ${new Date(effectiveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #2d3748;">New Plan:</strong> ${newPlan} (starts ${new Date(effectiveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #2d3748;">Access:</strong> You keep full ${currentPlan} access until the change date
          </div>
          
          <div>
            <strong style="color: #2d3748;">Credits:</strong> Unused credits will remain in your account
          </div>
        </div>

        <!-- Change your mind -->
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h4 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">💙 Changed Your Mind?</h4>
          <p style="color: #475569; margin: 0 0 15px 0; font-size: 14px; line-height: 1.5;">
            You can cancel this downgrade at any time before ${new Date(effectiveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to keep your ${currentPlan} benefits.
          </p>
          <div style="text-align: center;">
            <a href="https://www.jumpinai.com/dashboard/subscription" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
              Manage Subscription
            </a>
          </div>
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
      from: "JumpinAI <info@jumpinai.com>",
      to: [customerEmail],
      subject: `Subscription Change Scheduled - ${newPlan}`,
      html: downgradeHtml,
    });

    console.log("✅ Downgrade email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Downgrade email sent successfully",
        emailId: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error("💥 Error sending downgrade email:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Failed to send downgrade email",
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
