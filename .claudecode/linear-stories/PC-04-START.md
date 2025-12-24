# PC-04: Real-Time Price Calculation

**Started**: 2025-12-22
**Agent**: Backend-1
**Branch**: agent/backend-1
**Gate**: 1 - Planning → 2 - Build

---

## Story Summary
Implement real-time price calculation that updates as users select size, paper type, and frame options. Provides live calculation with breakdown visible and shipping estimate.

---

## Scope

### In Scope
- Price calculator with configurable pricing matrix
- Shipping cost estimation by region
- Discount code validation and application
- Full test coverage (100% for lib/pricing/)

### Out of Scope
- UI components (Frontend-B domain)
- Stripe payment processing (Backend-2 domain)
- Currency conversion (future feature)

---

## Acceptance Criteria
- [x] Live calculation as options change
- [x] Price breakdown visible (base, paper, frame, shipping, discount)
- [x] Shipping estimate based on address
- [x] Tests written (TDD)
- [x] 100% coverage on lib/pricing/
- [x] TypeScript clean
- [x] Linter clean

---

## Files to Create
| File | Action | Description |
|------|--------|-------------|
| `lib/pricing/calculator.ts` | Create | Main price calculation logic |
| `lib/pricing/calculator.test.ts` | Create | Tests for calculator |
| `lib/pricing/shipping.ts` | Create | Shipping cost estimation |
| `lib/pricing/shipping.test.ts` | Create | Tests for shipping |
| `lib/pricing/discounts.ts` | Create | Discount code validation |
| `lib/pricing/discounts.test.ts` | Create | Tests for discounts |
| `lib/pricing/index.ts` | Create | Public exports |

---

## Pricing Matrix (ILS)

### Base Prices by Size
| Size | Base Price |
|------|------------|
| A5   | 89         |
| A4   | 129        |
| A3   | 179        |
| A2   | 249        |

### Paper Modifiers
| Paper Type | Modifier |
|------------|----------|
| Matte      | +0       |
| Glossy     | +20      |
| Canvas     | +50      |

### Frame Prices
| Frame Type | Price |
|------------|-------|
| None       | +0    |
| Black      | +79   |
| White      | +79   |
| Oak        | +99   |

### Shipping
| Region   | Cost |
|----------|------|
| Israel   | 29   |
| Express  | 49   |

---

## Dependencies

### Blocked By
- None (types already exist)

### Blocks
- Frontend-B PC-04 UI integration

---

## Safety Gate Progress
- [x] Gate 0: Research (not required - internal pricing)
- [x] Gate 1: Planning (this document)
- [x] Gate 2: Implementation (TDD) - 127 tests, 100% coverage
- [ ] Gate 3: QA Validation (submitted 2025-12-22)
- [ ] Gate 4: Review
- [ ] Gate 5: Deployment

---

*Started by Backend-1 Agent - 2025-12-22*
