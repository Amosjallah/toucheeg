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

const categoriesList = [
  { name: 'Cleansers', slug: 'cleansers', description: 'Gentle and clarifying cleansers for clean, refreshed skin.', metadata: { featured: true } },
  { name: 'Serums', slug: 'serums', description: 'Targeted serums packed with active ingredients for maximum results.', metadata: { featured: true } },
  { name: 'Moisturizers', slug: 'moisturizers', description: 'Hydrating creams and gels to protect and lock in moisture.', metadata: { featured: true } },
  { name: 'Face Masks', slug: 'face-masks', description: 'Nourishing and clarifying masks for your self-care routine.', metadata: { featured: true } },
  { name: 'Body Care', slug: 'body-care', description: 'All-over hydration and body oils for silky-smooth skin.', metadata: { featured: true } }
];

const productsList = [
  {
    name: 'Dark Knuckles Cream',
    categorySlug: 'body-care',
    description: 'Specially formulated to target hyperpigmentation and uneven tone on dark knuckles, knees, and elbows. Touchée Glow Dark Knuckles Cream gently exfoliates, deeply moisturizes, and brightens tough skin areas for smooth, radiant, and even-toned skin.',
    shortDescription: 'Targeted hyperpigmentation cream for dark knuckles & elbows.',
    price: 35.00,
    tags: ['body-care', 'dark-knuckles', 'brightening', 'hyperpigmentation', 'cream'],
    image: '/products/dark-knuckles-cream.jpg',
    featured: true,
    variants: [
      { name: '50g', price: 35.00, option1: '50g' },
      { name: '100g', price: 60.00, option1: '100g' }
    ]
  },
  {
    name: 'Vitamin C Facial Serum',
    categorySlug: 'serums',
    description: 'Touchée Glow Vitamin C Facial Serum delivers potent anti-aging and skin-brightening benefits. Formulated with antioxidant-rich Vitamin C and Vitamin E, it combats fine lines, boosts collagen production, fades dark spots, and restores a youthful, radiant glow.',
    shortDescription: 'Anti-aging & brightening Vitamin C facial serum.',
    price: 48.00,
    tags: ['serum', 'vitamin-c', 'facial-serum', 'anti-aging', 'brightening'],
    image: '/products/vitamin-c-facial-serum.jpg',
    featured: true,
    variants: [
      { name: '30ml', price: 48.00, option1: '30ml' },
      { name: '50ml', price: 75.00, option1: '50ml' }
    ]
  },
  {
    name: 'Fruity Facial Toner',
    categorySlug: 'cleansers',
    description: 'Revitalize and clarify your complexion with Touchée Glow Fruity Facial Toner. Packed with natural fruit AHA extracts, it gently removes lingering impurities, balances skin pH, minimizes pores, and primes your skin for maximum serum absorption.',
    shortDescription: 'Refreshing fruit extract facial toner.',
    price: 32.00,
    tags: ['toner', 'facial-toner', 'fruity', 'cleanser', 'brightening'],
    image: '/products/fruity-facial-toner.jpg',
    featured: true,
    variants: [
      { name: '150ml', price: 32.00, option1: '150ml' },
      { name: '250ml', price: 50.00, option1: '250ml' }
    ]
  },
  {
    name: 'Skin Lighten Lotion',
    categorySlug: 'body-care',
    description: 'Touchée Glow Skin Lighten Lotion (8oz) is an intensive body moisturizer formulated to clarify skin tone, fade discoloration, and deliver deep hydration. Use twice daily for fast, radiant, and silky-smooth results.',
    shortDescription: '8oz intensive skin-lightening & radiance body lotion.',
    price: 52.00,
    tags: ['lotion', 'body-care', 'skin-lighten', 'moisturizer', 'radiance'],
    image: '/products/skin-lighten-lotion.jpg',
    featured: true,
    variants: [
      { name: '8oz', price: 52.00, option1: '8oz' },
      { name: '16oz', price: 88.00, option1: '16oz' }
    ]
  },
  {
    name: 'Hydrating Gel Cleanser',
    categorySlug: 'cleansers',
    description: 'A gentle, non-stripping gel cleanser infused with hyaluronic acid and chamomile to remove impurities while maintaining the skin\'s moisture barrier. Ideal for daily use.',
    shortDescription: 'Gentle hyaluronic acid gel cleanser.',
    price: 28.00,
    tags: ['cleanser', 'hydration', 'hyaluronic-acid', 'daily'],
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
    featured: true,
    variants: [
      { name: '150ml', price: 28.00, option1: '150ml' },
      { name: '300ml', price: 45.00, option1: '300ml' }
    ]
  },
  {
    name: 'Clarifying Salicylic Cleanser',
    categorySlug: 'cleansers',
    description: 'Target blemishes, breakouts, and excess oil with this clarifying cleanser containing 2% salicylic acid and soothing tea tree extract. Leaves skin clear and balanced.',
    shortDescription: 'Blemish-fighting 2% salicylic acid cleanser.',
    price: 32.00,
    tags: ['cleanser', 'acne', 'salicylic-acid', 'clarifying'],
    image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop',
    featured: false,
    variants: [
      { name: '150ml', price: 32.00, option1: '150ml' },
      { name: '250ml', price: 48.00, option1: '250ml' }
    ]
  },
  {
    name: 'Vitamin C Brightening Serum',
    categorySlug: 'serums',
    description: 'A potent 15% Vitamin C serum stabilized with Ferulic Acid and Vitamin E. Formulated to fade dark spots, even out skin tone, and boost overall skin radiance.',
    shortDescription: '15% Vitamin C brightening serum.',
    price: 58.00,
    tags: ['serum', 'vitamin-c', 'brightening', 'radiance'],
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop',
    featured: true,
    variants: [
      { name: '30ml', price: 58.00, option1: '30ml' },
      { name: '50ml', price: 85.00, option1: '50ml' }
    ]
  },
  {
    name: 'Hyaluronic Acid Plumping Serum',
    categorySlug: 'serums',
    description: 'Multi-molecular weight hyaluronic acid serum that delivers deep, multi-layered hydration. Plumps the skin, reduces fine lines, and leaves a dewy finish.',
    shortDescription: 'Deeply hydrating hyaluronic acid serum.',
    price: 45.00,
    tags: ['serum', 'hydration', 'hyaluronic-acid', 'plumping'],
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop',
    featured: true,
    variants: [
      { name: '30ml', price: 45.00, option1: '30ml' },
      { name: '60ml', price: 72.00, option1: '60ml' }
    ]
  },
  {
    name: 'Niacinamide Pore-Refining Serum',
    categorySlug: 'serums',
    description: '10% Niacinamide paired with 1% Zinc PCA to minimize the appearance of enlarged pores, control excess oil/shine, and visibly improve skin texture and tone.',
    shortDescription: '10% Niacinamide pore-refining serum.',
    price: 42.00,
    tags: ['serum', 'niacinamide', 'pores', 'oil-control'],
    image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop',
    featured: false,
    variants: [
      { name: '30ml', price: 42.00, option1: '30ml' },
      { name: '50ml', price: 62.00, option1: '50ml' }
    ]
  },
  {
    name: 'Retinol Renewal Night Serum',
    categorySlug: 'serums',
    description: 'Time-released 0.5% pure retinol night serum designed to target fine lines, wrinkles, and sun damage. Promotes gentle cell turnover for smoother, younger-looking skin.',
    shortDescription: '0.5% Retinol anti-aging night serum.',
    price: 65.00,
    tags: ['serum', 'retinol', 'anti-aging', 'night'],
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop',
    featured: true,
    variants: [
      { name: '30ml', price: 65.00, option1: '30ml' }
    ]
  },
  {
    name: 'Ceramide Barrier Restore Cream',
    categorySlug: 'moisturizers',
    description: 'A rich, comforting moisturizer packed with 5 essential ceramides, cholesterol, and fatty acids to rebuild and protect the skin barrier while sealing in hydration.',
    shortDescription: 'Rich barrier-repair ceramide moisturizer.',
    price: 48.00,
    tags: ['moisturizer', 'cream', 'ceramides', 'barrier-repair'],
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop',
    featured: true,
    variants: [
      { name: '50ml', price: 48.00, option1: '50ml' },
      { name: '100ml', price: 75.00, option1: '100ml' }
    ]
  },
  {
    name: 'Dewy Glow Gel Moisturizer',
    categorySlug: 'moisturizers',
    description: 'An oil-free, lightweight gel-cream that floods the skin with long-lasting moisture, leaving a fresh, dewy, and glowing finish without weight or stickiness.',
    shortDescription: 'Lightweight oil-free dewy gel moisturizer.',
    price: 40.00,
    tags: ['moisturizer', 'gel', 'dewy', 'glowing'],
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop',
    featured: true,
    variants: [
      { name: '50ml', price: 40.00, option1: '50ml' },
      { name: '80ml', price: 58.00, option1: '80ml' }
    ]
  },
  {
    name: 'Squalane Nourishing Facial Oil',
    categorySlug: 'moisturizers',
    description: '100% plant-derived squalane oil that locks in moisture, softens skin texture, and prevents hydration loss without clogging pores or feeling greasy.',
    shortDescription: '100% plant-derived squalane facial oil.',
    price: 38.00,
    tags: ['oil', 'squalane', 'nourishing', 'dry-skin'],
    image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop',
    featured: false,
    variants: [
      { name: '30ml', price: 38.00, option1: '30ml' }
    ]
  },
  {
    name: 'Rosehip Radiance Oil',
    categorySlug: 'moisturizers',
    description: 'Organic, cold-pressed rosehip seed oil rich in essential fatty acids and antioxidants. Nourishes, soothes, and brightens dry or dull skin tones.',
    shortDescription: 'Organic cold-pressed rosehip seed oil.',
    price: 44.00,
    tags: ['oil', 'rosehip', 'organic', 'brightening'],
    image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop',
    featured: false,
    variants: [
      { name: '30ml', price: 44.00, option1: '30ml' },
      { name: '50ml', price: 68.00, option1: '50ml' }
    ]
  },
  {
    name: 'Kaolin Clay Pore Mask',
    categorySlug: 'face-masks',
    description: 'Deeply detoxifying clay mask formulated with white kaolin clay, bentonite, and soothing green tea extract to draw out skin impurities and refine pores.',
    shortDescription: 'Detoxifying kaolin clay face mask.',
    price: 35.00,
    tags: ['mask', 'clay', 'pores', 'detoxify'],
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
    featured: false,
    variants: [
      { name: '100g', price: 35.00, option1: '100g' }
    ]
  },
  {
    name: 'Overnight Hydration Sleep Mask',
    categorySlug: 'face-masks',
    description: 'An ultra-nourishing sleep mask infused with squalane, hyaluronic acid, and centella asiatica to soothe, hydrate, and restore skin health overnight.',
    shortDescription: 'Overnight hydrating squalane sleep mask.',
    price: 46.00,
    tags: ['mask', 'sleep-mask', 'hydration', 'overnight'],
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop',
    featured: true,
    variants: [
      { name: '80ml', price: 46.00, option1: '80ml' }
    ]
  },
  {
    name: 'Glycolic Acid Exfoliating Toner',
    categorySlug: 'cleansers',
    description: '7% Glycolic Acid exfoliating toner that gently resurfaces the skin, sweeps away dead cells, and reveals a brighter, more radiant complexion over time.',
    shortDescription: '7% Glycolic Acid exfoliating toner.',
    price: 30.00,
    tags: ['toner', 'glycolic-acid', 'exfoliate', 'brightening'],
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
    featured: false,
    variants: [
      { name: '150ml', price: 30.00, option1: '150ml' },
      { name: '250ml', price: 45.00, option1: '250ml' }
    ]
  },
  {
    name: 'Soothing Cica Toner',
    categorySlug: 'cleansers',
    description: 'A calming, alcohol-free toner enriched with Centella Asiatica (Cica), aloe vera, and panthenol to soothe redness, balance pH, and hydrate sensitive skin.',
    shortDescription: 'Calming alcohol-free Cica toner.',
    price: 28.00,
    tags: ['toner', 'cica', 'soothing', 'sensitive-skin'],
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
    featured: false,
    variants: [
      { name: '150ml', price: 28.00, option1: '150ml' },
      { name: '300ml', price: 48.00, option1: '300ml' }
    ]
  },
  {
    name: 'Whipped Shea Body Butter',
    categorySlug: 'body-care',
    description: 'Luxurious whipped body butter combining raw organic shea butter, cold-pressed coconut oil, and vitamin E for deep, decadent all-over body hydration.',
    shortDescription: 'Decadent whipped shea body butter.',
    price: 34.00,
    tags: ['body-care', 'body-butter', 'shea-butter', 'hydration'],
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop',
    featured: true,
    variants: [
      { name: '200ml', price: 34.00, option1: '200ml' },
      { name: '400ml', price: 58.00, option1: '400ml' }
    ]
  },
  {
    name: 'Nourishing Body Glow Oil',
    categorySlug: 'body-care',
    description: 'A fast-absorbing, silky blend of sweet almond, jojoba, and argan oils designed to lock in post-shower moisture and leave body skin glowing and soft.',
    shortDescription: 'Fast-absorbing glowing body oil.',
    price: 36.00,
    tags: ['body-care', 'body-oil', 'glow', 'jojoba'],
    image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop',
    featured: false,
    variants: [
      { name: '120ml', price: 36.00, option1: '120ml' }
    ]
  },
  {
    name: 'Caffeine Depuffing Eye Cream',
    categorySlug: 'moisturizers',
    description: 'A lightweight, cooling eye cream infused with green coffee caffeine and active peptides to visibly reduce dark circles, under-eye puffiness, and fine lines.',
    shortDescription: 'Caffeine and peptide depuffing eye cream.',
    price: 38.00,
    tags: ['eye-cream', 'caffeine', 'depuffing', 'moisturizer'],
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop',
    featured: false,
    variants: [
      { name: '15ml', price: 38.00, option1: '15ml' }
    ]
  },
  {
    name: 'Vitamin E Intensive Hand Cream',
    categorySlug: 'body-care',
    description: 'Repair dry, chapped, or cracked hands with this fast-absorbing intensive cream containing colloidal oatmeal, raw honey, and nourishing Vitamin E.',
    shortDescription: 'Intensive repair Vitamin E hand cream.',
    price: 18.00,
    tags: ['body-care', 'hand-cream', 'vitamin-e', 'repair'],
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop',
    featured: false,
    variants: [
      { name: '75ml', price: 18.00, option1: '75ml' }
    ]
  },
  {
    name: 'Bakuchiol Youth Elixir Serum',
    categorySlug: 'serums',
    description: 'A natural, plant-based alternative to retinol. Designed to firm the skin, reduce the appearance of fine lines, and boost skin elasticity without irritation.',
    shortDescription: 'Bakuchiol plant-based anti-aging serum.',
    price: 62.00,
    tags: ['serum', 'bakuchiol', 'retinol-alternative', 'firming'],
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop',
    featured: true,
    variants: [
      { name: '30ml', price: 62.00, option1: '30ml' }
    ]
  },
  {
    name: 'Calming Oats Face Mask',
    categorySlug: 'face-masks',
    description: 'A nourishing, wash-off face mask containing colloidal oatmeal, organic honey, and calendula extract. Calms redness, reduces irritation, and hydrates dry skin.',
    shortDescription: 'Nourishing oatmeal and honey wash-off mask.',
    price: 36.00,
    tags: ['mask', 'oatmeal', 'soothing', 'hydration'],
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
    featured: false,
    variants: [
      { name: '100g', price: 36.00, option1: '100g' }
    ]
  }
];

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

async function main() {
  console.log('Seeding 20 skincare products...');
  try {
    // 1. Create categories and keep mapping of slug -> ID
    const categoryMap = new Map();
    for (const cat of categoriesList) {
      const { data, error } = await supabase
        .from('categories')
        .upsert(
          { name: cat.name, slug: cat.slug, description: cat.description, metadata: cat.metadata, status: 'active' },
          { onConflict: 'slug' }
        )
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to upsert category ${cat.name}: ${error.message}`);
      }
      categoryMap.set(cat.slug, data.id);
    }
    console.log('Categories upserted successfully.');

    // Delete existing products to make space for the 20 clean skincare products
    console.log('Clearing old product variants and images...');
    await supabase.from('product_variants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('product_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Clearing old products...');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Insert products, product_images, and variants
    for (const prod of productsList) {
      const slug = generateSlug(prod.name);
      const categoryId = categoryMap.get(prod.categorySlug);

      if (!categoryId) {
        console.error(`Category ID not found for slug: ${prod.categorySlug}`);
        continue;
      }

      // Insert product
      const { data: newProduct, error: prodErr } = await supabase
        .from('products')
        .insert({
          name: prod.name,
          slug,
          description: prod.description,
          short_description: prod.shortDescription,
          price: prod.price,
          category_id: categoryId,
          tags: prod.tags,
          status: 'active',
          featured: prod.featured,
          quantity: 100,
          brand: 'TOUCHEEGLOW',
          vendor: 'TOUCHEEGLOW Canada',
          moq: 1,
          options: JSON.stringify([{ name: 'Size', values: prod.variants.map(v => v.name) }])
        })
        .select()
        .single();

      if (prodErr) {
        console.error(`Failed to insert product ${prod.name}:`, prodErr.message);
        continue;
      }

      console.log(`Inserted product: ${newProduct.name}`);

      // Insert product main image
      const { error: imgErr } = await supabase
        .from('product_images')
        .insert({
          product_id: newProduct.id,
          url: prod.image,
          alt_text: prod.name,
          position: 1
        });

      if (imgErr) {
        console.error(`Failed to insert image for ${prod.name}:`, imgErr.message);
      }

      // Insert product variants
      for (const variant of prod.variants) {
        const variantSku = `TG-${slug.substring(0, 10).toUpperCase()}-${variant.name.toUpperCase()}`;
        const { error: varErr } = await supabase
          .from('product_variants')
          .insert({
            product_id: newProduct.id,
            name: variant.name,
            sku: variantSku,
            price: variant.price,
            quantity: 50,
            option1: variant.option1,
            image_url: prod.image
          });

        if (varErr) {
          console.error(`Failed to insert variant ${variant.name} for ${prod.name}:`, varErr.message);
        }
      }
    }

    console.log('Successfully seeded 20 luxury skincare products!');
  } catch (err) {
    console.error('Seeding failed with error:', err);
    process.exit(1);
  }
}

main();
