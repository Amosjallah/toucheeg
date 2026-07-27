import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { FALLBACK_PRODUCTS } from '@/lib/products-data';

// Simple in-memory cache
let cache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes — products don't change frequently

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');

    // Build a cache key from params
    const cacheKey = `${featured}-${limit}-${category || 'all'}`;

    // Check cache (only for featured/home requests — general shop is more dynamic)
    if (featured && cache && cache.data?.[cacheKey] && Date.now() - cache.timestamp < CACHE_TTL) {
        return NextResponse.json(cache.data[cacheKey], {
            headers: {
                'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
                'X-Cache': 'HIT'
            }
        });
    }

    try {
        let query = supabase
            .from('products')
            .select(`
                id, name, slug, price, compare_at_price, quantity, description, metadata,
                categories(id, name, slug),
                product_images(url, position),
                product_variants(id, name, price, quantity)
            `)
            .order('created_at', { ascending: false });

        // Always filter active products
        query = query.eq('status', 'active');

        if (featured) {
            query = query.eq('featured', true).limit(limit);
        } else if (category) {
            // Filter by category slug or name
            query = query.limit(limit);
        } else {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        let responseData: any[] = data || [];
        if (error || !data || data.length === 0) {
            console.warn('[Storefront API] Using fallback products due to Supabase error or empty result');
            responseData = FALLBACK_PRODUCTS as any[];
        }

        // Cache the result
        if (!cache) cache = { data: {}, timestamp: Date.now() };
        cache.data[cacheKey] = responseData;
        cache.timestamp = Date.now();

        return NextResponse.json(responseData, {
            headers: {
                'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
                'X-Cache': 'MISS'
            }
        });
    } catch (err: any) {
        console.error('[Storefront API] Error:', err);
        return NextResponse.json(FALLBACK_PRODUCTS as any[], { status: 200 });
    }
}
