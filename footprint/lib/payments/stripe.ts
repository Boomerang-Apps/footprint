/**
 * Stripe Payment Integration
 *
 * Handles wallet payments (Apple Pay, Google Pay) using Stripe's
 * Express Checkout Element.
 *
 * Architecture:
 * - Israeli Customers: PayPlus (Bit, local cards, installments)
 * - International + Wallet Users: Stripe (Apple Pay, Google Pay)
 */

import Stripe from 'stripe';

// ============================================================================
// Types
// ============================================================================

export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  isTestMode: boolean;
}

export interface WalletPaymentParams {
  orderId: string;
  amount: number; // in smallest currency unit (agorot for ILS, cents for USD)
  currency: 'ils' | 'usd' | 'eur';
  customerEmail: string;
  description?: string;
}

export interface PaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Gets Stripe configuration from environment variables.
 * Throws an error if required variables are missing.
 */
export function getStripeConfig(): StripeConfig {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  if (!publishableKey) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured');
  }

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  // Detect test mode from secret key prefix
  const isTestMode = secretKey.startsWith('sk_test_');

  return {
    secretKey,
    publishableKey,
    webhookSecret,
    isTestMode,
  };
}

// ============================================================================
// Stripe Client
// ============================================================================

let stripeClient: Stripe | null = null;

/**
 * Gets or creates a Stripe client instance.
 */
function getStripeClient(): Stripe {
  if (!stripeClient) {
    const config = getStripeConfig();
    stripeClient = new Stripe(config.secretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  }
  return stripeClient;
}

// ============================================================================
// Payment Intent Creation
// ============================================================================

/**
 * Creates a PaymentIntent for wallet payments (Apple Pay, Google Pay).
 *
 * The client_secret is returned to the frontend to complete the payment
 * using the Express Checkout Element.
 *
 * @param params - Payment parameters including order ID, amount, and customer email
 * @returns PaymentIntent ID and client secret for frontend confirmation
 * @throws Error if validation fails or Stripe API call fails
 */
export async function createWalletPaymentIntent(
  params: WalletPaymentParams
): Promise<PaymentIntentResult> {
  // Validate inputs
  if (!params.orderId) {
    throw new Error('Order ID is required');
  }

  if (params.amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const stripe = getStripeClient();

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      payment_method_types: ['card'],
      metadata: {
        orderId: params.orderId,
      },
      receipt_email: params.customerEmail,
      ...(params.description && { description: params.description }),
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to create payment intent: ${message}`);
  }
}

// ============================================================================
// Webhook Validation
// ============================================================================

/**
 * Validates a Stripe webhook signature and returns the event.
 *
 * Stripe signs webhooks using HMAC-SHA256. This function uses Stripe's
 * SDK to verify the signature, which handles timing-safe comparison.
 *
 * @param body - The raw request body as a string
 * @param signature - The Stripe-Signature header value
 * @returns The validated Stripe event
 * @throws Error if signature is invalid or verification fails
 */
export async function validateStripeWebhook(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  if (!body) {
    throw new Error('Missing webhook body');
  }

  if (!signature) {
    throw new Error('Missing Stripe webhook signature');
  }

  const config = getStripeConfig();
  const stripe = getStripeClient();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      config.webhookSecret
    );
    return event;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(message);
  }
}

// ============================================================================
// Reset (for testing)
// ============================================================================

/**
 * Resets the Stripe client instance.
 * Only used in tests to ensure clean state between test runs.
 */
export function resetStripeClient(): void {
  stripeClient = null;
}
