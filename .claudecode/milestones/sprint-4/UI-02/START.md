# UI-02: Style Selection UI

**Started**: 2025-12-24
**Agent**: Frontend-B
**Branch**: feature/ui-02-style-selection
**Mockup**: 02-style-selection.html
**Gate**: 1 - Planning

---

## Story Summary

Implement the Style Selection Page UI matching the 02-style-selection.html mockup exactly, with Hebrew RTL support, horizontal style strip, AI processing overlay, and preview state.

---

## Scope

### In Scope
- Update `app/(app)/create/style/page.tsx` to match mockup
- Progress bar at 40% (Step 2 active, Step 1 completed)
- Large preview container with:
  - Close button (X) to go back
  - Style badge showing current style
  - AI processing overlay with spinner
- Horizontal scrollable style strip with 8 styles
- Style icons with gradient backgrounds
- Popular/New badges on specific styles
- Free preview notice
- Fixed bottom CTA with two buttons
- Hebrew RTL layout
- Responsive design

### Out of Scope
- Actual AI transformation (simulated with timeout)
- Backend integration

---

## Acceptance Criteria

- [ ] Page layout matches 02-style-selection.html mockup
- [ ] Progress bar shows 40% with Step 2 active
- [ ] Preview container with style badge
- [ ] AI processing overlay when switching styles
- [ ] Horizontal scrollable style strip
- [ ] 8 style options with gradient icons
- [ ] Popular badge on Pop Art
- [ ] "חדש" badge on Romantic
- [ ] Free preview notice displayed
- [ ] Bottom CTA with "חזרה" and "אהבתי! המשך" buttons
- [ ] Hebrew RTL text direction
- [ ] Tests written FIRST (TDD)
- [ ] TypeScript strict mode clean
- [ ] Linter clean

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `app/(app)/create/style/page.tsx` | Modify | Match mockup layout and styling |
| `app/(app)/create/style/page.test.tsx` | Create | TDD tests for style page |

---

## Technical Notes

### Key Components from Mockup

1. **Header**: Sticky, back button (arrow-right for RTL), title "בחירת סגנון"

2. **Progress Bar**:
   - 4 steps with dots
   - Step 1 (העלאה) - completed (green)
   - Step 2 (סגנון) - active (purple)
   - 40% gradient fill

3. **Preview Container**:
   - Large aspect-ratio 4/5
   - Close button (X) top-left
   - Style badge bottom-right
   - AI overlay with spinner

4. **Style Strip** (horizontal scroll):
   - 8 styles: פופ ארט, צבעי מים, ציור קווי, ציור שמן, רומנטי, קומיקס, וינטג', מקורי משופר
   - Gradient icon buttons
   - Selection check mark
   - Popular/New badges

5. **Free Notice**: Purple background with sparkle icon

6. **Bottom CTA**: Fixed, two buttons (secondary + primary)

### Style Colors (from mockup)
```css
.style-pop-art { background: linear-gradient(135deg, #8b5cf6, #ec4899); }
.style-watercolor { background: linear-gradient(135deg, #3b82f6, #06b6d4); }
.style-line-art { background: linear-gradient(135deg, #6b7280, #9ca3af); }
.style-oil { background: linear-gradient(135deg, #f59e0b, #d97706); }
.style-romantic { background: linear-gradient(135deg, #ec4899, #f472b6); }
.style-comic { background: linear-gradient(135deg, #f97316, #ef4444); }
.style-vintage { background: linear-gradient(135deg, #92400e, #b45309); }
.style-original { background: linear-gradient(135deg, #10b981, #34d399); }
```

---

## Dependencies

### Requires
- UI-01: Upload Page (provides originalImage in store)

### Blocks
- UI-03: Customize Page UI

---

## Safety Gate Progress

- [x] Gate 0: Research (N/A - UI implementation)
- [x] Gate 1: Planning (this document)
- [ ] Gate 2: Implementation (TDD)
- [ ] Gate 3: QA Validation
- [ ] Gate 4: Review
- [ ] Gate 5: Deployment

---

*Started by Frontend-B Agent - 2025-12-24*
