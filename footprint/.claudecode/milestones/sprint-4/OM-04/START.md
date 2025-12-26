# OM-04: Add Tracking Numbers

**Started**: 2025-12-26
**Agent**: Backend-2
**Branch**: feature/OM-04-tracking-numbers
**Linear ID**: UZF-1848
**Gate**: 2 - Build (Complete) → 3 - QA Validation

---

## Story Summary

Admin functionality to add tracking numbers to shipped orders with carrier selection and automatic customer notification email.

---

## Scope

### In Scope
- Tracking number management library with validation
- Support for Israel Post, DHL, FedEx, UPS, and Other carriers
- Tracking URL generation per carrier
- Admin API endpoint (PATCH /api/admin/orders/[id]/tracking)
- Customer notification email with tracking info

### Out of Scope
- Automatic tracking updates from carrier APIs
- SMS notifications (future enhancement)

---

## Acceptance Criteria

- [x] Tracking library with carrier validation
- [x] API endpoint validates tracking number format per carrier
- [x] Generates tracking URL for supported carriers
- [x] Sends customer notification email with tracking link
- [x] Tests written (TDD)
- [x] 96.66% coverage on tracking.ts
- [x] 15 API tests passing

---

## Technical Approach

1. Create tracking library with carrier-specific validation rules
2. Build admin API endpoint with auth, validation, and notification
3. Add Hebrew email template with tracking link button

---

## Files Created/Modified

| File | Action | Description |
|------|--------|-------------|
| lib/orders/tracking.ts | Create | Tracking validation and URL generation |
| lib/orders/tracking.test.ts | Create | 33 unit tests for tracking library |
| app/api/admin/orders/[id]/tracking/route.ts | Create | Admin API endpoint |
| app/api/admin/orders/[id]/tracking/route.test.ts | Create | 15 API tests |
| lib/email/resend.ts | Modify | Add sendTrackingNotificationEmail |

---

## Dependencies

### Blocked By
- OM-02: Update Order Status (provides status transition logic)

### Blocks
- None

---

## Test Plan

### Unit Tests (33 tests)
- Carrier validation (isValidCarrier)
- Tracking number format validation per carrier
- Tracking URL generation
- TrackingInfo creation

### API Tests (15 tests)
- Authentication and authorization
- Request validation
- Database operations
- Customer notification

---

## Safety Gate Progress

- [x] Gate 0: Research (N/A - no new external APIs)
- [x] Gate 1: Planning (this document)
- [x] Gate 2: Implementation (TDD) - **COMPLETE**
- [ ] Gate 3: QA Validation (Ready for handoff)
- [ ] Gate 4: Review
- [ ] Gate 5: Deployment

---

## Implementation Notes

### Carrier Tracking URL Patterns:
- Israel Post: `https://israelpost.co.il/itemtrace?itemcode={tracking}`
- DHL: `https://www.dhl.com/il-he/home/tracking.html?tracking-id={tracking}`
- FedEx: `https://www.fedex.com/fedextrack/?trknbr={tracking}`
- UPS: `https://www.ups.com/track?tracknum={tracking}`
- Other: null (no URL)

### Tracking Number Formats:
- Israel Post: RR/RL/EA/EE + 9 digits + IL (13 chars)
- DHL: 10 digits
- FedEx: 12-22 digits
- UPS: 1Z + 16 alphanumeric (18 chars)
- Other: any non-empty string

---

*Started by Backend-2 Agent - 2025-12-26*
