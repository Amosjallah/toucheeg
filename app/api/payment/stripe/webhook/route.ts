import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendOrderConfirmation } from '@/lib/notifications';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-06-24.dahlia',
});

/**
 * Stripe Webhook Handler
 *
 * Handles the following events:
 *  - checkout.session.completed  → Payment succeeded, mark order as paid
 *  - checkout.session.expired    → Session expired without payment, mark as failed
 *
 * Webhook signature is verified using STRIPE_WEBHOOK_SECRET for security.
 *
 * To set up:
 *  1. Go to https://dashboard.stripe.com/test/webhooks
 *  2. Add endpoint: https://yourdomain.com/api/payment/stripe/webhook
 *  3. Select events: checkout.session.completed, checkout.session.expired
 *  4. Copy the "Signing secret" and set it as STRIPE_WEBHOOK_SECRET in .env
 *
 * For local testing:
 *  stripe listen --forward-to localhost:3002/api/payment/stripe/webhook
 */
export async function POST(req: Request) {
    console.log('[Stripe Webhook] Received at', new Date().toISOString());

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Read raw body for signature verification
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event: Stripe.Event;

    // Verify webhook signature (mandatory security check)
    if (webhookSecret && sig) {
        try {
            event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
            console.log('[Stripe Webhook] Signature verified ✓ | Event:', event.type);
        } catch (err: any) {
            console.error('[Stripe Webhook] Signature verification FAILED:', err.message);
            return NextResponse.json(
                { success: false, message: 'Invalid webhook signature' },
                { status: 400 }
            );
        }
    } else {
        // No webhook secret configured — parse without verification (dev mode warning)
        console.warn('[Stripe Webhook] WARNING: STRIPE_WEBHOOK_SECRET not set. Skipping signature check.');
        try {
            event = JSON.parse(body) as Stripe.Event;
        } catch {
            return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
        }
    }

    // ============================================================
    // Handle checkout.session.completed — Payment Succeeded
    // ============================================================
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const orderNumber = session.metadata?.order_number;
        const orderId = session.metadata?.order_id;
        const stripeRef = session.payment_intent as string || session.id;

        console.log('[Stripe Webhook] Payment SUCCESS | Order:', orderNumber, '| Session:', session.id);

        if (!orderNumber) {
            console.error('[Stripe Webhook] Missing order_number in session metadata');
            return NextResponse.json({ success: false, message: 'Missing order reference' }, { status: 400 });
        }

        // Fetch order
        const { data: existingOrder, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('id, order_number, payment_status, total, email')
            .eq('order_number', orderNumber)
            .single();

        if (fetchError || !existingOrder) {
            console.error('[Stripe Webhook] Order not found:', orderNumber);
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }

        // Idempotency: skip already-paid orders
        if (existingOrder.payment_status === 'paid') {
            console.log('[Stripe Webhook] Order already paid, skipping:', orderNumber);
            return NextResponse.json({ success: true, message: 'Already processed' });
        }

        // SECURITY: Verify amount matches (Stripe amount_total is in cents)
        if (session.amount_total !== null) {
            const stripeAmountCAD = session.amount_total / 100;
            const dbAmount = Number(existingOrder.total);
            if (Math.abs(stripeAmountCAD - dbAmount) > 0.01) {
                console.error('[Stripe Webhook] AMOUNT MISMATCH — Stripe:', stripeAmountCAD, '| DB:', dbAmount);
                return NextResponse.json(
                    { success: false, message: 'Amount mismatch' },
                    { status: 400 }
                );
            }
        }

        // Mark order as paid via existing RPC (reuses same function as Moolre)
        const { data: orderJson, error: updateError } = await supabaseAdmin
            .rpc('mark_order_paid', {
                order_ref: orderNumber,
                moolre_ref: stripeRef  // passing Stripe payment intent as the payment reference
            });

        if (updateError) {
            console.error('[Stripe Webhook] RPC Error:', updateError.message);
            return NextResponse.json({ success: false, message: 'Database update failed' }, { status: 500 });
        }

        if (!orderJson) {
            console.error('[Stripe Webhook] RPC returned null for:', orderNumber);
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }

        console.log('[Stripe Webhook] Order marked paid:', orderJson.id, '| Status:', orderJson.status);

        // Update customer stats
        try {
            if (orderJson.email) {
                await supabaseAdmin.rpc('update_customer_stats', {
                    p_customer_email: orderJson.email,
                    p_order_total: orderJson.total
                });
            }
        } catch (statsError: any) {
            console.error('[Stripe Webhook] Customer stats error:', statsError.message);
        }

        // Send Email + SMS notifications
        try {
            console.log('[Stripe Webhook] Sending notifications for:', orderJson.order_number);
            await sendOrderConfirmation(orderJson);
            console.log('[Stripe Webhook] Notifications sent ✓');
        } catch (notifyError: any) {
            console.error('[Stripe Webhook] Notification error:', notifyError.message);
        }

        return NextResponse.json({ success: true, message: 'Payment verified and order updated' });
    }

    // ============================================================
    // Handle checkout.session.expired — Payment Failed/Abandoned
    // ============================================================
    if (event.type === 'checkout.session.expired') {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderNumber = session.metadata?.order_number;

        console.log('[Stripe Webhook] Session EXPIRED | Order:', orderNumber);

        if (orderNumber) {
            await supabaseAdmin
                .from('orders')
                .update({
                    payment_status: 'failed',
                })
                .eq('order_number', orderNumber)
                .eq('payment_status', 'pending'); // Only update if still pending

            console.log('[Stripe Webhook] Marked order as failed:', orderNumber);
        }

        return NextResponse.json({ received: true });
    }

    // Acknowledge other events without processing
    console.log('[Stripe Webhook] Unhandled event type:', event.type);
    return NextResponse.json({ received: true });
}

export async function GET() {
    return NextResponse.json({
        message: 'Stripe webhook endpoint ready',
        timestamp: new Date().toISOString()
    });
}
