
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const GOOGLE_SHEETS_WEBHOOK_URL = Deno.env.get("GOOGLE_SHEETS_WEBHOOK_URL");

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncRequest {
  email?: string;
  sync_all?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Google Sheets sync function started");
    
    if (!GOOGLE_SHEETS_WEBHOOK_URL) {
      console.error("GOOGLE_SHEETS_WEBHOOK_URL not configured");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Google Sheets webhook URL not configured. Please add GOOGLE_SHEETS_WEBHOOK_URL to your Supabase secrets." 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { email, sync_all }: SyncRequest = await req.json();
    console.log("Sync request:", { email, sync_all });

    let contacts;
    
    if (sync_all) {
      // Sync all contacts
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching all contacts:", error);
        throw error;
      }
      
      contacts = data;
    } else if (email) {
      // Sync specific contact
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('email', email)
        .single();
        
      if (error) {
        console.error("Error fetching contact:", error);
        throw error;
      }
      
      contacts = [data];
    } else {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Either 'email' or 'sync_all' parameter is required" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "No contacts to sync",
          count: 0
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Prepare data for Google Sheets
    const sheetsData = contacts.map(contact => ({
      email: contact.email,
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      status: contact.status,
      source: contact.source,
      newsletter_subscribed: contact.newsletter_subscribed ? 'Yes' : 'No',
      lead_magnet_downloaded: contact.lead_magnet_downloaded ? 'Yes' : 'No',
      tags: contact.tags ? contact.tags.join(', ') : '',
      created_at: contact.created_at,
      updated_at: contact.updated_at,
      notes: contact.notes || ''
    }));

    // Send to Google Sheets via webhook
    console.log(`Sending ${sheetsData.length} contacts to Google Sheets`);
    
    const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: sync_all ? "bulk_sync" : "single_sync",
        data: sheetsData,
        timestamp: new Date().toISOString(),
        source: "jumpinai_supabase"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Sheets webhook error:", errorText);
      throw new Error(`Google Sheets webhook failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("Google Sheets sync successful:", result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully synced ${sheetsData.length} contact(s) to Google Sheets`,
        count: sheetsData.length,
        webhook_response: result
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in sync-to-google-sheets function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Failed to sync contacts to Google Sheets",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
