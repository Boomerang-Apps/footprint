# BE-04: User Profile API - START

**Story ID:** BE-04
**Wave:** 4
**Branch:** feature/BE-04-user-profile-api
**Started:** 2026-01-30
**Agent:** Claude Opus 4.5

---

## Story Overview

**Title:** User Profile API
**Domain:** Backend
**Priority:** High
**Story Points:** 3

### Objective

As a Footprint user, I want to view and update my profile information via API, so that I can manage my personal details and preferences.

---

## Acceptance Criteria Summary

| AC | Description | Test Approach |
|----|-------------|---------------|
| AC-001 | GET /api/profile returns current user's profile | Mock auth, verify response |
| AC-002 | GET /api/profile returns 401 when not authenticated | Test without auth |
| AC-003 | PUT /api/profile updates user profile fields | Verify database update |
| AC-004 | PUT /api/profile validates input with Zod | Test invalid input |
| AC-005 | PUT /api/profile returns 401 when not authenticated | Test without auth |
| AC-006 | POST /api/profile/avatar uploads avatar image | Verify file upload |
| AC-007 | POST /api/profile/avatar validates file type | Test invalid file type |
| AC-008 | POST /api/profile/avatar enforces 2MB limit | Test oversized file |
| AC-009 | All endpoints apply rate limiting | Verify rate limit called |
| AC-010 | Response uses camelCase format | Verify response format |

---

## Files to Create

```
app/api/profile/route.ts          # GET, PUT endpoints
app/api/profile/route.test.ts     # Tests for GET, PUT
app/api/profile/avatar/route.ts   # POST avatar upload
app/api/profile/avatar/route.test.ts # Tests for avatar
lib/validation/profile.ts         # Zod schema
```

---

## Technical Approach

1. **Validation Schema:** Create Zod schema for profile updates
2. **GET Endpoint:** Fetch profile from Supabase, transform to camelCase
3. **PUT Endpoint:** Validate input, update database, return updated profile
4. **Avatar Upload:** Validate file, upload to R2, update avatar_url

### Reuse Components

- `lib/supabase/server.ts` - createClient()
- `lib/rate-limit.ts` - checkRateLimit()
- `lib/storage/r2.ts` - uploadFile() for avatar

---

## TDD Plan

**Phase 1: RED** - Write all tests first (expect failures)
**Phase 2: GREEN** - Implement endpoints to pass tests
**Phase 3: REFACTOR** - Clean up code while maintaining tests

### Test Categories

1. Authentication (3 tests)
2. GET Profile (3 tests)
3. PUT Profile (5 tests)
4. Avatar Upload (5 tests)
5. Rate Limiting (2 tests)
6. Error Handling (2 tests)

**Total Estimated Tests:** 20
**Coverage Target:** 90%

---

## Definition of Done

- [ ] All 10 acceptance criteria implemented
- [ ] All tests passing
- [ ] Coverage ≥ 80%
- [ ] TypeScript clean (no errors)
- [ ] ESLint clean (no warnings)
- [ ] Code reviewed
- [ ] Merged to main
