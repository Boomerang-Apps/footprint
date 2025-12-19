# Rollback Plan: STORY-ID

**Story**: STORY-ID - [Title]
**Created**: YYYY-MM-DD
**Agent**: [Agent Name]

---

## Rollback Scenarios

### Scenario 1: Tests Fail After Implementation

**Trigger**: Tests fail, cannot fix within reasonable time

**Action**:
```bash
git checkout develop
git branch -D feature/STORY-ID-description
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
git push origin develop
```

**Recovery Time**: < 15 minutes

---

## Pre-Rollback Checklist
- [ ] Document the issue clearly
- [ ] Notify PM Agent
- [ ] Notify CTO if security-related
- [ ] Confirm no data loss will occur

---

## Post-Rollback Actions
1. [ ] Update story status
2. [ ] Document root cause
3. [ ] Create follow-up story if needed

---

## Maximum Rollback Time Target
**< 30 minutes from decision to restored state**

---

*Rollback plan created by [Agent Name] - YYYY-MM-DD*
