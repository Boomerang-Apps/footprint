/**
 * Stripe Webhook Handler
 *
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events for wallet payments.
 * Verifies webhook signatures and processes payment events.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateStripeWebhook } from '@/lib/payments/stripe';
import type Stripe from 'stripe';

// Define the structure of a PaymentIntent with metadata
interface PaymentIntentWithMetadata {
  id: string;
  metadata: {
    orderId?: string;
  };
  last_payment_error?: {
    message?: string;
  };
}

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events.
 *
 * Headers:
 * - stripe-signature: string (required) - Stripe signature for verification
 *
 * Body:
 * - Raw Stripe event payload
 *
 * Response:
 * - 200: { received: true, ... } - Event acknowledged
 * - 400: { error: string } - Invalid signature or payload
 * - 500: { error: string } - Server error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Get signature header
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  // Get raw body
  const body = await request.text();

  // Validate webhook signature
  let event: Stripe.Event;
  try {
    event = await validateStripeWebhook(body, signature);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook validation failed:', message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // Handle specific event types
  const paymentIntent = event.data.object as PaymentIntentWithMetadata;
  const orderId = paymentIntent.metadata?.orderId;

  switch (event.type) {
    case 'payment_intent.succeeded':
      // Payment successful - update order status
      console.log(`Payment succeeded for order ${orderId}`);
      // TODO: Update order status in database
      // TODO: Send confirmation email
      return NextResponse.json({
        received: true,
        orderId,
        status: 'succeeded',
        paymentIntentId: paymentIntent.id,
      });

    case 'payment_intent.payment_failed':
      // Payment failed - handle failure
      console.log(
        `Payment failed for order ${orderId}:`,
        paymentIntent.last_payment_error?.message
      );
      // TODO: Update order status in database
      // TODO: Optionally notify customer
      return NextResponse.json({
        received: true,
        orderId,
        status: 'failed',
        paymentIntentId: paymentIntent.id,
      });

    case 'payment_intent.canceled':
      // Payment canceled
      console.log(`Payment canceled for order ${orderId}`);
      // TODO: Update order status in database
      return NextResponse.json({
        received: true,
        orderId,
        status: 'canceled',
        paymentIntentId: paymentIntent.id,
      });

    default:
      // Acknowledge unhandled event types
      console.log(`Unhandled event type: ${event.type}`);
      return NextResponse.json({
        received: true,
        handled: false,
        eventType: event.type,
      });
  }
}
