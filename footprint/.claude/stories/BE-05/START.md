# BE-05: Addresses CRUD API - START

**Story ID:** BE-05
**Wave:** 4
**Branch:** feature/BE-05-addresses-crud-api
**Started:** 2026-01-30
**Agent:** Claude Opus 4.5

---

## Story Overview

**Title:** Addresses CRUD API
**Domain:** Backend
**Priority:** High
**Story Points:** 5

### Objective

As a Footprint user, I want to manage my saved addresses via API, so that I can quickly select shipping addresses during checkout.

---

## Acceptance Criteria Summary

| AC | Description | Test Approach |
|----|-------------|---------------|
| AC-001 | GET /api/addresses returns list of user's addresses | Mock auth, verify array response |
| AC-002 | GET /api/addresses returns empty array for new users | Mock empty addresses |
| AC-003 | POST /api/addresses creates new address | Verify database insert |
| AC-004 | POST /api/addresses validates input with Zod | Test invalid postal code |
| AC-005 | POST sets isDefault=true if first address | Create first, verify default |
| AC-006 | GET /api/addresses/[id] returns single address | Request specific address |
| AC-007 | GET /api/addresses/[id] returns 404 for non-existent | Test invalid UUID |
| AC-008 | GET /api/addresses/[id] returns 403 for other user's | Test cross-user access |
| AC-009 | PUT /api/addresses/[id] updates address fields | Update and verify |
| AC-010 | DELETE /api/addresses/[id] removes address | Delete and verify |
| AC-011 | DELETE prevents deleting default if others exist | Test constraint |
| AC-012 | PATCH /api/addresses/[id]/default sets as default | Verify others unset |
| AC-013 | All endpoints return 401 when not authenticated | Test each without auth |
| AC-014 | All endpoints apply rate limiting | Verify rate limit called |
| AC-015 | Response format uses camelCase | Verify postalCode not postal_code |

---

## Files to Create

```
app/api/addresses/route.ts              # GET list, POST create
app/api/addresses/route.test.ts         # Tests for list/create
app/api/addresses/[id]/route.ts         # GET, PUT, DELETE single
app/api/addresses/[id]/route.test.ts    # Tests for single address
app/api/addresses/[id]/default/route.ts # PATCH set default
app/api/addresses/[id]/default/route.test.ts # Tests for set default
lib/validation/address.ts               # Zod schema
```

---

## Technical Approach

1. **Validation Schema:** Create Zod schema for address input (Israeli postal code: 7 digits)
2. **List Endpoint:** GET all addresses for authenticated user
3. **Create Endpoint:** POST with validation, auto-set default if first
4. **Single Endpoints:** GET/PUT/DELETE with ownership verification
5. **Default Endpoint:** PATCH to set default, unset others

### Database Table: addresses

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | FK to auth.users |
| name | text | Recipient name |
| street | text | Street address |
| apartment | text | Optional unit/apt |
| city | text | City name |
| postal_code | text | 7-digit Israeli code |
| country | text | Default: Israel |
| phone | text | Optional phone |
| is_default | boolean | Default address flag |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-updated |

### Reuse Components

- `lib/supabase/server.ts` - createClient()
- `lib/rate-limit.ts` - checkRateLimit()

---

## TDD Plan

**Phase 1: RED** - Write all tests first (expect failures)
**Phase 2: GREEN** - Implement endpoints to pass tests
**Phase 3: REFACTOR** - Clean up code while maintaining tests

### Test Categories

1. Authentication (5 tests)
2. List Addresses (3 tests)
3. Create Address (5 tests)
4. Get Single Address (3 tests)
5. Update Address (4 tests)
6. Delete Address (4 tests)
7. Set Default (3 tests)
8. Rate Limiting (2 tests)
9. Error Handling (2 tests)

**Total Estimated Tests:** 31
**Coverage Target:** 90%

---

## Definition of Done

- [ ] All 15 acceptance criteria implemented
- [ ] All tests passing
- [ ] Coverage ≥ 80%
- [ ] TypeScript clean (no errors)
- [ ] ESLint clean (no warnings)
- [ ] Code reviewed
- [ ] Merged to main
