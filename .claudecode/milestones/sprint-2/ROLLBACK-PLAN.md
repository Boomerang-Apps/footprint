# Rollback Plan: Sprint 2 - AI Style & Product Configuration

**Stories**: AI-01, PC-01, PC-02, PC-03, AI-03, AI-04
**Created**: 2025-12-22
**Agent**: Frontend-B
**Branch**: feature/sprint-2-style-config

---

## Rollback Scenarios

### Scenario 1: Tests Fail After Implementation

**Trigger**: Tests fail, cannot fix within reasonable time (>2 hours)

**Action**:
```bash
cd /Users/mymac/Desktop/footprint-worktrees/frontend-b
git checkout feature/UP-01-camera-upload  # Return to Sprint 1 branch
git branch -D feature/sprint-2-style-config
```

**Recovery Time**: < 5 minutes
**Impact**: No impact, feature branch only

---

### Scenario 2: Partial Implementation - Need to Restart

**Trigger**: Approach is wrong, need different implementation strategy

**Action**:
```bash
cd /Users/mymac/Desktop/footprint-worktrees/frontend-b
git tag sprint-2-restart-$(date +%Y%m%d-%H%M)  # Tag current state
git reset --hard sprint-2-start  # Reset to starting point
```

**Recovery Time**: < 5 minutes
**Impact**: Lost work on feature branch, can review tagged commit

---

### Scenario 3: Style Gallery Breaking UI

**Trigger**: Style gallery component breaks layout or performance issues

**Action**:
```bash
# Revert specific component commits
git log --oneline components/style-picker/
git revert [commit-hash]
```

**Recovery Time**: < 15 minutes
**Impact**: Style selection unavailable, users can skip to customize

---

### Scenario 4: Product Config State Issues

**Trigger**: Size/Paper/Frame selectors not updating orderStore correctly

**Action**:
```bash
# Revert product config components
git log --oneline components/product-config/
git revert [commit-hash]
# Fall back to hardcoded defaults in customize page
```

**Recovery Time**: < 15 minutes
**Impact**: Product configuration limited, orders use defaults

---

### Scenario 5: Merged but Breaking Production

**Trigger**: Bug discovered after merge to main

**Action**:
```bash
# In main worktree
cd /Users/mymac/Desktop/footprint
git revert [merge-commit-hash]
git push origin main
# Immediate deployment
```

**Recovery Time**: < 15 minutes
**Impact**: Brief disruption to style/config flow

---

## Pre-Rollback Checklist
- [ ] Document the issue clearly (screenshots, error logs)
- [ ] Notify PM Agent via pm-inbox.md
- [ ] Confirm no user data loss will occur
- [ ] Check if orderStore state needs cleanup

---

## Post-Rollback Actions
1. [ ] Update Sprint 2 story status in milestone
2. [ ] Document root cause in .claudecode/decisions/
3. [ ] Create follow-up story if needed
4. [ ] Notify QA Agent if already in testing
5. [ ] Update handoff in frontend-b-inbox.md

---

## Critical Files Affected by Rollback
- `components/style-picker/*` - Style gallery removed
- `components/product-config/*` - Config selectors removed
- `app/(app)/create/style/page.tsx` - Integration removed
- `app/(app)/create/customize/page.tsx` - Integration removed

## State Management Impact
- orderStore.selectedStyle reverts to default
- orderStore.size/paperType/frameType use defaults
- Users in progress keep uploaded images

---

## Maximum Rollback Time Target
**< 30 minutes from decision to restored state**

---

## Emergency Contacts
- **PM Agent**: Check `.claudecode/handoffs/pm-inbox.md`
- **CTO Agent**: For architecture issues
- **QA Agent**: If in testing phase

---

*Rollback plan created by Frontend-B Agent - 2025-12-22*
