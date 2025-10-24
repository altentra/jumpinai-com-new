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
  investmentLevel: string;
  message: string;
}

// Basic rate limiting storage
const rateLimitCache = new Map<string, { count: number; timestamp: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5;

  const record = rateLimitCache.get(ip);
  if (!record || now - record.timestamp > windowMs) {
    rateLimitCache.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= maxRequests) {
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
  console.log("Investor contact function called");

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

    const { name, email, investmentLevel, message }: InvestorContactRequest = await req.json();

    // Validate required fields
    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Name and email are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name.trim()),
      email: sanitizeInput(email.trim().toLowerCase()),
      investmentLevel: investmentLevel ? sanitizeInput(investmentLevel) : "Not specified",
      message: message ? sanitizeInput(message.trim()) : "No message provided"
    };

    console.log("Processing investor inquiry for:", sanitizedData.email);

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "JumpinAI Investor Portal <investors@jumpinai.com>",
      to: ["info@jumpinai.com"],
      subject: `🚀 New Investor Inquiry from ${sanitizedData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://jumpinai.com/images/jumpinai-logo-email.png" alt="JumpinAI" style="max-width: 120px; height: auto;" />
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">New Investor Inquiry</h1>
              <div style="width: 50px; height: 3px; background: linear-gradient(to right, #2563eb, #3b82f6); margin: 10px auto;"></div>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1e293b; margin-top: 0;">Contact Information</h2>
              <p style="margin: 8px 0;"><strong>Name:</strong> ${sanitizedData.name}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${sanitizedData.email}</p>
              <p style="margin: 8px 0;"><strong>Investment Level:</strong> ${sanitizedData.investmentLevel}</p>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px;">
              <h3 style="color: #1e293b; margin-top: 0;">Message</h3>
              <p style="margin: 0; line-height: 1.6; color: #334155;">${sanitizedData.message}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                <strong>JumpinAI - Your Personalized AI Adaptation Studio</strong>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (adminEmailResponse.error) {
      console.error("Failed to send admin notification:", adminEmailResponse.error);
    } else {
      console.log("Admin notification sent successfully");
    }

    // Send confirmation email to investor
    const confirmationEmailResponse = await resend.emails.send({
      from: "JumpinAI Team <investors@jumpinai.com>",
      to: [sanitizedData.email],
      subject: "Thank you for your interest in JumpinAI",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://jumpinai.com/images/jumpinai-logo-email.png" alt="JumpinAI" style="max-width: 120px; height: auto;" />
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">Thank You, ${sanitizedData.name}!</h1>
              <div style="width: 50px; height: 3px; background: linear-gradient(to right, #2563eb, #3b82f6); margin: 10px auto;"></div>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 15px;">
                We've received your investment inquiry and are excited about your interest in JumpinAI - Your Personalized AI Adaptation Studio's mission to democratize AI education.
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 15px;">
                Our team will review your inquiry and respond within 24 hours with more information about investment opportunities and next steps.
              </p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 15px;">What happens next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #334155;">
                <li style="margin-bottom: 8px;">We'll review your inquiry and investment interests</li>
                <li style="margin-bottom: 8px;">A team member will reach out to schedule a discovery call</li>
                <li style="margin-bottom: 8px;">We'll share our investment deck and detailed financials</li>
                <li>We'll discuss partnership opportunities that align with your goals</li>
              </ul>
            </div>
            
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
              <p style="margin: 0; color: #1e40af; font-weight: 500;">
                <strong>Investment Level:</strong> ${sanitizedData.investmentLevel}
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 5px 0;">
                Best regards,<br>
                <strong>JumpinAI - Your Personalized AI Adaptation Studio</strong>
              </p>
              <p style="color: #64748b; font-size: 12px; margin-top: 15px;">
                Empowering professionals with personalized AI adaptation strategies.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (confirmationEmailResponse.error) {
      console.error("Failed to send confirmation email:", confirmationEmailResponse.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to send confirmation email" 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Investor inquiry processed successfully");
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Investment inquiry submitted successfully" 
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
        success: false, 
        error: "Internal server error" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);