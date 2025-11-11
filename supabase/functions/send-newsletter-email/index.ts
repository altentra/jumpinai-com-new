
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

interface NewsletterData {
  email: string;
}

// Rate limiting check (basic implementation)
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const limit = rateLimitCache.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (limit.count >= 3) { // Max 3 newsletter requests per minute
    return false;
  }
  
  limit.count++;
  return true;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Newsletter function started");
    console.log("Environment check - RESEND_API_KEY:", Deno.env.get("RESEND_API_KEY") ? "Present" : "Missing");
    console.log("Environment check - SUPABASE_URL:", Deno.env.get("SUPABASE_URL") ? "Present" : "Missing");

    // Basic rate limiting
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(clientIP)) {
      console.log("Rate limit exceeded for IP:", clientIP);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Too many subscription attempts. Please try again later." 
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { email }: NewsletterData = await req.json();
    console.log("Processing newsletter signup:", email);

    if (!email) {
      throw new Error("Email is required");
    }

    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();

    // Length validation
    if (sanitizedEmail.length > 320) { // RFC standard max email length
      throw new Error("Email address is too long");
    }

    // Check if contact exists in unified system
    const { data: existingContact, error: checkError } = await supabase
      .from('contacts')
      .select('*')
      .eq('email', sanitizedEmail)
      .single();

    let isResubscription = false;
    let contactId;

    if (existingContact) {
      if (existingContact.newsletter_subscribed && existingContact.status === 'active') {
        // Already subscribed and active
        console.log("Email already subscribed and active:", sanitizedEmail);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "This email is already subscribed to our newsletter. Check your inbox for our latest updates!" 
          }),
          {
            status: 409,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      } else {
        // Previously existed but not newsletter subscribed or inactive
        console.log("Updating existing contact for newsletter:", sanitizedEmail);
        const { data: updateData, error: updateError } = await supabase
          .from('contacts')
          .update({ 
            newsletter_subscribed: true,
            status: 'active',
            updated_at: new Date().toISOString(),
            tags: existingContact.tags?.includes('newsletter_subscriber') 
              ? existingContact.tags 
              : [...(existingContact.tags || []), 'newsletter_subscriber']
          })
          .eq('email', sanitizedEmail)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating existing contact:", updateError);
          throw updateError;
        }

        contactId = updateData.id;
        isResubscription = !existingContact.newsletter_subscribed;
        console.log("Successfully updated existing contact:", updateData);
      }
    } else {
      // New contact - use the upsert function
      console.log("Creating new contact:", sanitizedEmail);
      const { data: newContactId, error: insertError } = await supabase
        .rpc('upsert_contact', {
          p_email: sanitizedEmail,
          p_source: 'newsletter',
          p_newsletter_subscribed: true,
          p_tags: ['newsletter_subscriber']
        });

      if (insertError) {
        console.error("Error creating new contact:", insertError);
        throw insertError;
      }

      contactId = newContactId;
      console.log("Successfully created new contact:", contactId);
    }

    // Log the activity
    await supabase
      .from('contact_activities')
      .insert({
        contact_id: contactId,
        activity_type: isResubscription ? 'newsletter_resubscribe' : 'newsletter_subscribe',
        source: 'website',
        details: {
          user_agent: req.headers.get('user-agent') || 'unknown',
          ip_address: clientIP
        }
      });

    // Keep legacy newsletter_subscribers table for backward compatibility
    const { data: legacySubscriber, error: legacyCheckError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', sanitizedEmail)
      .single();

    if (legacySubscriber) {
      if (!legacySubscriber.is_active) {
        // Reactivate in legacy table
        await supabase
          .from('newsletter_subscribers')
          .update({ 
            is_active: true,
            subscribed_at: new Date().toISOString(),
            source: 'website_resubscription'
          })
          .eq('email', sanitizedEmail);
      }
    } else {
      // Create new entry in legacy table
      await supabase
        .from('newsletter_subscribers')
        .insert([
          { 
            email: sanitizedEmail,
            source: 'website'
          }
        ]);
    }

    // Generate unsubscribe link
    const unsubscribeUrl = `${supabaseUrl}/functions/v1/unsubscribe-newsletter?email=${encodeURIComponent(sanitizedEmail)}`;

    // Send welcome email to the subscriber
    const welcomeSubject = isResubscription 
      ? "Welcome Back to JumpinAI! 🚀" 
      : "Welcome to JumpinAI — Let's Transform How You Work with AI 🚀";

    const welcomeMessage = isResubscription
      ? "We're thrilled to have you back! You're reconnecting with a community of forward-thinking professionals who are leveraging AI to work smarter, faster, and more strategically."
      : "Thank you for joining our community! You've just taken the first step toward mastering AI in your daily work. We're here to guide you every step of the way.";

    console.log("Sending welcome email to:", sanitizedEmail);
    const welcomeResponse = await resend.emails.send({
      from: "info@jumpinai.com",
      to: [sanitizedEmail],
      subject: welcomeSubject,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <div style="text-align: center; padding: 30px 20px;">
            <img src="https://jumpinai.com/images/jumpinai-logo-email.png" alt="JumpinAI" style="max-width: 180px; height: auto;" />
          </div>
          
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">${isResubscription ? 'Welcome Back! 🎉' : 'Welcome to JumpinAI! 🚀'}</h1>
            <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 18px; font-weight: 400;">Your AI transformation journey ${isResubscription ? 'continues' : 'begins now'}</p>
          </div>
          
          <div style="padding: 40px 30px; background: #ffffff; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <p style="font-size: 17px; line-height: 1.7; margin-bottom: 25px; color: #374151;">
              ${welcomeMessage}
            </p>
            
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%); padding: 28px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1f2937; margin: 0 0 18px 0; font-size: 20px; font-weight: 600;">What You'll Receive Every Week:</h3>
              <ul style="margin: 0; padding-left: 22px; color: #374151; font-size: 16px; line-height: 1.8;">
                <li style="margin-bottom: 12px;"><strong style="color: #1f2937;">Strategic AI Insights:</strong> Expert guidance on integrating AI into your work and business</li>
                <li style="margin-bottom: 12px;"><strong style="color: #1f2937;">Exclusive Tools & Prompts:</strong> Ready-to-use resources that deliver immediate results</li>
                <li style="margin-bottom: 12px;"><strong style="color: #1f2937;">JumpinAI Studio Updates:</strong> Latest features and AI models in our adaptation platform</li>
                <li style="margin-bottom: 12px;"><strong style="color: #1f2937;">Personalized Jumps:</strong> 3-tab adaptation plans with strategic analysis, tools, and prompts</li>
                <li style="margin-bottom: 0;"><strong style="color: #1f2937;">Industry Breakthroughs:</strong> Stay ahead with the latest AI developments and trends</li>
              </ul>
            </div>
            
            <div style="background: #fefce8; padding: 20px; border-radius: 8px; border-left: 4px solid #eab308; margin: 25px 0;">
              <p style="margin: 0; color: #713f12; font-size: 15px; line-height: 1.6;">
                <strong style="color: #854d0e;">🎯 Pro Tip:</strong> Each newsletter is packed with actionable strategies you can implement immediately. No fluff, just results.
              </p>
            </div>
            
            <p style="font-size: 17px; margin: 25px 0; color: #374151; line-height: 1.7;">
              Your first newsletter is on its way! In the meantime, explore <a href="https://jumpinai.com" style="color: #3b82f6; text-decoration: none; font-weight: 600; border-bottom: 2px solid #3b82f6;">JumpinAI Studio</a> to start creating personalized AI adaptation plans today.
            </p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://jumpinai.com" style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); transition: all 0.3s;">Visit JumpinAI Studio</a>
            </div>
            
            <div style="border-top: 2px solid #f3f4f6; padding-top: 25px; margin-top: 30px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 15px;">Questions? We're always here to help!</p>
              <p style="margin: 0; color: #374151; font-size: 15px;">
                Email us at <a href="mailto:info@jumpinai.com" style="color: #3b82f6; text-decoration: none; font-weight: 600;">info@jumpinai.com</a>
              </p>
            </div>
          </div>
          
          <div style="padding: 25px 30px; text-align: center; background: #f9fafb; margin-top: 20px; border-radius: 8px;">
            <p style="color: #374151; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">
              JumpinAI — Your Personalized AI Adaptation Studio
            </p>
            <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
              Transforming how professionals work with AI
            </p>
            <p style="color: #9ca3af; margin: 0; font-size: 13px;">
              <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> anytime with one click
            </p>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent:", welcomeResponse);

    // Send notification email to us
    console.log("Sending notification email");
    const notificationResponse = await resend.emails.send({
      from: "info@jumpinai.com",
      to: ["info@jumpinai.com"],
      subject: `${isResubscription ? 'Newsletter Resubscription' : 'New Newsletter Subscription'} - JumpinAI`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #374151 0%, #1f2937 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${isResubscription ? 'Newsletter Resubscription' : 'New Newsletter Subscription'}</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #374151; margin-bottom: 20px;">${isResubscription ? 'Professional Rejoined!' : 'New Professional Joined!'}</h2>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #6b7280;">Email:</strong>
                <span style="margin-left: 10px;"><a href="mailto:${sanitizedEmail}" style="color: #374151;">${sanitizedEmail}</a></span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #6b7280;">Action:</strong>
                <span style="margin-left: 10px;">${isResubscription ? 'Resubscribed' : 'New Subscription'}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #6b7280;">Date:</strong>
                <span style="margin-left: 10px;">${new Date().toLocaleDateString()}</span>
              </div>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; color: #374151;">
                  Contact added to unified system and welcome email sent automatically.
                </p>
              </div>
            </div>
          </div>
          
          <div style="background: #374151; padding: 20px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 14px;">JumpinAI - Your Personalized AI Adaptation Studio</p>
          </div>
        </div>
      `,
    });

    console.log("Notification email sent:", notificationResponse);

    // 🚀 NEW: Sync to Google Sheets after successful newsletter signup
    console.log("Syncing newsletter subscriber to Google Sheets...");
    try {
      const { data: syncData, error: syncError } = await supabase.functions.invoke('sync-to-google-sheets', {
        body: { email: sanitizedEmail }
      });

      if (syncError) {
        console.error("Google Sheets sync error (non-critical):", syncError);
      } else {
        console.log("Google Sheets sync successful:", syncData);
      }
    } catch (syncError) {
      console.error("Google Sheets sync failed (non-critical):", syncError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: isResubscription 
          ? "Welcome back! You've been successfully resubscribed to our newsletter!" 
          : "Successfully subscribed to newsletter!",
        isResubscription,
        welcomeResponse, 
        notificationResponse 
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
    console.error("Error in send-newsletter-email function:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "We're experiencing technical difficulties. Please try again in a few moments or contact us at info@jumpinai.com if the problem persists.",
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
