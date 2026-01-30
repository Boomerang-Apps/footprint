# AUTH-02 Backend - Guest Session State
**Agent**: Backend-1
**Date**: 2026-01-27
**Branch**: feature/AUTH-02-guest-state
**Gate**: 1 - Planning

## Story Overview
Implement guest checkout state management to allow users to purchase without creating an account. This enables faster checkout and reduces friction in the purchase flow.

## Scope
**IN SCOPE**:
- Guest info state in orderStore (isGuest, guestInfo)
- Guest info validation functions
- Email validation
- localStorage persistence
- Tests for all scenarios (TDD)

**OUT OF SCOPE**:
- UI components (Frontend-A responsibility)
- API integration for guest orders (Backend-2 responsibility)
- Order submission flow

## Implementation Plan

### 1. Type Definitions (lib/auth/guest.ts)
```typescript
export interface GuestInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  marketingConsent: boolean;
}

export interface GuestValidationResult {
  valid: boolean;
  errors: string[];
}
```

### 2. Validation Functions (lib/auth/guest.ts)
- `isValidGuestEmail(email: string): boolean`
  - RFC 5322 email validation
  - Common domain check
  - No disposable email domains

- `isValidGuestInfo(info: GuestInfo): GuestValidationResult`
  - All required fields present
  - Email format valid
  - Names not empty
  - Phone format valid if provided

### 3. Order Store Updates (stores/orderStore.ts)

**Add to OrderState**:
```typescript
interface OrderState {
  // ... existing fields ...

  // Guest checkout
  isGuest: boolean;
  guestInfo: GuestInfo | null;
}
```

**Add to OrderActions**:
```typescript
interface OrderActions {
  // ... existing actions ...

  setIsGuest: (value: boolean) => void;
  setGuestInfo: (info: GuestInfo) => void;
  clearGuestInfo: () => void;
}
```

**Implementation Details**:
- `setIsGuest`: Toggle guest mode
- `setGuestInfo`: Validate before storing, throw if invalid
- `clearGuestInfo`: Reset guest state
- Add to `partialize` for localStorage persistence
- Clear guest info on `reset()`

### 4. Test Coverage

**lib/auth/guest.test.ts**:
- Email validation edge cases
- Valid/invalid GuestInfo objects
- Partial GuestInfo objects
- Edge cases (empty strings, special characters)

**stores/orderStore.test.ts**:
- Toggle guest mode
- Set valid guest info
- Reject invalid guest info
- Clear guest info
- Persistence to localStorage
- Reset clears guest state

## File Changes

| File | Action | Lines |
|------|--------|-------|
| `lib/auth/guest.ts` | Create | ~80 |
| `lib/auth/guest.test.ts` | Create | ~150 |
| `stores/orderStore.ts` | Modify | +30 |
| `stores/orderStore.test.ts` | Modify | +100 |

## Success Criteria
- [ ] All tests pass
- [ ] Coverage >= 80% for new code
- [ ] TypeScript strict mode clean
- [ ] ESLint clean
- [ ] Guest info persists to localStorage
- [ ] Invalid guest info rejected with clear errors

## Dependencies
- Zustand (already installed)
- Zod (for validation)

## Coordination
- **Frontend-A**: Building GuestCheckoutForm component
- **Interface**: GuestInfo type must match form fields

## Rollback Plan
See ROLLBACK-PLAN.md

## TDD Approach
1. Write guest.test.ts (RED)
2. Implement guest.ts (GREEN)
3. Write orderStore guest tests (RED)
4. Implement orderStore guest state (GREEN)
5. Refactor if needed

## Timeline
- Tests: ~1 hour
- Implementation: ~1 hour
- Coverage/lint: ~30 min
- Total: ~2.5 hours

---
**Status**: ✅ Planning complete - Ready to implement
