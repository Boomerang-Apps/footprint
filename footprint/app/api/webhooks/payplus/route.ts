/**
 * POST /api/webhooks/payplus
 *
 * Handles PayPlus webhook callbacks for payment processing.
 * Verifies webhook signature (HMAC-SHA256) and user-agent header.
 *
 * Headers required:
 * - hash: HMAC-SHA256 signature (base64)
 * - user-agent: Must be "PayPlus"
 *
 * Events handled:
 * - status_code "000": Payment successful, update order status
 * - Other status codes: Payment failed, log error
 */

import { NextResponse } from 'next/server';
import { validateWebhook } from '@/lib/payments/payplus';

interface WebhookPayload {
  transaction_uid: string;
  page_request_uid?: string;
  status_code: string;
  amount?: number;
  currency?: string;
  more_info?: string; // orderId
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
    transactionUid: string;
    pageRequestUid?: string;
    amount?: number;
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
    const orderId = payload.more_info;
    const isSuccess = payload.status_code === '000';

    if (orderId) {
      if (isSuccess) {
        await updateOrderStatus(orderId, 'paid', {
          transactionUid: payload.transaction_uid,
          pageRequestUid: payload.page_request_uid,
          amount: payload.amount,
          paidAt: new Date(),
        });
        console.log(`Order ${orderId} marked as paid`);
      } else {
        await updateOrderStatus(orderId, 'failed', {
          transactionUid: payload.transaction_uid,
          pageRequestUid: payload.page_request_uid,
          failureReason: `Payment failed with status code: ${payload.status_code}`,
        });
        console.log(`Order ${orderId} marked as failed: ${payload.status_code}`);
      }
    } else {
      console.warn('Webhook received but no orderId in more_info');
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
