import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JumpGenerationNotification {
  userType: 'authenticated' | 'guest';
  userId?: string;
  userEmail?: string;
  userName?: string;
  ipAddress?: string;
  location?: string;
  goals: string;
  challenges: string;
  timestamp: string;
  userAgent?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received jump generation notification request");

    const data: JumpGenerationNotification = await req.json();
    
    console.log("Jump generation data:", {
      userType: data.userType,
      userId: data.userId,
      hasGoals: !!data.goals,
      hasChallenges: !!data.challenges,
    });

    // Format the timestamp
    const formattedTime = new Date(data.timestamp).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });

    // Build the email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); padding: 24px; color: white; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 8px 0 0; opacity: 0.9; }
          .content { padding: 24px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 14px; font-weight: 600; color: #6366F1; text-transform: uppercase; margin-bottom: 8px; }
          .info-row { display: flex; margin-bottom: 8px; }
          .info-label { font-weight: 600; color: #374151; min-width: 120px; }
          .info-value { color: #6B7280; }
          .input-box { background: #F3F4F6; border-radius: 8px; padding: 16px; margin-top: 8px; }
          .input-box p { margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .badge-authenticated { background: #D1FAE5; color: #065F46; }
          .badge-guest { background: #FEE2E2; color: #991B1B; }
          .footer { background: #F9FAFB; padding: 16px 24px; text-align: center; font-size: 12px; color: #9CA3AF; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 New Jump Generation</h1>
            <p>${formattedTime}</p>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="section-title">User Information</div>
              <div class="info-row">
                <span class="info-label">Type:</span>
                <span class="info-value">
                  <span class="badge ${data.userType === 'authenticated' ? 'badge-authenticated' : 'badge-guest'}">
                    ${data.userType === 'authenticated' ? '✓ Authenticated' : '👤 Guest'}
                  </span>
                </span>
              </div>
              ${data.userId ? `
              <div class="info-row">
                <span class="info-label">User ID:</span>
                <span class="info-value">${data.userId}</span>
              </div>
              ` : ''}
              ${data.userEmail ? `
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${data.userEmail}</span>
              </div>
              ` : ''}
              ${data.userName ? `
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${data.userName}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="section">
              <div class="section-title">Location & Device</div>
              <div class="info-row">
                <span class="info-label">IP Address:</span>
                <span class="info-value">${data.ipAddress || 'Unknown'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Location:</span>
                <span class="info-value">${data.location || 'Unknown'}</span>
              </div>
              ${data.userAgent ? `
              <div class="info-row">
                <span class="info-label">Device:</span>
                <span class="info-value" style="font-size: 11px;">${data.userAgent.substring(0, 100)}${data.userAgent.length > 100 ? '...' : ''}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="section">
              <div class="section-title">🎯 Goals Input</div>
              <div class="input-box">
                <p>${data.goals || 'No goals provided'}</p>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">⚡ Challenges Input</div>
              <div class="input-box">
                <p>${data.challenges || 'No challenges provided'}</p>
              </div>
            </div>
          </div>
          
          <div class="footer">
            JumpinAI Studio - Generation Notification
          </div>
        </div>
      </body>
      </html>
    `;

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "JumpinAI Studio <noreply@jumpinai.com>",
      to: ["info@jumpinai.com"],
      subject: `🚀 New Jump: ${data.userType === 'authenticated' ? data.userName || data.userEmail || 'User' : 'Guest'} started generation`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending jump generation notification:", error);
    // Don't fail the main flow - just log the error
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 200, // Return 200 to not disrupt the main flow
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
