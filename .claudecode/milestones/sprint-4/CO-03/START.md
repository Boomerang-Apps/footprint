# CO-03: Apple Pay / Google Pay

**Started**: 2025-12-25
**Agent**: Backend-2
**Branch**: feature/CO-03-apple-google-pay
**Gate**: 1 - Planning
**Linear**: UZF-1850

---

## Story Summary

Implement Apple Pay and Google Pay wallet payment options using Stripe Express Checkout Element. This provides one-tap payment for users with configured digital wallets, complementing the PayPlus integration for Israeli customers.

---

## Architecture Context

Per CTO Gate 0 decision:
- **Israeli Customers**: PayPlus (Bit, local cards, installments)
- **International + Wallet Users**: Stripe (Apple Pay, Google Pay, cards)

This story implements the Stripe wallet payment path using Express Checkout Element, which displays Apple Pay / Google Pay buttons when available on the user's device.

---

## Scope

### In Scope
- Stripe Express Checkout Element integration
- Apple Pay button (Safari, iOS)
- Google Pay button (Chrome, Android)
- Wallet availability detection
- Payment session creation API
- Webhook handling for wallet payments
- Same order confirmation flow as PayPlus

### Out of Scope
- Standard credit card form (future Stripe Elements story)
- PayPlus integration (CO-02, separate branch)
- Apple/Google domain verification (ops task, documented in handoff)

---

## Acceptance Criteria

- [ ] Wallet detection shows Apple Pay on Safari/iOS when available
- [ ] Wallet detection shows Google Pay on Chrome/Android when available
- [ ] One-tap payment completes transaction
- [ ] Same confirmation page as other payment methods
- [ ] Graceful fallback when wallets unavailable
- [ ] Tests written (TDD approach)
- [ ] 80%+ coverage for new code
- [ ] TypeScript clean
- [ ] Lint clean

---

## Technical Approach

### 1. Express Checkout Element

Using Stripe's `ExpressCheckoutElement` which automatically:
- Detects available wallets (Apple Pay, Google Pay, Link)
- Renders appropriate buttons
- Handles payment flow

```typescript
// Frontend component structure
import { ExpressCheckoutElement } from '@stripe/react-stripe-js';

<ExpressCheckoutElement
  onConfirm={handlePayment}
  options={{
    wallets: { applePay: 'auto', googlePay: 'auto' }
  }}
/>
```

### 2. API Endpoints

| Endpoint | Purpose |
|----------|---------|
| POST /api/checkout/wallet/create-intent | Create PaymentIntent for wallet |
| POST /api/webhooks/stripe | Handle payment confirmation |

### 3. Flow Diagram

```
User clicks Apple/Google Pay button
    -> Frontend calls /api/checkout/wallet/create-intent
    -> Backend creates Stripe PaymentIntent
    -> Frontend confirms with wallet
    -> User authenticates (Face ID, fingerprint)
    -> Stripe processes payment
    -> Webhook confirms -> Order marked paid
    -> Redirect to /create/complete
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| footprint/lib/payments/stripe.ts | Create | Stripe client initialization |
| footprint/lib/payments/wallet.ts | Create | Wallet payment logic |
| footprint/app/api/checkout/wallet/create-intent/route.ts | Create | PaymentIntent API |
| footprint/app/api/webhooks/stripe/route.ts | Create | Stripe webhook handler |
| footprint/components/checkout/WalletPayment.tsx | Create | Express Checkout component |
| + test files for each | Create | TDD tests |

---

## Dependencies

### Blocked By
- Gate 0 Stripe research: APPROVED (GATE0-stripe-payments.md)

### Blocks
- None (independent payment method)

### Complements
- CO-02: PayPlus payment (parallel payment option)

---

## Environment Variables Required

```bash
# Already in .env.local template
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## Ops Tasks (Post-Implementation)

1. **Apple Pay Domain Verification**
   - Add `apple-developer-merchantid-domain-association` file
   - Register domain in Stripe Dashboard

2. **Google Pay**
   - Enable Google Pay in Stripe Dashboard
   - No additional verification for test mode

---

## Safety Gate Progress

- [x] Gate 0: Research (GATE0-stripe-payments.md approved)
- [x] Gate 1: Planning (this document, ROLLBACK-PLAN.md, tag CO-03-start)
- [x] Gate 2: Implementation (TDD - 35 tests, 100% lib coverage)
- [ ] Gate 3: QA Validation (PENDING)
- [x] Gate 4: Review (TypeScript clean, Lint clean)
- [ ] Gate 5: Deployment

---

*Started by Backend-2 Agent - 2025-12-25*
*Gate 2 completed - 2025-12-25*
