# OM-02: Rollback Plan

**Story**: OM-02 - Update Order Status
**Branch**: feature/OM-02-order-status-update
**Created**: 2025-12-25

---

## Rollback Triggers

Execute rollback if any of the following occur:

1. **Critical Bug**: Status updates causing data corruption
2. **Notification Failure**: Emails not sending or sending incorrectly
3. **Authorization Bypass**: Non-admin users able to update status
4. **QA Rejection**: Failing acceptance criteria

---

## Rollback Steps

### Step 1: Revert to Tag

```bash
# Return to pre-implementation state
git checkout OM-02-start
```

### Step 2: Delete Feature Branch (if needed)

```bash
git branch -D feature/OM-02-order-status-update
```

### Step 3: Remove Created Files

Files that can be safely deleted:

```bash
rm -f footprint/lib/orders/status.ts
rm -f footprint/lib/orders/status.test.ts
rm -rf footprint/app/api/admin/orders/
```

### Step 4: Revert Email Changes

If lib/email/resend.ts was modified, revert those changes:

```bash
git checkout HEAD -- footprint/lib/email/resend.ts
```

### Step 5: Verify Clean State

```bash
npm run type-check
npm test
npm run lint
```

---

## Recovery Options

### Option A: Fix Forward
If the issue is minor, fix in a new commit rather than rolling back.

### Option B: Disable Notifications
If only notifications are failing, disable email sending while keeping status updates working.

### Option C: Full Rollback
Use the steps above for complete removal.

---

## Impact Assessment

| Component | Impact if Rolled Back |
|-----------|----------------------|
| Admin Dashboard | Cannot update order status (frontend unaffected) |
| Customer Emails | No status update notifications |
| Orders | Status remains unchanged (no data loss) |
| Database | No schema changes in this story |

---

## Notification

If rollback executed:
1. Update PM inbox with reason
2. Create new story for fix if needed
3. Document lessons learned

---

*Rollback plan created by Backend-2 Agent - 2025-12-25*
