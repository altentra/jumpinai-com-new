
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

const createHtmlPage = (title: string, heading: string, message: string, icon: string, isSuccess = false) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${sanitizeInput(title)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .container {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 500px;
      width: 100%;
    }
    
    .icon {
      font-size: 64px;
      margin-bottom: 20px;
      display: block;
    }
    
    h1 {
      color: ${isSuccess ? '#059669' : '#dc2626'};
      margin-bottom: 20px;
      font-size: 28px;
      font-weight: 700;
    }
    
    p {
      margin-bottom: 15px;
      color: #6b7280;
      font-size: 16px;
    }
    
    .details-box {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin: 30px 0;
      border-left: 4px solid ${isSuccess ? '#059669' : '#6b7280'};
    }
    
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      margin-top: 20px;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }
    
    .contact-info {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #9ca3af;
    }
    
    .contact-info a {
      color: #374151;
      text-decoration: none;
    }
    
    .contact-info a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <span class="icon">${icon}</span>
    <h1>${sanitizeInput(heading)}</h1>
    ${message}
    <a href="https://jumpinai.com" class="button">← Back to JumpinAI</a>
    <div class="contact-info">
      <p>Questions? Contact us at <a href="mailto:info@jumpinai.com">info@jumpinai.com</a></p>
      <p style="margin-top: 10px;">JumpinAI Newsletter System</p>
    </div>
  </div>
</body>
</html>`;
  
  return html;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Unsubscribe request received:", req.method, req.url);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    console.log("Processing unsubscribe request for:", email);

    if (!email) {
      const errorHtml = createHtmlPage(
        "Invalid Unsubscribe Link - JumpinAI",
        "Invalid Unsubscribe Link",
        "<p>The unsubscribe link is invalid or expired.</p><p>If you continue to receive emails, please contact us directly at <strong>info@jumpinai.com</strong></p>",
        "⚠️"
      );
      
      return new Response(errorHtml, {
        status: 400,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
          ...corsHeaders,
        },
      });
    }

    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      const errorHtml = createHtmlPage(
        "Invalid Email - JumpinAI",
        "Invalid Email Format",
        "<p>The email address in the unsubscribe link is not valid.</p><p>If you need assistance, please contact us at <strong>info@jumpinai.com</strong></p>",
        "⚠️"
      );
      
      return new Response(errorHtml, {
        status: 400,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
          ...corsHeaders,
        },
      });
    }

    const sanitizedEmail = email.toLowerCase().trim();

    // Update the subscriber to mark as inactive
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .update({ is_active: false })
      .eq('email', sanitizedEmail)
      .eq('is_active', true)
      .select();

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      // Email not found or already unsubscribed
      const alreadyUnsubscribedHtml = createHtmlPage(
        "Already Unsubscribed - JumpinAI",
        "Already Unsubscribed",
        "<p>This email address is already unsubscribed or was not found in our list.</p><p>If you continue to receive emails, please contact us at <strong>info@jumpinai.com</strong></p>",
        "ℹ️"
      );
      
      return new Response(alreadyUnsubscribedHtml, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
          ...corsHeaders,
        },
      });
    }

    console.log("Successfully unsubscribed:", sanitizedEmail);

    // Return success page
    const successHtml = createHtmlPage(
      "Successfully Unsubscribed - JumpinAI",
      "Successfully Unsubscribed",
      `<p>You have been successfully unsubscribed from the JumpinAI newsletter.</p>
       <p>We're sorry to see you go! If you change your mind, you can always subscribe again on our website.</p>
       <div class="details-box">
         <p><strong>Email:</strong> ${sanitizeInput(sanitizedEmail)}</p>
         <p><strong>Unsubscribed on:</strong> ${new Date().toLocaleDateString()}</p>
       </div>`,
      "✅",
      true
    );
    
    return new Response(successHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in unsubscribe function:", error);
    
    const errorHtml = createHtmlPage(
      "Unsubscribe Error - JumpinAI",
      "Error Processing Request",
      "<p>There was an error processing your unsubscribe request. Please try again or contact us directly.</p><p><strong>Contact:</strong> info@jumpinai.com</p>",
      "❌"
    );
    
    return new Response(errorHtml, {
      status: 500,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        ...corsHeaders,
      },
    });
  }
};

serve(handler);
