# BE-04: User Profile API - ROLLBACK PLAN

**Story ID:** BE-04
**Branch:** feature/BE-04-user-profile-api
**Created:** 2026-01-30

---

## Rollback Triggers

Execute rollback if any of the following occur:

1. **Security vulnerability** in profile access
2. **Data corruption** in profiles table
3. **Breaking change** to existing auth flow
4. **Performance degradation** (API response > 500ms)
5. **Test failures** that cannot be resolved

---

## Rollback Steps

### Step 1: Identify Scope

Determine which files were modified:

```bash
git diff main --name-only
```

Expected files:
- `app/api/profile/route.ts`
- `app/api/profile/route.test.ts`
- `app/api/profile/avatar/route.ts`
- `app/api/profile/avatar/route.test.ts`
- `lib/validation/profile.ts`

### Step 2: Rollback Code

**Option A: Delete feature branch (before merge)**
```bash
git checkout main
git branch -D feature/BE-04-user-profile-api
```

**Option B: Revert merge commit (after merge)**
```bash
git revert <merge-commit-hash>
git push origin main
```

### Step 3: Delete Created Files

If partially merged, manually delete:

```bash
rm -rf app/api/profile/
rm lib/validation/profile.ts
```

### Step 4: Verify Rollback

```bash
# Ensure no profile API routes exist
ls app/api/profile/ # Should fail (not found)

# Run tests to verify no regressions
npm test

# Verify existing functionality works
npm run build
```

---

## Data Considerations

**This story does NOT modify database schema.**

No data migration rollback needed.

If avatar files were uploaded to R2:
- Files remain in storage (no harm)
- Can be cleaned up later via admin script

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
2. Test all edge cases
3. Review authentication carefully
4. Monitor error rates after merge
