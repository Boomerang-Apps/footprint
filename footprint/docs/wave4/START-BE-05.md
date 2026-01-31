# START.md - BE-05: Addresses CRUD API

**Story ID:** BE-05
**Wave:** 4
**Domain:** Backend (Profile)
**Agent:** BE-Dev
**Branch:** `feature/BE-05-addresses-crud-api`
**Status:** Ready for Implementation

---

## Objective

Create RESTful API endpoints for managing user saved addresses with full CRUD operations and default address functionality.

---

## Implementation Plan

### Phase 1: Validation Schema (TDD First)

1. Create `lib/validation/address.ts`
   ```typescript
   // Zod schema for address validation
   - name: min 2 chars
   - street: min 5 chars
   - city: min 2 chars
   - postalCode: 7 digits (Israeli format)
   - country: default 'Israel'
   - phone: optional, Israeli format
   - isDefault: optional boolean
   ```

2. Write tests first: `lib/validation/address.test.ts`

### Phase 2: GET/POST /api/addresses

1. Create `app/api/addresses/route.ts`
2. Implement GET handler:
   - Auth check
   - Fetch addresses where `user_id = auth.uid()`
   - Transform snake_case to camelCase
   - Return array (empty if none)

3. Implement POST handler:
   - Auth check
   - Validate input with Zod
   - If first address, set `is_default = true`
   - Insert into `addresses` table
   - Return created address

4. Write tests: `app/api/addresses/route.test.ts`

### Phase 3: GET/PUT/DELETE /api/addresses/[id]

1. Create `app/api/addresses/[id]/route.ts`
2. Implement handlers:
   - **GET**: Fetch by ID, verify ownership, return 403/404 as needed
   - **PUT**: Validate, update, return updated address
   - **DELETE**: Verify ownership, check default rules, delete

3. Write tests: `app/api/addresses/[id]/route.test.ts`
   - Test 404 for non-existent
   - Test 403 for other user's address
   - Test delete default prevention

### Phase 4: PATCH /api/addresses/[id]/default

1. Create `app/api/addresses/[id]/default/route.ts`
2. Implement:
   - Auth check + ownership verification
   - Use transaction: unset all `is_default`, set target `is_default = true`
   - Return success

3. Write tests: `app/api/addresses/[id]/default/route.test.ts`

### Phase 5: Rate Limiting

1. Add `checkRateLimit()` to all handlers
2. Test rate limiting behavior

---

## Files to Create

| File | Purpose |
|------|---------|
| `lib/validation/address.ts` | Zod validation schema |
| `app/api/addresses/route.ts` | GET list / POST create |
| `app/api/addresses/route.test.ts` | Tests |
| `app/api/addresses/[id]/route.ts` | GET/PUT/DELETE single |
| `app/api/addresses/[id]/route.test.ts` | Tests |
| `app/api/addresses/[id]/default/route.ts` | PATCH set default |
| `app/api/addresses/[id]/default/route.test.ts` | Tests |

---

## Files to Reuse

| File | Usage |
|------|-------|
| `lib/supabase/server.ts` | `createClient()` for auth |
| `lib/rate-limit.ts` | `checkRateLimit()` |

---

## Forbidden Files (Do Not Modify)

- `components/checkout/ShippingAddressForm.tsx`
- `supabase/migrations/*`

---

## Database Operations

### Set Default (Transaction Required)
```sql
-- Must be atomic to prevent race conditions
BEGIN;
UPDATE addresses SET is_default = false WHERE user_id = $1;
UPDATE addresses SET is_default = true WHERE id = $2 AND user_id = $1;
COMMIT;
```

### Delete Default Prevention
```sql
-- Before delete, check if default and others exist
SELECT COUNT(*) as others FROM addresses
WHERE user_id = $1 AND id != $2;
-- If is_default AND others > 0, return 400
```

---

## Acceptance Criteria Checklist

- [ ] AC-001: GET list returns addresses
- [ ] AC-002: GET list returns empty array
- [ ] AC-003: POST creates address
- [ ] AC-004: POST validates with Zod
- [ ] AC-005: POST sets first as default
- [ ] AC-006: GET [id] returns single
- [ ] AC-007: GET [id] returns 404
- [ ] AC-008: GET [id] returns 403
- [ ] AC-009: PUT updates address
- [ ] AC-010: DELETE removes address
- [ ] AC-011: DELETE prevents default deletion
- [ ] AC-012: PATCH default works
- [ ] AC-013: All return 401 when unauthenticated
- [ ] AC-014: Rate limiting applied
- [ ] AC-015: camelCase response format

---

## Test Coverage Target

**Minimum:** 90%
**Estimated Tests:** 31

---

## Definition of Done

1. All tests pass
2. Coverage >= 90%
3. TypeScript clean
4. ESLint clean
5. All ACs verified
6. Default address uses transaction
7. Ready for QA review

---

*Generated: 2026-01-30*
*Gate 1: Planning Complete*
