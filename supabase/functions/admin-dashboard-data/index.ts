import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Check if user has admin role using RPC
    const { data: isAdmin, error: roleError } = await supabaseUser.rpc('has_role', {
      _user_id: userData.user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      console.error('Admin role check failed:', roleError);
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role client for unrestricted reads
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch data in parallel
    const [profilesRes, ordersRes, subscribersRes, contactsRes, productsRes, jumpsRes, creditsRes, transactionsRes] = await Promise.all([
      supabase.from("profiles").select("id, display_name, avatar_url, created_at, email_verified"),
      supabase.from("orders").select("id, product_id, amount, status, created_at, user_email, download_count"),
      supabase.from("subscribers").select("id, user_id, email, subscribed, subscription_end, subscription_tier, created_at"),
      supabase.from("contacts").select("id, email, first_name, last_name, source, status, newsletter_subscribed, lead_magnet_downloaded, tags, created_at"),
      supabase.from("products").select("id, name, file_name"),
      supabase.from("user_jumps").select("id, user_id, title, full_content, status, created_at").order('created_at', { ascending: false }).limit(200),
      supabase.from("user_credits").select("id, user_id, credits_balance, total_credits_purchased"),
      supabase.from("credit_transactions").select("id, user_id, transaction_type, credits_amount, description, created_at").order('created_at', { ascending: false }),
    ]);

    if (profilesRes.error) throw profilesRes.error;
    if (ordersRes.error) throw ordersRes.error;
    if (subscribersRes.error) throw subscribersRes.error;
    if (contactsRes.error) throw contactsRes.error;
    if (productsRes.error) throw productsRes.error;
    if (jumpsRes.error) throw jumpsRes.error;
    if (creditsRes.error) throw creditsRes.error;
    if (transactionsRes.error) throw transactionsRes.error;

    const profiles = profilesRes.data ?? [];
    const orders = ordersRes.data ?? [];
    const subscribers = subscribersRes.data ?? [];
    const contacts = contactsRes.data ?? [];
    const products = productsRes.data ?? [];
    const jumps = jumpsRes.data ?? [];
    const userCredits = creditsRes.data ?? [];
    const creditTransactions = transactionsRes.data ?? [];

    // Create product map for lookups
    const productById = new Map(products.map((p: any) => [p.id, p]));

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
    // Count subscription orders separately (they are also "revenue" generating)
    const subscriptionOrders = paidOrders.filter((o) => productById.get(o.product_id)?.name === "JumpinAI Pro Subscription");
    const totalRevenueCents = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    // Filter paid subscribers early for stats calculation - only real active Stripe subscribers
    const paidSubscribers = subscribers.filter(s => s.subscribed);
    const starterSubscribers = paidSubscribers.filter(s => s.subscription_tier === 'JumpinAI Starter');
    const proSubscribers = paidSubscribers.filter(s => s.subscription_tier === 'JumpinAI Pro');
    const growthSubscribers = paidSubscribers.filter(s => s.subscription_tier === 'JumpinAI Growth');

    // Jump stats
    const successfulJumps = jumps.filter(j => j.status === 'active');
    const failedJumps = jumps.filter(j => j.status !== 'active');
    const guestJumps = jumps.filter(j => !j.user_id);

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
      starterSubscribers: starterSubscribers.length,
      proSubscribers: proSubscribers.length,
      growthSubscribers: growthSubscribers.length,
      totalOrders: paidOrders.length, // Only count actually paid orders
      totalRevenue: totalRevenueCents / 100,
      totalContacts: contacts.length,
      totalNewsletterSubscribers: contacts.filter((c) => c.newsletter_subscribed).length,
      totalJumps: jumps.length,
      successfulJumps: successfulJumps.length,
      failedJumps: failedJumps.length,
      guestJumps: guestJumps.length,
      abandonedCarts: orders.filter((o) => o.status === "pending").length,
      completedOrders: paidOrders.length,
      // Add breakdown of revenue and orders
      subscriptionRevenue: subscriptionOrders.reduce((sum, o) => sum + (o.amount || 0), 0) / 100,
      productRevenue: paidOrders.filter(o => !(productById.get(o.product_id)?.name === "JumpinAI Pro Subscription")).reduce((sum, o) => sum + (o.amount || 0), 0) / 100,
      subscriptionOrders: subscriptionOrders.length,
      productOrders: paidOrders.filter(o => !(productById.get(o.product_id)?.name === "JumpinAI Pro Subscription")).length,
      monthlyRevenue: monthlyRevenueCents / 100,
      dailyRevenue: dailyRevenueCents / 100,
      averageOrderValue: paidOrders.length ? totalRevenueCents / paidOrders.length / 100 : 0,
    };

    // All orders with product names (show ALL orders, not just recent)
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      // Show ALL orders, not just recent ones
      .map((o) => ({
        id: o.id,
        user_email: o.user_email,
        amount: o.amount,
        status: o.status,
        created_at: o.created_at,
        product_name: productById.get(o.product_id)?.name || "Unknown Product",
        is_completed: o.status === "paid",
        is_subscription: productById.get(o.product_id)?.name === "JumpinAI Pro Subscription",
      }));

    // Only show actual active paid subscribers for the $10/month pro plan
    const recentSubscribers = [...paidSubscribers]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((s) => {
        const auth = authById.get(s.user_id);
        const userOrders = s.email ? orders.filter(o => o.user_email === s.email && o.status === 'paid') : [];
        const subscriptionOrders = userOrders.filter(o => productById.get(o.product_id)?.name === "JumpinAI Pro Subscription");
        const productPurchases = userOrders.filter(o => productById.get(o.product_id)?.name !== "JumpinAI Pro Subscription");
        const totalPaid = userOrders.reduce((sum, o) => sum + (o.amount || 0), 0) / 100;
        const totalDownloads = userOrders.reduce((sum, o) => sum + (o.download_count || 0), 0);
        
        return {
          ...s,
          last_login: auth?.last_sign_in_at || null,
          total_paid: totalPaid,
          total_downloads: totalDownloads,
          completed_orders: userOrders.length,
          subscription_payments: subscriptionOrders.length,
          product_purchases: productPurchases.length,
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

    // Format jump generations with user info
    const jumpGenerations = jumps.map((j: any) => {
      const userProfile = profiles.find((p: any) => p.id === j.user_id);
      const userAuth = authById.get(j.user_id);
      const userSub = subscribers.find((s: any) => s.user_id === j.user_id);
      
      return {
        id: j.id,
        user_id: j.user_id,
        user_email: userAuth?.email || userSub?.email || null,
        title: j.title,
        full_content: j.full_content,
        status: j.status,
        created_at: j.created_at,
        is_guest: !j.user_id,
        // We don't have IP/location data stored, but structure is here for future
        ip_address: null,
        location: null,
      };
    });

    // Build credit overviews
    const creditOverviews = userCredits.map((uc: any) => {
      const userAuth = authById.get(uc.user_id);
      const userSub = subscribers.find((s: any) => s.user_id === uc.user_id);
      const userTransactions = creditTransactions
        .filter((t: any) => t.user_id === uc.user_id)
        .slice(0, 10); // Get recent 10 transactions per user
      
      return {
        user_id: uc.user_id,
        user_email: userAuth?.email || userSub?.email || 'Unknown',
        credits_balance: uc.credits_balance,
        total_credits_purchased: uc.total_credits_purchased,
        recent_transactions: userTransactions,
      };
    });

    const payload = {
      stats,
      recentOrders,
      recentSubscribers,
      contacts: contactsSorted,
      users,
      authLogs,
      jumpGenerations,
      creditOverviews,
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
