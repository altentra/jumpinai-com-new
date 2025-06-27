
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface RequestBody {
  email: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { email }: RequestBody = await req.json();
    console.log("Processing lead magnet email for:", email);

    if (!email) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email is required" 
        }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid email format" 
        }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email service configuration error" 
        }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }

    // PDF download URL
    const pdfUrl = "https://cieczaajcgkgdgenfdzi.supabase.co/storage/v1/object/public/lead-magnets/jumpstart-ai-7-fast-wins.pdf";

    // Send email using Resend
    const emailData = {
      from: "JumpinAI <info@jumpinai.com>",
      to: [email],
      subject: "🚀 Your Free AI Guide: 7 Fast Wins You Can Use Today!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Free AI Guide</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 10px;">🚀 Welcome to JumpinAI!</h1>
            <p style="font-size: 18px; color: #666; margin: 0;">Your AI journey starts now</p>
          </div>

          <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
            <h2 style="color: #1e293b; font-size: 24px; margin-bottom: 20px; text-align: center;">
              📥 Download Your Free Guide
            </h2>
            
            <div style="text-align: center; margin-bottom: 25px;">
              <a href="${pdfUrl}" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                📄 Download: Jumpstart AI - 7 Fast Wins
              </a>
            </div>
            
            <p style="text-align: center; color: #64748b; font-size: 14px; margin: 0;">
              Click the button above to download your PDF instantly
            </p>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #1e293b; font-size: 20px; margin-bottom: 15px;">🎯 What's Inside:</h3>
            <ul style="color: #475569; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;"><strong>7 Proven AI Strategies</strong> - Ready to implement today</li>
              <li style="margin-bottom: 8px;"><strong>Real-World Examples</strong> - See exactly how it works</li>
              <li style="margin-bottom: 8px;"><strong>Step-by-Step Instructions</strong> - No technical background needed</li>
              <li style="margin-bottom: 8px;"><strong>Quick Wins</strong> - Start seeing results immediately</li>
            </ul>
          </div>

          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin-bottom: 30px;">
            <p style="margin: 0; color: #065f46; font-weight: 500;">
              💡 <strong>Pro Tip:</strong> Don't just read the guide - pick one strategy and implement it this week. 
              That's how you'll see real results!
            </p>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 15px;">🚀 What's Next?</h3>
            <p style="color: #475569; margin-bottom: 15px;">
              This is just the beginning! We're building a community of professionals who are successfully 
              implementing AI in their businesses.
            </p>
            <div style="text-align: center;">
              <a href="https://whop.com/jumpinai/" 
                 style="display: inline-block; background: #059669; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                🔥 Join Our Whop Community
              </a>
            </div>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">
              Questions? Reply to this email - we read every message!
            </p>
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong>The JumpinAI Team</strong>
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              You're receiving this because you downloaded our free AI guide from jumpinai.com
            </p>
          </div>

        </body>
        </html>
      `,
    };

    console.log("Sending email to:", email);
    
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend API error:", response.status, errorText);
      throw new Error(`Failed to send email: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("Email sent successfully:", result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Lead magnet email sent successfully",
        emailId: result.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

  } catch (error) {
    console.error("Error in send-lead-magnet-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to send lead magnet email" 
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
