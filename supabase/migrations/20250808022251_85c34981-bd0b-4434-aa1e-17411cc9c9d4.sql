-- Add two new products if they don't already exist
INSERT INTO public.products (name, description, price, file_name, file_path, status)
SELECT 
  'Jump in AI of Sound & Music Creation',
  'Compose and produce music with AI. Learn tools and workflows for generative composition, sound design, mixing, and mastering.',
  499,
  'Jump in AI of Sound & Music Creation.pdf',
  'digital-products/jump-in-ai-sound-music-creation.pdf',
  'active'
WHERE NOT EXISTS (
  SELECT 1 FROM public.products 
  WHERE file_path = 'digital-products/jump-in-ai-sound-music-creation.pdf' 
     OR name = 'Jump in AI of Sound & Music Creation'
);

INSERT INTO public.products (name, description, price, file_name, file_path, status)
SELECT 
  'Jump in AI of Website Building, App Development & Coding',
  'Build websites and apps faster with AI. Use AI for planning, scaffolding, coding, debugging, and deployment across modern stacks.',
  499,
  'Jump in AI of Website Building, App Development & Coding.pdf',
  'digital-products/jump-in-ai-website-building-app-development-coding.pdf',
  'active'
WHERE NOT EXISTS (
  SELECT 1 FROM public.products 
  WHERE file_path = 'digital-products/jump-in-ai-website-building-app-development-coding.pdf' 
     OR name = 'Jump in AI of Website Building, App Development & Coding'
);
