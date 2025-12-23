/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events for payment processing.
 * Verifies webhook signature and processes payment events.
 *
 * Events handled:
 * - checkout.session.completed: Payment successful, update order status
 * - payment_intent.payment_failed: Payment failed, log error
 */

import { NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/payments/stripe';
import type Stripe from 'stripe';

interface WebhookResponse {
  received: boolean;
}

interface ErrorResponse {
  error: string;
}

/**
 * Updates order status in the database
 * TODO: Implement with actual Supabase client
 */
async function updateOrderStatus(
  orderId: string,
  status: 'paid' | 'failed',
  paymentDetails: {
    stripeSessionId: string;
    stripePaymentIntentId?: string;
    paidAt?: Date;
    failureReason?: string;
  }
): Promise<void> {
  // TODO: Update order in Supabase
  // This will be implemented when integrating with the orders table
  console.log(`Updating order ${orderId} to status: ${status}`, paymentDetails);
}

export async function POST(
  request: Request
): Promise<NextResponse<WebhookResponse | ErrorResponse>> {
  try {
    // 1. Get webhook secret
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // 2. Get raw body and signature
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // 3. Verify webhook signature
    let event: Stripe.Event;
    try {
      event = constructWebhookEvent(payload, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Webhook signature verification failed:', message);
      return NextResponse.json(
        { error: `Invalid signature: ${message}` },
        { status: 400 }
      );
    }

    // 4. Handle event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await updateOrderStatus(orderId, 'paid', {
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string | undefined,
            paidAt: new Date(),
          });
          console.log(`Order ${orderId} marked as paid`);
        } else {
          console.warn('Checkout session completed but no orderId in metadata');
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const errorMessage =
          paymentIntent.last_payment_error?.message || 'Unknown error';
        console.error(`Payment failed for intent ${paymentIntent.id}: ${errorMessage}`);

        // Optionally update order status to failed
        // Note: We'd need the orderId from the session, which may require
        // looking up the session from the payment intent
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
