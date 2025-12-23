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

## 2025-12-23 - PM: PC-04 UNBLOCKED - Begin Implementation

**Story**: PC-04
**Priority**: P1 → P0 (Elevated)
**Gate**: 2 (Implementation)
**Status**: ✅ UNBLOCKED - Begin Now

### Dependencies Cleared

| Dependency | Status |
|------------|--------|
| PC-01 Size Selector | ✅ Merged to main |
| PC-02 Paper Selector | ✅ Merged to main |
| PC-03 Frame Selector | ✅ Merged to main |

Frontend-B completed all product config UI components. Your price calculation service can now integrate with them.

### Action Required

```bash
# Sync with main first
git fetch origin main
git checkout -b feature/PC-04-price-calculation
git merge origin/main

# Gate 1 setup
mkdir -p .claudecode/milestones/sprint-2/PC-04/
# Create START.md and ROLLBACK-PLAN.md
git tag PC-04-start
```

### Files Now Available (from main)

| File | Purpose |
|------|---------|
| `components/product-config/SizeSelector.tsx` | Provides size selection |
| `components/product-config/PaperSelector.tsx` | Provides paper type |
| `components/product-config/FrameSelector.tsx` | Provides frame choice |

Your calculator should accept these values and return pricing breakdown.

→ **ACTION**: Begin PC-04 immediately. TDD required - 100% coverage for `lib/pricing/`.

---

## 2025-12-22 - PM: Sprint 2 Assignment - Price Calculation

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
