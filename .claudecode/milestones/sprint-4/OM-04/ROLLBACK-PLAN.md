# OM-04: Rollback Plan

**Story**: OM-04 - Add Tracking Numbers
**Branch**: feature/OM-04-tracking-numbers
**Created**: 2025-12-26

---

## Rollback Triggers

Execute rollback if any of the following occur:

1. **Critical Bug**: Tracking updates corrupting order data
2. **Notification Failure**: Emails not sending or sending incorrect tracking
3. **Authorization Bypass**: Non-admin users able to add tracking
4. **Invalid URLs**: Generated tracking URLs are broken
5. **QA Rejection**: Failing acceptance criteria

---

## Rollback Steps

### Step 1: Revert to Tag

```bash
# Return to pre-implementation state
git checkout OM-04-start
```

### Step 2: Delete Feature Branch (if needed)

```bash
git branch -D feature/OM-04-tracking-numbers
```

### Step 3: Remove Created Files

Files that can be safely deleted:

```bash
rm -f footprint/lib/orders/tracking.ts
rm -f footprint/lib/orders/tracking.test.ts
rm -rf footprint/app/api/admin/orders/[id]/tracking/
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
If only notifications are failing, disable email sending while keeping tracking updates working.

### Option C: Full Rollback
Use the steps above for complete removal.

---

## Impact Assessment

| Component | Impact if Rolled Back |
|-----------|----------------------|
| Admin Dashboard | Cannot add tracking numbers (frontend unaffected) |
| Customer Emails | No tracking notifications sent |
| Orders | Tracking data not stored (no data loss) |
| Database | No schema changes in this story |

---

## Notification

If rollback executed:
1. Update PM inbox with reason
2. Create new story for fix if needed
3. Document lessons learned

---

*Rollback plan created by Backend-2 Agent - 2025-12-26*
