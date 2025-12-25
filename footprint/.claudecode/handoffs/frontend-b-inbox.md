# frontend-b Agent Inbox

---

## 📋 CURRENT: UI-04 - Checkout Page UI
**From**: PM Agent
**Date**: 2025-12-25
**Priority**: P0 (Highest)
**Sprint**: 4

### Story: UI-04 - Checkout Page UI
**Points**: 5 SP
**Status**: In Progress
**Mockup**: `design_mockups/04-checkout.html`

**Acceptance Criteria**:
- Header with back button and title "תשלום"
- 4-step progress bar at 80% (Step 4 active)
- Gift toggle section with gift wrap option
- Gift message input (150 char limit) when gift enabled
- Shipping address form with:
  - Full name, phone, email
  - Street address, city, postal code
  - Israel address format (7-digit postal)
- Payment section showing card/Bit options
- Price breakdown with:
  - Subtotal, shipping, discount row
  - Discount code input field
  - Total in ILS (₪)
- Fixed bottom CTA with "חזרה" and "לתשלום" buttons
- Hebrew RTL layout throughout

**Branch**: `feature/ui-04-checkout-page`

**Dependencies**:
- UI-06 (Demo Data) ✅ Done
- UI-03 (Customize) ✅ Done - use same patterns

**Files to create/modify**:
- `app/(app)/create/checkout/page.tsx` - Complete page rewrite
- `app/(app)/create/checkout/page.test.tsx` - TDD tests (write first!)
- `.claudecode/milestones/sprint-4/UI-04/START.md` - Gate 1 planning
- `.claudecode/milestones/sprint-4/UI-04/ROLLBACK-PLAN.md` - Gate 1 rollback

**Reference Files**:
- `design_mockups/04-checkout.html` - Target design
- `app/(app)/create/customize/page.tsx` - Pattern reference
- `data/demo/` - Demo data for testing
- `stores/orderStore.ts` - Gift and address state

**Gate Checklist**:
- [ ] Gate 1: START.md + ROLLBACK-PLAN.md
- [ ] Gate 2: TDD tests first, then implementation
- [ ] Gate 3: 80%+ coverage, TypeScript clean, Lint clean
- [ ] Gate 4: QA validation
- [ ] Gate 5: Merge to main

**Notes**:
- This is the largest UI story (5 SP) - take your time
- Use existing orderStore for gift/address state
- Discount code UI only - CO-05 handles validation logic

---

## 📋 NEXT: OM-01 - Admin Order Dashboard
**Priority**: HIGH (after UI-04)

Admin dashboard implementation - will be assigned after UI-04 completion.

---

*Last checked: 2025-12-25*
