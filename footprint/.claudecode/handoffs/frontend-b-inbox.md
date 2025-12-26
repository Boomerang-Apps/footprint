# frontend-b Agent Inbox

---

## 📬 INT-03: Connect Checkout to Payment APIs

**From**: PM Agent
**Date**: 2025-12-26
**Priority**: High
**Story Points**: 5
**Dependencies**: UI-04 ✅, CO-02 ✅, CO-03 ✅, INT-02 ✅ (all complete)

### Story Description

Replace simulated payment processing with real API calls. Credit card payments go to PayPlus (Israeli gateway), wallet payments (Apple Pay, Google Pay) go to Stripe.

### Current Implementation (to replace)

File: `app/(app)/create/checkout/page.tsx` lines 112-139

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // ... validation ...
  setIsProcessing(true);

  // ⚠️ SIMULATED - Replace with real payment flow
  await new Promise(resolve => setTimeout(resolve, 2000));

  // ... save address ...
  toast.success('ההזמנה התקבלה בהצלחה!');
  setStep('complete');
  router.push('/create/complete');
};
```

---

### Payment Flow Overview

```
┌─────────────────┐     ┌─────────────────┐
│  Credit Card    │────▶│  /api/checkout  │────▶ PayPlus Hosted Page
│  (PayPlus)      │     │  (returns URL)  │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────────────────────┐
│  Apple/Google   │────▶│  /api/checkout/wallet/create-   │────▶ Stripe Elements
│  Pay (Stripe)   │     │  intent (returns clientSecret)  │
└─────────────────┘     └─────────────────────────────────┘
```

---

### API 1: PayPlus (Credit Card)

**Endpoint**: `POST /api/checkout`

**Request**:
```typescript
{
  orderId: string;        // Generate UUID before call
  amount: number;         // In agorot (e.g., 15800 = ₪158)
  customerName: string;   // From form
  customerEmail?: string; // Optional, uses auth user if not provided
  customerPhone?: string; // Optional
}
```

**Success Response** (200):
```typescript
{
  pageRequestUid: string;  // PayPlus transaction ID
  paymentUrl: string;      // Redirect user here
}
```

**Error Responses**:
- 400: Missing required fields
- 401: Unauthorized
- 500: Failed to create payment link

**Integration**:
```typescript
// Credit card flow
const response = await fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: crypto.randomUUID(),
    amount: total * 100,  // Convert to agorot
    customerName: formData.fullName,
    customerPhone: formData.phone,
  }),
});

const { paymentUrl } = await response.json();
window.location.href = paymentUrl;  // Redirect to PayPlus
```

---

### API 2: Stripe (Wallet Payments)

**Endpoint**: `POST /api/checkout/wallet/create-intent`

**Request**:
```typescript
{
  orderId: string;        // Generate UUID
  amount: number;         // In agorot/cents
  currency?: string;      // Default: 'ils'
  customerEmail: string;  // Required
  description?: string;   // Optional
}
```

**Success Response** (200):
```typescript
{
  paymentIntentId: string;
  clientSecret: string;    // Use with Stripe Elements
}
```

**Integration**:
```typescript
// Wallet flow (Apple Pay / Google Pay)
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const response = await fetch('/api/checkout/wallet/create-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: crypto.randomUUID(),
    amount: total * 100,
    customerEmail: user.email,
  }),
});

const { clientSecret } = await response.json();

// Use Stripe Express Checkout Element
// See: https://stripe.com/docs/payments/accept-a-payment?platform=web&ui=elements
```

---

### Implementation Requirements

1. **Generate Order ID**
   - Use `crypto.randomUUID()` before making API call
   - Store in orderStore for confirmation page

2. **Credit Card Flow**
   - Call `/api/checkout` → Get `paymentUrl`
   - Redirect user to PayPlus hosted page
   - PayPlus redirects back to `/create/complete?page_request_uid=xxx`

3. **Wallet Payment Flow**
   - Install: `npm install @stripe/stripe-js @stripe/react-stripe-js`
   - Create payment intent → Get `clientSecret`
   - Show Stripe Express Checkout Element
   - Handle success/failure in component

4. **Success Flow**
   - PayPlus: User returns to `/create/complete?page_request_uid={uid}`
   - Stripe: `confirmPayment()` resolves → Navigate to `/create/complete`

5. **Error Handling**
   - Show toast on API errors
   - Handle payment cancellation (PayPlus redirects to checkout with `?error=payment_failed`)
   - Retry button for failed payments

---

### Files to Modify

1. **`app/(app)/create/checkout/page.tsx`**
   - Replace `handleSubmit` with real payment logic
   - Add payment method routing (credit card vs wallet)
   - Handle URL params for PayPlus callback

2. **New: `components/checkout/StripeWalletButton.tsx`** (optional)
   - Wrap Stripe Express Checkout Element
   - Handle wallet payment confirmation

---

### Acceptance Criteria

- [ ] Credit card → calls `/api/checkout` → redirects to PayPlus
- [ ] Apple/Google Pay → calls wallet API → shows Stripe Element
- [ ] Order ID generated and stored before payment
- [ ] Payment errors show user-friendly messages
- [ ] Handles PayPlus redirect callback (`?error=payment_failed`)
- [ ] Tests cover all payment paths
- [ ] 80%+ test coverage maintained

---

### Test Scenarios

1. **Credit Card Happy Path**: Fill form → Select credit card → Submit → Redirect to PayPlus
2. **Wallet Payment Happy Path**: Select Apple Pay → Call API → Confirm with Stripe
3. **PayPlus Error**: Return with `?error=payment_failed` → Show error toast
4. **API Error**: `/api/checkout` returns 500 → Show error → Allow retry
5. **Validation Error**: Missing fields → Show validation messages

---

### Notes

- PayPlus is redirect-based (user leaves our site temporarily)
- Stripe wallet is in-page (Express Checkout Element)
- Amount must be in smallest unit (agorot/cents), not shekel
- INT-04 will handle order creation after payment success

### Reference Files

- PayPlus API: `app/api/checkout/route.ts`
- Stripe API: `app/api/checkout/wallet/create-intent/route.ts`
- Checkout Page: `app/(app)/create/checkout/page.tsx`
- PayPlus lib: `lib/payments/payplus.ts`
- Stripe lib: `lib/payments/stripe.ts`

---

**Ready for implementation!** Ping PM when complete for QA handoff.

---

*Last checked: 2025-12-26*
