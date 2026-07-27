import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const altPath = path.join(__dirname, '..', '.env');
  const p = fs.existsSync(envPath) ? envPath : fs.existsSync(altPath) ? altPath : null;
  if (!p) return {};
  return Object.fromEntries(
    fs
      .readFileSync(p, 'utf-8')
      .split('\n')
      .filter((l) => /^[A-Z_]+=/.test(l.trim()))
      .map((l) => {
        const eq = l.indexOf('=');
        const key = l.slice(0, eq).trim();
        let val = l.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        return [key, val];
      })
  );
}

const env = { ...process.env, ...loadEnv() };
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env configuration.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const newProductsList = [
  {
    name: 'Dark Knuckles Cream',
    slug: 'dark-knuckles-cream',
    categorySlug: 'body-care',
    description: 'Specially formulated to target hyperpigmentation and uneven tone on dark knuckles, knees, and elbows. Touchée Glow Dark Knuckles Cream gently exfoliates, deeply moisturizes, and brightens tough skin areas for smooth, radiant, and even-toned skin.',
    shortDescription: 'Targeted hyperpigmentation cream for dark knuckles & elbows.',
    price: 35.00,
    tags: ['body-care', 'dark-knuckles', 'brightening', 'hyperpigmentation', 'cream', 'featured'],
    images: [
      { localPath: 'public/products/dark-knuckles-cream.jpg', alt: 'Dark Knuckles Cream' }
    ],
    featured: true,
    variants: [
      { name: '50g', price: 35.00, option1: '50g' },
      { name: '100g', price: 60.00, option1: '100g' }
    ]
  },
  {
    name: 'Vitamin C Facial Serum',
    slug: 'vitamin-c-facial-serum',
    categorySlug: 'serums',
    description: 'Touchée Glow Vitamin C Facial Serum delivers potent anti-aging and skin-brightening benefits. Formulated with antioxidant-rich Vitamin C and Vitamin E, it combats fine lines, boosts collagen production, fades dark spots, and restores a youthful, radiant glow.',
    shortDescription: 'Anti-aging & brightening Vitamin C facial serum.',
    price: 48.00,
    tags: ['serum', 'vitamin-c', 'facial-serum', 'anti-aging', 'brightening', 'featured'],
    images: [
      { localPath: 'public/products/vitamin-c-facial-serum.jpg', alt: 'Vitamin C Facial Serum' }
    ],
    featured: true,
    variants: [
      { name: '30ml', price: 48.00, option1: '30ml' },
      { name: '50ml', price: 75.00, option1: '50ml' }
    ]
  },
  {
    name: 'Fruity Facial Toner',
    slug: 'fruity-facial-toner',
    categorySlug: 'cleansers',
    description: 'Revitalize and clarify your complexion with Touchée Glow Fruity Facial Toner. Packed with natural fruit AHA extracts, it gently removes lingering impurities, balances skin pH, minimizes pores, and primes your skin for maximum serum absorption.',
    shortDescription: 'Refreshing fruit extract facial toner.',
    price: 32.00,
    tags: ['toner', 'facial-toner', 'fruity', 'cleanser', 'brightening', 'featured'],
    images: [
      { localPath: 'public/products/fruity-facial-toner.jpg', alt: 'Fruity Facial Toner' }
    ],
    featured: true,
    variants: [
      { name: '150ml', price: 32.00, option1: '150ml' },
      { name: '250ml', price: 50.00, option1: '250ml' }
    ]
  },
  {
    name: 'Skin Lighten Lotion',
    slug: 'skin-lighten-lotion',
    categorySlug: 'body-care',
    description: 'Touchée Glow Skin Lighten Lotion (8oz) is an intensive body moisturizer formulated to clarify skin tone, fade discoloration, and deliver deep hydration. Use twice daily for fast, radiant, and silky-smooth results.',
    shortDescription: '8oz intensive skin-lightening & radiance body lotion.',
    price: 52.00,
    tags: ['lotion', 'body-care', 'skin-lighten', 'moisturizer', 'radiance', 'featured'],
    images: [
      { localPath: 'public/products/skin-lighten-lotion.jpg', alt: 'Skin Lighten Lotion 8oz' },
      { localPath: 'public/products/skin-lighten-lotion-2.jpg', alt: 'Skin Lighten Lotion Set' }
    ],
    featured: true,
    variants: [
      { name: '8oz', price: 52.00, option1: '8oz' },
      { name: '16oz', price: 88.00, option1: '16oz' }
    ]
  }
];

async function main() {
  console.log('Uploading 4 new products to Supabase...');

  try {
    // Check categories
    const { data: categories, error: catErr } = await supabase.from('categories').select('id, slug');
    if (catErr) {
      throw new Error(`Failed to fetch categories: ${catErr.message}`);
    }
    const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

    // Fallback category if needed
    let defaultCatId = categoryMap.values().next().value;

    for (const prod of newProductsList) {
      const categoryId = categoryMap.get(prod.categorySlug) || defaultCatId;

      // Try uploading images to Supabase Storage if storage bucket exists
      const imageUrls = [];
      for (const img of prod.images) {
        const fileName = path.basename(img.localPath);
        const relativePublicUrl = `/products/${fileName}`;
        
        try {
          if (fs.existsSync(path.join(__dirname, '..', img.localPath))) {
            const fileBuffer = fs.readFileSync(path.join(__dirname, '..', img.localPath));
            const storagePath = `products/${fileName}`;
            
            const { data: uploadData, error: uploadErr } = await supabase.storage
              .from('products')
              .upload(storagePath, fileBuffer, {
                contentType: 'image/jpeg',
                upsert: true,
              });

            if (!uploadErr && uploadData) {
              const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(storagePath);
              if (publicUrlData?.publicUrl) {
                console.log(`Uploaded ${fileName} to Supabase Storage: ${publicUrlData.publicUrl}`);
                imageUrls.push({ url: publicUrlData.publicUrl, alt: img.alt });
                continue;
              }
            } else {
              console.log(`Storage upload fallback to public URL for ${fileName}:`, uploadErr?.message);
            }
          }
        } catch (e) {
          console.log(`Using static public asset fallback for ${fileName}`);
        }

        imageUrls.push({ url: relativePublicUrl, alt: img.alt });
      }

      // Upsert product
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('slug', prod.slug)
        .single();

      let productId;

      if (existingProduct) {
        productId = existingProduct.id;
        const { error: updateErr } = await supabase
          .from('products')
          .update({
            name: prod.name,
            description: prod.description,
            short_description: prod.shortDescription,
            price: prod.price,
            category_id: categoryId,
            tags: prod.tags,
            status: 'active',
            featured: prod.featured,
            quantity: 100,
            brand: 'Touchée Glow',
            vendor: 'Touchée Glow Canada',
            moq: 1,
            options: JSON.stringify([{ name: 'Size', values: prod.variants.map((v) => v.name) }]),
          })
          .eq('id', productId);

        if (updateErr) {
          console.error(`Failed to update product ${prod.name}:`, updateErr.message);
          continue;
        }
        console.log(`Updated existing product: ${prod.name}`);
      } else {
        const { data: newProd, error: insertErr } = await supabase
          .from('products')
          .insert({
            name: prod.name,
            slug: prod.slug,
            description: prod.description,
            short_description: prod.shortDescription,
            price: prod.price,
            category_id: categoryId,
            tags: prod.tags,
            status: 'active',
            featured: prod.featured,
            quantity: 100,
            brand: 'Touchée Glow',
            vendor: 'Touchée Glow Canada',
            moq: 1,
            options: JSON.stringify([{ name: 'Size', values: prod.variants.map((v) => v.name) }]),
          })
          .select()
          .single();

        if (insertErr) {
          console.error(`Failed to insert product ${prod.name}:`, insertErr.message);
          continue;
        }
        productId = newProd.id;
        console.log(`Inserted new product: ${prod.name} (ID: ${productId})`);
      }

      // Clean up & update product_images
      await supabase.from('product_images').delete().eq('product_id', productId);
      for (let i = 0; i < imageUrls.length; i++) {
        const img = imageUrls[i];
        const { error: imgErr } = await supabase.from('product_images').insert({
          product_id: productId,
          url: img.url,
          alt_text: img.alt,
          position: i,
        });

        if (imgErr) {
          console.error(`Failed to insert image for ${prod.name}:`, imgErr.message);
        }
      }

      // Clean up & update product_variants
      await supabase.from('product_variants').delete().eq('product_id', productId);
      for (const variant of prod.variants) {
        const variantSku = `TG-${prod.slug.substring(0, 10).toUpperCase()}-${variant.name.toUpperCase()}`;
        const { error: varErr } = await supabase.from('product_variants').insert({
          product_id: productId,
          name: variant.name,
          sku: variantSku,
          price: variant.price,
          quantity: 50,
          option1: variant.option1,
          image_url: imageUrls[0]?.url,
        });

        if (varErr) {
          console.error(`Failed to insert variant ${variant.name} for ${prod.name}:`, varErr.message);
        }
      }
    }

    console.log('Finished uploading all products successfully!');
  } catch (err) {
    console.error('Error uploading products:', err);
    process.exit(1);
  }
}

main();
