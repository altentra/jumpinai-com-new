import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RequestBody {
  email: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

// Helper function to format date in PST
const formatDatePST = (date: Date): string => {
  return date.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
};

serve(async (req: Request) => {
  const startTime = Date.now();
  console.log("Edge function called with method:", req.method, "at", formatDatePST(new Date()));
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight");
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    console.log("Invalid method:", req.method);
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      },
    });
  }

  try {
    console.log("Processing request body...");
    const { email }: RequestBody = await req.json();
    console.log("Processing lead magnet email for:", email, "at", Date.now() - startTime, "ms");

    if (!email) {
      console.log("No email provided");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email is required" 
        }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Invalid email format:", email);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid email format" 
        }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
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
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    // Add to unified contacts table
    console.log("Adding contact to unified system...");
    const { data: contactData, error: contactError } = await supabase
      .rpc('upsert_contact', {
        p_email: email,
        p_source: 'lead_magnet',
        p_lead_magnet_downloaded: true,
        p_tags: ['lead_magnet_subscriber']
      });

    if (contactError) {
      console.error("Error adding contact:", contactError);
      // Continue with email sending even if contact insert fails
    } else {
      console.log("Contact added successfully:", contactData);
      
      // Log the activity
      await supabase
        .from('contact_activities')
        .insert({
          contact_id: contactData,
          activity_type: 'lead_magnet_download',
          source: 'website',
          details: {
            pdf_name: 'Jumpstart AI: 7 Fast Wins You Can Use Today',
            user_agent: req.headers.get('user-agent') || 'unknown'
          }
        });
    }

    // Keep original lead_magnet_downloads for legacy tracking
    const { error: insertError } = await supabase
      .from('lead_magnet_downloads')
      .insert({
        email: email,
        ip_address: null,
        user_agent: req.headers.get('user-agent') || 'unknown'
      });

    if (insertError) {
      console.error("Database insert error:", insertError);
      // Don't throw error here, we still want to send the email
    }

    // Use the professional branded URL for PDF download
    const pdfUrl = "https://jumpinai.com/download/ai-guide";

    // Prepare both emails
    const userEmailData = {
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

    const adminEmailData = {
      from: "JumpinAI <info@jumpinai.com>",
      to: ["info@jumpinai.com"],
      subject: "🎉 New Lead Magnet Download - JumpinAI",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Lead Capture</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; font-size: 28px; margin-bottom: 10px;">🎉 New Lead Captured!</h1>
            <p style="font-size: 18px; color: #666; margin: 0;">Someone just downloaded your AI guide</p>
          </div>

          <div style="background: #f0fdf4; border: 2px solid #059669; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
            <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 20px; text-align: center;">
              📧 Lead Details
            </h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
              <p style="margin: 0; font-size: 16px;"><strong>Email:</strong> ${email}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
              <p style="margin: 0; font-size: 16px;"><strong>Downloaded:</strong> Jumpstart AI - 7 Fast Wins You Can Use Today</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <p style="margin: 0; font-size: 16px;"><strong>Time (PST):</strong> ${formatDatePST(new Date())}</p>
            </div>
          </div>

          <div style="text-align: center; margin-bottom: 20px;">
            <p style="color: #475569; font-size: 14px; margin: 0;">
              🚀 <strong>Next steps:</strong> Consider following up with this lead or adding them to your nurture sequence.
            </p>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              This notification was sent automatically from your JumpinAI lead magnet system.
            </p>
          </div>

        </body>
        </html>
      `,
    };

    console.log("Sending both emails in parallel at", Date.now() - startTime, "ms");
    
    // Send both emails in parallel with timeout
    const emailPromises = [
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(userEmailData),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }),
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(adminEmailData),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })
    ];

    const [userResponse, adminResponse] = await Promise.allSettled(emailPromises);
    console.log("Both email requests completed at", Date.now() - startTime, "ms");

    // Handle user email result
    let userResult;
    if (userResponse.status === 'fulfilled' && userResponse.value.ok) {
      userResult = await userResponse.value.json();
      console.log("Welcome email sent successfully:", userResult, "at", Date.now() - startTime, "ms");
    } else {
      const error = userResponse.status === 'fulfilled' 
        ? await userResponse.value.text() 
        : userResponse.reason;
      console.error("Failed to send user email:", error);
      throw new Error(`Failed to send user email: ${error}`);
    }

    // Handle admin email result (non-critical)
    if (adminResponse.status === 'fulfilled' && adminResponse.value.ok) {
      const adminResult = await adminResponse.value.json();
      console.log("Admin notification sent successfully:", adminResult, "at", Date.now() - startTime, "ms");
    } else {
      const error = adminResponse.status === 'fulfilled' 
        ? await adminResponse.value.text() 
        : adminResponse.reason;
      console.error("Admin notification failed (non-critical):", error);
    }

    // 🚀 NEW: Sync to Google Sheets after successful email processing
    console.log("Syncing contact to Google Sheets...");
    try {
      const { data: syncData, error: syncError } = await supabase.functions.invoke('sync-to-google-sheets', {
        body: { email }
      });

      if (syncError) {
        console.error("Google Sheets sync error (non-critical):", syncError);
      } else {
        console.log("Google Sheets sync successful:", syncData);
      }
    } catch (syncError) {
      console.error("Google Sheets sync failed (non-critical):", syncError);
    }

    console.log("Function completed successfully in", Date.now() - startTime, "ms");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Lead magnet email sent successfully",
        emailId: userResult.id,
        processingTime: Date.now() - startTime
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error("Error in send-lead-magnet-email function:", error, "after", processingTime, "ms");
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to send lead magnet email",
        processingTime
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
