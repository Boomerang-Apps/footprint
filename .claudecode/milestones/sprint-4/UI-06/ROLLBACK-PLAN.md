# UI-06 Rollback Plan

**Story**: UI-06 - Demo Data & Mock Images
**Branch**: feature/ui-06-demo-data
**Start Tag**: UI-06-start

---

## Rollback Triggers

- TypeScript errors that can't be resolved
- Test failures that indicate design issues
- Type conflicts with existing types
- Circular dependency issues

---

## Rollback Steps

### 1. Abort and Reset
```bash
# Stash any work in progress
git stash

# Reset to start point
git reset --hard UI-06-start

# Or if tag wasn't created, reset to main
git reset --hard main
```

### 2. Clean Up Files
```bash
# Remove created files
rm -rf footprint/data/demo/
```

### 3. Verify Clean State
```bash
# Check status
git status

# Run tests to confirm nothing broken
npm test

# Type check
npm run type-check
```

---

## Recovery Options

### Option A: Full Reset
If demo data approach is flawed, reset to main and await PM guidance.

### Option B: Partial Reset
If specific file has issues, remove only that file and re-implement.

### Option C: Type Adjustment
If type conflicts exist, adjust demo data to match existing types (don't modify types).

---

## Prevention Measures

1. Write tests first (TDD)
2. Import existing types, don't redefine
3. Use strict TypeScript checking
4. Run type-check before committing

---

## Contact

If rollback needed, notify PM at `.claudecode/handoffs/pm-inbox.md` with:
- What went wrong
- What was attempted
- Rollback status

---

*Created by Frontend-B Agent - 2025-12-24*
