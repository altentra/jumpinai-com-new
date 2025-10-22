-- Enable pg_net extension for HTTP requests (required for cron jobs)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedule the old hourly drip credit job if it exists
SELECT cron.unschedule('allocate-drip-credits-hourly');

-- Verify the 48-hour drip credit job exists
-- If the job 'allocate-drip-credits-48h' doesn't exist, this will create it
-- If it exists, we'll get an error but the job will continue to run
DO $$
BEGIN
  -- First try to unschedule in case it exists with wrong settings
  PERFORM cron.unschedule('allocate-drip-credits-48h');
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignore error if job doesn't exist
END $$;

-- Schedule drip credit allocation every 48 hours at 12am PST (8am UTC)
-- Runs at 8:00 AM UTC on odd days (every 48 hours)
SELECT cron.schedule(
  'allocate-drip-credits-48h',
  '0 8 1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31 * *',
  $$
  SELECT
    net.http_post(
        url:='https://cieczaajcgkgdgenfdzi.supabase.co/functions/v1/allocate-drip-credits',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpZWN6YWFqY2drZ2RnZW5mZHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MzU4OTksImV4cCI6MjA2NjExMTg5OX0.OiDppCXfN_AN64XvCvfhphFqbjSvRtKSwF-cIXCZMQU"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);