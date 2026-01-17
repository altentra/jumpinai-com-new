-- Add 100 developer testing credits to ivan.v.kruchok@gmail.com
SELECT add_user_credits(
  'ddc5a69a-9989-4cfa-bb1a-d92a276900bb'::uuid,
  100,
  'Developer testing credits - Admin override',
  'admin_manual_override'
);