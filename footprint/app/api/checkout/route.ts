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
import { isValidGuestEmail } from '@/lib/auth/guest';

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
    // 1. Parse request body (before auth check so guest email is available)
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

    // 2. Check authentication (allow guest with valid email)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payPlusConfigured = !!process.env.PAYPLUS_PAYMENT_PAGE_UID;
    if (payPlusConfigured && !user) {
      // Allow guest checkout if a valid email is provided
      if (!customerEmail || !isValidGuestEmail(customerEmail)) {
        return NextResponse.json(
          { error: 'Unauthorized - Please sign in or provide a valid email to checkout' },
          { status: 401 }
        );
      }
    }

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

    // Production: pre-create order with pending_payment status, then create PayPlus link
    const email = customerEmail || user?.email || '';

    const orderResult = await createOrder({
      userId: user?.id,
      customerName,
      customerEmail: email,
      customerPhone,
      items: body.items || [{ name: 'Item', quantity: 1, price: amount / 100 }],
      subtotal: body.subtotal || amount / 100,
      shipping: body.shipping || 0,
      total: body.total || amount / 100,
      shippingAddress: body.shippingAddress || { street: '', city: '', postalCode: '', country: 'Israel' },
      paymentProvider: 'payplus',
      paymentTransactionId: `pending-${Date.now()}`,
      isGift: body.isGift || false,
      giftMessage: body.giftMessage,
      hasPassepartout: body.hasPassepartout || false,
      status: 'pending',
    });

    const moreInfo = JSON.stringify({
      userId: user?.id,
      orderId: orderResult.orderId,
      orderNumber: orderResult.orderNumber,
      items: body.items || [],
      subtotal: body.subtotal || 0,
      shipping: body.shipping || 0,
      total: body.total || amount / 100,
      shippingAddress: body.shippingAddress || { street: '', city: '', postalCode: '', country: 'Israel' },
      isGift: body.isGift || false,
      giftMessage: body.giftMessage,
      hasPassepartout: body.hasPassepartout || false,
    });

    const successUrlParams = new URLSearchParams({
      status: 'success',
      page_request_uid: '{page_request_uid}',
      orderId: orderResult.orderId,
      orderNumber: orderResult.orderNumber,
    });

    const paymentLink = await createPaymentLink({
      orderId,
      amount,
      customerName,
      customerEmail: email,
      customerPhone,
      successUrl: `${baseUrl}/payment/iframe-callback?${successUrlParams.toString()}`,
      failureUrl: `${baseUrl}/payment/iframe-callback?status=failure`,
      callbackUrl: `${baseUrl}/api/webhooks/payplus`,
      moreInfo,
    });

    // 6. Return payment URL with order IDs
    return NextResponse.json({
      pageRequestUid: paymentLink.pageRequestUid,
      paymentUrl: paymentLink.paymentUrl,
      orderId: orderResult.orderId,
      orderNumber: orderResult.orderNumber,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Checkout error', { message, stack: error instanceof Error ? error.stack : undefined });
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    );
  }
}
