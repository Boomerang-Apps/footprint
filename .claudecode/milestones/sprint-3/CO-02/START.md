# START.md - CO-02: Pay with Credit Card (PayPlus)

**Story**: CO-02
**Sprint**: 3
**Agent**: Backend-2
**Story Points**: 5
**Priority**: P0 - CRITICAL PATH
**Created**: 2025-12-23
**Updated**: 2025-12-23 (Stripe → PayPlus)

---

## Story Description

Implement PayPlus payment integration for Footprint. Users complete payment via PayPlus hosted checkout page, which handles card validation, 3D Secure, and PCI compliance for Israeli market.

---

## Acceptance Criteria

- [ ] PayPlus generateLink API integration
- [ ] Credit card validation (handled by PayPlus)
- [ ] 3D Secure support (automatic with PayPlus)
- [ ] ILS currency support
- [ ] Webhook signature verification (HMAC-SHA256)
- [ ] Order status update on payment success
- [ ] Handle payment failures gracefully

---

## Scope

### In Scope
- PayPlus payment page link generation
- Webhook handling for payment confirmation
- Order status updates (paid/failed)
- ILS currency support
- Sandbox mode for testing

### Out of Scope (for now)
- Bit payment method
- Installments (תשלומים)
- Apple Pay / Google Pay
- Paddle international fallback
- Recurring payments

---

## Files to Create

| File | Purpose |
|------|---------|
| `lib/payments/payplus.ts` | PayPlus API client |
| `lib/payments/payplus.test.ts` | Unit tests for PayPlus module |
| `app/api/checkout/route.ts` | POST endpoint to create payment link |
| `app/api/checkout/route.test.ts` | API route tests |
| `app/api/webhooks/payplus/route.ts` | Webhook handler for PayPlus callbacks |
| `app/api/webhooks/payplus/route.test.ts` | Webhook tests |

## Files to Remove (Stripe)

| File | Reason |
|------|--------|
| `lib/payments/stripe.ts` | Replaced by PayPlus |
| `lib/payments/stripe.test.ts` | Replaced by PayPlus |
| `app/api/webhooks/stripe/route.ts` | Replaced by PayPlus webhook |
| `app/api/webhooks/stripe/route.test.ts` | Replaced by PayPlus webhook |

---

## Technical Approach

### 1. PayPlus Client (`lib/payments/payplus.ts`)

```typescript
// Core exports
export function createPaymentLink(params: CreatePaymentParams): Promise<PaymentLinkResult>;
export function validateWebhook(body: string, hash: string, secretKey: string): boolean;
```

### 2. Checkout API (`app/api/checkout/route.ts`)

```
POST /api/checkout
Content-Type: application/json
Authorization: Required

Request:
{
  "orderId": "order_123",
  "amount": 15800,  // in agorot (158.00 ILS)
  "customerEmail": "user@example.com",
  "customerName": "John Doe"
}

Response (200):
{
  "pageRequestUid": "xxx-xxx-xxx",
  "paymentUrl": "https://payments.payplus.co.il/..."
}
```

### 3. Webhook Handler (`app/api/webhooks/payplus/route.ts`)

Validates:
- `user-agent` header equals "PayPlus"
- `hash` header matches HMAC-SHA256 of body

Updates order to 'paid' on successful transaction.

---

## Environment Variables Required

```bash
PAYPLUS_API_KEY=xxx                    # PayPlus API key
PAYPLUS_SECRET_KEY=xxx                 # PayPlus secret key
PAYPLUS_PAYMENT_PAGE_UID=xxx           # Payment page UID
PAYPLUS_SANDBOX=true                   # true for testing
```

---

## PayPlus API Details

### Base URLs
- **Sandbox**: `https://restapidev.payplus.co.il/api/v1.0/`
- **Production**: `https://restapi.payplus.co.il/api/v1.0/`

### Endpoint
`POST /PaymentPages/generateLink`

### Test Cards
- Success: `5326-1402-8077-9844` (05/26, CVV: 000)
- Decline: `5326-1402-0001-0120` (05/26, CVV: 000)

---

## Testing Strategy (TDD)

### Unit Tests (`lib/payments/payplus.test.ts`)
1. createPaymentLink returns pageRequestUid and paymentUrl
2. createPaymentLink includes orderId in more_info
3. createPaymentLink uses correct charge_method
4. validateWebhook returns true for valid hash
5. validateWebhook returns false for invalid hash
6. validateWebhook returns false for wrong user-agent

### API Tests (`app/api/checkout/route.test.ts`)
1. Returns 401 for unauthenticated users
2. Returns 400 for missing orderId
3. Returns 400 for missing amount
4. Returns 400 for invalid amount (negative, non-integer)
5. Returns 200 with payment URL for valid request

### Webhook Tests (`app/api/webhooks/payplus/route.test.ts`)
1. Returns 400 for missing hash header
2. Returns 400 for invalid user-agent
3. Returns 400 for invalid hash
4. Returns 200 and updates order on valid callback

---

## Security Checklist

- [ ] PAYPLUS_SECRET_KEY in environment only
- [ ] Webhook hash verification
- [ ] Webhook user-agent verification
- [ ] Authentication required for checkout creation
- [ ] Amount validated (positive integer)
- [ ] No sensitive data logged

---

## Rollback Trigger Conditions

- PayPlus API consistently failing
- Webhook signature verification issues
- Security vulnerability discovered
- API keys exposed

---

**Gate 1 Status**: READY FOR IMPLEMENTATION

*Created by Backend-2 Agent - 2025-12-23*
