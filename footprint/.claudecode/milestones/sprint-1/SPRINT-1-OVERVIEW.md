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

| Story ID | Title | Agent | Points | Status |
|----------|-------|-------|--------|--------|
| UP-01 | UI Primitives Library | Frontend-A | 5 | Pending |
| UP-02 | Photo Upload Component | Frontend-B | 3 | Pending |
| UP-03 | Upload Page Layout | Frontend-B | 3 | Pending |
| UP-04 | Image Preview & Validation | Frontend-B | 5 | Pending |
| ST-01 | Order Store Foundation | Backend-1 | 3 | Pending |

**Total Points**: 19

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

| Story | Agent | G0 | G1 | G2 | G3 | G4 | G5 | Status |
|-------|-------|----|----|----|----|----|----|--------|
| UP-01 | Frontend-A | N/A | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | Not Started |
| UP-02 | Frontend-B | N/A | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | Not Started |
| UP-03 | Frontend-B | N/A | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | Not Started |
| UP-04 | Frontend-B | N/A | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | Not Started |
| ST-01 | Backend-1 | N/A | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | Not Started |

Legend: ✅ Complete, 🔄 In Progress, ⏳ Pending, ❌ Blocked

---

## Dependencies

```
UP-01 (UI Primitives) ─┬─> UP-02 (Upload Component)
                       ├─> UP-03 (Upload Page)
                       └─> UP-04 (Image Preview)

ST-01 (Order Store) ───> UP-03 (Upload Page uses store)
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
