import { supabase } from "@/integrations/supabase/client";

export interface InvestorContactFormData {
  name: string;
  email: string;
  investmentLevel: string;
  message: string;
}

export interface InvestmentDeckRequestData {
  email: string;
  name: string;
  company?: string;
  title?: string;
}

export const sendInvestorContactEmail = async (formData: InvestorContactFormData) => {
  console.log("Sending investor contact email via Supabase function");
  
  try {
    const { data, error } = await supabase.functions.invoke('send-investor-email', {
      body: formData
    });

    if (error) {
      console.error("Supabase function error:", error);
      throw error;
    }

    if (data && !data.success) {
      throw new Error(data.error || "Failed to send investor contact email");
    }

    console.log("Investor contact email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending investor contact email:", error);
    throw error;
  }
};

export const requestInvestmentDeck = async (formData: InvestmentDeckRequestData) => {
  console.log("Requesting investment deck via Supabase function");
  
  try {
    const { data, error } = await supabase.functions.invoke('request-investment-deck', {
      body: formData
    });

    if (error) {
      console.error("Supabase function error:", error);
      throw error;
    }

    if (data && !data.success) {
      throw new Error(data.error || "Failed to request investment deck");
    }

    console.log("Investment deck request sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error requesting investment deck:", error);
    throw error;
  }
};