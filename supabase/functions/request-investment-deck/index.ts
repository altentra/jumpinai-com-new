import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvestmentDeckRequest {
  email: string;
  name: string;
  company?: string;
  title?: string;
}

// Basic rate limiting storage
const rateLimitCache = new Map<string, { count: number; timestamp: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 3; // Stricter limit for deck downloads

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

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Investment deck request function called");

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

    const { email, name, company, title }: InvestmentDeckRequest = await req.json();

    // Validate required fields
    if (!email || !name) {
      return new Response(
        JSON.stringify({ error: "Email and name are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid email address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      email: sanitizeInput(email.trim().toLowerCase()),
      name: sanitizeInput(name.trim()),
      company: company ? sanitizeInput(company.trim()) : "",
      title: title ? sanitizeInput(title.trim()) : ""
    };

    console.log("Processing investment deck request for:", sanitizedData.email);

    // Generate a secure download token
    const downloadToken = crypto.randomUUID();
    const downloadUrl = `https://cieczaajcgkgdgenfdzi.supabase.co/functions/v1/download-investment-deck?token=${downloadToken}&email=${encodeURIComponent(sanitizedData.email)}`;

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "JumpinAI Investor Portal <investors@jumpinai.com>",
      to: ["info@jumpinai.com"],
      subject: `📊 Investment Deck Request from ${sanitizedData.name}`,
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
                <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 20px 0; text-align: center;">Investment Deck Request</h1>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
                  <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">Professional Details</h2>
                  <p style="margin: 5px 0; color: #333;"><strong>Name:</strong> ${sanitizedData.name}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Email:</strong> ${sanitizedData.email}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Company:</strong> ${sanitizedData.company || "Not provided"}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Title:</strong> ${sanitizedData.title || "Not provided"}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Download Token:</strong> ${downloadToken}</p>
                </div>
                
                <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 14px; margin: 0;">
                    Investment deck download initiated.
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

    if (adminEmailResponse.error) {
      console.error("Failed to send admin notification:", adminEmailResponse.error);
    } else {
      console.log("Admin notification sent successfully");
    }

    // Send investment deck email to requester
    const deckEmailResponse = await resend.emails.send({
      from: "JumpinAI Investments <investors@jumpinai.com>",
      to: [sanitizedData.email],
      subject: "Your JumpinAI Investment Deck is Ready",
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
                <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 20px 0; text-align: center;">Your Investment Deck is Ready</h1>
                
                <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 15px 0;">
                  Dear ${sanitizedData.name},
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 15px 0;">
                  Thank you for your interest in JumpinAI. We're excited to share our investment opportunity with you.
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 25px 0;">
                  You can access our comprehensive investment deck using the secure download link below:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${downloadUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Download Investment Deck
                  </a>
                </div>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                  <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 16px;">What's included in the deck:</h3>
                  <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 15px;">
                    <li style="margin-bottom: 8px;">Market opportunity and size analysis</li>
                    <li style="margin-bottom: 8px;">Business model and revenue streams</li>
                    <li style="margin-bottom: 8px;">Financial projections and growth metrics</li>
                    <li style="margin-bottom: 8px;">Competitive landscape analysis</li>
                    <li style="margin-bottom: 8px;">Team background and expertise</li>
                    <li>Use of funds and investment terms</li>
                  </ul>
                </div>
                
                <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin-bottom: 25px;">
                  <p style="margin: 0; color: #1e40af; font-weight: 500; font-size: 14px;">
                    <strong>Next Steps:</strong> After reviewing the deck, we'd love to schedule a call to discuss the opportunity in more detail and answer any questions you may have.
                  </p>
                </div>
                
                <p style="color: #64748b; font-size: 13px; margin: 15px 0 5px 0; text-align: center;">
                  This download link is secure and expires in 7 days for security purposes.
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

    if (deckEmailResponse.error) {
      console.error("Failed to send deck email:", deckEmailResponse.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to send investment deck email" 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Investment deck request processed successfully");
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Investment deck sent to your email",
        downloadToken: downloadToken
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in request-investment-deck function:", error);
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
