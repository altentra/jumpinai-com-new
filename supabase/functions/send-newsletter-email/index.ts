import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

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
      ? "Welcome Back to JumpinAI - Great to Have You Again!" 
      : "Welcome to JumpinAI - Your AI Transformation Journey Starts Now!";

    const welcomeMessage = isResubscription
      ? "Welcome back! We're thrilled to have you rejoin our community of AI professionals."
      : "You're now part of an exclusive community of 30,000+ industry leaders who are strategically implementing AI to transform their businesses.";

    console.log("Sending welcome email to:", sanitizedEmail);
    const welcomeResponse = await resend.emails.send({
      from: "info@jumpinai.com",
      to: [sanitizedEmail],
      subject: welcomeSubject,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #374151 0%, #1f2937 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${isResubscription ? 'Welcome Back to JumpinAI!' : 'Welcome to JumpinAI!'}</h1>
            <p style="color: #d1d5db; margin: 10px 0 0 0; font-size: 16px;">Your AI transformation journey ${isResubscription ? 'continues' : 'starts now'}</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #374151; margin-bottom: 20px;">${isResubscription ? 'Thanks for rejoining' : 'Thanks for joining'} 30,000+ professionals!</h2>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                ${welcomeMessage}
              </p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #374151;">
                <h3 style="color: #374151; margin-top: 0;">What you'll receive:</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li><strong>Weekly AI Insights:</strong> Latest tools and strategic workflows</li>
                  <li><strong>Professional Resources:</strong> Actionable guides and case studies</li>
                  <li><strong>Industry Updates:</strong> Stay ahead of AI trends and innovations</li>
                  <li><strong>Exclusive Content:</strong> First access to our premium resources</li>
                </ul>
              </div>
              
              <p style="font-size: 16px; margin: 20px 0;">
                Our next newsletter is coming soon with actionable AI strategies you can implement immediately. Get ready to accelerate your transformation!
              </p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="mailto:info@jumpinai.com" style="background: linear-gradient(135deg, #374151 0%, #1f2937 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Get in Touch</a>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 25px; text-align: center; font-size: 14px; color: #6b7280;">
                <p style="margin: 5px 0;">Questions? We're here to help!</p>
                <p style="margin: 5px 0;">Reply to this email or contact us at <a href="mailto:info@jumpinai.com" style="color: #374151;">info@jumpinai.com</a></p>
              </div>
            </div>
          </div>
          
          <div style="background: #374151; padding: 20px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 14px;">
              ${isResubscription ? 'Welcome back!' : 'Welcome aboard!'}<br>
              <strong>The JumpinAI Team</strong><br>
              <a href="mailto:info@jumpinai.com" style="color: #d1d5db;">info@jumpinai.com</a>
            </p>
            <p style="color: #9ca3af; margin: 15px 0 0 0; font-size: 12px;">
              You can <a href="${unsubscribeUrl}" style="color: #d1d5db; text-decoration: underline;">unsubscribe</a> at any time.
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
            <p style="color: white; margin: 0; font-size: 14px;">JumpinAI Newsletter System</p>
          </div>
        </div>
      `,
    });

    console.log("Notification email sent:", notificationResponse);

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
