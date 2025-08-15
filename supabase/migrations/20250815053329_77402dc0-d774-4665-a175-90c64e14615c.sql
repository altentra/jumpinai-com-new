-- Update RLS policy for products table to allow authenticated users to view products for their orders
DROP POLICY IF EXISTS "Users can view products for their orders" ON public.products;

CREATE POLICY "Users can view products for their orders" 
ON public.products 
FOR SELECT 
USING (
  -- Allow viewing products that are referenced in user's orders
  id IN (
    SELECT product_id 
    FROM public.orders 
    WHERE user_email = auth.email() AND status = 'completed'
  )
  OR 
  -- Keep existing public access for active products
  status = 'active'
);