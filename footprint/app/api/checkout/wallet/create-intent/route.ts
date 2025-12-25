/**
 * Wallet Payment Intent API Route
 *
 * POST /api/checkout/wallet/create-intent
 *
 * Creates a Stripe PaymentIntent for wallet payments (Apple Pay, Google Pay).
 * Returns a client_secret that the frontend uses with the Express Checkout Element.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createWalletPaymentIntent } from '@/lib/payments/stripe';

// Valid currency codes
const VALID_CURRENCIES = ['ils', 'usd', 'eur'] as const;
type ValidCurrency = (typeof VALID_CURRENCIES)[number];

interface CreateIntentRequest {
  orderId: string;
  amount: number;
  currency?: ValidCurrency;
  customerEmail: string;
  description?: string;
}

/**
 * POST /api/checkout/wallet/create-intent
 *
 * Creates a PaymentIntent for wallet payments.
 *
 * Request body:
 * - orderId: string (required) - The order ID from your system
 * - amount: number (required) - Amount in smallest currency unit (agorot/cents)
 * - currency: string (optional) - Currency code (default: 'ils')
 * - customerEmail: string (required) - Customer email for receipt
 * - description: string (optional) - Payment description
 *
 * Response:
 * - 200: { paymentIntentId, clientSecret }
 * - 400: { error: string } - Validation error
 * - 500: { error: string } - Server error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    let body: CreateIntentRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.orderId || typeof body.orderId !== 'string') {
      return NextResponse.json(
        { error: 'orderId is required and must be a string' },
        { status: 400 }
      );
    }

    if (typeof body.amount !== 'number' || body.amount <= 0) {
      return NextResponse.json(
        { error: 'amount is required and must be a positive number' },
        { status: 400 }
      );
    }

    if (!body.customerEmail || typeof body.customerEmail !== 'string') {
      return NextResponse.json(
        { error: 'customerEmail is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate and default currency
    const currency = body.currency || 'ils';
    if (!VALID_CURRENCIES.includes(currency as ValidCurrency)) {
      return NextResponse.json(
        { error: `currency must be one of: ${VALID_CURRENCIES.join(', ')}` },
        { status: 400 }
      );
    }

    // Create payment intent
    const result = await createWalletPaymentIntent({
      orderId: body.orderId,
      amount: body.amount,
      currency: currency as ValidCurrency,
      customerEmail: body.customerEmail,
      description: body.description,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to create wallet payment intent:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create payment intent: ${message}` },
      { status: 500 }
    );
  }
}
