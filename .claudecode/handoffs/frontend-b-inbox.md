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

## 2025-12-23 - PM: Sprint 2 Stories MERGED ✅

**Sprint**: 2 - AI & Customization
**Status**: ✅ YOUR WORK COMPLETE

Frontend-B, excellent work! Your Sprint 2 stories have been:
- QA approved (97 tests, 90.47% coverage)
- Merged to main

**Completed Stories:**
| Story | Title | SP | Status |
|-------|-------|-----|--------|
| AI-01 | Display AI Style Gallery | 3 | ✅ Merged |
| AI-03 | Keep Original Photo Option | 2 | ✅ Merged |
| AI-04 | Unlimited Free Style Previews | 3 | ✅ Merged |
| PC-01 | Select Print Size | 3 | ✅ Merged |
| PC-02 | Choose Paper Type | 2 | ✅ Merged |
| PC-03 | Add Frame Option | 3 | ✅ Merged |

**Total**: 16 SP completed

### Next Steps

Wait for Backend-2 (AI-02) to complete the Replicate API integration. You may need to integrate the `/api/transform` endpoint with your StyleGallery component.

PM will notify when AI-02 is ready for UI integration.

---

## 2025-12-22 - PM: Sprint 2 ACTIVE - Begin Implementation [COMPLETED]

**Sprint**: 2 - AI & Customization
**Priority**: P0
**Gate**: 1 (Planning) → 2 (Implementation)
**Status**: ✅ ACTIVE - Sprint 1 Complete, Begin Sprint 2

### Overview

Frontend-B, Sprint 1 is COMPLETE! All stories merged to main. You are now assigned Sprint 2 stories. **Begin implementation immediately.**

**Sprint 2 Total**: 16 SP (Frontend-B portion)

### Your Sprint 2 Stories

| Story | Title | SP | Priority | Description |
|-------|-------|-----|----------|-------------|
| AI-01 | Display AI Style Gallery | 3 | P0 | Style gallery UI with thumbnails |
| AI-03 | Keep Original Photo Option | 2 | P1 | 'Original' option in gallery |
| AI-04 | Unlimited Free Style Previews | 3 | P1 | Preview logic, watermarking |
| PC-01 | Select Print Size | 3 | P0 | A5/A4/A3/A2 size selector |
| PC-02 | Choose Paper Type | 2 | P1 | Matte/Glossy/Canvas options |
| PC-03 | Add Frame Option | 3 | P1 | Frame selector + preview |

**Shared with Backend-2:**
| AI-02 | Preview Photo in Styles | 8 | P0 | UI calls Backend-2's `/api/transform` |

### Recommended Order

1. **AI-01** first (unblocks AI-02 integration)
2. **PC-01, PC-02, PC-03** (product config)
3. **AI-03, AI-04** (style options)
4. **AI-02 UI** (after Backend-2 completes API)

### Acceptance Criteria

**AI-01: Display AI Style Gallery**
- Gallery shows all 8 styles with thumbnails
- Style names in Hebrew
- Click to select style
- Selected style highlighted

**PC-01: Select Print Size**
- A5/A4/A3/A2 options visible
- Size visualization (aspect ratio preview)
- Live price update on selection

**PC-02: Choose Paper Type**
- Matte/Glossy/Canvas options
- Tooltips explaining each type
- Price difference shown

**PC-03: Add Frame Option**
- None/Black/White/Oak options
- Frame preview around image
- Price update on selection

### Files to Create/Modify

| File | Action |
|------|--------|
| `components/style-picker/StyleGallery.tsx` | Create |
| `components/style-picker/StyleCard.tsx` | Create |
| `components/product-config/SizeSelector.tsx` | Create |
| `components/product-config/PaperSelector.tsx` | Create |
| `components/product-config/FrameSelector.tsx` | Create |
| `app/(app)/create/style/page.tsx` | Enhance |
| `app/(app)/create/customize/page.tsx` | Enhance |

### Gate 1 Requirements

```bash
git checkout -b feature/AI-01-style-gallery
mkdir -p .claudecode/milestones/sprint-2/AI-01/
# Create START.md and ROLLBACK-PLAN.md
git tag AI-01-start
```

### Gate 0 Reference

Replicate AI approved (for AI-02 integration):
- **Model**: `black-forest-labs/flux-kontext-pro`
- **Styles**: pop_art, watercolor, line_art, oil_painting, romantic, comic_book, vintage, original_enhanced

### Handoff

When stories complete, write to `qa-inbox.md` with:
- Branch name
- Test results
- Coverage report (80%+ required)

**TDD Required: Write tests FIRST.**

→ **ACTION**: Begin with AI-01 (Style Gallery) NOW.

---

---

## Completed Messages

## 2025-12-21 - PM: Sprint 1 Assignment - Upload Stories [COMPLETED]

**Stories**: UP-01, UP-02, UP-04
**Status**: ✅ MERGED TO MAIN
**Sprint**: 1

### Completed Work

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

## 2025-12-22 - PM: Sprint 2 ACTIVE - Begin Implementation

**Sprint**: 2 - AI & Customization
**Priority**: P0
**Gate**: 1 (Planning) → 2 (Implementation)
**Status**: ✅ ACTIVE - Sprint 1 Complete, Begin Sprint 2

### Overview

Frontend-B, Sprint 1 is COMPLETE! All stories merged to main. You are now assigned Sprint 2 stories. Begin implementation immediately.

**Sprint 2 Total**: 16 SP (Frontend-B portion)

### Assignment

#### Phase 1: UI Components (Can start after QA approval)

| Story | Title | SP | Description |
|-------|-------|-----|-------------|
| AI-01 | Display AI Style Gallery | 3 | Style gallery UI with thumbnails |
| AI-03 | Keep Original Photo Option | 2 | 'Original' option in gallery |
| AI-04 | Unlimited Free Style Previews | 3 | Preview logic, watermarking |
| PC-01 | Select Print Size | 3 | A5/A4/A3 size selector |
| PC-02 | Choose Paper Type | 2 | Matte/Glossy options |
| PC-03 | Add Frame Option | 3 | Frame selector + preview |

#### Phase 2: AI Integration (Requires Backend-2 UP-03 + AI-02)

| Story | Title | SP | Description |
|-------|-------|-----|-------------|
| AI-02 | Preview Photo in Styles | 8 | Integrate with Replicate API (shared with Backend-2) |

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Sprint 1 Complete | ✅ DONE | All stories merged to main |
| UP-03 Image Optimization | ✅ DONE | Ready for AI-02 integration |
| Replicate Gate 0 | ✅ Approved | See GATE0-replicate-ai.md |

### Gate 0 Reference

Replicate AI integration is approved. Key details:
- **Model**: `black-forest-labs/flux-kontext-pro`
- **Time**: 6-12 seconds per transform
- **Styles**: pop_art, watercolor, line_art, oil_painting, romantic, comic_book, vintage, original_enhanced

Reference: `.claudecode/research/GATE0-replicate-ai.md`

### Files to Create/Modify

| File | Action |
|------|--------|
| `components/style-picker/StyleGallery.tsx` | Create |
| `components/style-picker/StyleCard.tsx` | Create |
| `components/product-config/SizeSelector.tsx` | Create |
| `components/product-config/PaperSelector.tsx` | Create |
| `components/product-config/FrameSelector.tsx` | Create |
| `app/(app)/create/style/page.tsx` | Enhance |
| `app/(app)/create/customize/page.tsx` | Enhance |

### Gate 1 Requirements (When Starting)

```bash
git checkout -b feature/AI-01-style-gallery
mkdir -p .claudecode/milestones/sprint-2/AI-01/
# Create START.md and ROLLBACK-PLAN.md
git tag AI-01-start
```

### Handoff

When stories are complete, write to `qa-inbox.md` with:
- Branch name
- Test results
- Coverage report (80%+ required)

**TDD Required: Write tests FIRST.**

→ **ACTION**: Begin Sprint 2 immediately. Start with AI-01 (Style Gallery) as it unblocks AI-02.

---

---
