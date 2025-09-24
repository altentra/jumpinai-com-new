import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AbandonedCartRequest {
  userEmail: string;
  productId: string;
  productName: string;
  productPrice: number;
  userName?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, productId, productName, productPrice, userName }: AbandonedCartRequest = await req.json();

    if (!userEmail || !productId || !productName) {
      throw new Error("Missing required fields");
    }

    const displayName = userName || userEmail.split('@')[0];
    const priceFormatted = (productPrice / 100).toFixed(2);

    // Send welcome email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "JumpinAI <welcome@jumpinai.com>",
      to: [userEmail],
      subject: "Welcome to JumpinAI - Complete Your Purchase",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 10px;">Welcome to JumpinAI!</h1>
            <div style="width: 50px; height: 3px; background: linear-gradient(90deg, #2563eb, #7c3aed); margin: 0 auto;"></div>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border-left: 4px solid #2563eb;">
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${displayName},</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">
              Thank you for your interest in our AI tools and resources! We noticed you were considering 
              <strong>${productName}</strong> but didn't complete your purchase.
            </p>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">
              We're here to help you accelerate your AI journey with proven strategies and tools 
              that deliver real results.
            </p>
          </div>

          <div style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #1e293b; margin-top: 0; font-size: 20px;">${productName}</h3>
            <p style="color: #64748b; margin: 10px 0; font-size: 24px; font-weight: bold;">$${priceFormatted}</p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${Deno.env.get("SUPABASE_URL")?.replace('supabase.co', 'vercel.app') || 'https://jumpinai.com'}/purchase/${productId}" 
                 style="background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; transition: transform 0.2s;">
                Complete Your Purchase
              </a>
            </div>
          </div>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px; text-align: center;">
              <strong>💡 Limited Time:</strong> Join thousands of professionals already using our AI tools to boost productivity and results.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0; color: #64748b; font-size: 14px;">
            <p>Need help? Reply to this email or visit our support center.</p>
            <p style="margin-top: 20px;">
              Best regards,<br>
              <strong style="color: #2563eb;">The JumpinAI Team</strong>
            </p>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p>JumpinAI - Accelerating AI Adoption for Professionals</p>
            <p>If you no longer wish to receive these emails, you can unsubscribe at any time.</p>
          </div>
        </div>
      `,
    });

    // Send notification email to company
    const notificationEmailResponse = await resend.emails.send({
      from: "JumpinAI Alerts <alerts@jumpinai.com>",
      to: ["info@jumpinai.com"],
      subject: `🛒 Abandoned Cart Alert - ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">Abandoned Cart Notification</h2>
          
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #991b1b; margin-top: 0;">Customer Details:</h3>
            <ul style="color: #7f1d1d;">
              <li><strong>Email:</strong> ${userEmail}</li>
              <li><strong>Name:</strong> ${displayName}</li>
              <li><strong>Product:</strong> ${productName}</li>
              <li><strong>Price:</strong> $${priceFormatted}</li>
              <li><strong>Product ID:</strong> ${productId}</li>
              <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 15px;">
            <p style="color: #0c4a6e; margin: 0;">
              <strong>Action Taken:</strong> Automated welcome email sent to customer with purchase link.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Abandoned cart emails sent:", { 
      customer: customerEmailResponse, 
      notification: notificationEmailResponse 
    });

    return new Response(JSON.stringify({ 
      success: true,
      customerEmailId: customerEmailResponse.data?.id,
      notificationEmailId: notificationEmailResponse.data?.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error in abandoned-cart-email function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});