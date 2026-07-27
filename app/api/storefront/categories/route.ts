import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { FALLBACK_CATEGORIES } from '@/lib/products-data';

// Simple in-memory cache
let cache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes — categories rarely change

export async function GET() {
    // Check cache
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
        return NextResponse.json(cache.data, {
            headers: {
                'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
                'X-Cache': 'HIT'
            }
        });
    }

    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name, slug, image_url, parent_id, metadata')
            .eq('status', 'active')
            .order('name');

        let responseData: any[] = data || [];
        if (error || !data || data.length === 0) {
            console.warn('[Storefront API] Using fallback categories due to Supabase error or empty result');
            responseData = FALLBACK_CATEGORIES as any[];
        }

        // Cache
        cache = { data: responseData, timestamp: Date.now() };

        return NextResponse.json(responseData, {
            headers: {
                'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
                'X-Cache': 'MISS'
            }
        });
    } catch (err: any) {
        console.error('[Storefront API] Error:', err);
        return NextResponse.json(FALLBACK_CATEGORIES as any[], { status: 200 });
    }
}
