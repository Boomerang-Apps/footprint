# Rollback Plan: UP-01

**Story**: UP-01 - Upload Photo from Camera Roll
**Created**: 2025-12-21
**Agent**: Frontend-B

---

## Rollback Scenarios

### Scenario 1: Tests Fail After Implementation

**Trigger**: Tests fail, cannot fix within reasonable time (>2 hours)

**Action**:
```bash
cd /Users/mymac/Desktop/footprint-worktrees/frontend-b
git checkout agent/frontend-b
git branch -D feature/UP-01-camera-upload
```

**Recovery Time**: < 5 minutes
**Impact**: No impact, feature branch only

---

### Scenario 2: Partial Implementation - Need to Restart

**Trigger**: Approach is wrong, need different implementation strategy

**Action**:
```bash
cd /Users/mymac/Desktop/footprint-worktrees/frontend-b
git tag UP-01-restart-$(date +%Y%m%d-%H%M)  # Tag current state for reference
git reset --hard UP-01-start  # Reset to starting point
```

**Recovery Time**: < 5 minutes
**Impact**: Lost work on feature branch, can review tagged commit

---

### Scenario 3: File Upload Breaking on Specific Devices

**Trigger**: Component works in tests but fails on real devices (iOS/Android)

**Action**:
```bash
# Revert specific component commits
git log --oneline components/upload/CameraRollUpload.tsx
git revert [commit-hash]
# Notify PM and create bug ticket
```

**Recovery Time**: < 15 minutes
**Impact**: Upload feature unavailable, users cannot create orders

---

### Scenario 4: Merged but Breaking Production

**Trigger**: Bug discovered after merge to main (file size validation fails, HEIC not supported, etc.)

**Action**:
```bash
# In main worktree
cd /Users/mymac/Desktop/footprint
git revert [merge-commit-hash]
git push origin main
# Immediate deployment
# Create hotfix story
```

**Recovery Time**: < 15 minutes
**Impact**: Brief disruption to upload functionality

---

## Pre-Rollback Checklist
- [ ] Document the issue clearly (screenshots, error logs)
- [ ] Notify PM Agent via pm-inbox.md
- [ ] Notify CTO if security-related (file upload vulnerabilities)
- [ ] Confirm no user data loss will occur
- [ ] Check if orderStore state needs cleanup

---

## Post-Rollback Actions
1. [ ] Update UP-01 story status in sprint-1 milestone
2. [ ] Document root cause in .claudecode/decisions/
3. [ ] Create follow-up story if needed (e.g., UP-01-fix)
4. [ ] Notify QA Agent if already in testing
5. [ ] Update handoff in frontend-b-inbox.md

---

## Critical Files Affected by Rollback
- `components/upload/CameraRollUpload.tsx` - Component removed
- `app/(app)/create/page.tsx` - Integration removed
- `types/upload.ts` - Types may be orphaned if used elsewhere

## State Management Impact
- orderStore.originalImage will be set to null
- Users in progress will lose uploaded images

---

## Maximum Rollback Time Target
**< 30 minutes from decision to restored state**

---

## Emergency Contacts
- **PM Agent**: Check `.claudecode/handoffs/pm-inbox.md`
- **CTO Agent**: For security/architecture issues
- **QA Agent**: If in testing phase

---

*Rollback plan created by Frontend-B Agent - 2025-12-21*
