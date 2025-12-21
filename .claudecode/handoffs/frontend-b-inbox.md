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

## 2025-12-21 - PM: Sprint 1 Assignment - Upload Stories

**Stories**: UP-01, UP-02, UP-04
**Priority**: P0
**Sprint**: 1
**Gate**: 1 (Planning) → 2 (Implementation)

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
