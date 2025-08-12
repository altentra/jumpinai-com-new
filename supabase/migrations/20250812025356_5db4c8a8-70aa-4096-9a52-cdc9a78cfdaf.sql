-- Secure products table by restricting sensitive columns while preserving public catalog
-- 1) Ensure RLS and proper policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public can only view active products
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- Service role (Edge Functions) full access
DROP POLICY IF EXISTS "Service role full access to products" ON public.products;
CREATE POLICY "Service role full access to products"
ON public.products
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2) Column-level privilege hardening: hide file_path from public
-- Revoke broad access first
REVOKE ALL ON TABLE public.products FROM anon, authenticated;

-- Grant SELECT only to safe columns needed by the UI and filters
GRANT SELECT (id, name, description, price, status, created_at, updated_at, file_name)
ON public.products TO anon, authenticated;

-- Do NOT grant file_path to public roles
-- Keep service_role full table privileges for functions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO service_role;