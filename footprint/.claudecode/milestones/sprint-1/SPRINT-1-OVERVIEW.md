# Sprint 1 Overview - Footprint

**Sprint**: 1
**Duration**: 2 weeks
**Focus**: UI Foundation + Upload Flow (UI-First)
**Started**: 2025-12-21

---

## Sprint Goal

Build the foundational UI components and complete Step 1 (Upload) of the order flow with mock data. Establish the component library and validate the upload UX.

---

## Stories

| Linear ID | Story ID | Title | Agent | Points | Status |
|-----------|----------|-------|-------|--------|--------|
| UZF-1852 | UI-01 | UI Primitives Library | Frontend-A | 5 | Pending |
| UZF-1829 | DB-01 | Supabase Database Schema | Backend-2 | 5 | Pending |
| UZF-1830 | ST-01 | Order Store + Supabase Sync | Backend-1 | 3 | Pending |
| UZF-1825 | UP-01 | Upload from camera roll | Frontend-B | 5 | Pending |
| UZF-1826 | UP-02 | Drag-and-drop upload | Frontend-B | 3 | Pending |
| UZF-1827 | UP-03 | Auto-optimize for print | Backend-2 | 5 | Pending |
| UZF-1828 | UP-04 | Preview uploaded photo | Frontend-B | 3 | Pending |

**Total Points**: 29

---

## Story Details

### UP-01: UI Primitives Library
**Agent**: Frontend-A
**Points**: 5

Create the base UI component library:
- Button (primary, secondary, ghost variants)
- Card
- Input
- Select
- Modal
- Loading spinner
- Toast notifications

**Acceptance Criteria**:
- [ ] All components support dark mode
- [ ] Tailwind CSS only (no inline styles)
- [ ] 80%+ test coverage
- [ ] Storybook or component demo page

---

### UP-02: Photo Upload Component
**Agent**: Frontend-B
**Points**: 3

Implement the PhotoUpload component:
- Drag & drop zone
- Click to browse
- File type validation (JPG, PNG, HEIC)
- Size validation (max 20MB)
- Upload progress indicator

**Acceptance Criteria**:
- [ ] Works on desktop and mobile
- [ ] Shows validation errors
- [ ] 80%+ test coverage

---

### UP-03: Upload Page Layout
**Agent**: Frontend-B
**Points**: 3

Create the `/create` page layout:
- Step indicator (1 of 5)
- Upload area (centered)
- Continue button (disabled until image uploaded)
- Back to home link

**Acceptance Criteria**:
- [ ] Responsive design
- [ ] Step indicator shows current step
- [ ] 80%+ test coverage

---

### UP-04: Image Preview & Validation
**Agent**: Frontend-B
**Points**: 5

Implement image preview and validation:
- Display uploaded image preview
- Show image dimensions
- Validate minimum resolution for print
- Option to re-upload
- DPI/quality indicator

**Acceptance Criteria**:
- [ ] Preview shows immediately after upload
- [ ] Validation messages for low-res images
- [ ] 80%+ test coverage

---

### ST-01: Order Store Foundation
**Agent**: Backend-1
**Points**: 3

Create the Zustand order store:
- Define OrderState interface
- Implement step navigation actions
- Implement image setters
- Implement reset action

**Acceptance Criteria**:
- [ ] TypeScript strict mode
- [ ] 90%+ test coverage
- [ ] All actions documented

---

## Parallel CTO Work (Gate 0 Research)

| Research | Document | Priority |
|----------|----------|----------|
| Cloudflare R2 | `GATE0-cloudflare-r2.md` | P0 |
| Replicate AI | `GATE0-replicate-ai.md` | P0 |

---

## Sprint Status Matrix

| Linear ID | Story | Agent | G0 | G1 | G2 | G3 | G4 | G5 | Status |
|-----------|-------|-------|----|----|----|----|----|----|--------|
| UZF-1852 | UI-01 | Frontend-A | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | Ready |
| UZF-1829 | DB-01 | Backend-2 | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | Ready |
| UZF-1830 | ST-01 | Backend-1 | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | Blocked (DB-01) |
| UZF-1825 | UP-01 | Frontend-B | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | Blocked (UI-01) |
| UZF-1826 | UP-02 | Frontend-B | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | Blocked (UI-01) |
| UZF-1827 | UP-03 | Backend-2 | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | Blocked (DB-01) |
| UZF-1828 | UP-04 | Frontend-B | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | Blocked (UP-01) |

Legend: ✅ Complete, 🔄 In Progress, ⏳ Pending, ❌ Blocked

---

## Dependencies

```
Phase 1 (Parallel - No Dependencies):
├── UI-01 (UI Primitives) - Frontend-A
└── DB-01 (Supabase Schema) - Backend-2

Phase 2 (After Phase 1):
├── ST-01 (Order Store) ──────> needs DB-01
├── UP-03 (Image Optimization) ──> needs DB-01
└── UP-01 (Camera Upload) ────> needs UI-01

Phase 3 (After Phase 2):
├── UP-02 (Drag-drop) ────────> needs UI-01
└── UP-04 (Preview) ──────────> needs UP-01
```

---

## Definition of Done

- [ ] All stories completed
- [ ] All tests passing
- [ ] Coverage ≥80%
- [ ] TypeScript clean
- [ ] Linter clean
- [ ] QA approved
- [ ] Merged to main

---

## Notes

- This sprint follows **UI-First** approach per CTO decision
- No backend integration - all data is mocked
- Focus on UX validation and component quality

---

*Sprint 1 - Footprint Multi-Agent Framework*
