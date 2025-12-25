# UI-01 Rollback Plan

**Story**: UI-01 - Upload Page UI
**Branch**: feature/ui-01-upload-page
**Start Tag**: UI-01-start

---

## Rollback Triggers

- Layout breaks on responsive breakpoints
- Upload functionality regresses
- TypeScript errors that can't be resolved
- Test failures indicating design issues

---

## Rollback Steps

### 1. Abort and Reset
```bash
# Stash any work in progress
git stash

# Reset to start point
git reset --hard UI-01-start

# Or reset to main
git reset --hard main
```

### 2. Verify Working State
```bash
# Check existing page works
npm run dev

# Run tests
npm test

# Type check
npm run type-check
```

---

## Recovery Options

### Option A: Full Reset
If page is broken, reset to main and start fresh.

### Option B: Component-level Reset
If specific component has issues, revert only that file:
```bash
git checkout main -- app/(app)/create/page.tsx
```

### Option C: Style-only Fix
If functionality works but styling is wrong, keep logic and fix CSS.

---

## Prevention Measures

1. Test upload functionality after each change
2. Check all 3 responsive breakpoints
3. Verify Hebrew RTL rendering
4. Run type-check before committing

---

## Contact

If rollback needed, notify PM at `.claudecode/handoffs/pm-inbox.md` with:
- What went wrong
- What was attempted
- Current state

---

*Created by Frontend-B Agent - 2025-12-24*
