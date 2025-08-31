-- Add performance indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_newsletter_subscribed ON contacts(newsletter_subscribed);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_magnet_downloaded ON contacts(lead_magnet_downloaded);

-- Add indexes for contact activities
CREATE INDEX IF NOT EXISTS idx_contact_activities_contact_id ON contact_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_activities_activity_type ON contact_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_contact_activities_created_at ON contact_activities(created_at DESC);

-- Add indexes for orders and products
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);

-- Add indexes for subscribers
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscribed ON subscribers(subscribed);
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON subscribers(user_id);

-- Add indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified);

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_contacts_status_source ON contacts(status, source);
CREATE INDEX IF NOT EXISTS idx_orders_email_status ON orders(user_email, status);