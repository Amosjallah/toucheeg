-- Migration to insert/upsert uploaded products into Supabase database

-- 1. Dark Knuckles Cream
INSERT INTO public.products (
  id, name, slug, description, short_description, price, category_id, brand, vendor, tags, status, featured, quantity, options, moq
) VALUES (
  'e1000001-0000-4000-a000-000000000001',
  'Dark Knuckles Cream',
  'dark-knuckles-cream',
  'Specially formulated to target hyperpigmentation and uneven tone on dark knuckles, knees, and elbows. Touchée Glow Dark Knuckles Cream gently exfoliates, deeply moisturizes, and brightens tough skin areas for smooth, radiant, and even-toned skin.',
  'Targeted hyperpigmentation cream for dark knuckles & elbows.',
  35.00,
  (SELECT id FROM public.categories WHERE slug = 'body-care' LIMIT 1),
  'Touchée Glow',
  'Touchée Glow Canada',
  ARRAY['body-care', 'dark-knuckles', 'brightening', 'hyperpigmentation', 'cream', 'featured'],
  'active'::product_status,
  true,
  100,
  '[{"name": "Size", "values": ["50g", "100g"]}]'::jsonb,
  1
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  price = EXCLUDED.price,
  featured = EXCLUDED.featured,
  status = EXCLUDED.status;

DELETE FROM public.product_images WHERE product_id = 'e1000001-0000-4000-a000-000000000001';
INSERT INTO public.product_images (product_id, url, alt_text, position) VALUES
  ('e1000001-0000-4000-a000-000000000001', '/products/dark-knuckles-cream.jpg', 'Dark Knuckles Cream', 0);

DELETE FROM public.product_variants WHERE product_id = 'e1000001-0000-4000-a000-000000000001';
INSERT INTO public.product_variants (product_id, name, sku, price, quantity, option1, image_url) VALUES
  ('e1000001-0000-4000-a000-000000000001', '50g', 'TG-DARK-KNUCKLES-50G', 35.00, 50, '50g', '/products/dark-knuckles-cream.jpg'),
  ('e1000001-0000-4000-a000-000000000001', '100g', 'TG-DARK-KNUCKLES-100G', 60.00, 50, '100g', '/products/dark-knuckles-cream.jpg');


-- 2. Vitamin C Facial Serum
INSERT INTO public.products (
  id, name, slug, description, short_description, price, category_id, brand, vendor, tags, status, featured, quantity, options, moq
) VALUES (
  'e1000001-0000-4000-a000-000000000002',
  'Vitamin C Facial Serum',
  'vitamin-c-facial-serum',
  'Touchée Glow Vitamin C Facial Serum delivers potent anti-aging and skin-brightening benefits. Formulated with antioxidant-rich Vitamin C and Vitamin E, it combats fine lines, boosts collagen production, fades dark spots, and restores a youthful, radiant glow.',
  'Anti-aging & brightening Vitamin C facial serum.',
  48.00,
  (SELECT id FROM public.categories WHERE slug = 'serums' LIMIT 1),
  'Touchée Glow',
  'Touchée Glow Canada',
  ARRAY['serum', 'vitamin-c', 'facial-serum', 'anti-aging', 'brightening', 'featured'],
  'active'::product_status,
  true,
  100,
  '[{"name": "Size", "values": ["30ml", "50ml"]}]'::jsonb,
  1
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  price = EXCLUDED.price,
  featured = EXCLUDED.featured,
  status = EXCLUDED.status;

DELETE FROM public.product_images WHERE product_id = 'e1000001-0000-4000-a000-000000000002';
INSERT INTO public.product_images (product_id, url, alt_text, position) VALUES
  ('e1000001-0000-4000-a000-000000000002', '/products/vitamin-c-facial-serum.jpg', 'Vitamin C Facial Serum', 0);

DELETE FROM public.product_variants WHERE product_id = 'e1000001-0000-4000-a000-000000000002';
INSERT INTO public.product_variants (product_id, name, sku, price, quantity, option1, image_url) VALUES
  ('e1000001-0000-4000-a000-000000000002', '30ml', 'TG-VITAMIN-C-30ML', 48.00, 50, '30ml', '/products/vitamin-c-facial-serum.jpg'),
  ('e1000001-0000-4000-a000-000000000002', '50ml', 'TG-VITAMIN-C-50ML', 75.00, 50, '50ml', '/products/vitamin-c-facial-serum.jpg');


-- 3. Fruity Facial Toner
INSERT INTO public.products (
  id, name, slug, description, short_description, price, category_id, brand, vendor, tags, status, featured, quantity, options, moq
) VALUES (
  'e1000001-0000-4000-a000-000000000003',
  'Fruity Facial Toner',
  'fruity-facial-toner',
  'Revitalize and clarify your complexion with Touchée Glow Fruity Facial Toner. Packed with natural fruit AHA extracts, it gently removes lingering impurities, balances skin pH, minimizes pores, and primes your skin for maximum serum absorption.',
  'Refreshing fruit extract facial toner.',
  32.00,
  (SELECT id FROM public.categories WHERE slug = 'cleansers' LIMIT 1),
  'Touchée Glow',
  'Touchée Glow Canada',
  ARRAY['toner', 'facial-toner', 'fruity', 'cleanser', 'brightening', 'featured'],
  'active'::product_status,
  true,
  100,
  '[{"name": "Size", "values": ["150ml", "250ml"]}]'::jsonb,
  1
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  price = EXCLUDED.price,
  featured = EXCLUDED.featured,
  status = EXCLUDED.status;

DELETE FROM public.product_images WHERE product_id = 'e1000001-0000-4000-a000-000000000003';
INSERT INTO public.product_images (product_id, url, alt_text, position) VALUES
  ('e1000001-0000-4000-a000-000000000003', '/products/fruity-facial-toner.jpg', 'Fruity Facial Toner', 0);

DELETE FROM public.product_variants WHERE product_id = 'e1000001-0000-4000-a000-000000000003';
INSERT INTO public.product_variants (product_id, name, sku, price, quantity, option1, image_url) VALUES
  ('e1000001-0000-4000-a000-000000000003', '150ml', 'TG-FRUITY-TONER-150ML', 32.00, 50, '150ml', '/products/fruity-facial-toner.jpg'),
  ('e1000001-0000-4000-a000-000000000003', '250ml', 'TG-FRUITY-TONER-250ML', 50.00, 50, '250ml', '/products/fruity-facial-toner.jpg');


-- 4. Skin Lighten Lotion
INSERT INTO public.products (
  id, name, slug, description, short_description, price, category_id, brand, vendor, tags, status, featured, quantity, options, moq
) VALUES (
  'e1000001-0000-4000-a000-000000000004',
  'Skin Lighten Lotion',
  'skin-lighten-lotion',
  'Touchée Glow Skin Lighten Lotion (8oz) is an intensive body moisturizer formulated to clarify skin tone, fade discoloration, and deliver deep hydration. Use twice daily for fast, radiant, and silky-smooth results.',
  '8oz intensive skin-lightening & radiance body lotion.',
  52.00,
  (SELECT id FROM public.categories WHERE slug = 'body-care' LIMIT 1),
  'Touchée Glow',
  'Touchée Glow Canada',
  ARRAY['lotion', 'body-care', 'skin-lighten', 'moisturizer', 'radiance', 'featured'],
  'active'::product_status,
  true,
  100,
  '[{"name": "Size", "values": ["8oz", "16oz"]}]'::jsonb,
  1
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  price = EXCLUDED.price,
  featured = EXCLUDED.featured,
  status = EXCLUDED.status;

DELETE FROM public.product_images WHERE product_id = 'e1000001-0000-4000-a000-000000000004';
INSERT INTO public.product_images (product_id, url, alt_text, position) VALUES
  ('e1000001-0000-4000-a000-000000000004', '/products/skin-lighten-lotion.jpg', 'Skin Lighten Lotion 8oz', 0),
  ('e1000001-0000-4000-a000-000000000004', '/products/skin-lighten-lotion-2.jpg', 'Skin Lighten Lotion Set', 1);

DELETE FROM public.product_variants WHERE product_id = 'e1000001-0000-4000-a000-000000000004';
INSERT INTO public.product_variants (product_id, name, sku, price, quantity, option1, image_url) VALUES
  ('e1000001-0000-4000-a000-000000000004', '8oz', 'TG-SKIN-LIGHTEN-8OZ', 52.00, 50, '8oz', '/products/skin-lighten-lotion.jpg'),
  ('e1000001-0000-4000-a000-000000000004', '16oz', 'TG-SKIN-LIGHTEN-16OZ', 88.00, 50, '16oz', '/products/skin-lighten-lotion.jpg');
