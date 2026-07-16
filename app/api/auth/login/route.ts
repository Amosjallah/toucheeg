import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * POST /api/auth/login
 * Proxies admin login through the server to avoid CORS issues.
 * The browser calls this local endpoint; this calls Supabase server-side.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Use admin client to sign in (server-side, no CORS issues)
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    if (!data.session) {
      return NextResponse.json(
        { error: 'No session returned' },
        { status: 401 }
      );
    }

    // Check the user has admin or staff role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Could not verify user role' },
        { status: 403 }
      );
    }

    if (profile.role !== 'admin' && profile.role !== 'staff') {
      return NextResponse.json(
        { error: 'Admin or staff access required' },
        { status: 403 }
      );
    }

    // Return session tokens — client will store in cookies
    return NextResponse.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile.role,
      },
    });
  } catch (err: any) {
    console.error('[Auth/Login] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
