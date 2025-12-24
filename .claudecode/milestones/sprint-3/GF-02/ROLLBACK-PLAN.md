# Rollback Plan: GF-02 - Add Personal Message

**Story**: GF-02
**Created**: 2025-12-23
**Agent**: Frontend-B
**Branch**: feature/gf-02-gift-message

---

## Rollback Scenarios

### Scenario 1: Tests Fail After Implementation

**Trigger**: Tests fail, cannot fix within reasonable time

**Action**:
```bash
cd /Users/mymac/Desktop/footprint-worktrees/frontend-b
git checkout feature/gf-01-gift-toggle
git branch -D feature/gf-02-gift-message
```

**Recovery Time**: < 5 minutes
**Impact**: No impact, feature branch only

---

### Scenario 2: Message Preview Breaking Layout

**Trigger**: Preview component causes layout issues on customize page

**Action**:
```bash
git revert [commit-hash]
# Or use existing inline textarea without preview
```

**Recovery Time**: < 10 minutes
**Impact**: Message input works, preview unavailable

---

### Scenario 3: State Management Issues

**Trigger**: giftMessage not saving/loading correctly

**Action**:
```bash
# Revert to inline textarea
git revert [commit-hash]
```

**Recovery Time**: < 10 minutes
**Impact**: Use basic textarea, no preview

---

## Pre-Rollback Checklist
- [ ] Document the issue
- [ ] Notify PM Agent
- [ ] Confirm gift toggle still works
- [ ] Check orderStore state

---

## Post-Rollback Actions
1. [ ] Update GF-02 story status
2. [ ] Document root cause
3. [ ] Notify QA if in testing

---

## Critical Files
- `components/gift/GiftMessage.tsx`
- `app/(app)/create/customize/page.tsx`

## State Impact
- orderStore.giftMessage (string, remains functional)

---

## Maximum Rollback Time Target
**< 10 minutes**

---

*Rollback plan created by Frontend-B Agent - 2025-12-23*
