# START.md - CO-04: Order Confirmation

**Story**: CO-04
**Sprint**: 3
**Agent**: Backend-2
**Story Points**: 2
**Priority**: P1
**Created**: 2025-12-23

---

## Story Description

Implement order confirmation functionality including:
1. Email confirmation sent after successful payment
2. Order number displayed on confirmation page
3. WhatsApp share option for order details

---

## Acceptance Criteria

- [ ] Email sent after successful payment
- [ ] Order number generated and displayed
- [ ] Email includes order details (items, total, shipping address)
- [ ] WhatsApp share link available
- [ ] Confirmation page shows order summary

---

## Scope

### In Scope
- Email service integration (Resend or similar)
- Order confirmation email template
- Confirmation API endpoint (triggered by payment webhook)
- WhatsApp share URL generation
- Order number generation

### Out of Scope
- SMS notifications
- Push notifications
- Email marketing/newsletters
- Order tracking (separate story)

---

## Technical Approach

### 1. Email Service (`lib/email/`)

```typescript
// lib/email/resend.ts
export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderNumber: string;
  orderDetails: OrderDetails;
}): Promise<void>;
```

### 2. Order Confirmation Flow

```
1. Payment successful (PayPlus webhook)
2. Webhook handler updates order to 'paid'
3. Webhook triggers sendOrderConfirmationEmail()
4. User redirected to /create/complete
5. Confirmation page displays order number + WhatsApp link
```

### 3. WhatsApp Share

```typescript
// Generate WhatsApp share URL
function getWhatsAppShareUrl(orderNumber: string, message: string): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/?text=${text}`;
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `lib/email/resend.ts` | Email service client |
| `lib/email/resend.test.ts` | Unit tests |
| `lib/email/templates/order-confirmation.tsx` | Email template (React Email) |
| `app/api/orders/[id]/confirm/route.ts` | Confirmation endpoint |
| `app/api/orders/[id]/confirm/route.test.ts` | API tests |

## Files to Modify

| File | Change |
|------|--------|
| `app/api/webhooks/payplus/route.ts` | Trigger email after payment |
| `app/(app)/create/complete/page.tsx` | Display order number + WhatsApp |

---

## Environment Variables Required

```bash
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=orders@footprint.co.il
```

---

## Dependencies

- `resend` - Email service provider
- `@react-email/components` - Email templates (optional)

---

## Testing Strategy (TDD)

### Unit Tests (`lib/email/resend.test.ts`)
1. sendOrderConfirmationEmail sends email with correct parameters
2. sendOrderConfirmationEmail handles API errors gracefully
3. Email template includes order number
4. Email template includes order items
5. Email template includes shipping address

### API Tests (`app/api/orders/[id]/confirm/route.test.ts`)
1. Returns 401 for unauthenticated users
2. Returns 404 for non-existent order
3. Returns 403 for order not owned by user
4. Returns 200 and sends email for valid order
5. Returns order details with WhatsApp share URL

---

## Security Checklist

- [ ] RESEND_API_KEY in environment only
- [ ] Email recipient validated (user's email)
- [ ] Order ownership verified before sending
- [ ] No sensitive data in WhatsApp message (no payment details)

---

## Rollback Trigger Conditions

- Email service API failing
- Email delivery issues
- Security vulnerability discovered

---

**Gate 1 Status**: READY FOR IMPLEMENTATION

*Created by Backend-2 Agent - 2025-12-23*
