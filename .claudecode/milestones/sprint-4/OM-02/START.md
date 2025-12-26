# OM-02: Update Order Status

**Started**: 2025-12-25
**Agent**: Backend-2
**Branch**: feature/OM-02-order-status-update
**Gate**: 1 - Planning
**Linear**: UZF-1846

---

## Story Summary

Implement admin functionality to update order status with timestamp logging and customer notification. Admin users can change order status (e.g., processing -> printing -> shipped), and customers receive email notifications about status changes.

---

## Scope

### In Scope
- PATCH /api/admin/orders/[id]/status - Update order status endpoint
- Valid status transitions enforcement
- Timestamp logging (updatedAt field)
- Status change history tracking
- Customer notification email on status change
- Admin-only authorization
- Hebrew status labels for customer notifications

### Out of Scope
- Frontend admin UI (OM-01, Frontend-B)
- Tracking number management (OM-04)
- Bulk status updates (future story)
- WebSocket real-time updates (future story)

---

## Order Status Flow

```
pending -> paid -> processing -> printing -> shipped -> delivered
                                    |
                                    v
                               cancelled
```

Valid statuses: `pending`, `paid`, `processing`, `printing`, `shipped`, `delivered`, `cancelled`

---

## Acceptance Criteria

- [ ] Admin can update order status via API
- [ ] Status dropdown values match OrderStatus type
- [ ] Timestamp logged on each status change (updatedAt)
- [ ] Customer notified via email on status change
- [ ] Invalid status transitions rejected
- [ ] Non-admin requests rejected (401/403)
- [ ] Tests written (TDD approach)
- [ ] 80%+ coverage for new code
- [ ] TypeScript clean
- [ ] Lint clean

---

## Technical Approach

### 1. API Endpoint

```typescript
// PATCH /api/admin/orders/[id]/status
{
  "status": "shipped",
  "note": "Optional admin note"  // optional
}

// Response
{
  "success": true,
  "order": {
    "id": "...",
    "status": "shipped",
    "updatedAt": "2025-12-25T12:00:00Z"
  },
  "notification": {
    "sent": true,
    "to": "customer@example.com"
  }
}
```

### 2. Status Change History

Add to order record:
```typescript
statusHistory: Array<{
  status: OrderStatus,
  timestamp: Date,
  changedBy: string,  // admin user id
  note?: string
}>
```

### 3. Customer Notification

Email template includes:
- Order number
- New status with Hebrew label
- Estimated delivery (for shipped status)
- Customer service contact

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| footprint/lib/orders/status.ts | Create | Status update logic and validation |
| footprint/lib/orders/status.test.ts | Create | TDD tests |
| footprint/app/api/admin/orders/[id]/status/route.ts | Create | API endpoint |
| footprint/app/api/admin/orders/[id]/status/route.test.ts | Create | API tests |
| footprint/lib/email/resend.ts | Modify | Add status update email template |

---

## Dependencies

### Blocked By
- None

### Blocks
- OM-01: Admin order dashboard (needs status update API)

---

## Status Labels (Hebrew)

| Status | Hebrew Label |
|--------|-------------|
| pending | ממתין לתשלום |
| paid | שולם |
| processing | בטיפול |
| printing | בהדפסה |
| shipped | נשלח |
| delivered | נמסר |
| cancelled | בוטל |

---

## Safety Gate Progress

- [x] Gate 0: Research (N/A - standard CRUD)
- [ ] Gate 1: Planning (this document)
- [ ] Gate 2: Implementation (TDD)
- [ ] Gate 3: QA Validation
- [ ] Gate 4: Review
- [ ] Gate 5: Deployment

---

*Started by Backend-2 Agent - 2025-12-25*
