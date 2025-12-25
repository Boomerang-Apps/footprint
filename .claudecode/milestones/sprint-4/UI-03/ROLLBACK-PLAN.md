# UI-03 Rollback Plan

**Story**: UI-03 - Customize Page UI
**Branch**: feature/ui-03-customize-page
**Start Tag**: UI-03-start

---

## Rollback Triggers

- Layout breaks on responsive breakpoints
- Size/paper/frame selection functionality regresses
- Price calculation produces incorrect values
- TypeScript errors that can't be resolved
- Test failures indicating design issues

---

## Rollback Steps

### 1. Abort and Reset
```bash
# Stash any work in progress
git stash

# Reset to start point
git reset --hard UI-03-start

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
git checkout main -- app/(app)/create/customize/page.tsx
```

### Option C: Selector-specific Fix
If one selector (size/paper/frame) has issues:
1. Keep working selectors
2. Reset only the problematic selector logic
3. Re-implement with correct approach

### Option D: Style-only Fix
If functionality works but styling is wrong, keep logic and fix CSS.

---

## Prevention Measures

1. Test each selector independently after implementation
2. Verify price calculation after each change
3. Check all responsive breakpoints
4. Verify Hebrew RTL rendering
5. Run type-check before committing

---

## Contact

If rollback needed, notify PM at `.claudecode/handoffs/pm-inbox.md` with:
- What went wrong
- What was attempted
- Current state

---

*Created by Frontend-B Agent - 2025-12-25*
