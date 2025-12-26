# GF-05: Scheduled Delivery Date

**Started**: 2025-12-26
**Agent**: Backend-1
**Branch**: feature/gf-05-scheduled-delivery
**Gate**: 1 - Planning -> 2 - Build

---

## Story Summary
Add scheduled delivery date functionality to the order flow. Users can select a preferred delivery date for their order, with validation to ensure dates fall within acceptable delivery windows.

---

## Scope

### In Scope (Backend-1 Domain)
- Add `scheduledDeliveryDate` state to orderStore
- Add setter action `setScheduledDeliveryDate`
- Add clear action `clearScheduledDeliveryDate`
- Implement delivery date validation utilities:
  - Minimum days calculation (3 business days from order)
  - Maximum days limit (30 days from order)
  - Business day calculation (skip weekends)
- Add delivery date to types (Order, CreateOrderInput)
- Persist delivery date in store partialize config
- TDD: Write tests first for all functionality

### Out of Scope
- Date picker UI component (Frontend-B)
- Calendar integration UI (Frontend-B)
- Backend API changes (Backend-2)

---

## Acceptance Criteria
- [ ] `scheduledDeliveryDate` field in orderStore state
- [ ] `setScheduledDeliveryDate(date: string | null)` action works
- [ ] `clearScheduledDeliveryDate()` action resets to null
- [ ] `getMinDeliveryDate()` returns date 3 business days out
- [ ] `getMaxDeliveryDate()` returns date 30 days out
- [ ] `isValidDeliveryDate(date)` validates date is within range
- [ ] Delivery date persists in localStorage
- [ ] Reset clears scheduled delivery date
- [ ] Tests written (TDD)
- [ ] 80%+ coverage
- [ ] TypeScript clean
- [ ] Linter clean

---

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `stores/orderStore.ts` | Modify | Add scheduledDeliveryDate state and actions |
| `stores/orderStore.test.ts` | Modify | Add tests for delivery date functionality |
| `lib/delivery/dates.ts` | Create | Delivery date validation utilities |
| `lib/delivery/dates.test.ts` | Create | Tests for delivery utilities |
| `types/order.ts` | Modify | Add scheduledDeliveryDate to Order types |

---

## Dependencies

### Blocked By
- None (gift options already implemented in GF-01, GF-02, GF-03)

### Blocks
- Frontend-B: Date picker component will consume this state

---

## Technical Design

### State Structure
```typescript
interface OrderState {
  // ... existing fields ...

  // Scheduled Delivery (GF-05)
  scheduledDeliveryDate: string | null; // ISO date string
}
```

### Actions
```typescript
interface OrderActions {
  // ... existing actions ...

  // Scheduled Delivery (GF-05)
  setScheduledDeliveryDate: (date: string | null) => void;
  clearScheduledDeliveryDate: () => void;
  getMinDeliveryDate: () => string;
  getMaxDeliveryDate: () => string;
  isValidDeliveryDate: (date: string) => boolean;
}
```

### Delivery Date Utilities (`lib/delivery/dates.ts`)
```typescript
// Constants
export const MIN_DELIVERY_DAYS = 3;  // Minimum business days
export const MAX_DELIVERY_DAYS = 30; // Maximum days from now

// Functions
export function getMinDeliveryDate(fromDate?: Date): Date;
export function getMaxDeliveryDate(fromDate?: Date): Date;
export function isBusinessDay(date: Date): boolean;
export function addBusinessDays(date: Date, days: number): Date;
export function isValidDeliveryDate(date: Date, fromDate?: Date): boolean;
```

---

## Safety Gate Progress
- [ ] Gate 0: Research (not required - no external APIs)
- [x] Gate 1: Planning (this document)
- [ ] Gate 2: Implementation (TDD)
- [ ] Gate 3: QA Validation
- [ ] Gate 4: Review
- [ ] Gate 5: Deployment

---

*Started by Backend-1 Agent - 2025-12-26*
