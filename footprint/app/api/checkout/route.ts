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
import { checkRateLimit } from '@/lib/rate-limit';
import {
  createOrder,
  triggerConfirmationEmail,
  triggerNewOrderNotification,
} from '@/lib/orders/create';
import { logger } from '@/lib/logger';

interface CheckoutOrderItem {
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  style?: string;
  size?: string;
  paper?: string;
  frame?: string;
}

interface CheckoutShippingAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface CheckoutRequest {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items?: CheckoutOrderItem[];
  subtotal?: number;
  shipping?: number;
  total?: number;
  shippingAddress?: CheckoutShippingAddress;
  isGift?: boolean;
  giftMessage?: string;
  hasPassepartout?: boolean;
}

interface CheckoutResponse {
  pageRequestUid: string;
  paymentUrl: string;
  orderId?: string;
  orderNumber?: string;
}

interface ErrorResponse {
  error: string;
}

export async function POST(
  request: Request
): Promise<NextResponse<CheckoutResponse | ErrorResponse>> {
  // Rate limiting: 5 checkouts per minute
  const rateLimited = await checkRateLimit('checkout', request);
  if (rateLimited) return rateLimited as NextResponse<ErrorResponse>;

  try {
    // 1. Check authentication (optional for test mode)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Require auth only in production (when PayPlus is configured)
    const payPlusConfigured = !!process.env.PAYPLUS_PAYMENT_PAGE_UID;
    if (payPlusConfigured && !user) {
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

    // 5. Check if PayPlus is fully configured
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!payPlusConfigured) {
      // Test mode: create order directly without payment gateway
      logger.debug('[checkout] PayPlus not configured — using test mode');

      const email = customerEmail || user?.email || '';
      const orderResult = await createOrder({
        userId: user?.id,
        customerName,
        customerEmail: email,
        customerPhone,
        items: body.items || [{ name: 'Test Item', quantity: 1, price: amount / 100 }],
        subtotal: body.subtotal || amount / 100,
        shipping: body.shipping || 0,
        total: body.total || amount / 100,
        shippingAddress: body.shippingAddress || { street: '', city: '', postalCode: '', country: 'Israel' },
        paymentProvider: 'payplus',
        paymentTransactionId: `test-${Date.now()}`,
        isGift: body.isGift || false,
        giftMessage: body.giftMessage,
        hasPassepartout: body.hasPassepartout || false,
      });

      // Fire-and-forget email triggers
      triggerConfirmationEmail(orderResult.orderId);
      triggerNewOrderNotification(orderResult.orderId);

      // Return order details directly (no payment gateway needed)
      return NextResponse.json({
        pageRequestUid: `test-${orderResult.orderId}`,
        paymentUrl: `${baseUrl}/payment/iframe-callback?status=success&page_request_uid=test-${orderResult.orderId}&orderId=${orderResult.orderId}&orderNumber=${orderResult.orderNumber}`,
        orderId: orderResult.orderId,
        orderNumber: orderResult.orderNumber,
      });
    }

    // Production: create PayPlus payment link (user guaranteed non-null — auth required above)
    const moreInfo = JSON.stringify({
      userId: user!.id,
      items: body.items || [],
      subtotal: body.subtotal || 0,
      shipping: body.shipping || 0,
      total: body.total || amount / 100,
      shippingAddress: body.shippingAddress || { street: '', city: '', postalCode: '', country: 'Israel' },
      isGift: body.isGift || false,
      giftMessage: body.giftMessage,
      hasPassepartout: body.hasPassepartout || false,
    });

    const paymentLink = await createPaymentLink({
      orderId,
      amount,
      customerName,
      customerEmail: customerEmail || user!.email || '',
      customerPhone,
      successUrl: `${baseUrl}/payment/iframe-callback?status=success&page_request_uid={page_request_uid}`,
      failureUrl: `${baseUrl}/payment/iframe-callback?status=failure`,
      callbackUrl: `${baseUrl}/api/webhooks/payplus`,
      moreInfo,
    });

    // 6. Return payment URL
    return NextResponse.json({
      pageRequestUid: paymentLink.pageRequestUid,
      paymentUrl: paymentLink.paymentUrl,
    });
  } catch (error) {
    logger.error('Checkout error', error);
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    );
  }
}
