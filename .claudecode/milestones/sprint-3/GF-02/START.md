# GF-02: Add Personal Message

**Started**: 2025-12-23
**Agent**: Frontend-B
**Branch**: feature/gf-02-gift-message
**Linear**: https://linear.app/boomerang-apps/issue/UZF-1840
**Gate**: 1 - Planning → 2 - Build

---

## Story Summary

Add a personal message feature for gift orders with 150 character limit, live preview of how the message will appear on the printed card.

---

## Scope

### In Scope
- GiftMessage component with textarea
- 150 character limit with counter
- Live preview showing message on card mockup
- Integration with orderStore.giftMessage
- Validation and character counting

### Out of Scope
- Actual print template (backend concern)
- Gift toggle (GF-01 - completed)
- Recipient address (GF-03)

---

## Acceptance Criteria
- [ ] Textarea with 150 char limit
- [ ] Character counter showing X/150
- [ ] Live preview of message on card
- [ ] Updates orderStore.giftMessage
- [ ] Only visible when isGift is true
- [ ] Hebrew placeholder text
- [ ] Tests written FIRST (TDD)
- [ ] 80%+ test coverage
- [ ] TypeScript strict mode clean
- [ ] Linter clean

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `components/gift/GiftMessage.tsx` | Create | Message input with preview |
| `components/gift/GiftMessage.test.tsx` | Create | TDD tests |
| `app/(app)/create/customize/page.tsx` | Modify | Replace inline textarea with component |

---

## Dependencies

### Blocked By
- GF-01: Gift toggle (completed)

### Blocks
- GF-03: Ship to recipient

---

## Technical Notes

### orderStore Integration
```typescript
// Existing field in orderStore:
giftMessage: string;
setGiftMessage: (message: string) => void;
```

### UI Considerations
- Preview should look like a gift card/note
- Show remaining characters
- Clear visual feedback when typing
- Optional: warn when approaching limit

---

## Safety Gate Progress
- [x] Gate 0: Research (N/A - standard UI component)
- [x] Gate 1: Planning (this document)
- [x] Gate 2: Implementation (TDD - 25 tests, 100% coverage)
- [ ] Gate 3: QA Validation (pending)
- [x] Gate 4: Review (TypeScript clean, Lint clean)
- [ ] Gate 5: Deployment

---

*Started by Frontend-B Agent - 2025-12-23*
