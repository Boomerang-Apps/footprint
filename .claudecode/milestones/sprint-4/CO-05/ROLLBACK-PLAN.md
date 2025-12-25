# CO-05: Apply Discount Codes - ROLLBACK PLAN

**Story**: CO-05
**Agent**: Backend-1
**Date**: 2025-12-25

---

## Rollback Strategy

### Quick Rollback (< 5 min)

```bash
# Revert to start tag
git checkout CO-05-start

# Or reset branch
git reset --hard CO-05-start
```

### Files to Restore

| File | Action | Notes |
|------|--------|-------|
| `stores/orderStore.ts` | Restore original | Remove discount validation state |
| `stores/orderStore.test.ts` | Restore/Delete | Remove new tests |
| `hooks/useDiscount.ts` | Delete | New file |
| `hooks/useDiscount.test.ts` | Delete | New file |

---

## Rollback Triggers

Rollback if ANY of the following occur:

1. **Store Breaking**: Existing orderStore tests fail
2. **Type Errors**: TypeScript errors in dependent files
3. **Runtime Errors**: Store hydration fails
4. **Test Failures**: Coverage drops below 80%
5. **Integration Issues**: Pricing calculations affected

---

## Verification After Rollback

```bash
# 1. Verify clean state
git status

# 2. Run tests
npm test

# 3. Type check
npm run type-check

# 4. Verify store works
npm run dev
# Navigate to /create and verify order flow works
```

---

## Impact Assessment

### Low Risk Changes
- Adding new state properties to store
- Creating new hook file
- Adding new tests

### Medium Risk Changes
- Modifying store persist configuration
- Changing pricing calculation flow

### Mitigation
- All changes are additive (not modifying existing logic)
- Existing `setDiscountCode` action preserved
- New state properties have sensible defaults

---

## Contact

If rollback needed, notify PM:
- Write to: `.claudecode/handoffs/pm-inbox.md`
- Include: Error details, steps to reproduce

---

**Prepared by**: Backend-1 Agent
