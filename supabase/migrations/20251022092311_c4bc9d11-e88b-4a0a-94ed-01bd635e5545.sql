-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule drip credit allocation every 48 hours at 12am PST (8am UTC)
-- Runs at 8:00 AM UTC every other day
SELECT cron.schedule(
  'allocate-drip-credits-48h',
  '0 8 */2 * *',
  $$
  SELECT
    net.http_post(
        url:='https://cieczaajcgkgdgenfdzi.supabase.co/functions/v1/allocate-drip-credits',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpZWN6YWFqY2drZ2RnZW5mZHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MzU4OTksImV4cCI6MjA2NjExMTg5OX0.OiDppCXfN_AN64XvCvfhphFqbjSvRtKSwF-cIXCZMQU"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);