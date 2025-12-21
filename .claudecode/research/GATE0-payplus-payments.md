# Research: PayPlus Israeli Payment Integration

**Date**: 2025-12-21
**Author**: CTO Agent
**Story**: CO-02 (Payment Integration)
**Gate**: 0 - Research
**Status**: APPROVED (Complementary to Stripe)

---

## Objective

Evaluate PayPlus as a complementary payment provider for the Israeli market, offering local payment methods alongside Stripe for international payments.

---

## Questions Answered

### 1. What payment methods does PayPlus support?

| Method | Supported | Notes |
|--------|-----------|-------|
| Credit Cards | Yes | Visa, Mastercard, Isracard, Diners |
| Bit | Yes | #1 APM in Israel (Bank Hapoalim) |
| Apple Pay | Yes | Native support |
| Google Pay | Yes | Native support |
| PayPal | Yes | For international |
| Max Payments | Yes | Israeli payment app |
| Hever | Yes | Israeli club card |
| Installments (תשלומים) | Yes | Native Israeli credit installments |

### 2. Transaction Fees (Estimated)

| Method | PayPlus | Stripe |
|--------|---------|--------|
| Credit Card | ~2.5% + ₪0.25 | 2.9% + ₪0.30 |
| Bit | ~1.5% | Not supported |
| Apple/Google Pay | ~2.5% | 2.9% + ₪0.30 |
| Installments | ~3.0% | Not supported |

**Note**: Exact fees require direct contact with PayPlus sales.

### 3. API Integration

PayPlus provides:
- RESTful API for programmatic integration
- Payment Page UID for hosted checkout
- API Key authentication
- Webhooks for payment notifications
- SDKs for major e-commerce platforms

```typescript
// Example: PayPlus API initialization
const payplus = new PayPlus({
  apiKey: process.env.PAYPLUS_API_KEY,
  secretKey: process.env.PAYPLUS_SECRET_KEY,
  sandbox: process.env.NODE_ENV !== 'production'
});
```

### 4. Stripe vs PayPlus Strategy

**Recommendation: Use Both (Complementary)**

| Use Case | Provider |
|----------|----------|
| International cards | Stripe |
| Israeli cards + Bit | PayPlus |
| Apple Pay (Israel) | PayPlus |
| Apple Pay (International) | Stripe |
| Installments (תשלומים) | PayPlus |
| Recurring subscriptions | Stripe |

### 5. Settlement Timeline

| Provider | Settlement |
|----------|------------|
| PayPlus | T+1 to T+3 (Israeli banks) |
| Stripe | T+2 to T+7 (International) |

### 6. Security Certifications

- **PCI DSS Level 1**: Highest level of compliance
- Bank of Israel regulated
- Israeli Privacy Protection Authority compliant

---

## Technical Architecture

### Dual Payment Provider Setup

```typescript
// lib/payments/router.ts
export async function createCheckoutSession(
  order: Order,
  paymentMethod: 'card' | 'bit' | 'applepay'
): Promise<CheckoutSession> {
  // Route to appropriate provider
  if (paymentMethod === 'bit') {
    return payplus.createBitSession(order);
  }

  if (isIsraeliCard(order.billingCountry)) {
    return payplus.createCardSession(order);
  }

  // Default to Stripe for international
  return stripe.createCheckoutSession(order);
}
```

### Provider Detection

```typescript
// Detect optimal provider based on user location
function getPaymentProvider(country: string): 'stripe' | 'payplus' {
  return country === 'IL' ? 'payplus' : 'stripe';
}
```

---

## Implementation Considerations

### Advantages of PayPlus for Israeli Market

1. **Bit Integration**: 6+ million Israeli users
2. **Lower fees**: ~0.4% savings on Israeli transactions
3. **Installments**: Native support for credit installments
4. **Local support**: Hebrew support, Israeli business hours
5. **Faster settlement**: T+1 for Israeli banks

### Challenges

1. **Dual integration**: More code to maintain
2. **Webhook handling**: Two webhook endpoints
3. **Reporting**: Consolidated reporting needed
4. **Testing**: Two test environments

---

## Supabase Integration

```sql
-- Add payment provider tracking
ALTER TABLE footprint_orders
ADD COLUMN payment_provider VARCHAR(20) DEFAULT 'stripe',
ADD COLUMN payment_provider_id VARCHAR(255);

-- Payment provider values: 'stripe', 'payplus'
```

---

## Rollback Plan

If PayPlus integration fails:
1. **Immediate**: Route all payments to Stripe
2. **Short-term**: Disable Bit/local payment options
3. **Long-term**: Consider alternative Israeli providers

---

## CTO Decision

### [CTO-DECISION] PayPlus Integration - APPROVED

**Status**: ✅ APPROVED (Complementary to Stripe)

**Decision**: Implement PayPlus as a complementary payment provider for Israeli customers, alongside existing Stripe integration.

**Rationale**:
1. Bit support covers 6+ million Israeli users
2. Lower transaction fees for local payments
3. Native installment (תשלומים) support
4. Maintains Stripe for international customers

**Implementation Scope**:
- Add PayPlus as secondary provider for IL customers
- Enable Bit payment method
- Enable credit installments
- Keep Stripe as primary for international

**Priority**: P1 (After core Stripe integration in CO-02)

**Sprint Assignment**: Sprint 3 or 4

**New Story Required**:
- [CO-06] PayPlus Israeli Payment Integration

---

## Next Steps

1. PM to create CO-06 story in Linear
2. Backend-2 to implement after CO-02 (Stripe) completes
3. QA to test both payment paths

---

**Approved by**: CTO Agent
**Date**: 2025-12-21

---

*Research completed by CTO Agent - 2025-12-21*
