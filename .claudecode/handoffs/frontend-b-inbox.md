# Frontend-B Agent Inbox

Work assignments for feature components and screens appear here.

---

## Domain Reminder
Your domain: Order creation flow (5 steps), upload, style picker, product config, checkout, feature screens

NOT your domain: UI primitives (Frontend-A), APIs (Backend-2), stores (Backend-1)

---

## How to Use This Inbox

### For PM Agent:
Assign work related to:
- Order creation flow steps
- Upload component
- Style picker
- Product configuration
- Checkout flow
- Admin/feature screens

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

## 2025-12-25 - PM: UI-04 Assignment - Checkout Page UI

**Story**: UI-04
**Priority**: P0
**Type**: Sprint 4 - UI Implementation
**Sprint**: 4
**Points**: 5

### Context
UI-03 (Customize Page) is now merged ✅. You can start UI-04 immediately.

### Assignment
You are assigned UI-04: Checkout Page UI

**Mockup**: `design_mockups/04-checkout.html`
**Route**: `/create/checkout`
**Dependencies**: UI-03 ✅ (merged)

### Requirements
Implement the checkout page matching the mockup exactly:

**Key UI Elements**:
1. **Header**: Back button (→) + title "תשלום"
2. **Progress Bar**: 80% filled (Step 4 of 4: העלאה ✓ → סגנון ✓ → התאמה ✓ → **תשלום**)
3. **Order Summary Card**:
   - Thumbnail of transformed image
   - Style name: "פורטרט AI - פופ ארט"
   - Specs: "A4 • 21×29.7 ס״מ / Fine Art Matte • מסגרת שחורה"
   - "עריכה" (edit) link back to customize
4. **Gift Toggle Section**:
   - Toggle switch with gift icon
   - "זו מתנה?" label + "נוסיף אריזת מתנה והודעה אישית" desc
   - When ON: Show gift message textarea (150 char limit)
   - Character counter
5. **Shipping Form**:
   - Icon: truck icon + "פרטי משלוח"
   - Fields:
     | Field | Placeholder |
     |-------|-------------|
     | שם מלא | ישראל ישראלי |
     | טלפון | 050-0000000 (dir="ltr") |
     | כתובת | רחוב, מספר בית, דירה |
     | עיר | תל אביב |
     | מיקוד | 0000000 (dir="ltr") |
6. **Payment Methods**:
   - Icon: credit card + "אמצעי תשלום"
   - Radio button options:
     | Method | Icon |
     |--------|------|
     | כרטיס אשראי | 💳 |
     | Apple Pay | 🍎 |
     | Google Pay | G |
7. **Coupon Section**:
   - Input field + "החל" (apply) button
8. **Price Breakdown**:
   | Item | Example |
   |------|---------|
   | הדפסה A4 | ₪149 |
   | מסגרת שחורה | ₪60 |
   | משלוח | חינם (green) |
   | **סה״כ לתשלום** | **₪209** |
9. **Bottom CTA**:
   - Secure badge: 🔒 "תשלום מאובטח ב-SSL"
   - Primary button: "לתשלום ₪209" with lock icon

**Files to Modify/Create**:
```
app/(app)/create/checkout/page.tsx     # Main checkout page
app/(app)/create/checkout/page.test.tsx  # TDD tests
```

### Technical Notes
- Read from orderStore for product config (size, paper, frame, prices)
- RTL layout with `dir="rtl"`
- Mobile-first responsive (375px+)
- Desktop: 2-column layout (form left, summary right sticky)
- Use Tailwind CSS only
- Gift toggle shows/hides message area
- Form validation with Hebrew error messages

### Acceptance Criteria
- [ ] Matches mockup visually
- [ ] Order summary card displays correctly
- [ ] Gift toggle shows/hides message textarea
- [ ] Gift message has 150 char limit with counter
- [ ] Shipping form with all required fields
- [ ] Payment method radio selection works
- [ ] Coupon input with apply button
- [ ] Price breakdown calculates correctly
- [ ] Progress bar shows 80% (step 4)
- [ ] RTL layout correct
- [ ] Mobile responsive
- [ ] Desktop 2-column layout
- [ ] Navigation works (back to /create/customize, forward to /create/complete)
- [ ] Tests written (TDD)
- [ ] Coverage: 80%+ minimum

### Gate 1 Checklist (MANDATORY - Before Coding)
- [ ] Create branch: `git checkout -b feature/UI-04-checkout-page`
- [ ] Create START.md: `.claudecode/milestones/sprint-4/UI-04/START.md`
- [ ] Create ROLLBACK-PLAN.md
- [ ] Create tag: `git tag UI-04-start`

### On Completion
Write handoff to: `.claudecode/handoffs/qa-inbox.md`

**Unblocks**: UI-05 (Confirmation Page UI)

---

## 2025-12-25 - PM: UI-03 Assignment - Customize Page UI [COMPLETED]

**Story**: UI-03
**Status**: ✅ QA APPROVED & MERGED (2025-12-25)
**Results**: 35 tests, 100% statement coverage, 92.42% branch

---

---

## Completed Messages

## 2025-12-25 - PM: UI-03 Assignment [COMPLETED]

**Story**: UI-03
**Status**: ✅ QA APPROVED & MERGED (2025-12-25)
**Results**: 35 tests, 100% coverage

---

## 2025-12-25 - PM: UI-02 Assignment [COMPLETED]

**Story**: UI-02
**Status**: ✅ QA APPROVED & MERGED (2025-12-25)
**Results**: 28 tests, 100% statement coverage

---

## 2025-12-24 - PM: UI-01 Assignment [COMPLETED]

### Assignment
You are assigned UI-03: Customize Page UI

**Points**: 3
**Mockup**: `design_mockups/03-customize.html`
**Route**: `/create/customize`
**Dependencies**: UI-02 ✅ (merged)

### Requirements
Implement the customize page matching the mockup exactly:

**Key UI Elements**:
1. **Header**: Back button (←) + title "התאמה אישית"
2. **Progress Bar**: 60% filled (Step 3 of 4: העלאה ✓ → סגנון ✓ → **התאמה** → תשלום)
3. **Preview Mockup**:
   - Frame preview with selected image
   - Updates based on frame selection (none/black/white/oak)
   - Size label showing dimensions (e.g., "A4 • 21×29.7 ס״מ")
4. **Size Options** (2x2 grid on mobile, 4-col on tablet+):
   | Size | Dimensions | Price |
   |------|------------|-------|
   | A5 | 14.8×21 ס״מ | ₪89 |
   | A4 | 21×29.7 ס״מ | ₪149 | ← "פופולרי" badge |
   | A3 | 29.7×42 ס״מ | ₪249 |
   | A2 | 42×59.4 ס״מ | ₪379 |
5. **Paper Options** (vertical list with radio buttons):
   | Paper | Description | Price |
   |-------|-------------|-------|
   | Fine Art Matte | נייר פיין ארט מט, איכות מוזיאון | כלול |
   | Glossy Photo | נייר צילום מבריק, צבעים עזים | +₪20 |
   | Canvas Texture | טקסטורת קנבס, מראה ציורי | +₪40 |
6. **Frame Options** (4-col grid):
   | Frame | Hebrew | Price |
   |-------|--------|-------|
   | None | ללא | חינם |
   | Black | שחור | +₪60 |
   | White | לבן | +₪60 |
   | Oak | אלון | +₪80 |
7. **Bottom CTA**:
   - Price summary: "סה״כ ₪209 + משלוח"
   - Back button (secondary)
   - "המשך לתשלום" button (primary)

**Live Price Calculation**:
- Total = Size + Paper + Frame
- Default: A4 (₪149) + Matte (₪0) + Black (₪60) = ₪209

**Files to Modify/Create**:
```
app/(app)/create/customize/page.tsx     # Main customize page
app/(app)/create/customize/page.test.tsx  # TDD tests
```

### Technical Notes
- Use demo data from `data/demo/` for pricing
- RTL layout with `dir="rtl"`
- Mobile-first responsive (375px+)
- Use Tailwind CSS only
- Live price updates on selection change
- Frame preview updates on frame selection

### Acceptance Criteria
- [ ] Matches mockup visually
- [ ] Size grid displays correctly (2x2 mobile, 4-col tablet)
- [ ] Paper options with radio button styling
- [ ] Frame grid with frame previews
- [ ] Live price calculation updates
- [ ] Frame preview updates on selection
- [ ] Progress bar shows 60% (step 3)
- [ ] RTL layout correct
- [ ] Mobile responsive
- [ ] Navigation works (back to /create/style, forward to /create/checkout)
- [ ] Tests written (TDD)
- [ ] Coverage: 80%+ minimum

### Gate 1 Checklist (MANDATORY - Before Coding)
- [ ] Create branch: `git checkout -b feature/UI-03-customize-page`
- [ ] Create START.md: `.claudecode/milestones/sprint-4/UI-03/START.md`
- [ ] Create ROLLBACK-PLAN.md
- [ ] Create tag: `git tag UI-03-start`

### On Completion
Write handoff to: `.claudecode/handoffs/qa-inbox.md`

**Unblocks**: UI-04 (Checkout Page UI)

---

---

## Completed Messages

## 2025-12-25 - PM: UI-02 Assignment [COMPLETED]

**Story**: UI-02
**Status**: ✅ QA APPROVED & MERGED (2025-12-25)
**Results**: 28 tests, 100% statement coverage

---

## 2025-12-24 - PM: UI-01 Assignment [COMPLETED]

**Story**: UI-01
**Status**: ✅ QA APPROVED & MERGED (2025-12-24)
**Results**: 24 tests, 624 total tests passing

---

## 2025-12-24 - PM: UI-06 Assignment [COMPLETED]

**Story**: UI-06
**Status**: ✅ QA APPROVED & MERGED (2025-12-24)
**Results**: 51 tests, 100% coverage

---

## 2025-12-21 - PM: Sprint 1 Assignment - Upload Stories [COMPLETED 2025-12-22]

**Story**: UI-02
**Priority**: P0
**Type**: Sprint 4 - UI Implementation
**Sprint**: 4

### Context
UI-01 (Upload Page) is now merged ✅. You can start UI-02 immediately.

### Assignment
You are assigned UI-02: Style Selection UI

**Points**: 3
**Mockup**: `design_mockups/02-style-selection.html`
**Route**: `/create/style`
**Dependencies**: UI-01 ✅ (merged)

### Requirements
Implement the style selection page matching the mockup exactly:

**Key UI Elements**:
1. **Header**: Back button (←) + title "בחירת סגנון"
2. **Progress Bar**: 40% filled (Step 2 of 4: העלאה → **סגנון** → התאמה → תשלום)
3. **Preview Container**:
   - Large image preview (4:5 aspect ratio)
   - Close/X button (top-left)
   - Style badge showing current style name (bottom-right)
   - AI processing overlay with spinner when switching styles
4. **Style Strip** (horizontal scrollable):
   | Style | Hebrew | Badge |
   |-------|--------|-------|
   | Pop Art | פופ ארט | פופולרי (Popular) |
   | Watercolor | צבעי מים | - |
   | Line Art | ציור קווי | - |
   | Oil Painting | ציור שמן | - |
   | Romantic | רומנטי | חדש (New) |
   | Comic | קומיקס | - |
   | Vintage | וינטג׳ | - |
   | Original Enhanced | מקורי משופר | - |
5. **Free Notice**: "תצוגה מקדימה חינם ללא הגבלה"
6. **Bottom CTA**: "חזרה" (secondary) + "אהבתי! המשך" (primary)

**Style Colors** (gradients):
- Pop Art: purple → pink (#8b5cf6 → #ec4899)
- Watercolor: blue → cyan (#3b82f6 → #06b6d4)
- Line Art: gray (#6b7280 → #9ca3af)
- Oil: amber → orange (#f59e0b → #d97706)
- Romantic: pink (#ec4899 → #f472b6)
- Comic: orange → red (#f97316 → #ef4444)
- Vintage: brown (#92400e → #b45309)
- Original: green (#10b981 → #34d399)

**Files to Modify/Create**:
```
app/(app)/create/style/page.tsx     # Main style selection page
app/(app)/create/style/page.test.tsx  # TDD tests
```

### Technical Notes
- Use demo data from `data/demo/` for style previews
- RTL layout with `dir="rtl"`
- Mobile-first responsive (375px+)
- Use Tailwind CSS only
- Style selection should update preview with loading state
- Store selected style in orderStore (or local state for demo)

### Acceptance Criteria
- [ ] Matches mockup visually
- [ ] All 8 styles displayed with correct icons and colors
- [ ] Style selection shows checkmark on selected item
- [ ] AI processing overlay shows when switching styles
- [ ] Progress bar shows 40% (step 2)
- [ ] RTL layout correct
- [ ] Mobile responsive (horizontal scroll on mobile)
- [ ] Navigation works (back to /create, forward to /create/customize)
- [ ] Tests written (TDD)
- [ ] Coverage: 80%+ minimum

### Gate 1 Checklist (MANDATORY - Before Coding)
- [ ] Create branch: `git checkout -b feature/UI-02-style-selection`
- [ ] Create START.md: `.claudecode/milestones/sprint-4/UI-02/START.md`
- [ ] Create ROLLBACK-PLAN.md
- [ ] Create tag: `git tag UI-02-start`

### On Completion
Write handoff to: `.claudecode/handoffs/qa-inbox.md`

**Unblocks**: UI-03 (Customize Page UI)

---

---

## Completed Messages

## 2025-12-24 - PM: UI-01 Assignment [COMPLETED]

**Story**: UI-01
**Status**: ✅ QA APPROVED & MERGED (2025-12-24)
**Results**: 24 tests, 624 total tests passing

---

## 2025-12-24 - PM: UI-06 Assignment [COMPLETED]

**Story**: UI-06
**Status**: ✅ QA APPROVED & MERGED (2025-12-24)
**Results**: 51 tests, 100% coverage

---

## 2025-12-21 - PM: Sprint 1 Assignment - Upload Stories [COMPLETED 2025-12-22]

**Stories**: UP-01, UP-02, UP-04
**Priority**: P0
**Sprint**: 1
**Status**: ✅ COMPLETED - Handed off to QA Agent

### Assignment

Frontend-B, you are assigned the following Sprint 1 stories:

#### UP-01: Upload Photo from Camera Roll (5 SP)
**Acceptance Criteria:**
- Camera roll opens on mobile devices
- JPG, PNG, HEIC format support
- Preview shown after selection
- Error handling for invalid files

**Files to modify:**
- `app/(app)/create/page.tsx` (enhance existing)
- `components/upload/CameraRollUpload.tsx` (new)

#### UP-02: Drag-and-Drop Upload on Desktop (3 SP)
**Acceptance Criteria:**
- Drop zone visible and responsive
- Multi-file support (single selection for MVP)
- Upload progress indicator
- File type validation feedback

**Files to modify:**
- `app/(app)/create/page.tsx` (enhance existing)
- `components/upload/DropZone.tsx` (new)

#### UP-04: Preview Uploaded Photo (3 SP)
**Acceptance Criteria:**
- Full-size preview display
- Zoom/pan capability
- Replace photo option
- Image dimensions shown

**Files to modify:**
- `components/upload/ImagePreview.tsx` (new)
- `app/(app)/create/page.tsx` (integrate)

### Gate 1 Requirements (MANDATORY)
Before starting implementation:
```bash
git checkout -b feature/UP-01-camera-upload
mkdir -p .claudecode/milestones/sprint-1/UP-01/
# Create START.md and ROLLBACK-PLAN.md
git tag UP-01-start
```

### Handoff
When complete, write to `qa-inbox.md` with:
- Branch name
- Test results
- Coverage report

**TDD Required: Write tests FIRST. 80%+ coverage.**

---

---
