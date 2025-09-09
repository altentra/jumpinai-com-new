-- Fix security warning: Set search_path for check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(table_name text, email_col text, time_col text, user_email text, limit_count integer, time_window_hours integer DEFAULT 24)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_count integer;
BEGIN
  EXECUTE format(
    'SELECT COUNT(*) FROM %I WHERE %I = $1 AND %I > NOW() - INTERVAL ''%s hours''',
    table_name, email_col, time_col, time_window_hours
  ) INTO current_count USING user_email;
  
  RETURN current_count < limit_count;
END;
$function$;