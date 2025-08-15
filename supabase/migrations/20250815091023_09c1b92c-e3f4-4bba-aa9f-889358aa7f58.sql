-- Remove the auth hook trigger to use Supabase's built-in email confirmation
-- This will eliminate the 500 error and use Supabase's native email system

-- First, let's see if there are any existing auth hooks
SELECT * FROM pg_stat_user_functions WHERE schemaname = 'auth';