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
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 New User Signup!</h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Someone just joined JumpinAI</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #374151; margin-bottom: 20px;">User Details</h2>
              
              <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #059669;">
                <div style="margin-bottom: 10px;">
                  <strong style="color: #065f46;">Email:</strong>
                  <div style="margin-top: 5px;">
                    <a href="mailto:${email}" style="color: #374151; text-decoration: none; font-size: 16px;">${email}</a>
                  </div>
                </div>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #6b7280;">Display Name:</strong>
                <span style="margin-left: 10px; color: #374151;">${displayName}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #6b7280;">Signup Method:</strong>
                <span style="margin-left: 10px; color: #374151;">${signupMethod}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #6b7280;">Timestamp:</strong>
                <span style="margin-left: 10px; color: #374151;">${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', dateStyle: 'full', timeStyle: 'long' })}</span>
              </div>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #78350f; font-size: 14px;">
                  <strong>💡 Next Steps:</strong> Consider sending a personalized welcome email or adding to your email nurture sequence.
                </p>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              This notification was sent automatically from JumpinAI user signup system
            </p>
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
