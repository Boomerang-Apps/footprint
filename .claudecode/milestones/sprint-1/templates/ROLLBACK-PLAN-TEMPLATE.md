# ROLLBACK-PLAN.md Template

Copy this template to your story directory and fill in the details.

---

# [STORY-ID] Rollback Plan

**Story**: [STORY-ID]
**Title**: [Story Title]
**Agent**: [Your Agent Name]
**Date**: [YYYY-MM-DD]

---

## Purpose

This document defines how to safely rollback changes if implementation fails or causes issues.

---

## Git Rollback Commands

```bash
# Option 1: Reset to start tag (preserves files as uncommitted)
git reset [STORY-ID]-start

# Option 2: Hard reset (discards all changes)
git reset --hard [STORY-ID]-start

# Option 3: Revert specific commits
git revert <commit-hash>
```

---

## Files Created (Safe to Delete)

These files were created by this story and can be safely deleted:

| File | Purpose |
|------|---------|
| `path/to/new-file.ts` | [Purpose] |
| `path/to/new-file.test.ts` | [Tests] |

```bash
# Delete created files
rm path/to/new-file.ts
rm path/to/new-file.test.ts
```

---

## Files Modified (Need Revert)

These existing files were modified:

| File | Changes Made |
|------|--------------|
| `path/to/existing.ts` | [What was changed] |

To revert:
```bash
git checkout [STORY-ID]-start -- path/to/existing.ts
```

---

## Dependencies Added

| Package | Command to Remove |
|---------|-------------------|
| `package-name` | `npm uninstall package-name` |

---

## Database Changes

If applicable:

- [ ] No database changes
- [ ] Migrations need rollback: [migration name]

---

## Rollback Steps

1. **Stop development server**
2. **Git reset to start tag**:
   ```bash
   git reset --hard [STORY-ID]-start
   ```
3. **Remove added dependencies** (if any):
   ```bash
   npm uninstall [package-name]
   ```
4. **Clean build artifacts**:
   ```bash
   rm -rf .next
   npm run build
   ```
5. **Verify application works**:
   ```bash
   npm run dev
   npm test
   ```

---

## Escalation

If rollback fails:
1. Notify PM Agent via inbox
2. Include error messages
3. Do NOT force push without PM approval

---

**Created at Gate 1 - Before Implementation**
