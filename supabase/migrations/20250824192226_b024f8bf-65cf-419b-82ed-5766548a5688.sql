-- Enable leaked password protection for better security
INSERT INTO auth.config (parameter, value) 
VALUES ('password_min_length', '6')
ON CONFLICT (parameter) 
DO UPDATE SET value = EXCLUDED.value;

INSERT INTO auth.config (parameter, value) 
VALUES ('password_required_characters', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
ON CONFLICT (parameter) 
DO UPDATE SET value = EXCLUDED.value;