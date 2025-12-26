# OM-04: Add Tracking Numbers

**Started**: 2025-12-26
**Agent**: Backend-2
**Branch**: feature/OM-04-tracking-numbers
**Gate**: 1 - Planning
**Linear**: UZF-1848

---

## Story Summary

Implement admin functionality to add tracking numbers to shipped orders with carrier selection and automatic customer notification. Admin users can input tracking information and customers receive email notifications with tracking links.

---

## Scope

### In Scope
- PATCH /api/admin/orders/[id]/tracking - Add tracking number endpoint
- Carrier selection (Israel Post, DHL, FedEx, UPS, other)
- Tracking number validation per carrier
- Automatic customer notification email with tracking link
- Admin-only authorization
- Hebrew email template for tracking notification

### Out of Scope
- Real-time tracking status updates (future integration)
- Multiple tracking numbers per order (single shipment only)
- Automatic carrier detection (manual selection)
- Tracking page within app (links to carrier website)

---

## Supported Carriers

| Carrier | Code | Tracking URL Pattern |
|---------|------|---------------------|
| Israel Post | `israel_post` | https://israelpost.co.il/itemtrace?itemcode={tracking} |
| DHL | `dhl` | https://www.dhl.com/il-he/home/tracking.html?tracking-id={tracking} |
| FedEx | `fedex` | https://www.fedex.com/fedextrack/?trknbr={tracking} |
| UPS | `ups` | https://www.ups.com/track?tracknum={tracking} |
| Other | `other` | No auto-link (display number only) |

---

## Technical Approach

### 1. API Endpoint

```typescript
// PATCH /api/admin/orders/[id]/tracking
{
  "trackingNumber": "RR123456789IL",
  "carrier": "israel_post",
  "note": "Optional admin note"
}

// Response
{
  "success": true,
  "order": {
    "id": "...",
    "trackingNumber": "RR123456789IL",
    "carrier": "israel_post",
    "trackingUrl": "https://israelpost.co.il/itemtrace?itemcode=RR123456789IL",
    "updatedAt": "2025-12-26T12:00:00Z"
  },
  "notification": {
    "sent": true,
    "to": "customer@example.com"
  }
}
```

### 2. Tracking Data Model

Add to order record:
```typescript
{
  trackingNumber: string;
  carrier: CarrierCode;
  trackingUrl: string;
  trackingAddedAt: Date;
  trackingAddedBy: string;  // admin user id
}
```

### 3. Customer Notification

Email template includes:
- Order number
- Tracking number with copy button
- Direct link to carrier tracking page
- Estimated delivery reminder
- Customer service contact

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| footprint/lib/orders/tracking.ts | Create | Tracking logic and carrier URLs |
| footprint/lib/orders/tracking.test.ts | Create | TDD tests |
| footprint/app/api/admin/orders/[id]/tracking/route.ts | Create | API endpoint |
| footprint/app/api/admin/orders/[id]/tracking/route.test.ts | Create | API tests |
| footprint/lib/email/resend.ts | Modify | Add tracking notification email |

---

## Dependencies

### Uses Existing
- lib/orders/status.ts - May update status to 'shipped' if not already
- lib/email/resend.ts - Email infrastructure
- lib/supabase/server.ts - Authentication

### Blocked By
- None

### Blocks
- OM-01: Admin order dashboard (needs tracking display)

---

## Tracking Number Validation

| Carrier | Format | Example |
|---------|--------|---------|
| Israel Post | 13 chars, starts with RR/RL/EA/EE + 9 digits + IL | RR123456789IL |
| DHL | 10 digits | 1234567890 |
| FedEx | 12-22 digits | 123456789012 |
| UPS | 1Z + 16 alphanumeric | 1Z12345E0205271688 |
| Other | Any non-empty string | - |

---

## Acceptance Criteria

- [ ] Admin can add tracking number via API
- [ ] Carrier can be selected from supported list
- [ ] Tracking URL generated correctly per carrier
- [ ] Customer notified via email with tracking link
- [ ] Order status updated to 'shipped' if not already
- [ ] Non-admin requests rejected (401/403)
- [ ] Tests written (TDD approach)
- [ ] 80%+ coverage for new code
- [ ] TypeScript clean
- [ ] Lint clean

---

## Safety Gate Progress

- [x] Gate 0: Research (N/A - standard CRUD)
- [ ] Gate 1: Planning (this document)
- [ ] Gate 2: Implementation (TDD)
- [ ] Gate 3: QA Validation
- [ ] Gate 4: Review
- [ ] Gate 5: Deployment

---

*Started by Backend-2 Agent - 2025-12-26*
