import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AbandonedCartRequest {
  customerEmail: string;
  customerName?: string;
  productName: string;
  productPrice: number;
  checkoutUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    const {
      customerEmail,
      customerName,
      productName,
      productPrice,
      checkoutUrl,
    }: AbandonedCartRequest = await req.json();

    // Validate required fields
    if (!customerEmail || !productName || !productPrice || !checkoutUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Processing abandoned cart email for:", customerEmail);

    // Send abandoned cart email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "JumpinAI <noreply@jumpinai.com>",
      to: [customerEmail],
      subject: "Don't miss out on your JumpinAI purchase!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <!-- Header with Logo -->
              <div style="text-align: center; padding: 30px 20px 20px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <img src="https://jumpinai.com/images/jumpinai-logo-email.png" alt="JumpinAI" style="max-width: 120px; height: auto; border-radius: 12px;" />
              </div>
              
              <!-- Content -->
              <div style="padding: 30px;">
                <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 20px 0; text-align: center;">You left something behind!</h1>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                  ${customerName ? `Hi ${customerName},` : 'Hi there,'}
                </p>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  We noticed you didn't complete your purchase of <strong>${productName}</strong>. Don't worry, we saved it for you!
                </p>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                  <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 18px;">Your Item:</h3>
                  <p style="margin: 5px 0; color: #333;"><strong>Product:</strong> ${productName}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Price:</strong> $${(productPrice / 100).toFixed(2)}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${checkoutUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Complete Your Purchase
                  </a>
                </div>
                
                <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px;">
                  <p style="margin: 0; color: #059669; font-size: 14px;">
                    <strong>Why customers love JumpinAI:</strong><br>
                    • Personalized AI adaptation plans<br>
                    • Expert-crafted workflows and prompts<br>
                    • Lifetime access to purchased content
                  </p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0; text-align: center;">
                  Need help? Just reply to this email and we'll assist you right away.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Questions? We're always here to help!</p>
                <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">Email us at <a href="mailto:info@jumpinai.com" style="color: #667eea; text-decoration: none;">info@jumpinai.com</a></p>
                <p style="margin: 0 0 5px 0; color: #999; font-size: 13px; font-weight: bold;">JumpinAI.</p>
                <p style="margin: 0 0 10px 0; color: #999; font-size: 12px;">Your Personalized AI Adaptation Studio.</p>
              </div>
              
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (customerEmailResponse.error) {
      console.error("Failed to send customer email:", customerEmailResponse.error);
      throw new Error("Failed to send abandoned cart email to customer");
    }

    // Send notification to admin
    const adminEmailResponse = await resend.emails.send({
      from: "JumpinAI Notifications <notifications@jumpinai.com>",
      to: ["info@jumpinai.com"],
      subject: `Abandoned Cart: ${productName} - ${customerEmail}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <!-- Header with Logo -->
              <div style="text-align: center; padding: 30px 20px 20px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <img src="https://jumpinai.com/images/jumpinai-logo-email.png" alt="JumpinAI" style="max-width: 120px; height: auto; border-radius: 12px;" />
              </div>
              
              <!-- Content -->
              <div style="padding: 30px;">
                <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 20px 0; text-align: center;">Abandoned Cart Alert</h1>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px;">Cart Details:</h2>
                  <p style="margin: 5px 0; color: #333;"><strong>Customer:</strong> ${customerEmail}</p>
                  ${customerName ? `<p style="margin: 5px 0; color: #333;"><strong>Name:</strong> ${customerName}</p>` : ''}
                  <p style="margin: 5px 0; color: #333;"><strong>Product:</strong> ${productName}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Price:</strong> $${(productPrice / 100).toFixed(2)}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; color: #92400e; font-size: 14px;">
                    <strong>Action taken:</strong> Abandoned cart recovery email sent to customer with checkout link.
                  </p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Questions? We're always here to help!</p>
                <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">Email us at <a href="mailto:info@jumpinai.com" style="color: #667eea; text-decoration: none;">info@jumpinai.com</a></p>
                <p style="margin: 0 0 5px 0; color: #999; font-size: 13px; font-weight: bold;">JumpinAI.</p>
                <p style="margin: 0 0 10px 0; color: #999; font-size: 12px;">Your Personalized AI Adaptation Studio.</p>
              </div>
              
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (adminEmailResponse.error) {
      console.error("Failed to send admin notification:", adminEmailResponse.error);
    }

    console.log("Abandoned cart emails sent successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Abandoned cart emails sent successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in abandoned-cart-email function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to send abandoned cart emails",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

Deno.serve(handler);
