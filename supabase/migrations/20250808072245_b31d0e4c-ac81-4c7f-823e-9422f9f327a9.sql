-- Ensure PowerStack product exists for checkout
insert into public.products (name, description, price, file_name, file_path, status)
select
  'Jump in AI: PowerStack',
  'Compact PDF guide to 21 strategic AI jumps with practical, step-by-step playbooks.',
  499,
  'jump-in-ai-powerstack.pdf',
  'digital-products/jump-in-ai-powerstack.pdf',
  'active'
where not exists (
  select 1 from public.products where file_name = 'jump-in-ai-powerstack.pdf'
);

-- If it already exists but is inactive or has a different path/price, update it
update public.products
set
  name = 'Jump in AI: PowerStack',
  description = 'Compact PDF guide to 21 strategic AI jumps with practical, step-by-step playbooks.',
  price = 499,
  file_path = 'digital-products/jump-in-ai-powerstack.pdf',
  status = 'active',
  updated_at = now()
where file_name = 'jump-in-ai-powerstack.pdf';