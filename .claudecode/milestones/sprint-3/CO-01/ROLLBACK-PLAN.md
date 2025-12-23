# Rollback Plan: CO-01 - Enter Shipping Address

**Story**: CO-01
**Created**: 2025-12-23
**Agent**: Frontend-B
**Branch**: feature/co-01-shipping-address

---

## Rollback Scenarios

### Scenario 1: Tests Fail After Implementation

**Trigger**: Tests fail, cannot fix within reasonable time

**Action**:
```bash
cd /Users/mymac/Desktop/footprint-worktrees/frontend-b
git checkout feature/gf-02-gift-message
git branch -D feature/co-01-shipping-address
```

**Recovery Time**: < 5 minutes
**Impact**: No impact, feature branch only

---

### Scenario 2: Validation Breaking Form Submission

**Trigger**: Validation too strict, users cannot submit

**Action**:
```bash
# Relax validation rules temporarily
# Or disable validation and fix
git revert [commit-hash]
```

**Recovery Time**: < 10 minutes
**Impact**: Form works, validation disabled

---

### Scenario 3: State Management Issues

**Trigger**: shippingAddress not updating in orderStore

**Action**:
```bash
# Use existing checkout page form
git revert [commit-hash]
```

**Recovery Time**: < 10 minutes
**Impact**: Use existing form, no new component

---

## Pre-Rollback Checklist
- [ ] Document the issue
- [ ] Notify PM Agent
- [ ] Confirm checkout flow still works
- [ ] Check orderStore state

---

## Post-Rollback Actions
1. [ ] Update CO-01 story status
2. [ ] Document root cause
3. [ ] Notify QA if in testing

---

## Critical Files
- `components/checkout/ShippingAddressForm.tsx`
- `app/(app)/create/checkout/page.tsx`

## State Impact
- orderStore.shippingAddress (Address | null)

---

## Maximum Rollback Time Target
**< 10 minutes**

---

*Rollback plan created by Frontend-B Agent - 2025-12-23*
