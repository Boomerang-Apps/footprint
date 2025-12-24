# Research: PayPlus Payment Integration (CO-02)

**Date**: 2025-12-23 (Updated)
**Author**: Backend-2 Agent (Gate 0 Research)
**Story**: CO-02 (Payment Integration)
**Gate**: 0 - Research
**Status**: PENDING CTO APPROVAL

---

## Objective

Implement PayPlus as the **PRIMARY** payment provider for Footprint. PayPlus handles all Israeli market payments including credit cards, Bit, and installments.

**Note**: Paddle may be added later as secondary provider for international customers.

---

## API Documentation Summary

### Base URLs

| Environment | URL |
|-------------|-----|
| **Staging** | `https://restapidev.payplus.co.il/api/v1.0/` |
| **Production** | `https://restapi.payplus.co.il/api/v1.0/` |

### Authentication

All requests require two headers:
```
api_key: {your_api_key}
secret_key: {your_secret_key}
```

### Key Endpoint: Generate Payment Link

**Endpoint**: `POST /PaymentPages/generateLink`

**Request Body**:
```json
{
  "payment_page_uid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "charge_method": 1,
  "amount": 15800,
  "currency_code": "ILS",
  "customer": {
    "customer_name": "John Doe",
    "email": "customer@example.com",
    "phone": "0501234567"
  },
  "refURL_callback": "https://footprint.co.il/api/webhooks/payplus",
  "refURL_success": "https://footprint.co.il/create/complete",
  "refURL_failure": "https://footprint.co.il/create/checkout?error=payment_failed",
  "more_info": "order_123",
  "more_info_1": "additional_data"
}
```

**Charge Method Values**:
| Value | Type | Description |
|-------|------|-------------|
| 0 | Card Check (J2) | Validates card without charging |
| 1 | Charge (J4) | Immediate payment |
| 2 | Approval (J5) | Authorization hold |
| 3 | Recurring | Setup recurring payments |
| 4 | Refund | Immediate refund |
| 5 | Token Charge | Charge saved token |

**Response**:
```json
{
  "results": {
    "status": "success",
    "code": 0,
    "description": "payment page link has been generated"
  },
  "data": {
    "page_request_uid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "payment_page_link": "https://payments.payplus.co.il/..."
  }
}
```

### Webhook Callback Validation

PayPlus sends transaction results to `refURL_callback`. Validate authenticity:

**Required Headers**:
- `hash`: HMAC-SHA256 signature (base64)
- `user-agent`: Must equal `"PayPlus"`

**Validation Code**:
```typescript
import crypto from 'crypto';

function validatePayPlusWebhook(
  body: string,
  hash: string,
  secretKey: string
): boolean {
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(body)
    .digest('base64');

  return computedHash === hash;
}
```

### Test Cards (Sandbox)

| Card Number | Result | Expiry | CVV |
|-------------|--------|--------|-----|
| 5326-1402-8077-9844 | Success | 05/26 | 000 |
| 5326-1402-0001-0120 | Decline | 05/26 | 000 |

---

## Payment Methods Supported

| Method | Supported | Notes |
|--------|-----------|-------|
| Credit Cards | Yes | Visa, Mastercard, Isracard, Diners |
| Bit | Yes | #1 APM in Israel (6M+ users) |
| Apple Pay | Yes | Native support |
| Google Pay | Yes | Native support |
| Hever | Yes | Israeli club card |
| Installments (תשלומים) | Yes | Native Israeli credit installments |

---

## Environment Variables Required

```bash
# PayPlus Credentials
PAYPLUS_API_KEY=your_api_key
PAYPLUS_SECRET_KEY=your_secret_key
PAYPLUS_PAYMENT_PAGE_UID=your_payment_page_uid

# Environment
PAYPLUS_SANDBOX=true  # false for production
```

---

## Implementation Architecture

### File Structure
```
lib/payments/
├── payplus.ts          # PayPlus API client
├── payplus.test.ts     # Unit tests
└── types.ts            # TypeScript interfaces

app/api/
├── checkout/
│   └── route.ts        # Create payment session
└── webhooks/
    └── payplus/
        └── route.ts    # Handle PayPlus callbacks
```

### TypeScript Interfaces

```typescript
interface PayPlusConfig {
  apiKey: string;
  secretKey: string;
  paymentPageUid: string;
  sandbox: boolean;
}

interface CreatePaymentParams {
  orderId: string;
  amount: number;  // in agorot (ILS cents)
  customerEmail: string;
  customerName: string;
  successUrl: string;
  failureUrl: string;
  callbackUrl: string;
}

interface PaymentLinkResponse {
  pageRequestUid: string;
  paymentPageLink: string;
}

interface WebhookPayload {
  transaction_uid: string;
  page_request_uid: string;
  status_code: string;
  amount: number;
  more_info: string;  // orderId
}
```

---

## Security Considerations

1. **PCI DSS Level 1**: PayPlus is fully PCI compliant
2. **Server-side only**: All API calls must be server-side
3. **Webhook verification**: Always validate `hash` and `user-agent`
4. **HTTPS only**: All endpoints use TLS

---

## Rollback Plan

If PayPlus integration fails:
1. **Immediate**: Display "payment unavailable" message
2. **Short-term**: Enable Paddle fallback (if implemented)
3. **Long-term**: Contact PayPlus support or consider alternatives

---

## Documentation Sources

- [PayPlus Introduction](https://docs.payplus.co.il/reference/introduction)
- [REST API URLs](https://docs.payplus.co.il/reference/payplus-rest-api-urls)
- [Generate Payment Link](https://docs.payplus.co.il/reference/post_paymentpages-generatelink)
- [Webhook Validation](https://docs.payplus.co.il/reference/validate-requests-received-from-payplus)
- [PayPlus GitHub](https://github.com/PayPlus-Gateway)

---

## CTO Decision Required

### Questions for CTO:

1. **Confirm PayPlus as PRIMARY** (replacing Stripe)?
2. **Paddle for international** - implement now or defer?
3. **Installments (תשלומים)** - enable in v1?
4. **Bit integration** - enable in v1?

---

**Submitted by**: Backend-2 Agent
**Date**: 2025-12-23
**Status**: PENDING CTO APPROVAL

---

*Gate 0 Research - Awaiting CTO review*
