import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreatePaymentRequest {
  productId: string;
  customerEmail: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating product payment...");
    
    const { productId, customerEmail }: CreatePaymentRequest = await req.json();

    if (!productId || !customerEmail) {
      throw new Error("Product ID and customer email are required");
    }

    // Initialize Supabase client with service role for database operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get product details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("status", "active")
      .single();

    if (productError || !product) {
      console.error("Product fetch error:", productError);
      throw new Error("Product not found or inactive");
    }

    console.log("Product found:", product.name);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/jumps`,
      metadata: {
        productId: product.id,
        customerEmail: customerEmail,
      },
    });

    console.log("Stripe session created:", session.id);

    // Get user_id from email for better security
    let userId = null;
    try {
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users.users.find(u => u.email === customerEmail);
      userId = user?.id || null;
    } catch (error) {
      console.warn("Could not fetch user_id for email:", customerEmail);
    }

    // Create order record
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_email: customerEmail,
        user_id: userId,
        product_id: product.id,
        stripe_session_id: session.id,
        amount: product.price,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error("Failed to create order record");
    }

    console.log("Order created:", order.id);

    // Send purchase notification email to admin
    try {
      await supabase.functions.invoke('send-purchase-notification', {
        body: {
          type: 'product',
          customerEmail: customerEmail,
          amount: product.price,
          currency: 'usd',
          productName: product.name,
          orderId: order.id,
          stripeSessionId: session.id,
          timestamp: new Date().toISOString()
        }
      });
      console.log("✅ Purchase notification sent to admin");
    } catch (notificationError) {
      console.error("⚠️ Failed to send purchase notification:", notificationError);
      // Don't fail the payment if notification fails
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Payment creation error:", error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});