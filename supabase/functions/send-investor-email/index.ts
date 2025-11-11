import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvestorContactRequest {
  name: string;
  email: string;
  company: string;
  title: string;
  message: string;
}

// Basic rate limiting storage
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const limit = 3; // 3 requests
  const window = 60 * 60 * 1000; // per hour

  const record = rateLimitCache.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + window });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
};

const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Investor contact email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("cf-connecting-ip") || 
                    req.headers.get("x-forwarded-for") || 
                    "unknown";
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, company, title, message }: InvestorContactRequest = await req.json();

    // Validate required fields
    if (!name || !email || !company || !title || !message) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      company: sanitizeInput(company),
      title: sanitizeInput(title),
      message: sanitizeInput(message)
    };

    console.log("Processing investor contact from:", sanitizedData.email);

    // Send notification email to info@jumpinai.com
    const notificationResponse = await resend.emails.send({
      from: "JumpinAI Investors <investors@jumpinai.com>",
      to: ["info@jumpinai.com"],
      subject: `Investor Inquiry from ${sanitizedData.name} - ${sanitizedData.company}`,
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
                <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 20px 0; text-align: center;">Investor Inquiry</h1>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px;">Contact Details:</h2>
                  <p style="margin: 5px 0; color: #333;"><strong>Name:</strong> ${sanitizedData.name}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Email:</strong> <a href="mailto:${sanitizedData.email}" style="color: #667eea; text-decoration: none;">${sanitizedData.email}</a></p>
                  <p style="margin: 5px 0; color: #333;"><strong>Company:</strong> ${sanitizedData.company}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Title:</strong> ${sanitizedData.title}</p>
                </div>
                
                <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                  <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">Message:</p>
                  <p style="margin: 0; color: #555; line-height: 1.6; white-space: pre-wrap;">${sanitizedData.message}</p>
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

    if (notificationResponse.error) {
      console.error("Failed to send notification email:", notificationResponse.error);
      throw new Error("Failed to send notification email");
    }

    // Send confirmation email to the investor
    const confirmationResponse = await resend.emails.send({
      from: "JumpinAI <noreply@jumpinai.com>",
      to: [email],
      subject: "Thank you for your interest in JumpinAI",
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
                <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 20px 0; text-align: center;">Thank you for reaching out!</h1>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Dear ${sanitizedData.name},</p>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                  Thank you for your interest in investing in JumpinAI. We've received your message and our team will review it shortly.
                </p>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                  We typically respond to investment inquiries within 24-48 hours. In the meantime, feel free to explore our platform and learn more about how we're revolutionizing AI adaptation.
                </p>
                
                <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
                  <p style="margin: 0; color: #1e40af; font-size: 14px;">
                    <strong>Next Steps:</strong> Our team will review your inquiry and reach out to schedule a meeting to discuss the investment opportunity in detail.
                  </p>
                </div>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
                  Best regards,<br>
                  <strong style="color: #667eea;">The JumpinAI Team</strong>
                </p>
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

    if (confirmationResponse.error) {
      console.error("Failed to send confirmation email:", confirmationResponse.error);
    }

    console.log("Investor contact emails sent successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thank you for your interest. We'll be in touch soon.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-investor-email function:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to send message. Please try again later.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
