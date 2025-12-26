/**
 * POST /api/webhooks/payplus
 *
 * Handles PayPlus webhook callbacks for payment processing.
 * Verifies webhook signature (HMAC-SHA256) and user-agent header.
 * Creates orders in the database on successful payments.
 *
 * Headers required:
 * - hash: HMAC-SHA256 signature (base64)
 * - user-agent: Must be "PayPlus"
 *
 * Events handled:
 * - status_code "000": Payment successful, create order
 * - Other status codes: Payment failed, log error
 */

import { NextResponse } from 'next/server';
import { validateWebhook } from '@/lib/payments/payplus';
import {
  createOrder,
  triggerConfirmationEmail,
  type CreateOrderParams,
} from '@/lib/orders/create';

/**
 * PayPlus webhook payload structure
 *
 * Order data is stored in more_info fields:
 * - more_info: JSON stringified { userId, items, subtotal, shipping, total, shippingAddress, isGift, giftMessage }
 * - more_info_1-5: Reserved for additional data
 */
interface WebhookPayload {
  transaction_uid: string;
  page_request_uid?: string;
  status_code: string;
  amount?: number;
  currency?: string;
  more_info?: string; // JSON stringified order data
  more_info_1?: string;
  more_info_2?: string;
  more_info_3?: string;
  more_info_4?: string;
  more_info_5?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  number_of_payments?: number;
  voucher_id?: string;
  voucher_num?: string;
  approval_num?: string;
  token_uid?: string;
}

interface WebhookResponse {
  received: boolean;
  orderCreated?: boolean;
  orderId?: string;
  orderNumber?: string;
  reason?: string;
}

interface ErrorResponse {
  error: string;
}

/**
 * Parses order data from PayPlus webhook payload
 */
function parseOrderData(
  payload: WebhookPayload
): CreateOrderParams | null {
  // Customer info comes from PayPlus directly
  const customerName = payload.customer_name;
  const customerEmail = payload.customer_email;

  if (!customerName || !customerEmail) {
    return null;
  }

  // Order data is stored in more_info as JSON
  if (!payload.more_info) {
    return null;
  }

  try {
    const orderData = JSON.parse(payload.more_info);

    if (!orderData.items || !orderData.total) {
      return null;
    }

    return {
      userId: orderData.userId,
      customerName,
      customerEmail,
      items: orderData.items,
      subtotal: orderData.subtotal || 0,
      shipping: orderData.shipping || 0,
      total: orderData.total,
      shippingAddress: orderData.shippingAddress || {
        street: '',
        city: '',
        postalCode: '',
        country: 'Israel',
      },
      paymentProvider: 'payplus' as const,
      paymentTransactionId: payload.transaction_uid,
      isGift: orderData.isGift || false,
      giftMessage: orderData.giftMessage,
    };
  } catch (error) {
    console.error('Failed to parse PayPlus order data:', error);
    return null;
  }
}

export async function POST(
  request: Request
): Promise<NextResponse<WebhookResponse | ErrorResponse>> {
  try {
    // 1. Get secret key
    const secretKey = process.env.PAYPLUS_SECRET_KEY;
    if (!secretKey) {
      console.error('PAYPLUS_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // 2. Verify user-agent header
    const userAgent = request.headers.get('user-agent');
    if (userAgent !== 'PayPlus') {
      return NextResponse.json(
        { error: 'Invalid user-agent header' },
        { status: 400 }
      );
    }

    // 3. Get hash header
    const hash = request.headers.get('hash');
    if (!hash) {
      return NextResponse.json(
        { error: 'Missing hash header' },
        { status: 400 }
      );
    }

    // 4. Get raw body
    const body = await request.text();

    // 5. Verify webhook signature
    const isValid = validateWebhook(body, hash, secretKey);
    if (!isValid) {
      console.error('Webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // 6. Parse payload
    const payload: WebhookPayload = JSON.parse(body);

    // 7. Handle transaction result
    const isSuccess = payload.status_code === '000';

    if (isSuccess) {
      // Payment successful - create order
      console.log(`Payment succeeded: ${payload.transaction_uid}`);

      const orderParams = parseOrderData(payload);

      if (!orderParams) {
        console.warn(
          'Payment succeeded but missing order data:',
          payload.transaction_uid
        );
        return NextResponse.json({
          received: true,
          orderCreated: false,
          reason: 'Missing order data in payload',
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
          orderCreated: true,
          orderId: orderResult.orderId,
          orderNumber: orderResult.orderNumber,
        });
      } catch (error) {
        // Log error but still return 200 to acknowledge webhook
        console.error('Failed to create order:', error);
        return NextResponse.json({
          received: true,
          orderCreated: false,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } else {
      // Payment failed - log for debugging
      console.log(
        `Payment failed: ${payload.transaction_uid} (status: ${payload.status_code})`
      );
      return NextResponse.json({
        received: true,
        orderCreated: false,
        reason: `Payment failed with status code: ${payload.status_code}`,
      });
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
