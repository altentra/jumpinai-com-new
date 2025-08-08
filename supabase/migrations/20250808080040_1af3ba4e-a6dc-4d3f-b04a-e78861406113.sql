-- Update price for PowerStack to $9.99
UPDATE public.products
SET price = 999,
    status = 'active',
    updated_at = now()
WHERE file_name = 'jump-in-ai-powerstack.pdf';