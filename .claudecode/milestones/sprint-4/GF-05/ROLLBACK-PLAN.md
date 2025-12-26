# Rollback Plan: GF-05

**Story**: GF-05 - Scheduled Delivery Date
**Created**: 2025-12-26
**Agent**: Backend-1

---

## Rollback Scenarios

### Scenario 1: Tests Fail After Implementation

**Trigger**: Tests fail, cannot fix within reasonable time

**Action**:
```bash
git checkout main
git branch -D feature/gf-05-scheduled-delivery
```

**Recovery Time**: < 5 minutes

---

### Scenario 2: Partial Implementation - Need to Restart

**Trigger**: Approach is wrong, need different implementation

**Action**:
```bash
git log --oneline -5  # Find last good commit
git reset --hard [commit-hash]
```

**Recovery Time**: < 5 minutes

---

### Scenario 3: Merged but Breaking Production

**Trigger**: Bug discovered after merge

**Action**:
```bash
git revert [merge-commit-hash]
git push origin main
```

**Recovery Time**: < 15 minutes

---

### Scenario 4: Delivery Date Validation Logic Error

**Trigger**: Business day calculation produces incorrect dates

**Action**:
```bash
# Revert specific commit if isolated
git revert [commit-hash]

# Or disable feature temporarily by resetting state
# Frontend can check if scheduledDeliveryDate is always null
```

**Recovery Time**: < 10 minutes

---

## Pre-Rollback Checklist
- [ ] Document the issue clearly
- [ ] Notify PM Agent
- [ ] Notify CTO if security-related
- [ ] Confirm no data loss will occur

---

## Post-Rollback Actions
1. [ ] Update story status in dev-progress.ts
2. [ ] Document root cause
3. [ ] Create follow-up story if needed
4. [ ] Clear any persisted scheduledDeliveryDate from localStorage

---

## Files That Can Be Safely Reverted

| File | Impact of Revert |
|------|------------------|
| `stores/orderStore.ts` | Remove delivery date state - no other features affected |
| `lib/delivery/dates.ts` | Remove utility - only used by orderStore |
| `types/order.ts` | Remove scheduledDeliveryDate field - backwards compatible |

---

## Maximum Rollback Time Target
**< 30 minutes from decision to restored state**

---

*Rollback plan created by Backend-1 Agent - 2025-12-26*
