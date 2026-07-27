'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import ProductCard, { type ColorVariant, getColorHex } from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import AnimatedSection, { AnimatedGrid } from '@/components/AnimatedSection';
import NewsletterSection from '@/components/NewsletterSection';
import WhoWeAreSection from '@/components/WhoWeAreSection';
import { usePageTitle } from '@/hooks/usePageTitle';
import { FALLBACK_PRODUCTS, FALLBACK_CATEGORIES } from '@/lib/products-data';

export default function Home() {
  usePageTitle('');
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Config State - Managed in Code
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const config: {
    hero: {
      headline: string;
      subheadline: string;
      primaryButtonText: string;
      primaryButtonLink: string;
      secondaryButtonText: string;
      secondaryButtonLink: string;
      backgroundImage?: string;
    };
    banners?: Array<{ text: string; active: boolean }>;
  } = {
    hero: {
      headline: 'Discover Your Natural Radiance with Our Luxury Skincare',
      subheadline: 'Premium skincare products formulated for a flawless, healthy appearance. Elevate your beauty routine with TOUCHEEGLOW Canada.',
      primaryButtonText: 'Shop Skincare',
      primaryButtonLink: '/shop',
      secondaryButtonText: 'Our Story',
      secondaryButtonLink: '/about',
      // backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop' // Optional override
    },
    banners: [
      { text: '🚚 Free delivery on orders over $150 CAD within Canada!', active: false },
      { text: '✨ New luxury skincare sets arriving this weekend - Pre-order now!', active: false },
      { text: '💳 Secure payments via all major credit cards', active: false }
    ]
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch featured products directly from Supabase
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, product_variants(*), product_images(*)')
          .eq('status', 'active')
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(8);

        if (productsError) throw productsError;
        setFeaturedProducts(productsData && productsData.length > 0 ? productsData : FALLBACK_PRODUCTS);

        // Fetch featured categories (featured is stored in metadata JSONB)
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, slug, image_url, metadata')
          .eq('status', 'active')
          .order('name');

        if (categoriesError) throw categoriesError;

        // Filter by metadata.featured = true on client side
        const featuredCategories = (categoriesData || []).filter(
          (cat: any) => cat.metadata?.featured === true
        );
        setCategories(featuredCategories.length > 0 ? featuredCategories : FALLBACK_CATEGORIES);
      } catch (error: unknown) {
        const err = error as { message?: string; code?: string };
        const msg = err?.message ?? (error instanceof Error ? error.message : String(error));
        const code = err?.code ?? '';
        if (code === 'PGRST205') {
          console.warn('Products/categories tables not found. Using fallback products dataset.');
        } else {
          console.error('Error fetching data:', msg, code ? `(${code})` : '');
        }
        setFeaturedProducts(FALLBACK_PRODUCTS);
        setCategories(FALLBACK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);


  const getHeroImage = () => {
    if (config.hero.backgroundImage) return config.hero.backgroundImage;
    return "/touchee-logo.png";
  };

  const renderBanners = () => {
    const activeBanners = config.banners?.filter(b => b.active) || [];
    if (activeBanners.length === 0) return null;

    return (
      <div className="bg-blue-900 text-white py-2 overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {activeBanners.concat(activeBanners).map((banner, index) => (
            <span key={index} className="mx-8 text-sm font-medium tracking-wide flex items-center">
              {banner.text}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="flex-col items-center justify-between min-h-screen">
      {renderBanners()}

      {/* Hero Section - God Level Design */}
      <section className="relative w-full h-[85vh] md:h-[95vh] overflow-hidden bg-black">

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-white/10">
          <div
            key={currentSlide}
            className="h-full bg-white/80 animate-progress origin-left"
            style={{ animationDuration: '3000ms' }}
          ></div>
        </div>

        {/* Background Slider + Per-Slide Content */}
        {[
          {
            image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=2070&auto=format&fit=crop',
            tag: 'TOUCHEEGLOW · PREMIUM QUALITY',
            heading: <>Premium Skincare & <br /><span className="italic font-light text-emerald-200">Hydration Essentials</span></>,
            subtext: 'Formulated to restore hydration, nourish deeply, and bring out your skin\'s natural glow.',
            cta: { text: 'Shop Now', href: '/shop' },
            cta2: { text: 'Our Story', href: '/about' },
            position: 'object-center'
          },
          {
            image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=2070&auto=format&fit=crop',
            tag: 'NATURAL FORMULA · CRUELTY FREE',
            heading: <>Luxury Whipped <br /><span className="italic font-light text-rose-200">Face & Body Creams</span></>,
            subtext: 'Indulge in ultra-rich, whipped hydration for 24-hour nourishment and silky-smooth skin.',
            cta: { text: 'Shop Creams', href: '/shop' },
            cta2: { text: 'View Catalog', href: '/shop' },
            position: 'object-center'
          },
          {
            image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=2070&auto=format&fit=crop',
            tag: 'ORGANIC INGREDIENTS · CANADA MADE',
            heading: <>Nourishing Face Oils & <br /><span className="italic font-light text-amber-200">Glow Serums</span></>,
            subtext: 'Revitalize your routine with botanically infused face oils and active vitamin glow serums.',
            cta: { text: 'Shop Serums', href: '/shop' },
            cta2: { text: 'Our Philosophy', href: '/about' },
            position: 'object-center'
          },
        ].map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {/* Background Image with Ken Burns Effect */}
            <div className={`absolute inset-0 ${index === currentSlide ? 'animate-ken-burns' : ''}`}>
              <Image
                src={slide.image}
                alt={`Hero Banner ${index + 1}`}
                fill
                className={`object-cover ${slide.position}`}
                priority={index === 0}
                quality={82}
                sizes="100vw"
              />
            </div>

            {/* Premium Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70"></div>

            {/* Slide Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 md:px-16 max-w-7xl mx-auto h-full mt-[-20px]">
              <div className="max-w-4xl flex flex-col items-center">
                <div
                  className={`overflow-hidden transition-all duration-700 delay-100 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                >
                  <span className="inline-block py-1.5 px-6 mb-6 text-white text-xs md:text-sm tracking-[0.25em] uppercase font-bold border border-white/30 rounded-full backdrop-blur-md bg-black/20">
                    {slide.tag}
                  </span>
                </div>

                <div className={`transition-all duration-700 delay-200 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-[1.15] drop-shadow-2xl font-sans tracking-tight">
                    {slide.heading}
                  </h1>
                </div>

                <div className={`transition-all duration-700 delay-300 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <p className="text-base md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 font-normal leading-relaxed drop-shadow-md">
                    {slide.subtext}
                  </p>
                </div>

                <div className={`flex flex-row items-center justify-center gap-4 transition-all duration-700 delay-400 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <Link
                    href={slide.cta.href}
                    className="group flex items-center gap-2 px-8 py-3.5 bg-[#0d8a5f] hover:bg-[#0b734f] text-white rounded-full font-semibold text-base transition-all hover:scale-105 shadow-lg shadow-[#0d8a5f]/20 whitespace-nowrap"
                  >
                    <span>{slide.cta.text}</span>
                    <i className="ri-arrow-right-up-line transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-lg"></i>
                  </Link>
                  <Link
                    href={slide.cta2.href}
                    className="group px-8 py-3.5 bg-transparent border border-white/50 text-white rounded-full font-semibold text-base backdrop-blur-sm hover:bg-white/10 hover:border-white/80 transition-all hover:scale-105 whitespace-nowrap"
                  >
                    {slide.cta2.text}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-4">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1 transition-all duration-300 ${currentSlide === i ? 'w-12 bg-white' : 'w-6 bg-white/40 hover:bg-white/60'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Decoration */}
        <div className="absolute bottom-10 right-6 md:right-16 z-20 hidden md:block">
          <div className="text-white/40 text-sm font-light tracking-widest vertical-text transform rotate-180" style={{ writingMode: 'vertical-rl' }}>
            EST. 2026 — COLLECTION
          </div>
        </div>

      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4">Shop by Category</h2>
              <p className="text-gray-600 text-lg max-w-md">From serums to moisturizers, explore our skincare collection</p>
            </div>
            <Link href="/categories" className="hidden md:flex items-center text-blue-800 font-medium hover:text-blue-900 transition-colors">
              View All <i className="ri-arrow-right-line ml-2"></i>
            </Link>
          </AnimatedSection>

          <AnimatedGrid className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link href={`/shop?category=${category.slug}`} key={category.id} className="group cursor-pointer block relative">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden relative shadow-md group-hover:shadow-xl transition-all duration-300">
                  <Image
                    src={category.image || category.image_url || '/skincare-aesthetic.jpg'}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    quality={75}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end h-full">
                    <h3 className="font-serif font-bold text-white text-xl md:text-2xl mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{category.name}</h3>
                    <div className="flex items-center text-white/90 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 delay-75">
                      <span className="uppercase tracking-wider text-xs">Shop Now</span>
                      <i className="ri-arrow-right-line ml-2 transition-transform group-hover:translate-x-1"></i>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </AnimatedGrid>

          <div className="mt-8 text-center md:hidden">
            <Link href="/categories" className="inline-flex items-center text-blue-800 font-medium hover:text-blue-900 transition-colors">
              View All <i className="ri-arrow-right-line ml-2"></i>
            </Link>
          </div>
        </div>
      </section>


      {/* Who We Are */}
      <WhoWeAreSection />

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Top picks from our latest arrivals</p>
          </AnimatedSection>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-8">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <AnimatedGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {featuredProducts.map((product) => {
                const variants = product.product_variants || [];
                const hasVariants = variants.length > 0;
                const minVariantPrice = hasVariants ? Math.min(...variants.map((v: any) => v.price || product.price)) : undefined;
                const totalVariantStock = hasVariants ? variants.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) : 0;
                const effectiveStock = hasVariants ? totalVariantStock : product.quantity;

                // Extract unique colors from option2
                const colorVariants: ColorVariant[] = [];
                const seenColors = new Set<string>();
                for (const v of variants) {
                  const colorName = (v as any).option2;
                  if (colorName && !seenColors.has(colorName.toLowerCase().trim())) {
                    const hex = getColorHex(colorName);
                    if (hex) {
                      seenColors.add(colorName.toLowerCase().trim());
                      colorVariants.push({ name: colorName.trim(), hex });
                    }
                  }
                }

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.compare_at_price}
                    image={product.product_images?.[0]?.url || '/body-butter.jpg'}
                    rating={product.rating_avg || 5}
                    reviewCount={product.review_count || 0}
                    badge={product.featured ? 'Featured' : undefined}
                    inStock={effectiveStock > 0}
                    maxStock={effectiveStock || 50}
                    moq={product.moq || 1}
                    hasVariants={hasVariants}
                    minVariantPrice={minVariantPrice}
                    colorVariants={colorVariants}
                  />
                );
              })}
            </AnimatedGrid>
          )}

          <div className="text-center mt-16">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-full font-medium hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 btn-animate"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter - Homepage Only */}
      <NewsletterSection />

    </main>
  );
}
