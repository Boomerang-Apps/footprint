# UI-01: Upload Page UI

**Started**: 2025-12-24
**Agent**: Frontend-B
**Branch**: feature/ui-01-upload-page
**Mockup**: 01-upload.html
**Gate**: 1 - Planning

---

## Story Summary

Implement the Upload Page UI matching the 01-upload.html mockup exactly, with Hebrew RTL support, drag-drop functionality, loading states, and preview states.

---

## Scope

### In Scope
- Update `app/(app)/create/page.tsx` to match mockup
- Progress bar with gradient fill (20% for step 1)
- Upload zone with:
  - Drag-drop functionality (existing)
  - Loading state with spinner
  - Preview state with "מוכן" badge
  - Camera button for mobile
  - Gradient primary button styling
- Tips section with checkmark icons
- Fixed bottom CTA button (disabled until image uploaded)
- Hebrew RTL layout
- Responsive design (mobile, tablet, desktop)

### Out of Scope
- Backend upload API integration (already exists)
- Image processing (handled by UP-03)
- AI transformation (handled in style page)

---

## Acceptance Criteria

- [x] Page layout matches 01-upload.html mockup
- [x] Progress bar shows 20% with gradient fill
- [x] Upload zone has all 3 states: default, loading, preview
- [x] Camera button visible (triggers file input)
- [x] Bottom CTA disabled until image uploaded
- [x] Tips section displays with checkmark icons
- [x] Hebrew RTL text direction
- [x] Responsive at 640px, 1024px, 1280px breakpoints
- [x] Tests written FIRST (TDD)
- [x] 80%+ test coverage (24 tests passing)
- [x] TypeScript strict mode clean
- [x] Linter clean

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `app/(app)/create/page.tsx` | Modify | Match mockup layout and styling |
| `components/upload/UploadZone.tsx` | Create | Enhanced upload zone with all states |
| `components/create/ProgressBar.tsx` | Create | Multi-step progress indicator |
| `components/create/BottomCTA.tsx` | Create | Fixed bottom action button |

---

## Technical Notes

### Key Components from Mockup

1. **Header**: Sticky, back button (arrow-right for RTL), title "יצירת תמונה"

2. **Progress Bar**:
   - 4 steps: העלאה, סגנון, התאמה, תשלום
   - Gradient fill bar (primary → accent)
   - Active step has colored dot

3. **Upload Zone States**:
   - Default: Icon, title, subtitle, gradient button, camera button
   - Dragover: Border color change, background tint
   - Loading: Spinner, "מעבד את התמונה..."
   - Has-image: Preview with "מוכן" badge, replace button

4. **Tips Section**: Lightbulb icon, 3 tips with checkmarks

5. **Bottom CTA**: Fixed position, gradient when active, disabled by default

### CSS Variables (from mockup)
```css
--primary: #7c3aed
--primary-light: #a78bfa
--accent: #ec4899
--success: #10b981
--warning: #f59e0b
```

### Integration Points
- `useOrderStore` for state management
- Existing DropZone functionality can be reused
- Will use demo data from UI-06 in future

---

## Dependencies

### Uses
- UI-06: Demo Data (for testing)
- Existing upload components (CameraRollUpload, DropZone, ImagePreview)

### Blocks
- UI-02: Style Selection UI (needs upload to provide image)

---

## Safety Gate Progress

- [x] Gate 0: Research (N/A - UI implementation)
- [x] Gate 1: Planning (this document)
- [x] Gate 2: Implementation (TDD - 24 tests passing)
- [x] Gate 3: QA Validation (TypeScript clean, Lint clean)
- [ ] Gate 4: Review (PM/QA validation)
- [ ] Gate 5: Deployment

---

*Started by Frontend-B Agent - 2025-12-24*
*Completed Gate 2-3 by Frontend-B Agent - 2025-12-24*
