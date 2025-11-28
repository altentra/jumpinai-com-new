-- Update credit packages with new values and prices
UPDATE credit_packages 
SET credits = 25, price_cents = 900, name = 'Starter Pack', updated_at = now()
WHERE id = 'c6143ca2-40da-4e8b-a75d-20f19643724f';

UPDATE credit_packages 
SET credits = 50, price_cents = 1700, name = 'Value Pack', updated_at = now()
WHERE id = 'f0b64045-b604-46b5-987f-a0f946f4c0d5';

UPDATE credit_packages 
SET credits = 100, price_cents = 2900, name = 'Professional Pack', updated_at = now()
WHERE id = '987d1e2f-3249-491d-8bd5-f6eed2bd1369';

UPDATE credit_packages 
SET credits = 250, price_cents = 5900, name = 'Business Pack', updated_at = now()
WHERE id = '13be1a8e-ef1b-49ea-b079-d6de48170184';

UPDATE credit_packages 
SET credits = 500, price_cents = 11000, name = 'Enterprise Pack', updated_at = now()
WHERE id = '6736aff0-a465-45f8-996a-3b93d3d1737a';