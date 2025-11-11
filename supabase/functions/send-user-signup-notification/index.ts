import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignupNotification {
  email: string;
  name?: string;
  provider?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, provider }: SignupNotification = await req.json();
    
    console.log("Sending new user signup notification for:", email);

    const displayName = name || email.split('@')[0];
    const signupMethod = provider || 'email';

    // Send notification email to admin
    const emailResponse = await resend.emails.send({
      from: "JumpinAI Notifications <notifications@jumpinai.com>",
      to: ["info@jumpinai.com"],
      subject: `🎉 New User Signed Up - ${email}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <!-- Header with Logo -->
              <div style="text-align: center; padding: 30px 20px 20px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <img src="https://jumpinai.com/images/jumpinai-logo-email.png" alt="JumpinAI" style="max-width: 120px; height: auto; border-radius: 12px;" />
              </div>
              
              <!-- Content -->
              <div style="padding: 30px;">
                <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 5px 0; text-align: center;">🎉 New User Signup!</h1>
                <p style="color: #666; margin: 0 0 20px 0; text-align: center; font-size: 15px;">Someone just joined JumpinAI</p>
                
                <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #059669;">
                  <p style="margin: 0 0 10px 0; color: #333;"><strong style="color: #065f46;">Email:</strong></p>
                  <p style="margin: 0;"><a href="mailto:${email}" style="color: #374151; text-decoration: none; font-size: 15px;">${email}</a></p>
                </div>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                  <p style="margin: 0 0 10px 0; color: #333;"><strong>Display Name:</strong> ${displayName}</p>
                  <p style="margin: 0 0 10px 0; color: #333;"><strong>Signup Method:</strong> ${signupMethod}</p>
                  <p style="margin: 0; color: #333;"><strong>Timestamp:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', dateStyle: 'full', timeStyle: 'long' })}</p>
                </div>
                
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; color: #78350f; font-size: 14px;">
                    <strong>💡 Next Steps:</strong> Consider sending a personalized welcome email or adding to your email nurture sequence.
                  </p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Questions? We're always here to help!</p>
                <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">Email us at <a href="mailto:info@jumpinai.com" style="color: #667eea; text-decoration: none;">info@jumpinai.com</a></p>
                <p style="margin: 0 0 5px 0; color: #999; font-size: 13px; font-weight: bold;">JumpinAI.</p>
                <p style="margin: 0 0 10px 0; color: #999; font-size: 12px;">Your Personalized AI Adaptation Studio.</p>
              </div>
              
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Signup notification sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        emailResponse 
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
    console.error("Error in send-user-signup-notification:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Failed to send signup notification",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
