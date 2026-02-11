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
  triggerNewOrderNotification,
  type CreateOrderParams,
} from '@/lib/orders/create';
import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

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
      customerPhone: payload.customer_phone,
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
    logger.error('Failed to parse PayPlus order data', error);
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
      logger.error('PAYPLUS_SECRET_KEY is not configured');
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
      logger.error('Webhook signature verification failed');
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
      // Payment successful
      logger.info(`Payment succeeded: ${payload.transaction_uid}`);

      // Check if order was pre-created (orderId in more_info)
      let preCreatedOrderId: string | null = null;
      if (payload.more_info) {
        try {
          const moreInfoData = JSON.parse(payload.more_info);
          preCreatedOrderId = moreInfoData.orderId || null;
        } catch {
          // Will fall through to legacy path
        }
      }

      if (preCreatedOrderId) {
        // Pre-created order path: update existing order
        try {
          const supabase = createAdminClient();
          const { data: existing, error: fetchError } = await supabase
            .from('orders')
            .select('id, order_number, status, customer_notes')
            .eq('id', preCreatedOrderId)
            .single();

          if (fetchError || !existing) {
            logger.error('Pre-created order not found', { orderId: preCreatedOrderId });
            return NextResponse.json({
              received: true,
              orderCreated: false,
              reason: 'Pre-created order not found',
            });
          }

          if (existing.status === 'paid') {
            // Already finalized (e.g., by iframe-callback) — idempotent no-op
            logger.info(`Order already finalized: ${existing.order_number}`);
            return NextResponse.json({
              received: true,
              orderCreated: true,
              orderId: existing.id,
              orderNumber: existing.order_number,
            });
          }

          // Update pending_payment → paid, store real transaction_uid
          const updatedNotes = (() => {
            try {
              const parsed = JSON.parse(existing.customer_notes || '{}');
              parsed.txn = payload.transaction_uid;
              return JSON.stringify(parsed);
            } catch {
              return JSON.stringify({ txn: payload.transaction_uid });
            }
          })();

          const { error: updateError } = await supabase
            .from('orders')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString(),
              customer_notes: updatedNotes,
            })
            .eq('id', preCreatedOrderId);

          if (updateError) {
            logger.error('Failed to update pre-created order', updateError);
            return NextResponse.json({
              received: true,
              orderCreated: false,
              reason: 'Failed to update order status',
            });
          }

          logger.info(`Order updated to paid: ${existing.order_number} (${existing.id})`);

          // Trigger emails
          triggerConfirmationEmail(existing.id);
          triggerNewOrderNotification(existing.id);

          return NextResponse.json({
            received: true,
            orderCreated: true,
            orderId: existing.id,
            orderNumber: existing.order_number,
          });
        } catch (error) {
          logger.error('Failed to process pre-created order', error);
          return NextResponse.json({
            received: true,
            orderCreated: false,
            reason: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Legacy path: no pre-created order — create from scratch
      const orderParams = parseOrderData(payload);

      if (!orderParams) {
        logger.warn('Payment succeeded but missing order data', { transactionUid: payload.transaction_uid });
        return NextResponse.json({
          received: true,
          orderCreated: false,
          reason: 'Missing order data in payload',
        });
      }

      try {
        const orderResult = await createOrder(orderParams);

        logger.info(`Order created: ${orderResult.orderNumber} (${orderResult.orderId})`);

        triggerConfirmationEmail(orderResult.orderId);
        triggerNewOrderNotification(orderResult.orderId);

        return NextResponse.json({
          received: true,
          orderCreated: true,
          orderId: orderResult.orderId,
          orderNumber: orderResult.orderNumber,
        });
      } catch (error) {
        logger.error('Failed to create order', error);
        return NextResponse.json({
          received: true,
          orderCreated: false,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } else {
      // Payment failed - log for debugging
      logger.info(`Payment failed: ${payload.transaction_uid} (status: ${payload.status_code})`);
      return NextResponse.json({
        received: true,
        orderCreated: false,
        reason: `Payment failed with status code: ${payload.status_code}`,
      });
    }
  } catch (error) {
    logger.error('Webhook handler error', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
