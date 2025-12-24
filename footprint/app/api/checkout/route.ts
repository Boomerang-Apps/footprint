/**
 * POST /api/checkout
 *
 * Creates a PayPlus payment link for checkout.
 * Requires authentication.
 *
 * Request body:
 * {
 *   "orderId": "order_123",
 *   "amount": 15800,  // in agorot (158.00 ILS)
 *   "customerName": "John Doe",
 *   "customerEmail": "john@example.com",  // optional, uses auth user email if not provided
 *   "customerPhone": "0501234567"  // optional
 * }
 *
 * Response:
 * {
 *   "pageRequestUid": "xxx-xxx-xxx",
 *   "paymentUrl": "https://payments.payplus.co.il/..."
 * }
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPaymentLink } from '@/lib/payments/payplus';

interface CheckoutRequest {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
}

interface CheckoutResponse {
  pageRequestUid: string;
  paymentUrl: string;
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

    const { orderId, amount, customerName, customerEmail, customerPhone } = body;

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

    if (!customerName) {
      return NextResponse.json(
        { error: 'Missing required field: customerName' },
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

    // 5. Create payment link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const paymentLink = await createPaymentLink({
      orderId,
      amount,
      customerName,
      customerEmail: customerEmail || user.email || '',
      customerPhone,
      successUrl: `${baseUrl}/create/complete?page_request_uid={page_request_uid}`,
      failureUrl: `${baseUrl}/create/checkout?error=payment_failed`,
      callbackUrl: `${baseUrl}/api/webhooks/payplus`,
    });

    // 6. Return payment URL
    return NextResponse.json({
      pageRequestUid: paymentLink.pageRequestUid,
      paymentUrl: paymentLink.paymentUrl,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    );
  }
}
