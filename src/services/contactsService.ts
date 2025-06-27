
import { supabase } from "@/integrations/supabase/client";

export interface Contact {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  source: string;
  newsletter_subscribed: boolean;
  lead_magnet_downloaded: boolean;
  tags: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactActivity {
  id: string;
  contact_id: string;
  activity_type: string;
  source: string;
  details: any;
  created_at: string;
}

export const contactsService = {
  // Get all contacts
  async getAllContacts(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching contacts:", error);
      throw error;
    }

    return data || [];
  },

  // Get contact by email
  async getContactByEmail(email: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No contact found
      }
      console.error("Error fetching contact:", error);
      throw error;
    }

    return data;
  },

  // Get contact activities
  async getContactActivities(contactId: string): Promise<ContactActivity[]> {
    const { data, error } = await supabase
      .from('contact_activities')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching contact activities:", error);
      throw error;
    }

    return data || [];
  },

  // Sync specific contact to Google Sheets
  async syncContactToSheets(email: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('sync-to-google-sheets', {
      body: { email }
    });

    if (error) {
      console.error("Error syncing contact to Google Sheets:", error);
      throw error;
    }

    console.log("Contact synced to Google Sheets:", data);
  },

  // Sync all contacts to Google Sheets
  async syncAllContactsToSheets(): Promise<void> {
    const { data, error } = await supabase.functions.invoke('sync-to-google-sheets', {
      body: { sync_all: true }
    });

    if (error) {
      console.error("Error syncing all contacts to Google Sheets:", error);
      throw error;
    }

    console.log("All contacts synced to Google Sheets:", data);
  },

  // Get contact stats
  async getContactStats() {
    const { data: allContacts, error: allError } = await supabase
      .from('contacts')
      .select('*');

    if (allError) {
      console.error("Error fetching contact stats:", allError);
      throw allError;
    }

    const stats = {
      total: allContacts?.length || 0,
      active: allContacts?.filter(c => c.status === 'active').length || 0,
      newsletter_subscribers: allContacts?.filter(c => c.newsletter_subscribed).length || 0,
      lead_magnet_downloads: allContacts?.filter(c => c.lead_magnet_downloaded).length || 0,
      sources: {} as Record<string, number>
    };

    // Count by source
    allContacts?.forEach(contact => {
      stats.sources[contact.source] = (stats.sources[contact.source] || 0) + 1;
    });

    return stats;
  }
};
