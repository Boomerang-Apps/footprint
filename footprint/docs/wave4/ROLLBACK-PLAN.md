# ROLLBACK-PLAN.md - Wave 4: Customer Account

**Wave:** 4
**Stories:** BE-04, BE-05, UI-05A, UI-05B
**Created:** 2026-01-30
**Risk Level:** LOW (no database migrations, no breaking changes)

---

## Overview

Wave 4 creates new API endpoints and frontend pages for profile and address management. All changes are additive - no existing functionality is modified.

---

## Rollback Strategy by Story

### BE-04: User Profile API

**Rollback Complexity:** Simple
**Reason:** New API endpoints only, no schema changes

**Steps:**
```bash
# 1. Delete created files
rm -f app/api/profile/route.ts
rm -f app/api/profile/route.test.ts
rm -f app/api/profile/avatar/route.ts
rm -f app/api/profile/avatar/route.test.ts
rm -f lib/validation/profile.ts

# 2. Or revert git branch
git checkout main
git branch -D feature/BE-04-user-profile-api
```

**Impact:** None - no existing code depends on these endpoints

---

### BE-05: Addresses CRUD API

**Rollback Complexity:** Simple
**Reason:** New API endpoints only, no schema changes

**Steps:**
```bash
# 1. Delete created files
rm -rf app/api/addresses/
rm -f lib/validation/address.ts

# 2. Or revert git branch
git checkout main
git branch -D feature/BE-05-addresses-crud-api
```

**Impact:** None - no existing code depends on these endpoints

---

### UI-05A: User Profile Settings Page

**Rollback Complexity:** Simple
**Reason:** New components and page only

**Steps:**
```bash
# 1. Delete created files
rm -f app/\(app\)/account/profile/page.tsx
rm -f components/account/ProfileForm.tsx
rm -f components/account/ProfileForm.test.tsx
rm -f components/account/AvatarUpload.tsx
rm -f components/account/AvatarUpload.test.tsx
rm -f hooks/useProfile.ts
rm -f hooks/useProfile.test.ts
rm -f hooks/useUpdateProfile.ts
rm -f hooks/useUpdateProfile.test.ts

# 2. Or revert git branch
git checkout main
git branch -D feature/UI-05A-user-profile-settings
```

**Impact:** Profile link in account page will 404 (update account page to remove link)

---

### UI-05B: Saved Addresses Management

**Rollback Complexity:** Simple
**Reason:** New components and page only

**Steps:**
```bash
# 1. Delete created files
rm -f app/\(app\)/account/addresses/page.tsx
rm -rf components/account/Address*.tsx
rm -rf components/account/Address*.test.tsx
rm -f hooks/useAddresses.ts
rm -f hooks/useAddresses.test.ts
rm -f hooks/useCreateAddress.ts
rm -f hooks/useCreateAddress.test.ts
rm -f hooks/useUpdateAddress.ts
rm -f hooks/useUpdateAddress.test.ts
rm -f hooks/useDeleteAddress.ts
rm -f hooks/useDeleteAddress.test.ts

# 2. Or revert git branch
git checkout main
git branch -D feature/UI-05B-saved-addresses-page
```

**Impact:** Addresses link in account page will 404 (update account page to remove link)

---

## Full Wave Rollback

If entire Wave 4 needs to be rolled back:

```bash
# 1. Reset to pre-Wave 4 state
git checkout main
git reset --hard <pre-wave4-commit>

# 2. Force push (ONLY if approved by CTO)
git push origin main --force

# 3. Trigger deployment
# (Vercel will auto-deploy on main push)
```

---

## Rollback Triggers

Execute rollback if:

| Trigger | Severity | Action |
|---------|----------|--------|
| Authentication breaking | CRITICAL | Full wave rollback |
| Checkout flow affected | CRITICAL | Full wave rollback |
| Profile API returns 500s | HIGH | Rollback BE-04 |
| Addresses API returns 500s | HIGH | Rollback BE-05 |
| UI crashes on profile page | MEDIUM | Rollback UI-05A |
| UI crashes on addresses page | MEDIUM | Rollback UI-05B |
| Test failures > 10% | LOW | Investigate, partial rollback |

---

## Dependencies

```
BE-04 ──────► UI-05A

BE-05 ──────► UI-05B
```

**Rollback Order (if sequential needed):**
1. UI-05B (depends on BE-05)
2. UI-05A (depends on BE-04)
3. BE-05
4. BE-04

---

## Post-Rollback Verification

After any rollback:

```bash
# 1. Verify build passes
npm run build

# 2. Verify tests pass
npm test

# 3. Verify type check
npm run type-check

# 4. Verify lint
npm run lint

# 5. Smoke test critical paths
# - Home page loads
# - Upload flow works
# - Checkout flow works
# - Existing order history works
```

---

## Contact

**Rollback Authority:** CTO Master
**Emergency Contact:** PM Agent

---

*Generated: 2026-01-30*
*Gate 1: Planning Complete*
