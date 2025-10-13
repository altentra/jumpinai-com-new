-- Enable pg_cron extension if not already enabled
create extension if not exists pg_cron;

-- Enable pg_net extension for HTTP requests
create extension if not exists pg_net;

-- Schedule the drip credit allocation to run every hour
-- This checks for users eligible for drip credits (48-hour interval)
select cron.schedule(
  'allocate-drip-credits-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  select
    net.http_post(
        url:='https://cieczaajcgkgdgenfdzi.supabase.co/functions/v1/allocate-drip-credits',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpZWN6YWFqY2drZ2RnZW5mZHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MzU4OTksImV4cCI6MjA2NjExMTg5OX0.OiDppCXfN_AN64XvCvfhphFqbjSvRtKSwF-cIXCZMQU"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);