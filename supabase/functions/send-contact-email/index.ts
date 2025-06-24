
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Simple XSS protection function
const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

// Rate limiting check (basic implementation)
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const limit = rateLimitCache.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (limit.count >= 5) { // Max 5 requests per minute
    return false;
  }
  
  limit.count++;
  return true;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Contact form function started");
    console.log("Environment check - RESEND_API_KEY:", Deno.env.get("RESEND_API_KEY") ? "Present" : "Missing");

    // Basic rate limiting
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(clientIP)) {
      console.log("Rate limit exceeded for IP:", clientIP);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, subject, message }: ContactFormData = await req.json();

    console.log("Processing contact form submission:", { name, email, subject });

    // Enhanced input validation
    if (!name || !email || !subject || !message) {
      throw new Error("All fields are required");
    }

    // Length validation to prevent abuse
    if (name.length > 100 || subject.length > 200 || message.length > 5000) {
      throw new Error("Input exceeds maximum allowed length");
    }

    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Sanitize inputs for email content
    const sanitizedName = sanitizeInput(name.trim());
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedSubject = sanitizeInput(subject.trim());
    const sanitizedMessage = sanitizeInput(message.trim());

    console.log("Sending notification email");
    // Send notification email to us
    const notificationResponse = await resend.emails.send({
      from: "info@jumpinai.com",
      to: ["info@jumpinai.com"],
      subject: `New Contact Form Submission: ${sanitizedSubject}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #374151 0%, #1f2937 100%); padding: 30px; text-align: center;">
            <img src="https://lovable.dev/uploads/e5569afe-9d72-47bc-8b5c-5641bd1d4de6.png" alt="JumpinAI Logo" style="width: 48px; height: 48px; margin-bottom: 15px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #374151; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Contact Details</h2>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #6b7280;">Name:</strong>
                <span style="margin-left: 10px;">${sanitizedName}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #6b7280;">Email:</strong>
                <span style="margin-left: 10px;"><a href="mailto:${sanitizedEmail}" style="color: #374151;">${sanitizedEmail}</a></span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #6b7280;">Subject:</strong>
                <span style="margin-left: 10px;">${sanitizedSubject}</span>
              </div>
              
              <div style="margin-bottom: 20px;">
                <strong style="color: #6b7280;">Message:</strong>
                <div style="margin-top: 10px; padding: 15px; background: #f3f4f6; border-left: 4px solid #374151; border-radius: 4px;">
                  ${sanitizedMessage.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 25px;">
                <a href="mailto:${sanitizedEmail}" style="background: linear-gradient(135deg, #374151 0%, #1f2937 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Reply to ${sanitizedName}</a>
              </div>
            </div>
          </div>
          
          <div style="background: #374151; padding: 20px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 14px;">JumpinAI Contact Form System</p>
          </div>
        </div>
      `,
    });

    console.log("Notification email sent:", notificationResponse);

    console.log("Sending confirmation email");
    // Send confirmation email to the user
    const confirmationResponse = await resend.emails.send({
      from: "info@jumpinai.com",
      to: [sanitizedEmail],
      subject: "Thank you for contacting JumpinAI - We'll be in touch soon!",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #374151 0%, #1f2937 100%); padding: 30px; text-align: center;">
            <img src="https://lovable.dev/uploads/e5569afe-9d72-47bc-8b5c-5641bd1d4de6.png" alt="JumpinAI Logo" style="width: 48px; height: 48px; margin-bottom: 15px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Thank You, ${sanitizedName}!</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #374151; margin-bottom: 20px;">We've received your message</h2>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for reaching out to JumpinAI! We've successfully received your message about <strong>"${sanitizedSubject}"</strong> and we're excited to help you with your AI transformation goals.
              </p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #374151;">
                <h3 style="color: #374151; margin-top: 0;">What happens next?</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Our team will review your message within 24 hours</li>
                  <li>We'll get back to you with personalized insights for your AI strategy</li>
                  <li>If needed, we'll schedule a consultation to discuss your goals in detail</li>
                </ul>
              </div>
              
              <p style="font-size: 16px; margin: 20px 0;">
                In the meantime, feel free to explore our resources and stay updated with the latest AI trends by following us on our platforms.
              </p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="mailto:info@jumpinai.com" style="background: linear-gradient(135deg, #374151 0%, #1f2937 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Contact Us Again</a>
              </div>
            </div>
          </div>
          
          <div style="background: #374151; padding: 20px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 14px;">
              Best regards,<br>
              <strong>The JumpinAI Team</strong><br>
              <a href="mailto:info@jumpinai.com" style="color: #d1d5db;">info@jumpinai.com</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Confirmation email sent:", confirmationResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationResponse, 
        confirmationResponse 
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
    console.error("Error in send-contact-email function:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Please check the function logs for more details" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
