import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurchaseNotification {
  type: 'product' | 'subscription';
  customerEmail: string;
  customerName?: string;
  amount: number;
  currency: string;
  productName?: string;
  subscriptionTier?: string;
  orderId?: string;
  stripeSessionId?: string;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== Purchase notification function started ===");
    
    const notification: PurchaseNotification = await req.json();
    console.log("📧 Sending purchase notification:", notification);

    const { 
      type, 
      customerEmail, 
      customerName,
      amount, 
      currency, 
      productName, 
      subscriptionTier,
      orderId,
      stripeSessionId,
      timestamp 
    } = notification;

    // Format amount
    const formattedAmount = `${currency.toUpperCase()} $${(amount / 100).toFixed(2)}`;
    
    // Determine subject and content based on type
    let subject: string;
    let htmlContent: string;
    
    if (type === 'subscription') {
      subject = `🎉 New Pro Subscription - ${customerEmail}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">🎉 New Pro Subscription!</h1>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 15px 0; color: #1e293b;">Customer Details:</h2>
            <p><strong>Email:</strong> ${customerEmail}</p>
            ${customerName ? `<p><strong>Name:</strong> ${customerName}</p>` : ''}
            <p><strong>Subscription Tier:</strong> ${subscriptionTier || 'JumpinAI Pro'}</p>
            <p><strong>Amount:</strong> ${formattedAmount}</p>
            <p><strong>Date:</strong> ${new Date(timestamp).toLocaleString()}</p>
          </div>
          
          <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #059669;">
              <strong>💰 Monthly Recurring Revenue Increased!</strong><br>
              This customer will now have access to all Pro features including blueprints, advanced workflows, and premium prompts.
            </p>
          </div>
          
          ${stripeSessionId ? `
          <div style="margin-top: 20px; padding: 15px; background-color: #f1f5f9; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">
              <strong>Stripe Session ID:</strong> ${stripeSessionId}
            </p>
          </div>
          ` : ''}
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            This notification was sent automatically from JumpinAI when a new Pro subscription was created.
          </p>
        </div>
      `;
    } else {
      subject = `🛒 New Product Purchase - ${productName}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">🛒 New Product Purchase!</h1>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 15px 0; color: #1e293b;">Purchase Details:</h2>
            <p><strong>Customer:</strong> ${customerEmail}</p>
            ${customerName ? `<p><strong>Name:</strong> ${customerName}</p>` : ''}
            <p><strong>Product:</strong> ${productName || 'Digital Product'}</p>
            <p><strong>Amount:</strong> ${formattedAmount}</p>
            <p><strong>Date:</strong> ${new Date(timestamp).toLocaleString()}</p>
            ${orderId ? `<p><strong>Order ID:</strong> ${orderId}</p>` : ''}
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e;">
              <strong>💎 New Jump in AI Purchase!</strong><br>
              Customer has purchased one of your AI workflow guides. They'll receive download access via email.
            </p>
          </div>
          
          ${stripeSessionId ? `
          <div style="margin-top: 20px; padding: 15px; background-color: #f1f5f9; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">
              <strong>Stripe Session ID:</strong> ${stripeSessionId}
            </p>
          </div>
          ` : ''}
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            This notification was sent automatically from JumpinAI when a new product purchase was completed.
          </p>
        </div>
      `;
    }

    // Send email notification to admin
    const emailResponse = await resend.emails.send({
      from: "JumpinAI Notifications <notifications@jumpinai.com>",
      to: ["info@jumpinai.com"],
      subject: subject,
      html: htmlContent,
    });

    console.log("✅ Purchase notification email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Purchase notification sent successfully",
        emailId: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error("💥 Error sending purchase notification:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Failed to send purchase notification",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
};

serve(handler);