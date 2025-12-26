# INT-03: Connect Checkout to Payment APIs

## Story
**ID**: INT-03
**Title**: Connect Checkout to Payment APIs
**Agent**: Frontend-B
**Sprint**: 5
**Points**: TBD

## Objective
Integrate the checkout page with PayPlus (Israeli payments) and Stripe (wallet payments) APIs, handling success/failure callbacks.

## Current State
- Checkout page simulates payment with `setTimeout`
- No actual API calls to payment endpoints
- No payment method selection
- No error handling for failed payments

## Target State
- Call `/api/checkout` for PayPlus (credit card) payments
- Call `/api/checkout/wallet/create-intent` for Stripe wallet payments
- Show payment method selection (Credit Card vs Apple Pay/Google Pay)
- Redirect to PayPlus payment page for card payments
- Handle Stripe Express Checkout for wallet payments
- Handle success/failure callbacks
- Show error message if payment failed

## Technical Approach

### 1. Payment Method Selection
- Default to credit card (PayPlus)
- Detect wallet availability (Apple Pay/Google Pay)
- Show wallet option if available

### 2. PayPlus Flow
```typescript
const handlePayPlusPayment = async () => {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: generateOrderId(),
      amount: totalInAgorot,
      customerName: formData.fullName,
      customerEmail: formData.email,
      customerPhone: formData.phone,
    }),
  });

  const { paymentUrl } = await response.json();
  window.location.href = paymentUrl; // Redirect to PayPlus
};
```

### 3. Stripe Wallet Flow
```typescript
const handleWalletPayment = async () => {
  const response = await fetch('/api/checkout/wallet/create-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: generateOrderId(),
      amount: totalInAgorot,
      customerEmail: formData.email,
    }),
  });

  const { clientSecret } = await response.json();
  // Use Stripe Express Checkout Element with clientSecret
};
```

### 4. Error Handling
- Check for `?error=payment_failed` on page load
- Show error toast if payment failed
- Allow retry

## Dependencies
- `/api/checkout` endpoint (Backend-2) - READY
- `/api/checkout/wallet/create-intent` endpoint (Backend-2) - READY
- orderStore pricing (Backend-1) - READY

## Acceptance Criteria
- [ ] Credit card payments call PayPlus API
- [ ] Wallet payments call Stripe API
- [ ] User redirected to PayPlus for card payments
- [ ] Error message shown for failed payments
- [ ] Loading state during API calls
- [ ] Tests written (TDD)
- [ ] 80%+ coverage

## Files to Modify
| File | Change |
|------|--------|
| `app/(app)/create/checkout/page.tsx` | Integrate payment APIs |
| `app/(app)/create/checkout/page.test.tsx` | Create test file |

## Branch
`feature/int-03-checkout-payment-integration`

## Start Tag
`INT-03-start`

---
**Started**: 2025-12-26
**Agent**: Frontend-B
