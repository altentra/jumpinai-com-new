import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Change this if you want to allow multiple admins
const ADMIN_EMAIL = "info@jumpinai.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase environment variables" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Client bound to the caller to read their auth session (RLS-respecting)
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (userData.user.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role client for unrestricted reads
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch data in parallel
    const [profilesRes, ordersRes, subscribersRes, contactsRes, leadRes, productsRes] = await Promise.all([
      supabase.from("profiles").select("id, display_name, avatar_url, created_at, email_verified"),
      supabase.from("orders").select("id, product_id, amount, status, created_at, user_email, download_count"),
      supabase.from("subscribers").select("id, user_id, email, subscribed, subscription_end, subscription_tier, created_at"),
      supabase.from("contacts").select("id, email, first_name, last_name, source, status, newsletter_subscribed, lead_magnet_downloaded, tags, created_at"),
      supabase.from("lead_magnet_downloads").select("id, email, downloaded_at, pdf_name, ip_address, user_agent"),
      supabase.from("products").select("id, name, file_name"),
    ]);

    if (profilesRes.error) throw profilesRes.error;
    if (ordersRes.error) throw ordersRes.error;
    if (subscribersRes.error) throw subscribersRes.error;
    if (contactsRes.error) throw contactsRes.error;
    if (leadRes.error) throw leadRes.error;
    if (productsRes.error) throw productsRes.error;

    const profiles = profilesRes.data ?? [];
    const orders = ordersRes.data ?? [];
    const subscribers = subscribersRes.data ?? [];
    const contacts = contactsRes.data ?? [];
    const leadDownloads = leadRes.data ?? [];
    const products = productsRes.data ?? [];

    // Fetch auth users (emails, created_at, last_sign_in_at)
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const allAuthUsers: any[] = [];
    let page = 1;
    while (true) {
      const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      allAuthUsers.push(...(data?.users ?? []));
      if (!data || !data.users || data.users.length < 200) break;
      page += 1;
    }
    const authById = new Map(allAuthUsers.map((u) => [u.id, u]));

    // Stats
    const paidOrders = orders.filter((o) => o.status === "paid");
    const totalRevenueCents = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    // Filter paid subscribers early for stats calculation
    const paidSubscribers = subscribers.filter(s => s.subscribed && s.subscription_tier);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthlyRevenueCents = paidOrders.reduce((sum, o) => {
      const d = new Date(o.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear ? sum + (o.amount || 0) : sum;
    }, 0);

    const dailyRevenueCents = paidOrders.reduce((sum, o) => {
      const d = new Date(o.created_at);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime() ? sum + (o.amount || 0) : sum;
    }, 0);

    const stats = {
      totalUsers: profiles.length,
      totalSubscribers: paidSubscribers.length, // Only count actual paid subscribers
      totalOrders: paidOrders.length, // Only count actually paid orders
      totalRevenue: totalRevenueCents / 100,
      totalContacts: contacts.length,
      totalNewsletterSubscribers: contacts.filter((c) => c.newsletter_subscribed).length,
      totalLeadMagnetDownloads: leadDownloads.length,
      abandonedCarts: orders.filter((o) => o.status === "pending").length,
      completedOrders: paidOrders.length,
      monthlyRevenue: monthlyRevenueCents / 100,
      dailyRevenue: dailyRevenueCents / 100,
      averageOrderValue: paidOrders.length ? totalRevenueCents / paidOrders.length / 100 : 0,
    };

    // All orders with product names (not just recent)
    const productById = new Map(products.map((p: any) => [p.id, p]));
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50) // Show more orders
      .map((o) => ({
        id: o.id,
        user_email: o.user_email,
        amount: o.amount,
        status: o.status,
        created_at: o.created_at,
        product_name: productById.get(o.product_id)?.name || "Unknown Product",
        is_completed: o.status === "paid",
      }));

    // Only show actual paid subscribers for the subscription plan
    const recentSubscribers = [...paidSubscribers]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50)
      .map((s) => {
        const auth = authById.get(s.user_id);
        const userOrders = s.email ? orders.filter(o => o.user_email === s.email && o.status === 'paid') : [];
        const totalPaid = userOrders.reduce((sum, o) => sum + (o.amount || 0), 0) / 100;
        const totalDownloads = userOrders.reduce((sum, o) => sum + (o.download_count || 0), 0);
        
        return {
          ...s,
          last_login: auth?.last_sign_in_at || null,
          total_paid: totalPaid,
          total_downloads: totalDownloads,
          completed_orders: userOrders.length,
        };
      });

    const contactsSorted = [...contacts].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 100);

    // Build comprehensive user profiles
    const users = profiles.map((p: any) => {
      const auth = authById.get(p.id);
      const userSubs = subscribers.find((s) => s.user_id === p.id);

      // For orders and contacts we match by email where possible
      const email = auth?.email
        || userSubs?.email
        || contacts.find((c) => c.email && c.email === userSubs?.email)?.email
        || undefined;

      const userOrders = email ? orders.filter((o) => o.user_email === email) : [];
      const downloadsCount = userOrders.reduce((sum, o) => sum + (o.download_count || 0), 0);
      const paid = userOrders.filter((o) => o.status === "paid");
      const attempts = userOrders.filter((o) => o.status === "pending");
      const totalSpent = paid.reduce((sum, o) => sum + (o.amount || 0), 0) / 100;
      const lastOrder = paid.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      
      // Add order details with product names
      const completedOrders = paid.map((o) => ({
        id: o.id,
        amount: o.amount / 100,
        product_name: productById.get(o.product_id)?.name || "Unknown Product",
        created_at: o.created_at,
        download_count: o.download_count || 0,
      }));
      
      const purchaseAttempts = attempts.map((o) => ({
        id: o.id,
        amount: o.amount / 100,
        product_name: productById.get(o.product_id)?.name || "Unknown Product",
        created_at: o.created_at,
      }));

      let subscription_status: "active" | "expired" | "none" = "none";
      if (userSubs?.subscribed) {
        if (userSubs.subscription_end) {
          const end = new Date(userSubs.subscription_end);
          subscription_status = end > new Date() ? "active" : "expired";
        } else {
          subscription_status = "active";
        }
      }

      const contact = email ? contacts.find((c) => c.email === email) : undefined;

      return {
        id: p.id,
        email: auth?.email,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        created_at: p.created_at,
        email_verified: !!p.email_verified,
        subscription_status,
        subscription_tier: userSubs?.subscription_tier,
        subscription_end: userSubs?.subscription_end,
        total_orders: paid.length,
        total_purchase_attempts: attempts.length,
        total_spent: totalSpent,
        last_order_date: lastOrder?.created_at,
        total_downloads: downloadsCount,
        completed_orders: completedOrders,
        purchase_attempts: purchaseAttempts,
        newsletter_subscribed: !!contact?.newsletter_subscribed,
        lead_magnet_downloaded: !!contact?.lead_magnet_downloaded,
        last_login: auth?.last_sign_in_at || null,
      };
    });

    // Auth logs approximation: last login and signup events
    const authLogs = allAuthUsers.flatMap((u) => {
      const events: any[] = [];
      if (u.created_at) {
        const tsMs = Date.parse(u.created_at);
        if (!isNaN(tsMs)) {
          events.push({
            id: `signup-${u.id}`,
            timestamp: tsMs * 1000, // microseconds to match UI division
            level: "info",
            msg: "Signup",
            status: "200",
            event_message: JSON.stringify({ action: "signup", actor_username: u.email }),
            email: u.email,
            action: "signup",
          });
        }
      }
      if (u.last_sign_in_at) {
        const tsMs = Date.parse(u.last_sign_in_at);
        if (!isNaN(tsMs)) {
          events.push({
            id: `login-${u.id}`,
            timestamp: tsMs * 1000,
            level: "info",
            msg: "Login",
            status: "200",
            event_message: JSON.stringify({ action: "login", actor_username: u.email }),
            email: u.email,
            action: "login",
          });
        }
      }
      return events;
    }).sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);

    const payload = {
      stats,
      recentOrders,
      recentSubscribers,
      contacts: contactsSorted,
      users,
      authLogs,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("admin-dashboard-data error", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
