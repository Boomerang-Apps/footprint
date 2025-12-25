# UI-03: Customize Page UI

**Started**: 2025-12-25
**Agent**: Frontend-B
**Branch**: feature/ui-03-customize-page
**Mockup**: 03-customize.html
**Gate**: 1 - Planning

---

## Story Summary

Implement the Customize Page UI matching the 03-customize.html mockup exactly, with Hebrew RTL support, size/paper/frame selectors, live price calculation, and frame preview visualization.

---

## Scope

### In Scope
- Update `app/(app)/create/customize/page.tsx` to match mockup
- Progress bar at 60% (Steps 1 & 2 completed, Step 3 active)
- Preview mockup container with frame visualization
- Size selector grid (2x2): A5, A4, A3, A2
  - A4 marked as "פופולרי"
  - Prices: A5=₪89, A4=₪149, A3=₪249, A2=₪379
- Paper selector (vertical list with radio buttons):
  - Fine Art Matte (included in price)
  - Glossy Photo (+₪20)
  - Canvas (+₪40)
- Frame selector grid (4 columns):
  - None (ללא מסגרת) - free
  - Black (שחור) - +₪60
  - White (לבן) - +₪60
  - Oak (אלון טבעי) - +₪80
- Live price summary in bottom CTA
- Fixed bottom CTA with "המשך לתשלום" button
- Hebrew RTL layout

### Out of Scope
- Gift option (not in mockup for this step)
- Backend integration
- Actual payment processing

---

## Acceptance Criteria

- [ ] Page layout matches 03-customize.html mockup
- [ ] Progress bar shows 60% with Step 3 active
- [ ] Preview container with frame visualization
- [ ] Size grid with 4 options and "פופולרי" badge on A4
- [ ] Paper list with 3 options and radio buttons
- [ ] Frame grid with 4 options and color previews
- [ ] Live price calculation displayed
- [ ] Bottom CTA shows "סה״כ ₪X + משלוח"
- [ ] "המשך לתשלום" button navigates to checkout
- [ ] Hebrew RTL text direction
- [ ] Tests written FIRST (TDD)
- [ ] TypeScript strict mode clean
- [ ] Linter clean

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `app/(app)/create/customize/page.tsx` | Modify | Match mockup layout and styling |
| `app/(app)/create/customize/page.test.tsx` | Create | TDD tests for customize page |

---

## Technical Notes

### Key Components from Mockup

1. **Header**: Sticky, back button (arrow-right for RTL), title "התאמה אישית"

2. **Progress Bar**:
   - 4 steps with dots
   - Steps 1 & 2 (העלאה, סגנון) - completed (green)
   - Step 3 (התאמה) - active (purple)
   - 60% gradient fill

3. **Preview Container**:
   - Large aspect-ratio container
   - Frame visualization around image
   - Shadow effect based on frame selection

4. **Size Selector** (2x2 grid):
   - A5: 14.8 × 21 ס״מ - ₪89
   - A4: 21 × 29.7 ס״מ - ₪149 (פופולרי badge)
   - A3: 29.7 × 42 ס״מ - ₪249
   - A2: 42 × 59.4 ס״מ - ₪379

5. **Paper Selector** (vertical radio list):
   - נייר אמנות מט (Fine Art Matte) - כלול במחיר
   - נייר צילום מבריק (Glossy) - +₪20
   - קנבס (Canvas) - +₪40

6. **Frame Selector** (4-column grid):
   - ללא מסגרת - חינם (no frame)
   - שחור - +₪60 (black square)
   - לבן - +₪60 (white square)
   - אלון טבעי - +₪80 (wood color square)

7. **Bottom CTA**:
   - Price summary: "סה״כ ₪209 + משלוח"
   - Primary button: "המשך לתשלום"

### Price Calculation
```typescript
const calculateTotal = () => {
  const sizePrice = sizes.find(s => s.id === selectedSize)?.price || 0;
  const paperPrice = papers.find(p => p.id === selectedPaper)?.extraPrice || 0;
  const framePrice = frames.find(f => f.id === selectedFrame)?.extraPrice || 0;
  return sizePrice + paperPrice + framePrice;
};
```

---

## Dependencies

### Requires
- UI-02: Style Selection (provides selectedStyle and transformedImage)

### Blocks
- UI-04: Checkout Page UI

---

## Safety Gate Progress

- [x] Gate 0: Research (N/A - UI implementation)
- [x] Gate 1: Planning (this document)
- [ ] Gate 2: Implementation (TDD)
- [ ] Gate 3: QA Validation
- [ ] Gate 4: Review
- [ ] Gate 5: Deployment

---

*Started by Frontend-B Agent - 2025-12-25*
