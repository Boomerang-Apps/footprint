# Rollback Plan: PC-04

**Story**: PC-04 - Real-Time Price Calculation
**Created**: 2025-12-22
**Agent**: Backend-1

---

## Rollback Scenarios

### Scenario 1: Tests Fail After Implementation

**Trigger**: Tests fail, cannot fix within reasonable time

**Action**:
```bash
git checkout main
git branch -D agent/backend-1
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

### Scenario 3: Pricing Logic Incorrect After Merge

**Trigger**: Wrong prices displayed after merge

**Action**:
```bash
git revert [merge-commit-hash]
git push origin main
```

**Recovery Time**: < 15 minutes

---

## Pre-Rollback Checklist
- [ ] Document the issue clearly
- [ ] Notify PM Agent
- [ ] Confirm no orders affected
- [ ] Confirm no data loss will occur

---

## Post-Rollback Actions
1. [ ] Update story status
2. [ ] Document root cause
3. [ ] Create follow-up story if needed

---

## Files to Remove on Full Rollback
```
lib/pricing/
├── calculator.ts
├── calculator.test.ts
├── shipping.ts
├── shipping.test.ts
├── discounts.ts
├── discounts.test.ts
└── index.ts
```

---

## Maximum Rollback Time Target
**< 30 minutes from decision to restored state**

---

*Rollback plan created by Backend-1 Agent - 2025-12-22*
