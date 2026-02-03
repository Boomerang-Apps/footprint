# BE-05: Addresses CRUD API - ROLLBACK PLAN

**Story ID:** BE-05
**Branch:** feature/BE-05-addresses-crud-api
**Created:** 2026-01-30

---

## Rollback Triggers

Execute rollback if any of the following occur:

1. **Security vulnerability** - Address data leakage between users
2. **Data corruption** - Addresses table integrity issues
3. **Breaking change** - Checkout flow affected
4. **Performance degradation** - API response > 500ms
5. **Default address issues** - Race conditions or sync problems
6. **Test failures** - That cannot be resolved

---

## Rollback Steps

### Step 1: Identify Scope

Determine which files were modified:

```bash
git diff main --name-only
```

Expected files:
- `app/api/addresses/route.ts`
- `app/api/addresses/route.test.ts`
- `app/api/addresses/[id]/route.ts`
- `app/api/addresses/[id]/route.test.ts`
- `app/api/addresses/[id]/default/route.ts`
- `app/api/addresses/[id]/default/route.test.ts`
- `lib/validation/address.ts`

### Step 2: Rollback Code

**Option A: Delete feature branch (before merge)**
```bash
git checkout main
git branch -D feature/BE-05-addresses-crud-api
```

**Option B: Revert merge commit (after merge)**
```bash
git revert <merge-commit-hash>
git push origin main
```

### Step 3: Delete Created Files

If partially merged, manually delete:

```bash
rm -rf app/api/addresses/
rm lib/validation/address.ts
```

### Step 4: Verify Rollback

```bash
# Ensure no addresses API routes exist
ls app/api/addresses/ # Should fail (not found)

# Run tests to verify no regressions
npm test

# Verify existing functionality works
npm run build
```

---

## Data Considerations

**This story does NOT modify database schema.**

No data migration rollback needed.

Existing addresses in the database:
- Will remain intact (no deletion)
- Frontend will fall back to checkout form entry
- No data loss expected

---

## Critical Safety Checks

Before rollback, verify:

1. **No orders in progress** using saved addresses
2. **No active checkout sessions** referencing addresses
3. **Backup current addresses data** if needed

---

## Escalation

If rollback fails or causes additional issues:

1. **Notify team lead** immediately
2. **Document the issue** in incident report
3. **Consider reverting** to last known good commit

---

## Prevention

To minimize rollback likelihood:

1. Follow TDD strictly
2. Test ownership checks thoroughly
3. Verify default address logic
4. Review authorization carefully
5. Monitor error rates after merge
