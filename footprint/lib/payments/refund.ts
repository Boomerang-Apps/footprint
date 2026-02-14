/**
 * PayPlus Refund Service
 *
 * Processes refunds via PayPlus RefundByTransactionUID API.
 * Never throws — always returns a result object.
 */

import { getPayPlusConfig } from '@/lib/payments/payplus';
import { logger } from '@/lib/logger';

export interface ProcessRefundParams {
  transactionUid: string;
  amount: number; // in agorot
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundTransactionUid?: string;
  errorMessage?: string;
}

export async function processRefund(
  params: ProcessRefundParams
): Promise<RefundResult> {
  try {
    const config = getPayPlusConfig();

    if (!config.baseUrl.startsWith('https://')) {
      return { success: false, errorMessage: 'PayPlus base URL must use HTTPS' };
    }

    const amountILS = params.amount / 100;

    logger.info(
      `Processing refund: txn=${params.transactionUid}, amount=${amountILS} ILS`
    );

    const response = await fetch(
      `${config.baseUrl}/Transactions/RefundByTransactionUID`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey,
          'secret-key': config.secretKey,
        },
        body: JSON.stringify({
          related_transaction_uid: params.transactionUid,
          amount: amountILS,
          ...(params.reason && { more_info: params.reason }),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      logger.error(`PayPlus refund API error: HTTP ${response.status}`, errorText);
      return {
        success: false,
        errorMessage: `PayPlus API error: ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.results?.status !== 'success') {
      const msg = data.results?.description || `Error code: ${data.results?.code}`;
      logger.error('PayPlus refund failed', msg);
      return { success: false, errorMessage: msg };
    }

    const refundTransactionUid = data.data?.transaction_uid;
    logger.info(`Refund successful: ${refundTransactionUid}`);

    return { success: true, refundTransactionUid };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error('Refund processing error', error);
    return { success: false, errorMessage: message };
  }
}
