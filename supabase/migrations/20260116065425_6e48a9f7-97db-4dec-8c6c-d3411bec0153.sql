-- =====================================================
-- SECURE VIEW: Public jumps without sensitive data
-- Hides IP addresses and masks exact location
-- =====================================================

-- Create a secure view for public jumps that excludes sensitive fields
CREATE OR REPLACE VIEW public.public_jumps_safe
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  profile_id,
  title,
  summary,
  full_content,
  structured_plan,
  comprehensive_plan,
  form_goals,
  form_challenges,
  jump_type,
  status,
  implemented,
  completion_percentage,
  -- Mask location to show only city and country (remove street-level detail)
  CASE 
    WHEN location IS NOT NULL AND location != 'Unknown' THEN
      -- Extract just city and country from "City, State, Country" format
      CASE 
        WHEN array_length(string_to_array(location, ', '), 1) >= 3 THEN
          split_part(location, ', ', 1) || ', ' || split_part(location, ', ', array_length(string_to_array(location, ', '), 1))
        WHEN array_length(string_to_array(location, ', '), 1) = 2 THEN
          location
        ELSE
          'Unknown'
      END
    ELSE 
      'Unknown'
  END AS location,
  -- Exclude ip_address entirely (not included)
  input_method,
  stt_used,
  goals_stt_seconds,
  challenges_stt_seconds,
  likes_count,
  views_count,
  clarifications_count,
  reroutes_count,
  max_clarification_level,
  tools_clicked_count,
  prompts_copied_count,
  combos_used_count,
  is_public,
  created_at,
  updated_at
FROM public.user_jumps
WHERE is_public = true;

-- Grant SELECT on the view to authenticated and anon roles
GRANT SELECT ON public.public_jumps_safe TO authenticated;
GRANT SELECT ON public.public_jumps_safe TO anon;

-- Add comment explaining the view's purpose
COMMENT ON VIEW public.public_jumps_safe IS 'Secure view for public jumps that excludes IP addresses and masks exact location data to city/country level only. Use this view for all public-facing jump queries.';