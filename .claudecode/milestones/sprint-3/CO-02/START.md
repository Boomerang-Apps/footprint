# START.md - CO-02: Pay with Credit Card (Stripe)

**Story**: CO-02
**Sprint**: 3
**Agent**: Backend-2
**Story Points**: 5
**Priority**: P0 - CRITICAL PATH
**Created**: 2025-12-23

---

## Story Description

Implement Stripe Checkout for secure payment processing. Users complete payment via Stripe's hosted checkout page, which handles card validation, 3D Secure, and PCI compliance.

---

## Acceptance Criteria

- [ ] Stripe Checkout session creation
- [ ] Credit card validation (handled by Stripe)
- [ ] 3D Secure support (automatic with Stripe)
- [ ] ILS currency support
- [ ] Webhook signature verification
- [ ] Order status update on payment success
- [ ] Handle payment failures gracefully

---

## Scope

### In Scope
- Stripe Checkout session creation
- Webhook handling for payment confirmation
- Order status updates (paid/failed)
- ILS currency support
- Test mode implementation

### Out of Scope (for now)
- Apple Pay / Google Pay (auto-handled by Stripe, but UI in CO-03)
- Discount codes (CO-05)
- Refunds (post-MVP)

---

## Files to Create

| File | Purpose |
|------|---------|
| `lib/payments/stripe.ts` | Stripe client, checkout session, webhook utils |
| `lib/payments/stripe.test.ts` | Unit tests for Stripe module |
| `app/api/checkout/route.ts` | POST endpoint to create checkout session |
| `app/api/checkout/route.test.ts` | API route tests |
| `app/api/webhooks/stripe/route.ts` | Webhook handler for Stripe events |
| `app/api/webhooks/stripe/route.test.ts` | Webhook tests |

---

## Technical Approach

### 1. Stripe Client (`lib/payments/stripe.ts`)

```typescript
// Core exports
export const stripe: Stripe;
export function createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult>;
export function retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session>;
export function constructWebhookEvent(payload, signature, secret): Stripe.Event;
```

### 2. Checkout API (`app/api/checkout/route.ts`)

```
POST /api/checkout
Content-Type: application/json
Authorization: Required

Request:
{
  "orderId": "order_123",
  "amount": 15800  // in agorot (158.00 ILS)
}

Response (200):
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### 3. Webhook Handler (`app/api/webhooks/stripe/route.ts`)

Handles events:
- `checkout.session.completed` - Update order to 'paid'
- `payment_intent.payment_failed` - Log failure

---

## Environment Variables Required

```bash
STRIPE_SECRET_KEY=sk_test_...          # Stripe secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Client-side key
STRIPE_WEBHOOK_SECRET=whsec_...        # Webhook signing secret
```

---

## Dependencies

- `stripe` package (already in package.json)

---

## Testing Strategy (TDD)

### Unit Tests (`lib/payments/stripe.test.ts`)
1. createCheckoutSession returns session ID and URL
2. createCheckoutSession includes orderId in metadata
3. createCheckoutSession uses ILS currency
4. retrieveSession returns session data
5. constructWebhookEvent validates signature
6. constructWebhookEvent throws on invalid signature

### API Tests (`app/api/checkout/route.test.ts`)
1. Returns 401 for unauthenticated users
2. Returns 400 for missing orderId
3. Returns 400 for missing amount
4. Returns 400 for invalid amount (negative, non-integer)
5. Returns 200 with session URL for valid request

### Webhook Tests (`app/api/webhooks/stripe/route.test.ts`)
1. Returns 400 for missing signature header
2. Returns 400 for invalid signature
3. Returns 200 and processes checkout.session.completed
4. Returns 200 for unhandled event types

---

## Security Checklist

- [ ] STRIPE_SECRET_KEY in environment only
- [ ] Webhook signature verification
- [ ] Authentication required for checkout creation
- [ ] Amount validated (positive integer)
- [ ] No sensitive data logged

---

## Rollback Trigger Conditions

- Stripe API consistently failing
- Webhook signature verification issues
- Security vulnerability discovered
- Test keys exposed

---

**Gate 1 Status**: READY FOR IMPLEMENTATION

*Created by Backend-2 Agent - 2025-12-23*
