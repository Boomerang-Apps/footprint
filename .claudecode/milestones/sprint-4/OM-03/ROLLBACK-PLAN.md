# OM-03: Rollback Plan

**Story**: OM-03 - Download Print-Ready Files
**Branch**: feature/OM-03-print-ready-download
**Created**: 2025-12-26

---

## Rollback Triggers

Execute rollback if any of the following occur:

1. **Critical Bug**: Download generating corrupted files
2. **Storage Failure**: R2 operations failing consistently
3. **Authorization Bypass**: Non-admin users able to download
4. **Performance Issue**: Downloads blocking other operations
5. **QA Rejection**: Failing acceptance criteria

---

## Rollback Steps

### Step 1: Revert to Tag

```bash
# Return to pre-implementation state
git checkout OM-03-start
```

### Step 2: Delete Feature Branch (if needed)

```bash
git branch -D feature/OM-03-print-ready-download
```

### Step 3: Remove Created Files

Files that can be safely deleted:

```bash
rm -f footprint/lib/orders/printFile.ts
rm -f footprint/lib/orders/printFile.test.ts
rm -rf footprint/app/api/admin/orders/[id]/download/
```

### Step 4: Verify Clean State

```bash
npm run type-check
npm test
npm run lint
```

---

## Recovery Options

### Option A: Fix Forward
If the issue is minor, fix in a new commit rather than rolling back.

### Option B: Disable Endpoint
If only the API is problematic, add maintenance mode flag.

### Option C: Full Rollback
Use the steps above for complete removal.

---

## Impact Assessment

| Component | Impact if Rolled Back |
|-----------|----------------------|
| Admin Dashboard | Cannot download print files (frontend unaffected) |
| Print Production | Manual file access via R2 console still possible |
| Orders | No impact on order data |
| Storage | Generated print files remain in R2 (cleanup optional) |

---

## Notification

If rollback executed:
1. Update PM inbox with reason
2. Create new story for fix if needed
3. Document lessons learned

---

*Rollback plan created by Backend-2 Agent - 2025-12-26*
