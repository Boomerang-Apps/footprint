# Sprint 4: UI Implementation Plan

**Created**: 2025-12-24
**Owner**: PM Agent
**Status**: Ready for Kickoff
**CTO Approved**: Yes

---

## Sprint Overview

| Metric | Value |
|--------|-------|
| Sprint | 4 |
| Focus | UI Implementation & Demo |
| Stories | UI-01 to UI-06 |
| Total Points | 18 |
| Agent | Frontend-B |
| Duration | Target 3-4 days |

---

## Objective

Implement the 5-step order flow UI matching the HTML mockups exactly. Use demo/mock data only - no backend integration in this sprint.

**Goal**: Visual parity with mockups, Hebrew RTL support, responsive design.

---

## Story Execution Order

### Phase 1: Foundation (Day 1)

#### UI-06: Demo Data & Mock Images (2 points)
**Priority**: Start First - Other stories depend on this

**Deliverables**:
1. Create `data/demo/` folder with mock data files
2. Sample order data matching database types
3. Mock product images for style previews (8 styles)
4. Sample user profile data
5. Mock transformed images (before/after pairs)

**Files to Create**:
```
data/demo/
├── orders.ts        # Sample orders with all statuses
├── products.ts      # Size/paper/frame pricing
├── styles.ts        # 8 AI styles with preview images
├── images.ts        # Mock image URLs for testing
└── index.ts         # Export all demo data
```

**Acceptance Criteria**:
- [ ] Demo data matches `types/database.ts` interfaces
- [ ] At least 3 sample orders with different statuses
- [ ] 8 style previews with before/after images
- [ ] Price data matches product_prices table

---

### Phase 2: Order Flow Pages (Days 2-3)

#### UI-01: Upload Page (3 points)
**Mockup**: `design_mockups/01-upload.html`
**Route**: `/create`

**Key UI Elements**:
- Hero section with Hebrew headline
- Large drag-drop zone (dashed border)
- Camera/gallery button for mobile
- File type hints (JPG, PNG, HEIC)
- Upload progress indicator
- Error states for invalid files

**Implementation Notes**:
- Use existing `DropZone.tsx` as base, restyle to match mockup
- Add progress bar component
- Mobile-first responsive design
- RTL text alignment

---

#### UI-02: Style Selection Page (3 points)
**Mockup**: `design_mockups/02-style-selection.html`
**Route**: `/create/style`
**Depends On**: UI-01

**Key UI Elements**:
- 2x4 grid of style options
- Style thumbnails with Hebrew labels
- Selected state highlight (purple border)
- Before/after preview toggle
- "Original" option included
- Loading skeleton during preview

**8 Styles to Display**:
1. פופ ארט (Pop Art)
2. צבעי מים (Watercolor)
3. קווי מתאר (Line Art)
4. ציור שמן (Oil Painting)
5. רומנטי (Romantic)
6. קומיקס (Comic Book)
7. וינטג' (Vintage)
8. מקורי (Original)

---

#### UI-03: Customize Page (3 points)
**Mockup**: `design_mockups/03-customize.html`
**Route**: `/create/customize`
**Depends On**: UI-02

**Key UI Elements**:
- Large preview image (left/top)
- Configuration panel (right/bottom)
- Size selector (A5/A4/A3/A2) with visual scale
- Paper type cards (Matte/Glossy/Canvas)
- Frame options with color swatches
- Live price breakdown
- Room mockup preview (optional)

**Price Display**:
```
גודל: A4           ₪149
נייר: מאט          ₪0
מסגרת: שחורה       ₪60
───────────────────
סה"כ:              ₪209
```

---

#### UI-04: Checkout Page (5 points)
**Mockup**: `design_mockups/04-checkout.html`
**Route**: `/create/checkout`
**Depends On**: UI-03

**Key UI Elements**:
- Order summary sidebar
- Gift toggle with message field
- Shipping address form (Hebrew fields)
- Payment section placeholder
- Discount code input
- Terms checkbox
- Complete order CTA

**Form Fields**:
- שם מלא (Full name)
- טלפון (Phone)
- רחוב ומספר (Street & number)
- דירה (Apartment - optional)
- עיר (City)
- מיקוד (Postal code - optional)

**Gift Section** (when toggled):
- הודעה אישית (Personal message) - 150 char limit
- אריזת מתנה (Gift wrapping) checkbox

---

#### UI-05: Confirmation Page (2 points)
**Mockup**: `design_mockups/05-confirmation.html`
**Route**: `/create/complete`
**Depends On**: UI-04

**Key UI Elements**:
- Success animation/icon
- Order number display (FP-2024-XXXX)
- Order timeline tracker
- Product thumbnail
- Estimated delivery
- WhatsApp share button
- Email confirmation note
- "Create Another" CTA

**Timeline States**:
1. ✓ הזמנה התקבלה (Order received)
2. ○ בהדפסה (Printing)
3. ○ נשלח (Shipped)
4. ○ נמסר (Delivered)

---

## Phase 3: QA & Polish (Day 4)

- Run all tests (target 80%+ coverage)
- Cross-browser testing (Chrome, Safari, Firefox)
- Mobile responsive check (375px, 768px, 1024px+)
- RTL text alignment verification
- Accessibility audit (keyboard nav, screen readers)
- Performance check (Lighthouse score)

---

## Technical Requirements

### Styling
- Use Tailwind CSS classes
- Follow existing design tokens in `tailwind.config.ts`
- RTL: Use `dir="rtl"` and Tailwind RTL utilities
- Dark mode support (optional, but structure for it)

### Components
- Reuse primitives from `components/ui/`
- Create new components in appropriate feature folders
- Follow existing naming conventions

### State
- Use existing `orderStore.ts` for flow state
- Demo data should work with store actions

### Testing
- Jest/Vitest for unit tests
- React Testing Library for components
- Minimum 80% coverage per story

---

## File Structure

```
app/(app)/create/
├── page.tsx              # UI-01: Upload
├── style/
│   └── page.tsx          # UI-02: Style Selection
├── customize/
│   └── page.tsx          # UI-03: Customize
├── checkout/
│   └── page.tsx          # UI-04: Checkout
└── complete/
    └── page.tsx          # UI-05: Confirmation

components/
├── create/               # Order flow components
│   ├── UploadZone.tsx
│   ├── StyleGrid.tsx
│   ├── SizeSelector.tsx
│   ├── PaperPicker.tsx
│   ├── FrameOptions.tsx
│   ├── PriceBreakdown.tsx
│   ├── GiftToggle.tsx
│   ├── AddressForm.tsx
│   └── OrderTimeline.tsx

data/demo/                # UI-06: Demo data
├── orders.ts
├── products.ts
├── styles.ts
├── images.ts
└── index.ts
```

---

## PM Agent Actions

### Kickoff (Now)
1. [ ] Acknowledge this plan
2. [ ] Create handoff to Frontend-B for UI-06
3. [ ] Set UI-06 status to `in-progress` in dev-dashboard

### During Sprint
4. [ ] Monitor Frontend-B progress
5. [ ] Route completed stories to QA
6. [ ] Handle blockers and questions

### Per Story Completion
7. [ ] Receive completion notification from Frontend-B
8. [ ] Route to QA for Gate 3 validation
9. [ ] Receive QA approval
10. [ ] Merge to main
11. [ ] Update story status to `done`
12. [ ] Assign next story

### Sprint Completion
13. [ ] Verify all 6 stories merged
14. [ ] Update Sprint 4 status to `completed`
15. [ ] Create handoff to CTO for Sprint 5 planning

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Stories Completed | 6/6 |
| Test Coverage | >= 80% |
| TypeScript Errors | 0 |
| Lint Errors | 0 |
| Visual Match | 100% with mockups |
| Mobile Responsive | Yes |
| RTL Support | Yes |

---

## Dependencies

| Item | Status |
|------|--------|
| Mockup HTML files | ✅ Ready |
| Database types | ✅ Ready (`types/database.ts`) |
| Order store | ✅ Ready (`stores/orderStore.ts`) |
| UI primitives | ✅ Ready (`components/ui/`) |
| Supabase schema | ✅ Deployed |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Mockup interpretation | Reference HTML source, ask CTO if unclear |
| Complex animations | Defer to polish phase, basic states first |
| Image assets | Use placeholder images, replace later |
| RTL edge cases | Test early, use Tailwind RTL plugin |

---

**PM Agent**: Please acknowledge this plan and begin distribution to Frontend-B starting with UI-06.

---

*Plan created by CTO Agent - 2025-12-24*
