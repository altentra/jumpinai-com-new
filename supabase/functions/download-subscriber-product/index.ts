import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Returns a short-lived signed URL for a product file if the caller has an active subscription
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");

    // Get user
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Parse body
    let body: any = {};
    try { body = await req.json(); } catch {}
    const { productId, fileName } = body || {};
    if (!productId && !fileName) throw new Error("productId or fileName is required");

    // Check active subscription
    const { data: sub, error: subErr } = await supabase
      .from('subscribers')
      .select('subscribed, subscription_end, email')
      .eq('email', user.email)
      .maybeSingle();
    if (subErr) throw subErr;
    const active = sub?.subscribed && (!sub.subscription_end || new Date(sub.subscription_end) > new Date());
    if (!active) {
      return new Response(JSON.stringify({ error: 'No active subscription' }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve product
    let product: any = null;
    if (productId) {
      const { data, error } = await supabase.from('products').select('id, file_name').eq('id', productId).maybeSingle();
      if (error) throw error;
      product = data;
    } else if (fileName) {
      const { data, error } = await supabase.from('products').select('id, file_name').eq('file_name', fileName).maybeSingle();
      if (error) throw error;
      product = data;
    }
    if (!product?.file_name) throw new Error('Product file not found');

    // Create signed URL (60 seconds)
    const { data: signed, error: signErr } = await supabase
      .storage
      .from('digital-products')
      .createSignedUrl(product.file_name, 60);
    if (signErr) throw signErr;

    return new Response(JSON.stringify({ url: signed.signedUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error('download-subscriber-product error', error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});