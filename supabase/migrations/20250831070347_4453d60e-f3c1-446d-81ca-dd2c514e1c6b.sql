-- Create subscription product with active status and subscription order
DO $$
DECLARE
    subscription_product_id UUID := gen_random_uuid();
BEGIN
    -- First create the subscription product with active status
    INSERT INTO public.products (
        id,
        name,
        description,
        price,
        file_name,
        file_path,
        status,
        created_at,
        updated_at
    ) VALUES (
        subscription_product_id,
        'JumpinAI Pro Subscription',
        'Monthly subscription to JumpinAI Pro with unlimited access to all digital products and features.',
        1000,
        'subscription-file',
        'subscription-path',
        'active',
        '2025-08-30 03:43:57+00',
        '2025-08-30 03:43:57+00'
    );

    -- Then create the subscription order
    INSERT INTO public.orders (
        user_email,
        product_id,
        amount,
        currency,
        status,
        stripe_session_id,
        created_at,
        updated_at
    ) VALUES (
        'ivan.adventuring@gmail.com',
        subscription_product_id,
        1000,
        'usd',
        'subscription',
        'cs_live_a1fhL1yx9xM3OjTtiCtYkMN9rWckndwwYa0foiyW5h6kckvU6NLElq6Rl7',
        '2025-08-30 03:43:57+00',
        '2025-08-30 03:43:57+00'
    );
END $$;