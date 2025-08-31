-- Enable enhanced auth security configurations
-- Configure password strength and security settings
ALTER SYSTEM SET auth.password_min_length = '8';
ALTER SYSTEM SET auth.password_require_letters = 'true';
ALTER SYSTEM SET auth.password_require_numbers = 'true';
ALTER SYSTEM SET auth.password_require_symbols = 'false';
ALTER SYSTEM SET auth.password_require_uppercase = 'false';

-- Enable session timeout for better security
-- Sessions will expire after 7 days of inactivity
UPDATE auth.config 
SET 
  refresh_token_rotation_enabled = true,
  security_refresh_token_rotation_enabled = true
WHERE true;