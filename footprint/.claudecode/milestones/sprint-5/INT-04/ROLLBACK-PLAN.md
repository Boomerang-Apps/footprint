# INT-04: Rollback Plan

**Story**: INT-04 - Create Order on Payment Success
**Agent**: Backend-2
**Branch**: feature/INT-04-order-on-payment
**Start Tag**: INT-04-start

---

## Rollback Triggers

Execute rollback if ANY of these occur:
- [ ] Order creation fails silently (payments succeed but no orders)
- [ ] Duplicate orders created from same payment
- [ ] Confirmation emails not sent
- [ ] Tests cannot achieve 80% coverage
- [ ] TypeScript errors cannot be resolved
- [ ] Database operations cause webhook timeouts
- [ ] Webhook handlers start returning 500 errors

---

## Rollback Steps

### Step 1: Revert to Start Tag
```bash
# Ensure we're on the feature branch
git checkout feature/INT-04-order-on-payment

# Reset to starting point
git reset --hard INT-04-start
```

### Step 2: Remove New Files
```bash
# Files created by this story (safe to delete)
rm -f footprint/lib/orders/create.ts
rm -f footprint/lib/orders/create.test.ts
```

### Step 3: Revert Modified Files
```bash
# Restore webhook handlers to original state
git checkout INT-04-start -- footprint/app/api/webhooks/stripe/route.ts
git checkout INT-04-start -- footprint/app/api/webhooks/payplus/route.ts
```

### Step 4: Verify Clean State
```bash
# Run tests to ensure no regressions
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

---

## Files Safe to Delete

| File | Reason |
|------|--------|
| `lib/orders/create.ts` | New file, no other dependencies |
| `lib/orders/create.test.ts` | Test file only |

---

## Files Modified (Need Careful Revert)

| File | Changes | Revert Method |
|------|---------|---------------|
| `app/api/webhooks/stripe/route.ts` | Added createOrder call | Restore from tag |
| `app/api/webhooks/payplus/route.ts` | Added createOrder call | Restore from tag |

---

## Critical: Payment Safety

**IMPORTANT**: Webhooks must continue to return 200 OK even if order creation fails. Payment processors will retry failed webhooks, potentially causing issues.

If rollback is needed mid-implementation:
1. Ensure webhook handlers still return 200 for valid signatures
2. Order creation failures should log but not fail the webhook
3. Payments should never be affected by order creation issues

---

## Notification on Rollback

If rollback is executed, notify:
1. PM Agent via `.claudecode/handoffs/pm-inbox.md`
2. Include:
   - Reason for rollback
   - Trigger that caused it
   - Impact on payments (should be none)
   - Recommended next steps

### Rollback Notification Template

```markdown
## [DATE] - Backend-2: INT-04 ROLLBACK

**Story**: INT-04 - Create Order on Payment Success
**Status**: ROLLED BACK

### Reason
[Describe trigger that caused rollback]

### Payment Impact
- No impact on payment processing
- Webhooks still return 200 OK
- Payments recorded in payment provider

### Actions Taken
- Reverted to INT-04-start tag
- Removed new files
- Restored webhook handlers

### Recommendation
[Suggest alternative approach or blocker resolution]
```

---

## Alternative Approaches (If Rollback Needed)

1. **Async order creation**: Queue order creation instead of inline
2. **Separate endpoint**: Create `/api/orders/create-from-payment` endpoint
3. **Database trigger**: Use Supabase function to create order
4. **Manual reconciliation**: Create orders manually from payment logs

---

*Rollback plan created by Backend-2 Agent - 2025-12-26*
