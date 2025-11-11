import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Sending test newsletter sample email");

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const unsubscribeUrl = `${supabaseUrl}/functions/v1/unsubscribe-newsletter?email=info@jumpinai.com`;

    const testEmail = await resend.emails.send({
      from: "info@jumpinai.com",
      to: ["info@jumpinai.com"],
      subject: "📧 NEW Newsletter Welcome Email Sample — For Review",
      html: `
        <div style="max-width: 650px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f3f4f6; padding: 20px;">
          <div style="background: #1f2937; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px;">🎨 NEW Newsletter Welcome Email — Sample for Review</h2>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #d1d5db;">This is how the revamped welcome email will look to new subscribers</p>
          </div>

          <div style="background: white; padding: 10px; border-radius: 8px;">
            <!-- THE ACTUAL EMAIL PREVIEW STARTS HERE -->
            <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937;">
              <div style="text-align: center; padding: 30px 20px;">
                <img src="https://jumpinai.com/images/jumpinai-logo-email.png" alt="JumpinAI" style="max-width: 180px; height: auto;" />
              </div>
              
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Welcome to JumpinAI! 🚀</h1>
                <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 18px; font-weight: 400;">Your AI transformation journey begins now</p>
              </div>
              
              <div style="padding: 40px 30px; background: #ffffff; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <p style="font-size: 17px; line-height: 1.7; margin-bottom: 25px; color: #374151;">
                  Thank you for joining our community! You've just taken the first step toward mastering AI in your daily work. We're here to guide you every step of the way.
                </p>
                
                <div style="background: linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%); padding: 28px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #3b82f6;">
                  <h3 style="color: #1f2937; margin: 0 0 18px 0; font-size: 20px; font-weight: 600;">What You'll Receive Every Week:</h3>
                  <ul style="margin: 0; padding-left: 22px; color: #374151; font-size: 16px; line-height: 1.8;">
                    <li style="margin-bottom: 12px;"><strong style="color: #1f2937;">Strategic AI Insights:</strong> Expert guidance on integrating AI into your work and business</li>
                    <li style="margin-bottom: 12px;"><strong style="color: #1f2937;">Exclusive Tools & Prompts:</strong> Ready-to-use resources that deliver immediate results</li>
                    <li style="margin-bottom: 12px;"><strong style="color: #1f2937;">JumpinAI Studio Updates:</strong> Latest features and AI models in our adaptation platform</li>
                    <li style="margin-bottom: 12px;"><strong style="color: #1f2937;">Personalized Jumps:</strong> 3-tab adaptation plans with strategic analysis, tools, and prompts</li>
                    <li style="margin-bottom: 0;"><strong style="color: #1f2937;">Industry Breakthroughs:</strong> Stay ahead with the latest AI developments and trends</li>
                  </ul>
                </div>
                
                <div style="background: #fefce8; padding: 20px; border-radius: 8px; border-left: 4px solid #eab308; margin: 25px 0;">
                  <p style="margin: 0; color: #713f12; font-size: 15px; line-height: 1.6;">
                    <strong style="color: #854d0e;">🎯 Pro Tip:</strong> Each newsletter is packed with actionable strategies you can implement immediately. No fluff, just results.
                  </p>
                </div>
                
                <p style="font-size: 17px; margin: 25px 0; color: #374151; line-height: 1.7;">
                  Your first newsletter is on its way! In the meantime, explore <a href="https://jumpinai.com" style="color: #3b82f6; text-decoration: none; font-weight: 600; border-bottom: 2px solid #3b82f6;">JumpinAI Studio</a> to start creating personalized AI adaptation plans today.
                </p>
                
                <div style="text-align: center; margin: 35px 0;">
                  <a href="https://jumpinai.com" style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); transition: all 0.3s;">Visit JumpinAI Studio</a>
                </div>
                
                <div style="border-top: 2px solid #f3f4f6; padding-top: 25px; margin-top: 30px; text-align: center;">
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 15px;">Questions? We're always here to help!</p>
                  <p style="margin: 0; color: #374151; font-size: 15px;">
                    Email us at <a href="mailto:info@jumpinai.com" style="color: #3b82f6; text-decoration: none; font-weight: 600;">info@jumpinai.com</a>
                  </p>
                </div>
              </div>
              
              <div style="padding: 25px 30px; text-align: center; background: #f9fafb; margin-top: 20px; border-radius: 8px;">
                <p style="color: #374151; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">
                  JumpinAI — Your Personalized AI Adaptation Studio
                </p>
                <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
                  Transforming how professionals work with AI
                </p>
                <p style="color: #9ca3af; margin: 0; font-size: 13px;">
                  <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> anytime with one click
                </p>
              </div>
            </div>
            <!-- THE ACTUAL EMAIL PREVIEW ENDS HERE -->
          </div>

          <div style="background: #1f2937; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px;">
            <p style="margin: 0; font-size: 13px; color: #d1d5db;">
              ✅ This is a sample for review purposes only<br>
              The actual email will be sent to subscribers upon newsletter signup
            </p>
          </div>
        </div>
      `,
    });

    console.log("Test email sent:", testEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Test newsletter sample sent to info@jumpinai.com",
        emailId: testEmail.data?.id
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending test email:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
