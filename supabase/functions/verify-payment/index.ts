import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  sessionId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Verifying payment...");
    
    const { sessionId }: VerifyPaymentRequest = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    // Initialize services
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Get Stripe session details
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log("Stripe session status:", session.payment_status);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Get order from database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .single();

    if (orderError || !order) {
      console.error("Order fetch error:", orderError);
      throw new Error("Order not found");
    }

    // Get product details separately
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", order.product_id)
      .single();

    if (productError || !product) {
      console.error("Product fetch error:", productError);
      throw new Error("Product not found");
    }

    // Update order status if not already paid
    if (order.status !== "paid") {
      // Get user_id from email if not already set
      let userId = order.user_id;
      if (!userId && order.user_email) {
        try {
          const { data: users } = await supabase.auth.admin.listUsers();
          const user = users.users.find(u => u.email === order.user_email);
          userId = user?.id || null;
        } catch (error) {
          console.warn("Could not fetch user_id for email:", order.user_email);
        }
      }

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          stripe_payment_intent_id: session.payment_intent,
          user_id: userId, // Set user_id if we found it
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("Order update error:", updateError);
        throw new Error("Failed to update order status");
      }

      console.log("Order updated to paid status");

      // Send download email
      const downloadUrl = `${req.headers.get("origin")}/download/${order.download_token}`;
      
      const emailResponse = await resend.emails.send({
        from: "JumpinAI <downloads@jumpinai.com>",
        to: [order.user_email],
        subject: `Your ${product.name} is ready for download!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">Thank you for your purchase!</h1>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h2 style="color: #495057; margin-top: 0;">${product.name}</h2>
              <p style="color: #6c757d; line-height: 1.6;">
                ${product.description}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadUrl}" 
                 style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Download Your Product
              </a>
            </div>
            
            <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #495057; margin-top: 0;">Important Download Information:</h3>
              <ul style="color: #6c757d; line-height: 1.6;">
                <li>Your download link is valid for 30 days</li>
                <li>You can download this product up to 5 times</li>
                <li>Keep this email for your records</li>
              </ul>
            </div>
            
            <p style="color: #6c757d; text-align: center; margin-top: 30px;">
              Thank you for choosing JumpinAI!<br>
              <a href="https://jumpinai.com" style="color: #007bff;">Visit our website</a> for more AI resources.
            </p>
          </div>
        `,
      });

      if (emailResponse.error) {
        console.error("Email send error:", emailResponse.error);
        // Don't fail the whole process if email fails
      } else {
        console.log("Download email sent successfully");
      }
    }

    return new Response(JSON.stringify({
      success: true,
      order: {
        id: order.id,
        productName: product.name,
        downloadUrl: `${req.headers.get("origin")}/download/${order.download_token}`,
        status: "paid"
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});