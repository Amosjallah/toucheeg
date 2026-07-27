export interface FallbackProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price?: number;
  quantity: number;
  status: string;
  featured: boolean;
  brand: string;
  vendor: string;
  tags: string[];
  category_id?: string;
  categories: {
    id: string;
    name: string;
    slug: string;
  };
  product_images: Array<{
    id?: string;
    url: string;
    alt_text?: string;
    position: number;
  }>;
  product_variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    option1?: string;
    image_url?: string;
  }>;
}

export const FALLBACK_CATEGORIES = [
  { id: 'cat-body-care', name: 'Body Care', slug: 'body-care', description: 'All-over hydration and body oils for silky-smooth skin.', image_url: null, parent_id: null, metadata: { featured: true } },
  { id: 'cat-serums', name: 'Serums', slug: 'serums', description: 'Targeted serums packed with active ingredients for maximum results.', image_url: null, parent_id: null, metadata: { featured: true } },
  { id: 'cat-cleansers', name: 'Cleansers', slug: 'cleansers', description: 'Gentle and clarifying cleansers for clean, refreshed skin.', image_url: null, parent_id: null, metadata: { featured: true } },
  { id: 'cat-moisturizers', name: 'Moisturizers', slug: 'moisturizers', description: 'Hydrating creams and gels to protect and lock in moisture.', image_url: null, parent_id: null, metadata: { featured: true } },
  { id: 'cat-face-masks', name: 'Face Masks', slug: 'face-masks', description: 'Nourishing and clarifying masks for your self-care routine.', image_url: null, parent_id: null, metadata: { featured: true } },
];

export function ensureProducts(data: any[] | null | undefined): any[] {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return FALLBACK_PRODUCTS as any[];
  }
  const existingSlugs = new Set(data.map((p: any) => p.slug));
  const missing = FALLBACK_PRODUCTS.filter((p) => !existingSlugs.has(p.slug));
  if (missing.length > 0) {
    return [...data, ...missing];
  }
  return data;
}

export function ensureCategories(data: any[] | null | undefined): any[] {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return FALLBACK_CATEGORIES as any[];
  }
  const existingSlugs = new Set(data.map((c: any) => c.slug));
  const missing = FALLBACK_CATEGORIES.filter((c) => !existingSlugs.has(c.slug));
  if (missing.length > 0) {
    return [...data, ...missing];
  }
  return data;
}

export const FALLBACK_PRODUCTS: FallbackProduct[] = [
  {
    id: 'e1000001-0000-4000-a000-000000000001',
    name: 'Dark Knuckles Cream',
    slug: 'dark-knuckles-cream',
    description: 'Specially formulated to target hyperpigmentation and uneven tone on dark knuckles, knees, and elbows. Touchée Glow Dark Knuckles Cream gently exfoliates, deeply moisturizes, and brightens tough skin areas for smooth, radiant, and even-toned skin.',
    short_description: 'Targeted hyperpigmentation cream for dark knuckles & elbows.',
    price: 35.00,
    quantity: 100,
    status: 'active',
    featured: true,
    brand: 'Touchée Glow',
    vendor: 'Touchée Glow Canada',
    tags: ['body-care', 'dark-knuckles', 'brightening', 'hyperpigmentation', 'cream', 'featured'],
    categories: { id: 'cat-body-care', name: 'Body Care', slug: 'body-care' },
    product_images: [
      { id: 'img-1', url: '/products/dark-knuckles-cream.jpg', alt_text: 'Dark Knuckles Cream', position: 0 }
    ],
    product_variants: [
      { id: 'v-1-1', name: '50g', sku: 'TG-DARK-KNUCKLES-50G', price: 35.00, quantity: 50, option1: '50g', image_url: '/products/dark-knuckles-cream.jpg' },
      { id: 'v-1-2', name: '100g', sku: 'TG-DARK-KNUCKLES-100G', price: 60.00, quantity: 50, option1: '100g', image_url: '/products/dark-knuckles-cream.jpg' }
    ]
  },
  {
    id: 'e1000001-0000-4000-a000-000000000002',
    name: 'Vitamin C Facial Serum',
    slug: 'vitamin-c-facial-serum',
    description: 'Touchée Glow Vitamin C Facial Serum delivers potent anti-aging and skin-brightening benefits. Formulated with antioxidant-rich Vitamin C and Vitamin E, it combats fine lines, boosts collagen production, fades dark spots, and restores a youthful, radiant glow.',
    short_description: 'Anti-aging & brightening Vitamin C facial serum.',
    price: 48.00,
    quantity: 100,
    status: 'active',
    featured: true,
    brand: 'Touchée Glow',
    vendor: 'Touchée Glow Canada',
    tags: ['serum', 'vitamin-c', 'facial-serum', 'anti-aging', 'brightening', 'featured'],
    categories: { id: 'cat-serums', name: 'Serums', slug: 'serums' },
    product_images: [
      { id: 'img-2', url: '/products/vitamin-c-facial-serum.jpg', alt_text: 'Vitamin C Facial Serum', position: 0 }
    ],
    product_variants: [
      { id: 'v-2-1', name: '30ml', sku: 'TG-VITAMIN-C-30ML', price: 48.00, quantity: 50, option1: '30ml', image_url: '/products/vitamin-c-facial-serum.jpg' },
      { id: 'v-2-2', name: '50ml', sku: 'TG-VITAMIN-C-50ML', price: 75.00, quantity: 50, option1: '50ml', image_url: '/products/vitamin-c-facial-serum.jpg' }
    ]
  },
  {
    id: 'e1000001-0000-4000-a000-000000000003',
    name: 'Fruity Facial Toner',
    slug: 'fruity-facial-toner',
    description: 'Revitalize and clarify your complexion with Touchée Glow Fruity Facial Toner. Packed with natural fruit AHA extracts, it gently removes lingering impurities, balances skin pH, minimizes pores, and primes your skin for maximum serum absorption.',
    short_description: 'Refreshing fruit extract facial toner.',
    price: 32.00,
    quantity: 100,
    status: 'active',
    featured: true,
    brand: 'Touchée Glow',
    vendor: 'Touchée Glow Canada',
    tags: ['toner', 'facial-toner', 'fruity', 'cleanser', 'brightening', 'featured'],
    categories: { id: 'cat-cleansers', name: 'Cleansers', slug: 'cleansers' },
    product_images: [
      { id: 'img-3', url: '/products/fruity-facial-toner.jpg', alt_text: 'Fruity Facial Toner', position: 0 }
    ],
    product_variants: [
      { id: 'v-3-1', name: '150ml', sku: 'TG-FRUITY-TONER-150ML', price: 32.00, quantity: 50, option1: '150ml', image_url: '/products/fruity-facial-toner.jpg' },
      { id: 'v-3-2', name: '250ml', sku: 'TG-FRUITY-TONER-250ML', price: 50.00, quantity: 50, option1: '250ml', image_url: '/products/fruity-facial-toner.jpg' }
    ]
  },
  {
    id: 'e1000001-0000-4000-a000-000000000004',
    name: 'Skin Lighten Lotion',
    slug: 'skin-lighten-lotion',
    description: 'Touchée Glow Skin Lighten Lotion (8oz) is an intensive body moisturizer formulated to clarify skin tone, fade discoloration, and deliver deep hydration. Use twice daily for fast, radiant, and silky-smooth results.',
    short_description: '8oz intensive skin-lightening & radiance body lotion.',
    price: 52.00,
    quantity: 100,
    status: 'active',
    featured: true,
    brand: 'Touchée Glow',
    vendor: 'Touchée Glow Canada',
    tags: ['lotion', 'body-care', 'skin-lighten', 'moisturizer', 'radiance', 'featured'],
    categories: { id: 'cat-body-care', name: 'Body Care', slug: 'body-care' },
    product_images: [
      { id: 'img-4-1', url: '/products/skin-lighten-lotion.jpg', alt_text: 'Skin Lighten Lotion 8oz', position: 0 },
      { id: 'img-4-2', url: '/products/skin-lighten-lotion-2.jpg', alt_text: 'Skin Lighten Lotion Set', position: 1 }
    ],
    product_variants: [
      { id: 'v-4-1', name: '8oz', sku: 'TG-SKIN-LIGHTEN-8OZ', price: 52.00, quantity: 50, option1: '8oz', image_url: '/products/skin-lighten-lotion.jpg' },
      { id: 'v-4-2', name: '16oz', sku: 'TG-SKIN-LIGHTEN-16OZ', price: 88.00, quantity: 50, option1: '16oz', image_url: '/products/skin-lighten-lotion.jpg' }
    ]
  }
];
