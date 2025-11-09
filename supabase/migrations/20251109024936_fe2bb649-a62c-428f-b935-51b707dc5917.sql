-- Unschedule all drip credit cron jobs
SELECT cron.unschedule(2);
SELECT cron.unschedule(5);
SELECT cron.unschedule(6);

-- Drop the allocate_drip_credits database function
DROP FUNCTION IF EXISTS public.allocate_drip_credits();

-- Optional: Drop the drip_credit_tracking table if you want to remove historical data
-- Uncomment the line below if you want to delete this table and all its data
-- DROP TABLE IF EXISTS public.drip_credit_tracking;