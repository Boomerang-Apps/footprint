# UI-09: Price Display & Timeline Components

**Started**: 2025-12-26
**Agent**: Frontend-A
**Branch**: feature/ui-09-price-timeline
**Gate**: 1 - Planning → 2 - Build

---

## Story Summary
Create two shared UI components: PriceDisplay for ILS currency formatting with ₪ symbol, and OrderTimeline for 4-step order status tracking.

---

## Scope

### In Scope
- **PriceDisplay Component**
  - ILS currency formatting (₪ symbol)
  - Support for integers and decimals
  - Optional strikethrough for original prices
  - Optional "Free" text for zero amounts
  - Size variants (sm, md, lg)
  - RTL support for Hebrew

- **OrderTimeline Component**
  - 4 steps: Received, Processing, Shipped, Delivered
  - Current step highlighting
  - Completed steps with checkmarks
  - Hebrew labels with RTL support
  - Estimated dates display
  - Vertical layout for sidebar/mobile

### Out of Scope
- Order status management (Backend-1)
- Order tracking API integration (Backend-2)
- Step click navigation (future enhancement)

---

## Acceptance Criteria
- [ ] PriceDisplay formats ILS currency correctly
- [ ] PriceDisplay shows ₪ symbol in correct position
- [ ] PriceDisplay supports strikethrough for discounts
- [ ] PriceDisplay shows "חינם" (Free) for zero amounts
- [ ] OrderTimeline displays 4 order status steps
- [ ] OrderTimeline highlights current status
- [ ] OrderTimeline shows completed steps with checkmarks
- [ ] Both components support Hebrew/RTL
- [ ] Tests written (TDD)
- [ ] 80%+ coverage
- [ ] TypeScript clean
- [ ] Linter clean

---

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| footprint/components/ui/PriceDisplay.tsx | Create | Price formatting component |
| footprint/components/ui/PriceDisplay.test.tsx | Create | Test file |
| footprint/components/ui/OrderTimeline.tsx | Create | Order status tracker |
| footprint/components/ui/OrderTimeline.test.tsx | Create | Test file |
| footprint/components/ui/index.ts | Modify | Export components |

---

## Dependencies

### Blocked By
- UI-07: Base primitives (COMPLETE)

### Blocks
- Checkout page (Frontend-B)
- Order confirmation page (Frontend-B)
- Admin order management (Frontend-B)

---

## Safety Gate Progress
- [x] Gate 0: Research (not required - UI components)
- [x] Gate 1: Planning (this document)
- [ ] Gate 2: Implementation (TDD)
- [ ] Gate 3: QA Validation
- [ ] Gate 4: Review
- [ ] Gate 5: Deployment

---

*Started by Frontend-A Agent - 2025-12-26*
