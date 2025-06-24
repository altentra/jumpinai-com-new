
import { supabase } from "@/integrations/supabase/client";

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const sendContactEmail = async (formData: ContactFormData) => {
  console.log("Sending contact email via Supabase function");
  
  try {
    const { data, error } = await supabase.functions.invoke('send-contact-email', {
      body: formData
    });

    if (error) {
      console.error("Supabase function error:", error);
      throw error;
    }

    if (data && !data.success) {
      throw new Error(data.error || "Failed to send contact email");
    }

    console.log("Contact email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending contact email:", error);
    throw error;
  }
};
