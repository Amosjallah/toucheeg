import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function getStripe() {
    return new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
        apiVersion: '2026-06-24.dahlia',
    });
}

export async function POST(req: Request) {
    try {
        const stripe = getStripe();
        // Rate limiting (reuse payment rate limit)
        const clientId = getClientIdentifier(req);
        const rateLimitResult = checkRateLimit(`payment:${clientId}`, RATE_LIMITS.payment);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { success: false, message: 'Too many requests. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': rateLimitResult.resetIn.toString()
                    }
                }
            );
        }

        // Validate env
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('[Stripe] Missing STRIPE_SECRET_KEY');
            return NextResponse.json(
                { success: false, message: 'Payment gateway configuration error' },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { orderId } = body;

        if (!orderId || typeof orderId !== 'string') {
            return NextResponse.json(
                { success: false, message: 'Missing or invalid orderId' },
                { status: 400 }
            );
        }

        // SECURITY: Always fetch the order total from the DB — never trust client amount
        // Try by order_number first (most common), fallback to UUID id
        let order: any = null;
        let orderError: any = null;

        const byNumber = await supabaseAdmin
            .from('orders')
            .select('id, order_number, total, email, payment_status, currency')
            .eq('order_number', orderId)
            .maybeSingle();

        if (byNumber.data) {
            order = byNumber.data;
        } else {
            // Try by UUID id as fallback
            const byId = await supabaseAdmin
                .from('orders')
                .select('id, order_number, total, email, payment_status, currency')
                .eq('id', orderId)
                .maybeSingle();
            order = byId.data;
            orderError = byId.error;
        }

        if (orderError || !order) {
            console.error('[Stripe] Order not found. Searched for:', orderId, '| DB error:', orderError?.message || 'none');
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        // Prevent duplicate payment for already-paid orders
        if (order.payment_status === 'paid') {
            return NextResponse.json(
                { success: false, message: 'Order is already paid' },
                { status: 400 }
            );
        }

        const amount = Number(order.total);
        if (!amount || amount <= 0) {
            return NextResponse.json(
                { success: false, message: 'Invalid order amount' },
                { status: 400 }
            );
        }

        const orderRef = order.order_number || orderId;
        const requestUrl = new URL(req.url);
        const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin).replace(/\/+$/, '');

        // Convert to cents (Stripe uses smallest currency unit)
        const amountInCents = Math.round(amount * 100);

        console.log('[Stripe] Creating session for order:', orderRef, '| Amount (cents):', amountInCents);

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: order.email,
            line_items: [
                {
                    price_data: {
                        currency: (order.currency || 'cad').toLowerCase(),
                        product_data: {
                            name: `TOUCHEEGLOW Order #${orderRef}`,
                            description: 'Luxury Skincare Products',
                        },
                        unit_amount: amountInCents,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                order_id: order.id,
                order_number: orderRef,
            },
            success_url: `${baseUrl}/order-success?order=${orderRef}&payment_success=true`,
            cancel_url: `${baseUrl}/pay/${order.id}`,
        });

        console.log('[Stripe] Session created:', session.id, '| URL ready:', !!session.url);

        return NextResponse.json({
            success: true,
            url: session.url,
            sessionId: session.id,
        });

    } catch (error: any) {
        console.error('[Stripe] API Error:', error.message);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
