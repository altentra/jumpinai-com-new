interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface NewsletterData {
  email: string;
}

export class EmailService {
  private apiKey: string;
  private fromEmail = 'info@jumpinai.com';
  private supabaseUrl = 'https://aqchfffpcxuwmpamklfv.supabase.co';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getUnsubscribeUrl(email: string): string {
    return `${this.supabaseUrl}/functions/v1/unsubscribe-newsletter?email=${encodeURIComponent(email)}`;
  }

  private async sendEmail(to: string, subject: string, html: string, text: string) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to send email: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async sendContactFormNotification(data: ContactFormData) {
    const template = this.getContactFormNotificationTemplate(data);
    return this.sendEmail(this.fromEmail, template.subject, template.html, template.text);
  }

  async sendContactFormConfirmation(data: ContactFormData) {
    const template = this.getContactFormConfirmationTemplate(data);
    return this.sendEmail(data.email, template.subject, template.html, template.text);
  }

  async sendNewsletterWelcome(data: NewsletterData) {
    const template = this.getNewsletterWelcomeTemplate(data);
    return this.sendEmail(data.email, template.subject, template.html, template.text);
  }

  async sendNewsletterNotification(data: NewsletterData) {
    const template = this.getNewsletterNotificationTemplate(data);
    return this.sendEmail(this.fromEmail, template.subject, template.html, template.text);
  }

  private getContactFormNotificationTemplate(data: ContactFormData): EmailTemplate {
    return {
      subject: `New Contact Form Submission: ${data.subject}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #374151 0%, #1f2937 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #374151; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Contact Details</h2>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #6b7280;">Name:</strong>
                <span style="margin-left: 10px;">${data.name}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #6b7280;">Email:</strong>
                <span style="margin-left: 10px;"><a href="mailto:${data.email}" style="color: #374151;">${data.email}</a></span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #6b7280;">Subject:</strong>
                <span style="margin-left: 10px;">${data.subject}</span>
              </div>
              
              <div style="margin-bottom: 20px;">
                <strong style="color: #6b7280;">Message:</strong>
                <div style="margin-top: 10px; padding: 15px; background: #f3f4f6; border-left: 4px solid #374151; border-radius: 4px;">
                  ${data.message.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 25px;">
                <a href="mailto:${data.email}" style="background: linear-gradient(135deg, #374151 0%, #1f2937 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Reply to ${data.name}</a>
              </div>
            </div>
          </div>
          
          <div style="background: #374151; padding: 20px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 14px;">JumpinAI Contact Form System</p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}

Reply to: ${data.email}
      `.trim()
    };
  }

  private getContactFormConfirmationTemplate(data: ContactFormData): EmailTemplate {
    return {
      subject: 'Thank you for contacting JumpinAI - We\'ll be in touch soon!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #374151 0%, #1f2937 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Thank You, ${data.name}!</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #374151; margin-bottom: 20px;">We've received your message</h2>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for reaching out to JumpinAI! We've successfully received your message about <strong>"${data.subject}"</strong> and we're excited to help you with your AI transformation goals.
              </p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #374151;">
                <h3 style="color: #374151; margin-top: 0;">What happens next?</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Our team will review your message within 24 hours</li>
                  <li>We'll get back to you with personalized insights for your AI strategy</li>
                  <li>If needed, we'll schedule a consultation to discuss your goals in detail</li>
                </ul>
              </div>
              
              <p style="font-size: 16px; margin: 20px 0;">
                In the meantime, feel free to explore our resources and stay updated with the latest AI trends by following us on our platforms.
              </p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="mailto:info@jumpinai.com" style="background: linear-gradient(135deg, #374151 0%, #1f2937 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Contact Us Again</a>
              </div>
            </div>
          </div>
          
          <div style="background: #374151; padding: 20px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 14px;">
              Best regards,<br>
              <strong>The JumpinAI Team</strong><br>
              <a href="mailto:info@jumpinai.com" style="color: #d1d5db;">info@jumpinai.com</a>
            </p>
          </div>
        </div>
      `,
      text: `
Thank You, ${data.name}!

We've received your message about "${data.subject}" and we're excited to help you with your AI transformation goals.

What happens next?
- Our team will review your message within 24 hours
- We'll get back to you with personalized insights for your AI strategy
- If needed, we'll schedule a consultation to discuss your goals in detail

Best regards,
The JumpinAI Team
info@jumpinai.com
      `.trim()
    };
  }

  private getNewsletterWelcomeTemplate(data: NewsletterData): EmailTemplate {
    const unsubscribeUrl = this.getUnsubscribeUrl(data.email);
    
    return {
      subject: 'Welcome to JumpinAI - Your AI Transformation Journey Starts Now!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #374151 0%, #1f2937 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to JumpinAI!</h1>
            <p style="color: #d1d5db; margin: 10px 0 0 0; font-size: 16px;">Your AI transformation journey starts now</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #374151; margin-bottom: 20px;">Thanks for joining 30,000+ professionals!</h2>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                You're now part of an exclusive community of industry leaders who are strategically implementing AI to transform their businesses.
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
              Welcome aboard!<br>
              <strong>The JumpinAI Team</strong><br>
              <a href="mailto:info@jumpinai.com" style="color: #d1d5db;">info@jumpinai.com</a>
            </p>
            <p style="color: #9ca3af; margin: 15px 0 0 0; font-size: 12px;">
              You can <a href="${unsubscribeUrl}" style="color: #d1d5db; text-decoration: underline;">unsubscribe</a> at any time.
            </p>
          </div>
        </div>
      `,
      text: `
Welcome to JumpinAI!

Thanks for joining 30,000+ professionals in our community of industry leaders who are strategically implementing AI.

What you'll receive:
- Weekly AI Insights: Latest tools and strategic workflows
- Professional Resources: Actionable guides and case studies  
- Industry Updates: Stay ahead of AI trends and innovations
- Exclusive Content: First access to our premium resources

Our next newsletter is coming soon with actionable AI strategies you can implement immediately.

Questions? Contact us at info@jumpinai.com

Welcome aboard!
The JumpinAI Team

Unsubscribe: ${unsubscribeUrl}
      `.trim()
    };
  }

  private getNewsletterNotificationTemplate(data: NewsletterData): EmailTemplate {
    return {
      subject: 'New Newsletter Subscription - JumpinAI',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #374151 0%, #1f2937 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Newsletter Subscription</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #374151; margin-bottom: 20px;">New Professional Joined!</h2>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #6b7280;">Email:</strong>
                <span style="margin-left: 10px;"><a href="mailto:${data.email}" style="color: #374151;">${data.email}</a></span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #6b7280;">Subscription Date:</strong>
                <span style="margin-left: 10px;">${new Date().toLocaleDateString()}</span>
              </div>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; color: #374151;">
                  A welcome email has been automatically sent to the new subscriber.
                </p>
              </div>
            </div>
          </div>
          
          <div style="background: #374151; padding: 20px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 14px;">JumpinAI Newsletter System</p>
          </div>
        </div>
      `,
      text: `
New Newsletter Subscription

Email: ${data.email}
Subscription Date: ${new Date().toLocaleDateString()}

A welcome email has been automatically sent to the new subscriber.
      `.trim()
    };
  }
}
