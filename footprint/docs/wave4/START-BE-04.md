# START.md - BE-04: User Profile API

**Story ID:** BE-04
**Wave:** 4
**Domain:** Backend (Profile)
**Agent:** BE-Dev
**Branch:** `feature/BE-04-user-profile-api`
**Status:** Ready for Implementation

---

## Objective

Create API endpoints for user profile management including get, update, and avatar upload.

---

## Implementation Plan

### Phase 1: Validation Schema (TDD First)

1. Create `lib/validation/profile.ts`
   ```typescript
   // Zod schema for profile validation
   - profileUpdateSchema: name (min 2), phone (Israeli format), preferredLanguage (he|en)
   ```

2. Write tests first: `lib/validation/profile.test.ts`

### Phase 2: GET /api/profile

1. Create `app/api/profile/route.ts`
2. Implement GET handler:
   - Auth check via `createClient()` + `getUser()`
   - Return 401 if not authenticated
   - Fetch profile from `profiles` table
   - Transform snake_case to camelCase
   - Return profile data

3. Write tests: `app/api/profile/route.test.ts`
   - Test 401 when unauthenticated
   - Test successful profile fetch
   - Test camelCase response format

### Phase 3: PUT /api/profile

1. Add PUT handler to `app/api/profile/route.ts`
2. Implement:
   - Auth check
   - Validate input with Zod schema
   - Update `profiles` table
   - Return updated profile

3. Write tests:
   - Test 401 when unauthenticated
   - Test validation errors (name too short, invalid phone)
   - Test successful update

### Phase 4: POST /api/profile/avatar

1. Create `app/api/profile/avatar/route.ts`
2. Implement:
   - Auth check
   - Validate file type (jpg, png, webp)
   - Validate file size (max 2MB)
   - Upload to R2 via `uploadFile()`
   - Update `avatar_url` in profile
   - Return new avatar URL

3. Write tests: `app/api/profile/avatar/route.test.ts`
   - Test file type validation
   - Test file size validation
   - Test successful upload

### Phase 5: Rate Limiting

1. Add `checkRateLimit()` to all handlers
2. Test rate limiting behavior

---

## Files to Create

| File | Purpose |
|------|---------|
| `lib/validation/profile.ts` | Zod validation schema |
| `app/api/profile/route.ts` | GET/PUT endpoints |
| `app/api/profile/route.test.ts` | Tests for profile endpoints |
| `app/api/profile/avatar/route.ts` | Avatar upload endpoint |
| `app/api/profile/avatar/route.test.ts` | Tests for avatar upload |

---

## Files to Reuse

| File | Usage |
|------|-------|
| `lib/supabase/server.ts` | `createClient()` for auth |
| `lib/rate-limit.ts` | `checkRateLimit()` |
| `lib/storage/r2.ts` | `uploadFile()` for avatar |

---

## Forbidden Files (Do Not Modify)

- `lib/auth/admin.ts`
- `supabase/migrations/*`

---

## Acceptance Criteria Checklist

- [ ] AC-001: GET returns profile data
- [ ] AC-002: GET returns 401 when unauthenticated
- [ ] AC-003: PUT updates profile fields
- [ ] AC-004: PUT validates with Zod
- [ ] AC-005: PUT returns 401 when unauthenticated
- [ ] AC-006: POST avatar uploads and stores image
- [ ] AC-007: POST avatar validates file type
- [ ] AC-008: POST avatar enforces 2MB limit
- [ ] AC-009: Rate limiting applied
- [ ] AC-010: camelCase response format

---

## Test Coverage Target

**Minimum:** 90%
**Estimated Tests:** 20

---

## Definition of Done

1. All tests pass
2. Coverage >= 90%
3. TypeScript clean (no errors)
4. ESLint clean
5. All ACs verified
6. Ready for QA review

---

*Generated: 2026-01-30*
*Gate 1: Planning Complete*
