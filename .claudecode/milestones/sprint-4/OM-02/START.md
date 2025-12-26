# OM-02: Update Order Status

**Started**: 2025-12-25
**Agent**: Backend-2
**Branch**: feature/OM-02-order-status-update
**Gate**: 2 - Implementation (COMPLETE)
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

- [x] Admin can update order status via API
- [x] Status dropdown values match OrderStatus type
- [x] Timestamp logged on each status change (updatedAt)
- [x] Customer notified via email on status change
- [x] Invalid status transitions rejected
- [x] Non-admin requests rejected (401/403)
- [x] Tests written (TDD approach)
- [x] 80%+ coverage for new code (100% on lib/orders/status.ts)
- [x] TypeScript clean (OM-02 files)
- [x] Lint clean (OM-02 files)

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
- [x] Gate 1: Planning (START.md, ROLLBACK-PLAN.md, tag OM-02-start)
- [x] Gate 2: Implementation (TDD - 50 tests, 100% lib coverage)
- [ ] Gate 3: QA Validation (PENDING)
- [x] Gate 4: Review (TypeScript clean, Lint clean)
- [ ] Gate 5: Deployment

---

*Started by Backend-2 Agent - 2025-12-25*
*Gate 2 completed - 2025-12-26*
