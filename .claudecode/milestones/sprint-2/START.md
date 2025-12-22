# Sprint 2: AI Style & Product Configuration

**Started**: 2025-12-22
**Agent**: Frontend-B
**Branch**: feature/sprint-2-style-config
**Gate**: 1 - Planning → 2 - Build

---

## Sprint Summary

Implement the AI style gallery and product configuration components for the order creation flow. Users will select artistic styles for their photos and configure print options (size, paper, frame).

---

## Stories

| ID | Story | SP | Priority |
|----|-------|-----|----------|
| AI-01 | Display AI style gallery | 3 | Must |
| PC-01 | Select print size | 3 | Must |
| PC-02 | Choose paper type | 2 | Must |
| PC-03 | Add frame option | 3 | Must |
| AI-03 | Keep original photo option | 2 | Must |
| AI-04 | Unlimited free style previews | 3 | Must |

**Total**: 16 SP

**Recommended Order**: AI-01 → PC-01/02/03 → AI-03/04

---

## Acceptance Criteria

### AI-01: Display AI Style Gallery
- [ ] Gallery visible with style thumbnails
- [ ] Style names displayed
- [ ] Clickable style cards
- [ ] Visual selection indicator
- [ ] Tests written (TDD)
- [ ] 80%+ coverage

### PC-01: Select Print Size
- [ ] A5/A4/A3/A2 options displayed
- [ ] Size visualization (dimensions shown)
- [ ] Live price update on selection
- [ ] Tests written (TDD)
- [ ] 80%+ coverage

### PC-02: Choose Paper Type
- [ ] Matte/Glossy/Canvas options
- [ ] Tooltips explaining differences
- [ ] Price difference shown
- [ ] Tests written (TDD)
- [ ] 80%+ coverage

### PC-03: Add Frame Option
- [ ] None/Black/White/Oak options
- [ ] Frame preview visual
- [ ] Price update on selection
- [ ] Tests written (TDD)
- [ ] 80%+ coverage

### AI-03: Keep Original Photo Option
- [ ] 'Original' option in style gallery
- [ ] Enhancement toggle available
- [ ] Clear visual distinction
- [ ] Tests written (TDD)
- [ ] 80%+ coverage

### AI-04: Unlimited Free Style Previews
- [ ] No paywall for previews
- [ ] Watermark on preview images
- [ ] Full quality only on purchase
- [ ] Tests written (TDD)
- [ ] 80%+ coverage

---

## Files to Create/Modify

| File | Action | Story |
|------|--------|-------|
| `components/style-picker/StyleGallery.tsx` | Create | AI-01 |
| `components/style-picker/StyleCard.tsx` | Create | AI-01 |
| `components/style-picker/StyleGallery.test.tsx` | Create | AI-01 |
| `components/product-config/SizeSelector.tsx` | Create | PC-01 |
| `components/product-config/SizeSelector.test.tsx` | Create | PC-01 |
| `components/product-config/PaperSelector.tsx` | Create | PC-02 |
| `components/product-config/PaperSelector.test.tsx` | Create | PC-02 |
| `components/product-config/FrameSelector.tsx` | Create | PC-03 |
| `components/product-config/FrameSelector.test.tsx` | Create | PC-03 |
| `app/(app)/create/style/page.tsx` | Modify | AI-01, AI-03, AI-04 |
| `app/(app)/create/customize/page.tsx` | Modify | PC-01, PC-02, PC-03 |

---

## Dependencies

### Blocked By
- Sprint 1 Upload stories (COMPLETED)

### Blocks
- AI-02: Preview photo in different styles (Backend-2 integration)
- Checkout flow (Sprint 3)

---

## Safety Gate Progress
- [x] Gate 0: Research (N/A for these stories)
- [x] Gate 1: Planning (this document)
- [ ] Gate 2: Implementation (TDD)
- [ ] Gate 3: QA Validation
- [ ] Gate 4: Review
- [ ] Gate 5: Deployment

---

*Started by Frontend-B Agent - 2025-12-22*
