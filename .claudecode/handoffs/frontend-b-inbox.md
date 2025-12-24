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

## 2025-12-24 - PM: UI-01 Assignment - Upload Page UI

**Story**: UI-01
**Priority**: P0
**Type**: Sprint 4 - UI Implementation
**Sprint**: 4

### Context
UI-06 (Demo Data) is now merged. You can start UI-01 immediately.

### Assignment
You are assigned UI-01: Upload Page UI

**Points**: 3
**Mockup**: `design_mockups/01-upload.html`
**Route**: `/create`
**Dependencies**: UI-06 ✅ (merged)

### Requirements
Implement the upload page matching the mockup exactly:

**Key UI Elements**:
- Hero section with Hebrew headline: "העלה תמונה והפוך אותה ליצירת אמנות"
- Large drag-drop zone (dashed border)
- Camera/gallery button for mobile
- File type hints (JPG, PNG, HEIC - 20MB max)
- Upload progress indicator
- Error states for invalid files

**Files to Modify/Create**:
```
app/(app)/create/page.tsx           # Main upload page
components/create/UploadZone.tsx    # Upload component (can reuse existing DropZone)
```

### Technical Notes
- Use demo data from `data/demo/` for any needed test data
- RTL layout with `dir="rtl"`
- Mobile-first responsive (375px+)
- Use Tailwind CSS only

### Acceptance Criteria
- [ ] Matches mockup visually
- [ ] RTL layout correct
- [ ] Mobile responsive
- [ ] Drag-drop works on desktop
- [ ] Camera button works on mobile
- [ ] Progress indicator shows during upload
- [ ] Error states display properly
- [ ] Tests written (TDD)
- [ ] Coverage: 80%+ minimum

### Gate 1 Checklist (MANDATORY - Before Coding)
- [ ] Create branch: `git checkout -b feature/UI-01-upload-page`
- [ ] Create START.md: `.claudecode/milestones/sprint-4/UI-01/START.md`
- [ ] Create ROLLBACK-PLAN.md
- [ ] Create tag: `git tag UI-01-start`

### On Completion
Write handoff to: `.claudecode/handoffs/qa-inbox.md`

---

---

## Completed Messages

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
