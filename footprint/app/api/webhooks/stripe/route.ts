/**
 * Stripe Webhook Handler
 *
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events for wallet payments.
 * Verifies webhook signatures and processes payment events.
 * Creates orders in the database on successful payments.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateStripeWebhook } from '@/lib/payments/stripe';
import {
  createOrder,
  triggerConfirmationEmail,
  type CreateOrderParams,
} from '@/lib/orders/create';
import type Stripe from 'stripe';

// Define the structure of a PaymentIntent with order metadata
interface PaymentIntentWithMetadata {
  id: string;
  receipt_email?: string;
  metadata: {
    // Order creation metadata
    userId?: string;
    customerName?: string;
    customerEmail?: string;
    items?: string; // JSON stringified OrderItem[]
    subtotal?: string;
    shipping?: string;
    total?: string;
    shippingAddress?: string; // JSON stringified ShippingAddress
    isGift?: string;
    giftMessage?: string;
  };
  last_payment_error?: {
    message?: string;
  };
}

/**
 * Parses order metadata from PaymentIntent
 */
function parseOrderMetadata(
  paymentIntent: PaymentIntentWithMetadata
): CreateOrderParams | null {
  const { metadata, receipt_email } = paymentIntent;

  // Validate required fields
  if (!metadata.customerName || !metadata.items || !metadata.total) {
    return null;
  }

  try {
    return {
      userId: metadata.userId,
      customerName: metadata.customerName,
      customerEmail: metadata.customerEmail || receipt_email || '',
      items: JSON.parse(metadata.items),
      subtotal: parseFloat(metadata.subtotal || '0'),
      shipping: parseFloat(metadata.shipping || '0'),
      total: parseFloat(metadata.total),
      shippingAddress: metadata.shippingAddress
        ? JSON.parse(metadata.shippingAddress)
        : { street: '', city: '', postalCode: '', country: '' },
      paymentProvider: 'stripe' as const,
      paymentTransactionId: paymentIntent.id,
      isGift: metadata.isGift === 'true',
      giftMessage: metadata.giftMessage,
    };
  } catch (error) {
    console.error('Failed to parse order metadata:', error);
    return null;
  }
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

  switch (event.type) {
    case 'payment_intent.succeeded': {
      // Payment successful - create order in database
      console.log(`Payment succeeded: ${paymentIntent.id}`);

      const orderParams = parseOrderMetadata(paymentIntent);

      if (!orderParams) {
        console.warn(
          'Payment succeeded but missing order metadata:',
          paymentIntent.id
        );
        return NextResponse.json({
          received: true,
          status: 'succeeded',
          orderCreated: false,
          reason: 'Missing order metadata',
          paymentIntentId: paymentIntent.id,
        });
      }

      try {
        // Create order in database
        const orderResult = await createOrder(orderParams);

        console.log(
          `Order created: ${orderResult.orderNumber} (${orderResult.orderId})`
        );

        // Trigger confirmation email (fire and forget)
        triggerConfirmationEmail(orderResult.orderId);

        return NextResponse.json({
          received: true,
          status: 'succeeded',
          orderCreated: true,
          orderId: orderResult.orderId,
          orderNumber: orderResult.orderNumber,
          paymentIntentId: paymentIntent.id,
        });
      } catch (error) {
        // Log error but still return 200 to acknowledge webhook
        console.error('Failed to create order:', error);
        return NextResponse.json({
          received: true,
          status: 'succeeded',
          orderCreated: false,
          reason: error instanceof Error ? error.message : 'Unknown error',
          paymentIntentId: paymentIntent.id,
        });
      }
    }

    case 'payment_intent.payment_failed': {
      // Payment failed - log for debugging
      console.log(
        `Payment failed: ${paymentIntent.id}`,
        paymentIntent.last_payment_error?.message
      );
      return NextResponse.json({
        received: true,
        status: 'failed',
        paymentIntentId: paymentIntent.id,
      });
    }

    case 'payment_intent.canceled': {
      // Payment canceled - log for debugging
      console.log(`Payment canceled: ${paymentIntent.id}`);
      return NextResponse.json({
        received: true,
        status: 'canceled',
        paymentIntentId: paymentIntent.id,
      });
    }

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
