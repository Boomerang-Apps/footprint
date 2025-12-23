# Backend-1 Agent Inbox

Work assignments for database, auth, and state management appear here.

---

## Domain Reminder
Your domain: Order store, user auth, state management, data persistence

NOT your domain: External APIs (Backend-2), UI components (Frontend-A/B)

---

## How to Use This Inbox

### For PM Agent:
Assign work related to:
- Order store (`stores/orderStore.ts`)
- User authentication
- Session management
- Data persistence

### Message Format:
```markdown
## [DATE] - PM: [Story Title]

**Story**: STORY-ID
**Gate**: 1-Plan / 2-Build
**Priority**: P0/P1/P2

## Context
[Background information]

## Assignment
[What to implement]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Tests written (TDD)
- [ ] 80%+ coverage

## Files to Create/Modify
| File | Action |
|------|--------|
| path/to/file | Create/Modify |

→ When done, write to: .claudecode/handoffs/qa-inbox.md

---
```

---

## Pending Messages

## 2025-12-23 - PM: PC-04 FINAL SPRINT 2 STORY - Complete Implementation Guide

**Story**: PC-04 - Real-time Price Calculation
**Priority**: P0 - LAST STORY TO COMPLETE SPRINT 2
**Story Points**: 3
**Gate**: 1 (Planning) → 2 (Implementation)
**Status**: 🔴 URGENT - Sprint 2 is 89% complete, waiting on you

---

### Context

Sprint 2 is nearly complete! 7/8 stories merged (24/27 SP). Your PC-04 is the **only remaining story**.

| Completed | Agent | Status |
|-----------|-------|--------|
| AI-01, AI-03, AI-04, PC-01, PC-02, PC-03 | Frontend-B | ✅ Merged |
| AI-02 | Backend-2 | ✅ Merged |
| **PC-04** | **Backend-1** | 🟡 **YOUR TURN** |

---

### Step 1: Setup (Gate 1)

```bash
# 1. Navigate to your worktree
cd /Users/mymac/Desktop/footprint-worktrees/backend-1

# 2. Sync with main (IMPORTANT - contains all Sprint 2 work)
git fetch origin main
git checkout -b feature/PC-04-price-calculation
git merge origin/main

# 3. Create Gate 1 planning files
mkdir -p .claudecode/milestones/sprint-2/PC-04/

# 4. Create START.md
cat > .claudecode/milestones/sprint-2/PC-04/START.md << 'EOF'
# PC-04: Real-time Price Calculation

## Story
Implement price calculation service for print products

## Scope
- Price calculator with size/paper/frame inputs
- Shipping cost estimation
- Discount code validation
- Integration with orderStore

## Files to Create
- lib/pricing/calculator.ts
- lib/pricing/calculator.test.ts
- lib/pricing/shipping.ts
- lib/pricing/shipping.test.ts
- lib/pricing/discounts.ts
- lib/pricing/discounts.test.ts

## Success Criteria
- 100% test coverage on lib/pricing/
- All acceptance criteria met
- TypeScript clean
EOF

# 5. Create ROLLBACK-PLAN.md
cat > .claudecode/milestones/sprint-2/PC-04/ROLLBACK-PLAN.md << 'EOF'
# Rollback Plan for PC-04

## If Implementation Fails
1. git checkout main
2. git branch -D feature/PC-04-price-calculation
3. Report blocker to PM inbox

## Recovery Steps
- Pricing logic is isolated in lib/pricing/
- No breaking changes to existing code
- Store modifications are additive only
EOF

# 6. Tag start point
git add .
git commit -m "docs(PC-04): create Gate 1 planning files"
git tag PC-04-start
```

---

### Step 2: Implementation (Gate 2) - TDD Required

#### File 1: `lib/pricing/calculator.ts`

```typescript
// lib/pricing/calculator.ts

export type PrintSize = 'A5' | 'A4' | 'A3' | 'A2';
export type PaperType = 'matte' | 'glossy' | 'canvas';
export type FrameType = 'none' | 'black' | 'white' | 'oak';

export interface PriceConfig {
  size: PrintSize;
  paper: PaperType;
  frame: FrameType;
}

export interface PriceBreakdown {
  basePrice: number;      // Size-based price
  paperModifier: number;  // Paper upgrade cost
  framePrice: number;     // Frame cost
  subtotal: number;       // Before shipping
  shipping: number;       // Shipping cost
  total: number;          // Final price
  currency: 'ILS';
}

// Pricing constants (ILS)
export const BASE_PRICES: Record<PrintSize, number> = {
  A5: 89,
  A4: 129,
  A3: 179,
  A2: 249,
};

export const PAPER_MODIFIERS: Record<PaperType, number> = {
  matte: 0,
  glossy: 20,
  canvas: 50,
};

export const FRAME_PRICES: Record<FrameType, number> = {
  none: 0,
  black: 79,
  white: 79,
  oak: 99,
};

export function calculatePrice(config: PriceConfig, shippingCost: number = 29): PriceBreakdown {
  const basePrice = BASE_PRICES[config.size];
  const paperModifier = PAPER_MODIFIERS[config.paper];
  const framePrice = FRAME_PRICES[config.frame];
  const subtotal = basePrice + paperModifier + framePrice;
  const total = subtotal + shippingCost;

  return {
    basePrice,
    paperModifier,
    framePrice,
    subtotal,
    shipping: shippingCost,
    total,
    currency: 'ILS',
  };
}
```

#### File 2: `lib/pricing/shipping.ts`

```typescript
// lib/pricing/shipping.ts

export type ShippingZone = 'local' | 'national' | 'international';

export interface ShippingEstimate {
  cost: number;
  minDays: number;
  maxDays: number;
  carrier: string;
}

// Shipping rates (ILS)
export const SHIPPING_RATES: Record<ShippingZone, ShippingEstimate> = {
  local: { cost: 0, minDays: 1, maxDays: 2, carrier: 'Local Pickup' },
  national: { cost: 29, minDays: 3, maxDays: 5, carrier: 'Israel Post' },
  international: { cost: 89, minDays: 7, maxDays: 14, carrier: 'DHL' },
};

export function getShippingEstimate(zone: ShippingZone): ShippingEstimate {
  return SHIPPING_RATES[zone];
}

export function getShippingZone(countryCode: string): ShippingZone {
  if (countryCode === 'IL') return 'national';
  return 'international';
}
```

#### File 3: `lib/pricing/discounts.ts`

```typescript
// lib/pricing/discounts.ts

export interface DiscountCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  expiresAt?: Date;
}

export interface DiscountResult {
  valid: boolean;
  discount: number;
  message: string;
}

// Mock discount codes (replace with DB lookup in production)
const VALID_CODES: Record<string, DiscountCode> = {
  'WELCOME10': { code: 'WELCOME10', type: 'percentage', value: 10 },
  'SAVE20': { code: 'SAVE20', type: 'fixed', value: 20, minPurchase: 100 },
  'FIRST50': { code: 'FIRST50', type: 'percentage', value: 50, minPurchase: 200 },
};

export function validateDiscount(code: string, subtotal: number): DiscountResult {
  const upperCode = code.toUpperCase().trim();
  const discountCode = VALID_CODES[upperCode];

  if (!discountCode) {
    return { valid: false, discount: 0, message: 'Invalid discount code' };
  }

  if (discountCode.minPurchase && subtotal < discountCode.minPurchase) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum purchase of ₪${discountCode.minPurchase} required`
    };
  }

  if (discountCode.expiresAt && new Date() > discountCode.expiresAt) {
    return { valid: false, discount: 0, message: 'Discount code has expired' };
  }

  const discount = discountCode.type === 'percentage'
    ? Math.round(subtotal * (discountCode.value / 100))
    : discountCode.value;

  return {
    valid: true,
    discount,
    message: `${discountCode.value}${discountCode.type === 'percentage' ? '%' : '₪'} discount applied`
  };
}
```

---

### Step 3: Write Tests First (TDD)

Create test files BEFORE implementing:

```typescript
// lib/pricing/calculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculatePrice, BASE_PRICES, PAPER_MODIFIERS, FRAME_PRICES } from './calculator';

describe('calculatePrice', () => {
  it('calculates A4 matte no frame correctly', () => {
    const result = calculatePrice({ size: 'A4', paper: 'matte', frame: 'none' });
    expect(result.basePrice).toBe(129);
    expect(result.paperModifier).toBe(0);
    expect(result.framePrice).toBe(0);
    expect(result.subtotal).toBe(129);
    expect(result.shipping).toBe(29);
    expect(result.total).toBe(158);
  });

  it('calculates A3 canvas with oak frame correctly', () => {
    const result = calculatePrice({ size: 'A3', paper: 'canvas', frame: 'oak' });
    expect(result.basePrice).toBe(179);
    expect(result.paperModifier).toBe(50);
    expect(result.framePrice).toBe(99);
    expect(result.subtotal).toBe(328);
    expect(result.total).toBe(357);
  });

  it('applies custom shipping cost', () => {
    const result = calculatePrice({ size: 'A5', paper: 'matte', frame: 'none' }, 0);
    expect(result.shipping).toBe(0);
    expect(result.total).toBe(89);
  });

  // Add more tests for all size/paper/frame combinations
});
```

---

### Step 4: Acceptance Criteria Checklist

- [ ] Live price updates on configuration change
- [ ] Price breakdown visible (base + paper + frame + shipping)
- [ ] Shipping estimate based on zone
- [ ] Discount code validation
- [ ] 100% test coverage on `lib/pricing/`
- [ ] TypeScript clean (`npm run type-check`)
- [ ] Linter clean (`npm run lint`)

---

### Step 5: Submit to QA

When complete, add entry to `.claudecode/handoffs/qa-inbox.md`:

```markdown
## 2025-12-23 - Backend-1: PC-04 Price Calculation

**Story**: PC-04 (3 SP)
**Branch**: `feature/PC-04-price-calculation`

### Completed
- [x] lib/pricing/calculator.ts - Price calculation with breakdown
- [x] lib/pricing/shipping.ts - Shipping zones and estimates
- [x] lib/pricing/discounts.ts - Discount code validation
- [x] All tests written (TDD)
- [x] 100% coverage on lib/pricing/

### Test Results
- Tests: XX passing
- Coverage: 100% on lib/pricing/

### Files Changed
| File | Change |
|------|--------|
| lib/pricing/calculator.ts | Created |
| lib/pricing/calculator.test.ts | Created |
| lib/pricing/shipping.ts | Created |
| lib/pricing/shipping.test.ts | Created |
| lib/pricing/discounts.ts | Created |
| lib/pricing/discounts.test.ts | Created |

→ Ready for QA validation
```

---

### Urgency

**This is the LAST STORY blocking Sprint 2 completion.**

When you submit, PM will merge and Sprint 2 will be 100% complete.

→ **BEGIN IMMEDIATELY**

---

## 2025-12-23 - PM: PC-04 UNBLOCKED - Begin Implementation [SUPERSEDED]

**Sprint**: 2 - AI & Customization
**Story**: PC-04
**Priority**: P1
**Gate**: 1 (Planning) → 2 (Implementation)
**Status**: ⚪ PENDING - Depends on PC-01, PC-02, PC-03

### Context

Sprint 1 is COMPLETE! Sprint 2 has kicked off. Your story (PC-04) depends on Frontend-B completing PC-01, PC-02, PC-03 first.

### Assignment

#### PC-04: Real-time Price Calculation (3 SP)

**Acceptance Criteria:**
- Live price updates on configuration change
- Price breakdown visible (base + paper + frame + shipping)
- Shipping estimate based on address

**Your Responsibility (Backend/Logic):**
- Price calculation service
- Pricing rules and formulas
- Shipping cost calculation
- Discount code validation logic

**Files to Create/Modify:**
| File | Action |
|------|--------|
| `lib/pricing/calculator.ts` | Create - Price calculation |
| `lib/pricing/shipping.ts` | Create - Shipping costs |
| `lib/pricing/discounts.ts` | Create - Discount logic |
| `stores/orderStore.ts` | Modify - Add pricing state |

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| PC-01 Size Selector | ⚪ Pending | Frontend-B working |
| PC-02 Paper Selector | ⚪ Pending | Frontend-B working |
| PC-03 Frame Selector | ⚪ Pending | Frontend-B working |

### Pricing Matrix (Reference)

```typescript
const BASE_PRICES = {
  A5: 89,   // ILS
  A4: 129,
  A3: 179,
  A2: 249,
};

const PAPER_MODIFIERS = {
  matte: 0,
  glossy: 20,
  canvas: 50,
};

const FRAME_PRICES = {
  none: 0,
  black: 79,
  white: 79,
  oak: 99,
};
```

### When to Start

Wait for PM notification that PC-01, PC-02, PC-03 are complete. Then:

```bash
git checkout -b feature/PC-04-price-calculation
mkdir -p .claudecode/milestones/sprint-2/PC-04/
# Create START.md and ROLLBACK-PLAN.md
git tag PC-04-start
```

**TDD Required: Write tests FIRST. 100% coverage for lib/pricing/.**

---

---
