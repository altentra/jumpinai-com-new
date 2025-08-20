-- Add unique index to support upsert on subscribers.email used by auth0-sync
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'subscribers_email_unique_idx'
  ) THEN
    CREATE UNIQUE INDEX subscribers_email_unique_idx ON public.subscribers (email);
  END IF;
END $$;