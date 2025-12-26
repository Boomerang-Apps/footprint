# OM-04 Rollback Plan

## Commit Reference
- Feature commit: `0e32eba5`
- Start tag: `OM-04-start`
- Branch: `feature/OM-04-tracking-numbers`

## Rollback Steps

### Option 1: Revert Commit
```bash
git revert 0e32eba5
```

### Option 2: Full Branch Rollback
```bash
git checkout main
git branch -D feature/OM-04-tracking-numbers
```

### Option 3: Cherry-pick Revert (if merged)
```bash
git checkout main
git revert <merge-commit-hash>
```

## Files to Remove (if manual cleanup needed)
- lib/orders/tracking.ts
- lib/orders/tracking.test.ts
- app/api/admin/orders/[id]/tracking/route.ts
- app/api/admin/orders/[id]/tracking/route.test.ts

## Files to Restore (modifications)
- lib/email/resend.ts (remove sendTrackingNotificationEmail)

## Database Changes
- None (uses existing orders table fields)

## Verification After Rollback
1. Run `npm test` - all existing tests should pass
2. Verify admin dashboard works without tracking feature
3. Confirm email service still sends other notification types

---

*Created by Backend-2 Agent - 2025-12-26*
