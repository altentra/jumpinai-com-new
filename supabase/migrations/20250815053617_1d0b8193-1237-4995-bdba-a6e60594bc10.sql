-- Simplify the products RLS policy to avoid complex subqueries
DROP POLICY IF EXISTS "Users can view products for their orders" ON public.products;

-- Create a simpler policy that allows authenticated users to view all products
-- since they need this access to see order details
CREATE POLICY "Authenticated users can view products" 
ON public.products 
FOR SELECT 
USING (auth.role() = 'authenticated');