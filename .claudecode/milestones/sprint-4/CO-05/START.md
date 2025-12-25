# CO-05: Apply Discount Codes - START

**Story**: CO-05
**Agent**: Backend-1
**Date**: 2025-12-25
**Gate**: 1 - Planning

---

## Story Summary

**Title**: Apply Discount Codes
**Description**: Code input, validation feedback, discount shown
**Points**: 2
**Component**: Checkout

---

## Current State Analysis

### Existing Infrastructure

| File | Status | Notes |
|------|--------|-------|
| `lib/pricing/discounts.ts` | Complete | Full validation/application logic |
| `lib/pricing/discounts.test.ts` | Complete | 30+ tests, comprehensive coverage |
| `stores/orderStore.ts` | Partial | Has `discountCode` + `setDiscountCode`, no validation |
| `hooks/useDiscount.ts` | Missing | Need to create |

### Existing Discount Codes

| Code | Type | Value | Constraints |
|------|------|-------|-------------|
| SAVE10 | percentage | 10% | None |
| SAVE20 | percentage | 20% | None |
| FLAT20 | fixed | 20 ILS | None |
| FLAT50 | fixed | 50 ILS | None |
| VIP25 | percentage | 25% | Min 200 ILS |
| WELCOME | percentage | 15% | None |

---

## Implementation Plan

### Phase 1: Extend Order Store

**File**: `stores/orderStore.ts`

**Add State**:
```typescript
// Discount validation state
discountValidation: {
  isValidating: boolean;
  error: string | null;
  appliedDiscount: ApplyDiscountResult | null;
}
```

**Add Actions**:
```typescript
// Validate and apply discount code
applyDiscountCode: (code: string) => Promise<ApplyDiscountResult>;

// Clear applied discount
clearDiscount: () => void;
```

### Phase 2: Create useDiscount Hook

**File**: `hooks/useDiscount.ts`

**Interface**:
```typescript
interface UseDiscountReturn {
  // State
  discountCode: string;
  isValidating: boolean;
  error: string | null;
  appliedDiscount: ApplyDiscountResult | null;

  // Actions
  setDiscountCode: (code: string) => void;
  applyCode: () => Promise<void>;
  clearDiscount: () => void;

  // Computed
  hasDiscount: boolean;
  discountAmount: number;
}
```

---

## Test Plan (TDD)

### Store Tests (`stores/orderStore.test.ts`)

1. `applyDiscountCode` with valid code applies discount
2. `applyDiscountCode` with invalid code sets error
3. `applyDiscountCode` with expired code sets error
4. `applyDiscountCode` clears previous error on new attempt
5. `clearDiscount` resets discount state
6. Discount is recalculated when pricing updates

### Hook Tests (`hooks/useDiscount.test.ts`)

1. Hook returns initial state correctly
2. `setDiscountCode` updates the code
3. `applyCode` triggers validation
4. `applyCode` handles loading state
5. `hasDiscount` computed correctly
6. `discountAmount` returns correct value

---

## Files to Modify/Create

| File | Action | Owner |
|------|--------|-------|
| `stores/orderStore.ts` | Modify | Backend-1 |
| `stores/orderStore.test.ts` | Create/Extend | Backend-1 |
| `hooks/useDiscount.ts` | Create | Backend-1 |
| `hooks/useDiscount.test.ts` | Create | Backend-1 |

---

## Acceptance Criteria

- [ ] Discount code can be entered and validated
- [ ] Invalid codes show clear error message
- [ ] Expired codes show expiration error
- [ ] Valid codes show discount amount
- [ ] Minimum purchase requirements are enforced
- [ ] Discount is applied to pricing breakdown
- [ ] Discount can be removed/cleared
- [ ] 80%+ test coverage

---

## Dependencies

- `lib/pricing/discounts.ts` - Validation logic (existing)
- `lib/pricing/calculator.ts` - Price calculation (existing)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Store state complexity | Use clear discount validation object |
| Async validation UX | Proper loading states |
| Edge cases (expired, min purchase) | Comprehensive test coverage |

---

**Gate 1 Complete** - Ready for TDD implementation
