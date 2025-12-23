/**
 * Stripe Payment Integration
 *
 * Provides checkout session creation, session retrieval,
 * and webhook event verification for Stripe payments.
 *
 * Approved in Gate 0: .claudecode/research/GATE0-stripe-payments.md
 */

import Stripe from 'stripe';

/**
 * Gets or creates the Stripe client instance
 * Validates STRIPE_SECRET_KEY on first call
 */
function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(key, {
    apiVersion: '2023-10-16',
    typescript: true,
  });
}

/**
 * Parameters for creating a checkout session
 */
export interface CheckoutSessionParams {
  /** Unique order identifier */
  orderId: string;
  /** Amount in agorot (ILS cents) - e.g., 15800 = 158.00 ILS */
  amount: number;
  /** Customer email for receipt */
  customerEmail?: string;
  /** URL to redirect on successful payment */
  successUrl: string;
  /** URL to redirect on cancelled payment */
  cancelUrl: string;
  /** Additional metadata to store with the session */
  metadata?: Record<string, string>;
}

/**
 * Result of checkout session creation
 */
export interface CheckoutSessionResult {
  /** Stripe session ID */
  sessionId: string;
  /** URL to redirect user to Stripe Checkout */
  url: string;
}

/**
 * Creates a Stripe Checkout session for payment
 *
 * @param params - Checkout session parameters
 * @returns Session ID and checkout URL
 * @throws Error if session creation fails
 */
export async function createCheckoutSession(
  params: CheckoutSessionParams
): Promise<CheckoutSessionResult> {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'ils',
          product_data: {
            name: 'Footprint Art Print',
            description: 'Custom AI-transformed art print',
          },
          unit_amount: params.amount,
        },
        quantity: 1,
      },
    ],
    customer_email: params.customerEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      orderId: params.orderId,
      ...params.metadata,
    },
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session URL');
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Retrieves a checkout session by ID
 *
 * @param sessionId - Stripe session ID
 * @returns The checkout session object
 */
export async function retrieveSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  return stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Constructs and verifies a webhook event from Stripe
 *
 * @param payload - Raw request body (string or Buffer)
 * @param signature - Stripe-Signature header value
 * @param webhookSecret - Webhook signing secret
 * @returns Verified Stripe event
 * @throws Error if signature verification fails
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  const stripe = getStripeClient();
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
