-- Drop all existing policies on products table
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Service role full access to products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;

-- Create a simple policy that allows all authenticated users to view products
CREATE POLICY "Allow authenticated users to view products" 
ON public.products 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Keep the service role access policy
CREATE POLICY "Service role full access to products" 
ON public.products 
FOR ALL 
USING (true) 
WITH CHECK (true);