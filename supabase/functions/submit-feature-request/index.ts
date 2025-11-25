import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeatureRequestData {
  name: string;
  email: string;
  description: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, description }: FeatureRequestData = await req.json();

    console.log("Processing feature request from:", email);

    // Validate input
    if (!name || !email || !description) {
      throw new Error("Name, email, and description are required");
    }

    if (name.length < 2 || name.length > 100) {
      throw new Error("Name must be between 2 and 100 characters");
    }

    if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email address");
    }

    if (description.length < 10 || description.length > 2000) {
      throw new Error("Description must be between 10 and 2000 characters");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if this email has already submitted a feature request
    const { data: existingRequests, error: checkError } = await supabase
      .from('feature_requests')
      .select('id, credits_rewarded')
      .eq('user_email', email)
      .limit(1);

    if (checkError) {
      console.error("Error checking existing requests:", checkError);
      throw new Error("Failed to process request");
    }

    const isFirstRequest = !existingRequests || existingRequests.length === 0;
    const creditsRewarded = isFirstRequest;

    console.log("First request:", isFirstRequest, "Credits will be rewarded:", creditsRewarded);

    // Check if user exists in user_credits table
    let userId: string | null = null;
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (!authError && authUsers?.users) {
      const matchedUser = authUsers.users.find(u => u.email === email);
      userId = matchedUser?.id || null;
    }

    // Save feature request to database
    const { error: insertError } = await supabase
      .from('feature_requests')
      .insert({
        user_email: email,
        user_name: name,
        feature_description: description,
        credits_rewarded: creditsRewarded,
        user_id: userId
      });

    if (insertError) {
      console.error("Error saving feature request:", insertError);
      throw new Error("Failed to save feature request");
    }

    // Add credits if this is the first request and user exists
    if (creditsRewarded && userId) {
      console.log("Adding 10 credits to user:", userId);
      
      const { error: creditsError } = await supabase.rpc('add_user_credits', {
        p_user_id: userId,
        p_credits: 10,
        p_description: 'Feature request reward',
        p_reference_id: `feature_request_${email}`
      });

      if (creditsError) {
        console.error("Error adding credits:", creditsError);
        // Don't throw - continue with emails even if credits failed
      }
    }

    // Send email to admin
    const adminEmailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">New Feature Request</h1>
        </div>
        
        <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
          <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 16px 0;">Request Details</h2>
          
          <div style="margin-bottom: 12px;">
            <strong style="color: #4b5563;">Name:</strong>
            <p style="color: #1a1a1a; margin: 4px 0 0 0;">${name}</p>
          </div>
          
          <div style="margin-bottom: 12px;">
            <strong style="color: #4b5563;">Email:</strong>
            <p style="color: #1a1a1a; margin: 4px 0 0 0;">${email}</p>
          </div>
          
          <div style="margin-bottom: 12px;">
            <strong style="color: #4b5563;">First Request:</strong>
            <p style="color: #1a1a1a; margin: 4px 0 0 0;">${isFirstRequest ? `Yes (10 credits ${userId ? 'awarded' : 'will be awarded when user signs up'})` : 'No (no credits awarded)'}</p>
          </div>
          
          <div>
            <strong style="color: #4b5563;">Feature Description:</strong>
            <p style="color: #1a1a1a; margin: 4px 0 0 0; white-space: pre-wrap;">${description}</p>
          </div>
        </div>
        
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">JumpinAI. Your Personalized AI Adaptation Studio.</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "JumpinAI <info@jumpinai.com>",
      to: ["info@jumpinai.com"],
      subject: `New Feature Request from ${name}`,
      html: adminEmailHtml,
    });

    // Send confirmation email to user
    const userEmailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Thank You for Your Feedback!</h1>
        </div>
        
        <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
          <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
            Hi ${name},
          </p>
          
          <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
            We've received your feature request and truly appreciate you taking the time to share your ideas with us. Your input helps shape the future of JumpinAI.
          </p>
          
          ${creditsRewarded ? `
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0ea5e9; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="color: #0c4a6e; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">🎉 Bonus Reward!</p>
              <p style="color: #0c4a6e; font-size: 14px; margin: 0;">
                As a thank you for your first feature request, we've added <strong>10 bonus credits</strong> to your account${userId ? '!' : ' (they will be available once you sign up)!'}
              </p>
            </div>
          ` : `
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 16px 0; padding: 12px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #d1d5db;">
              Note: The 10 credit bonus is a one-time reward for your first feature request. We still greatly appreciate all your feedback!
            </p>
          `}
          
          <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 0;">
            Our team will review your suggestion carefully. We'll reach out if we need any clarification or when we have updates to share.
          </p>
        </div>
        
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
            Questions? We're always here to help! Email us at info@jumpinai.com
          </p>
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            JumpinAI. Your Personalized AI Adaptation Studio.
          </p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "JumpinAI <info@jumpinai.com>",
      to: [email],
      subject: `We Received Your Feature Request${creditsRewarded ? ' — 10 Credits Added!' : '!'}`,
      html: userEmailHtml,
    });

    console.log("Feature request processed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        creditsAwarded: creditsRewarded,
        message: creditsRewarded 
          ? "Thank you! Your request has been received and 10 credits have been added to your account."
          : "Thank you! Your request has been received. (Note: The 10 credit bonus is a one-time reward for your first feature request)"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-feature-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
