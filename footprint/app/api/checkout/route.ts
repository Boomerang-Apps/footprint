/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout session for payment.
 * Requires authentication.
 *
 * Request body:
 * {
 *   "orderId": "order_123",
 *   "amount": 15800  // in agorot (158.00 ILS)
 * }
 *
 * Response:
 * {
 *   "sessionId": "cs_test_...",
 *   "url": "https://checkout.stripe.com/..."
 * }
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/payments/stripe';

interface CheckoutRequest {
  orderId: string;
  amount: number;
}

interface CheckoutResponse {
  sessionId: string;
  url: string;
}

interface ErrorResponse {
  error: string;
}

export async function POST(
  request: Request
): Promise<NextResponse<CheckoutResponse | ErrorResponse>> {
  try {
    // 1. Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to checkout' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    let body: CheckoutRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { orderId, amount } = body;

    // 3. Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing required field: orderId' },
        { status: 400 }
      );
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'Missing required field: amount' },
        { status: 400 }
      );
    }

    // 4. Validate amount (must be positive integer in agorot)
    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount - must be a positive integer in agorot' },
        { status: 400 }
      );
    }

    // 5. Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const checkoutSession = await createCheckoutSession({
      orderId,
      amount,
      customerEmail: user.email || undefined,
      successUrl: `${baseUrl}/create/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/create/checkout`,
    });

    // 6. Return session URL
    return NextResponse.json({
      sessionId: checkoutSession.sessionId,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
