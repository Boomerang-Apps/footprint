/**
 * PayPlus Payment Integration
 *
 * Handles payment link generation and webhook validation for PayPlus.
 * https://docs.payplus.co.il/reference/introduction
 */

import crypto from 'crypto';

// ============================================================================
// Types
// ============================================================================

export interface PayPlusConfig {
  apiKey: string;
  secretKey: string;
  paymentPageUid: string;
  sandbox: boolean;
  baseUrl: string;
}

export interface CreatePaymentParams {
  orderId: string;
  amount: number; // in agorot (ILS cents)
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  successUrl: string;
  failureUrl: string;
  callbackUrl: string;
  moreInfo?: string; // JSON-serialized order data for webhook callback
}

export interface PaymentLinkResult {
  pageRequestUid: string;
  paymentUrl: string;
}

interface PayPlusResponse {
  results: {
    status: string;
    code: number;
    description: string;
  };
  data?: {
    page_request_uid: string;
    payment_page_link: string;
  };
}

// ============================================================================
// Configuration
// ============================================================================

const SANDBOX_URL = 'https://restapidev.payplus.co.il/api/v1.0';
const PRODUCTION_URL = 'https://restapi.payplus.co.il/api/v1.0';

/**
 * Gets PayPlus configuration from environment variables.
 * Throws an error if required variables are missing.
 */
export function getPayPlusConfig(): PayPlusConfig {
  const apiKey = process.env.PAYPLUS_API_KEY;
  const secretKey = process.env.PAYPLUS_SECRET_KEY;
  const paymentPageUid = process.env.PAYPLUS_PAYMENT_PAGE_UID;
  const sandbox = process.env.PAYPLUS_SANDBOX !== 'false';

  if (!apiKey) {
    throw new Error('PAYPLUS_API_KEY is not configured');
  }

  if (!secretKey) {
    throw new Error('PAYPLUS_SECRET_KEY is not configured');
  }

  if (!paymentPageUid) {
    throw new Error('PAYPLUS_PAYMENT_PAGE_UID is not configured');
  }

  return {
    apiKey,
    secretKey,
    paymentPageUid,
    sandbox,
    baseUrl: sandbox ? SANDBOX_URL : PRODUCTION_URL,
  };
}

// ============================================================================
// Payment Link Creation
// ============================================================================

/**
 * Creates a PayPlus payment link for the given order.
 *
 * @param params - Payment parameters including order ID, amount, and customer details
 * @returns Payment link result with page request UID and payment URL
 * @throws Error if API call fails or response is invalid
 */
export async function createPaymentLink(
  params: CreatePaymentParams
): Promise<PaymentLinkResult> {
  const config = getPayPlusConfig();

  // Build request body
  // Amount is converted from agorot to ILS (divide by 100)
  const requestBody = {
    payment_page_uid: config.paymentPageUid,
    charge_method: 1, // 1 = Charge (J4)
    amount: params.amount / 100,
    currency_code: 'ILS',
    customer: {
      customer_name: params.customerName,
      email: params.customerEmail,
      ...(params.customerPhone && { phone: params.customerPhone }),
    },
    refURL_success: params.successUrl,
    refURL_failure: params.failureUrl,
    refURL_callback: params.callbackUrl,
    send_failure_callback: true,
    more_info: params.moreInfo || params.orderId,
  };

  // Make API request
  const response = await fetch(
    `${config.baseUrl}/PaymentPages/generateLink`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey,
        'secret-key': config.secretKey,
      },
      body: JSON.stringify(requestBody),
    }
  );

  // Check HTTP status
  if (!response.ok) {
    let description = 'Unknown error';
    try {
      const errorData = await response.json() as PayPlusResponse;
      description = errorData?.results?.description || `HTTP ${response.status}`;
    } catch {
      description = `HTTP ${response.status}`;
    }
    throw new Error(
      `PayPlus API error: ${response.status} [${config.sandbox ? 'sandbox' : 'production'}] - ${description}`
    );
  }

  // Parse response
  const data: PayPlusResponse = await response.json();

  // Check for API-level errors
  if (data.results.status !== 'success') {
    throw new Error(
      data.results.description || `PayPlus error code: ${data.results.code}`
    );
  }

  // Validate response data
  if (!data.data?.payment_page_link) {
    throw new Error('PayPlus response missing payment link');
  }

  return {
    pageRequestUid: data.data.page_request_uid,
    paymentUrl: data.data.payment_page_link,
  };
}

// ============================================================================
// Webhook Validation
// ============================================================================

/**
 * Validates a PayPlus webhook signature.
 *
 * PayPlus signs webhooks using HMAC-SHA256 with the secret key.
 * The hash is sent in the 'hash' header as a base64-encoded string.
 *
 * @param body - The raw request body as a string
 * @param hash - The hash from the 'hash' header
 * @param secretKey - The PayPlus secret key
 * @returns true if the signature is valid, false otherwise
 */
export function validateWebhook(
  body: string,
  hash: string,
  secretKey: string
): boolean {
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(body)
    .digest('base64');

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedHash),
      Buffer.from(hash)
    );
  } catch {
    // If buffers have different lengths, timingSafeEqual throws
    return false;
  }
}
