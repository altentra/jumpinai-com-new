import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const GOOGLE_SHEETS_WEBHOOK_URL = Deno.env.get("GOOGLE_SHEETS_WEBHOOK_URL");

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncRequest {
  type?: 'contacts' | 'subscribers' | 'orders' | 'all';
  sync_all?: boolean;
}

const formatDatePST = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== Enhanced Google Sheets sync function started ===");
    
    if (!GOOGLE_SHEETS_WEBHOOK_URL) {
      console.error("❌ GOOGLE_SHEETS_WEBHOOK_URL not configured");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Google Sheets webhook URL not configured" 
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { type = 'all', sync_all = true }: SyncRequest = await req.json();
    console.log("📥 Sync request:", { type, sync_all });

    let allData: any = {};
    let totalRecords = 0;

    // Sync Contacts
    if (type === 'contacts' || type === 'all') {
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
        
      if (contactsError) throw contactsError;
      
      allData.contacts = contacts?.map(contact => ({
        sheet_type: 'contact',
        email: contact.email,
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        status: contact.status,
        source: contact.source,
        newsletter_subscribed: contact.newsletter_subscribed ? 'Yes' : 'No',
        lead_magnet_downloaded: contact.lead_magnet_downloaded ? 'Yes' : 'No',
        tags: contact.tags ? contact.tags.join(', ') : '',
        created_at: formatDatePST(contact.created_at),
        updated_at: formatDatePST(contact.updated_at),
        notes: contact.notes || ''
      })) || [];
      
      totalRecords += allData.contacts.length;
      console.log(`✅ Found ${allData.contacts.length} contacts`);
    }

    // Sync Subscribers
    if (type === 'subscribers' || type === 'all') {
      const { data: subscribers, error: subscribersError } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (subscribersError) throw subscribersError;
      
      allData.subscribers = subscribers?.map(subscriber => ({
        sheet_type: 'subscriber',
        email: subscriber.email,
        user_id: subscriber.user_id || '',
        stripe_customer_id: subscriber.stripe_customer_id || '',
        subscribed: subscriber.subscribed ? 'Yes' : 'No',
        subscription_tier: subscriber.subscription_tier || '',
        subscription_end: subscriber.subscription_end ? formatDatePST(subscriber.subscription_end) : '',
        created_at: formatDatePST(subscriber.created_at),
        updated_at: formatDatePST(subscriber.updated_at)
      })) || [];
      
      totalRecords += allData.subscribers.length;
      console.log(`✅ Found ${allData.subscribers.length} subscribers`);
    }

    // Sync Orders with Product Info
    if (type === 'orders' || type === 'all') {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            name,
            description,
            price
          )
        `)
        .order('created_at', { ascending: false });
        
      if (ordersError) throw ordersError;
      
      allData.orders = orders?.map(order => ({
        sheet_type: 'order',
        order_id: order.id,
        user_email: order.user_email,
        product_name: order.products?.name || 'Unknown Product',
        product_description: order.products?.description || '',
        amount_cents: order.amount,
        amount_dollars: (order.amount / 100).toFixed(2),
        currency: order.currency,
        status: order.status,
        stripe_session_id: order.stripe_session_id || '',
        stripe_payment_intent_id: order.stripe_payment_intent_id || '',
        download_count: order.download_count || 0,
        max_downloads: order.max_downloads || 0,
        created_at: formatDatePST(order.created_at),
        updated_at: formatDatePST(order.updated_at)
      })) || [];
      
      totalRecords += allData.orders.length;
      console.log(`✅ Found ${allData.orders.length} orders`);
    }

    if (totalRecords === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "No records to sync",
          count: 0
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send to Google Sheets
    console.log(`🚀 Sending ${totalRecords} total records to Google Sheets...`);
    
    const webhookPayload = {
      action: "enhanced_sync",
      type: type,
      data: allData,
      summary: {
        contacts: allData.contacts?.length || 0,
        subscribers: allData.subscribers?.length || 0,
        orders: allData.orders?.length || 0,
        total: totalRecords
      },
      timestamp: formatDatePST(new Date().toISOString()),
      source: "jumpinai_enhanced_sync"
    };

    const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload),
    });

    console.log("📡 Webhook response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Google Sheets webhook error:", errorText);
      throw new Error(`Webhook failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Enhanced sync successful:", result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully synced ${totalRecords} record(s) to Google Sheets`,
        count: totalRecords,
        breakdown: {
          contacts: allData.contacts?.length || 0,
          subscribers: allData.subscribers?.length || 0,
          orders: allData.orders?.length || 0
        },
        webhook_response: result
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error("💥 Error in enhanced-sheets-sync:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Failed to sync to Google Sheets",
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