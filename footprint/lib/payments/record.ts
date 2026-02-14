/**
 * Payment Record Service
 *
 * Creates payment records in the database for tracking PayPlus transactions.
 * Idempotent: checks for existing records by external_transaction_id before inserting.
 */

import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { PaymentProvider, PaymentStatus } from '@/types/database';

export interface CreatePaymentRecordParams {
  orderId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  externalId?: string;
  externalTransactionId: string;
  amount: number; // in agorot
  currency?: string;
  installments?: number;
  cardLastFour?: string;
  cardBrand?: string;
  errorCode?: string;
  errorMessage?: string;
  webhookPayload?: Record<string, unknown>;
}

export interface PaymentRecordResult {
  success: boolean;
  paymentId?: string;
  alreadyExists?: boolean;
  error?: string;
}

export async function createPaymentRecord(
  params: CreatePaymentRecordParams
): Promise<PaymentRecordResult> {
  try {
    const supabase = createAdminClient();

    // Idempotency check: look for existing record with same external_transaction_id
    const { data: existing } = await supabase
      .from('payments')
      .select('id')
      .eq('external_transaction_id', params.externalTransactionId)
      .single();

    if (existing) {
      logger.info(
        `Payment record already exists for transaction: ${params.externalTransactionId}`
      );
      return { success: true, paymentId: existing.id, alreadyExists: true };
    }

    // Insert new payment record
    const { data: inserted, error: insertError } = await supabase
      .from('payments')
      .insert({
        order_id: params.orderId,
        provider: params.provider,
        status: params.status,
        external_id: params.externalId ?? null,
        external_transaction_id: params.externalTransactionId,
        amount: params.amount,
        currency: params.currency ?? 'ILS',
        installments: params.installments ?? 1,
        card_last_four: params.cardLastFour ?? null,
        card_brand: params.cardBrand ?? null,
        error_code: params.errorCode ?? null,
        error_message: params.errorMessage ?? null,
        webhook_payload: params.webhookPayload ?? null,
        completed_at:
          params.status === 'succeeded'
            ? new Date().toISOString()
            : null,
      })
      .select('id')
      .single();

    if (insertError) {
      logger.error('Failed to insert payment record', insertError);
      return { success: false, error: insertError.message };
    }

    logger.info(
      `Payment record created: ${inserted.id} for order ${params.orderId}`
    );
    return { success: true, paymentId: inserted.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error('Payment record creation error', error);
    return { success: false, error: message };
  }
}
