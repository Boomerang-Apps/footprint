# Rollback Plan: RZ-XXX

**Story**: RZ-XXX - [Title]
**Created**: YYYY-MM-DD
**Agent**: [Agent Name]

---

## Overview

This document describes how to safely rollback RZ-XXX if issues are discovered.

---

## Rollback Scenarios

### Scenario 1: Tests Fail After Implementation

**Trigger**: Tests fail, cannot fix within reasonable time

**Action**:
```bash
# Discard all changes and return to develop
git checkout develop
git branch -D feature/RZ-XXX-description
```

**Recovery Time**: < 5 minutes

---

### Scenario 2: Partial Implementation - Need to Restart

**Trigger**: Approach is wrong, need different implementation

**Action**:
```bash
# Reset to last good commit
git log --oneline -5  # Find last good commit
git reset --hard [commit-hash]
```

**Recovery Time**: < 5 minutes

---

### Scenario 3: Merged but Breaking Production

**Trigger**: Bug discovered after merge to develop/main

**Action**:
```bash
# Create revert commit
git revert [merge-commit-hash]
git push origin develop
```

**Recovery Time**: < 15 minutes

---

### Scenario 4: Database Migration Issue

**Trigger**: Schema change causes data issues

**Action**:
```bash
# Revert Supabase migration
supabase db reset  # Local only
# For production: Contact CTO for manual rollback
```

**Recovery Time**: < 30 minutes (local), TBD (production)

---

## Pre-Rollback Checklist

Before rolling back:

- [ ] Document the issue clearly
- [ ] Notify PM Agent
- [ ] Notify CTO if security-related
- [ ] Take screenshots/logs if applicable
- [ ] Confirm no data loss will occur

---

## Post-Rollback Actions

After rollback:

1. [ ] Update story status in Linear
2. [ ] Document root cause in handoff
3. [ ] Create follow-up story if needed
4. [ ] Notify affected agents

---

## Contacts

| Role | Escalation |
|------|------------|
| PM Agent | All rollbacks |
| CTO Agent | Security issues, data issues |
| QA Agent | Test failures |

---

## Files That May Need Manual Cleanup

| File | Reason |
|------|--------|
| path/to/file | Description |

---

## Maximum Rollback Time Target

**< 30 minutes from decision to restored state**

---

*Rollback plan created by [Agent Name] - YYYY-MM-DD*
