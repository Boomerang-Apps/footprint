# GF-01: Mark Order as Gift

**Started**: 2025-12-22
**Agent**: Frontend-B
**Branch**: feature/gf-01-gift-toggle
**Linear**: https://linear.app/boomerang-apps/issue/UZF-1839
**Gate**: 1 - Planning → 2 - Build

---

## Story Summary

Enable users to mark their order as a gift with prominent toggle, gift wrap option, and ensure no price appears on the delivery slip for gift orders.

---

## Scope

### In Scope
- Gift toggle component (prominent placement)
- Gift wrap add-on option
- Integration with orderStore (isGift, giftWrap states)
- Visual feedback when gift mode is active
- Price hiding indicator for gift orders

### Out of Scope
- Personal message (GF-02)
- Recipient shipping address (GF-03)
- Backend price hiding logic (handled by Backend-2)

---

## Acceptance Criteria
- [ ] Gift toggle prominently displayed in customize/checkout flow
- [ ] Toggle updates orderStore.isGift state
- [ ] Gift wrap option visible when gift toggle is ON
- [ ] Gift wrap updates orderStore.giftWrap state
- [ ] Visual indicator that price won't appear on slip
- [ ] Tests written FIRST (TDD)
- [ ] 80%+ test coverage
- [ ] TypeScript strict mode clean
- [ ] Linter clean

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `components/gift/GiftToggle.tsx` | Create | Gift toggle with wrap option |
| `components/gift/GiftToggle.test.tsx` | Create | TDD tests |
| `app/(app)/create/customize/page.tsx` | Modify | Integrate GiftToggle |

---

## Dependencies

### Blocked By
- Sprint 1 & 2 complete (upload, style, product config)

### Blocks
- GF-02: Add personal message
- GF-03: Ship to recipient

---

## Technical Notes

### orderStore Integration
```typescript
// Existing fields in orderStore:
isGift: boolean;      // Toggle state
giftWrap: boolean;    // Wrap add-on
giftMessage: string;  // For GF-02
```

### UI Considerations
- Toggle should be visually prominent (not hidden)
- Gift wrap should only show when isGift is true
- Include messaging about price not appearing on slip

---

## Safety Gate Progress
- [x] Gate 0: Research (N/A - standard UI component)
- [x] Gate 1: Planning (this document)
- [x] Gate 2: Implementation (TDD - 20 tests, 100% coverage)
- [ ] Gate 3: QA Validation (pending)
- [x] Gate 4: Review (TypeScript clean, Lint clean)
- [ ] Gate 5: Deployment

---

*Started by Frontend-B Agent - 2025-12-22*
