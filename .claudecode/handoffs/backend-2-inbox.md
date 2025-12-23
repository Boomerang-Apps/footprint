# Backend-2 Agent Inbox

Work assignments for external APIs and integrations appear here.

---

## Domain Reminder
Your domain: Replicate AI, Stripe, Cloudflare R2, API client (`lib/api/`)

NOT your domain: User auth (Backend-1), UI components (Frontend-A/B)

---

## How to Use This Inbox

### For PM Agent:
Assign work related to:
- Replicate AI integration (style transformation)
- Stripe payment processing
- Cloudflare R2 image storage
- API client maintenance

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

## 2025-12-23 - PM: AI-02 Dependencies Complete - Continue Implementation

**Story**: AI-02
**Priority**: P0 - Critical Path
**Status**: ✅ All dependencies met

### Update

Frontend-B's Sprint 2 work has been merged to main. This includes:

| Component | File | Status |
|-----------|------|--------|
| Style Gallery (AI-01) | `components/style-picker/StyleGallery.tsx` | ✅ Merged |
| Size Selector (PC-01) | `components/product-config/SizeSelector.tsx` | ✅ Merged |
| Paper Selector (PC-02) | `components/product-config/PaperSelector.tsx` | ✅ Merged |
| Frame Selector (PC-03) | `components/product-config/FrameSelector.tsx` | ✅ Merged |

### Sync Required

```bash
git fetch origin main
git merge origin/main
```

### Your /api/transform endpoint integrates with:

StyleGallery provides style selection. Your endpoint receives:
```typescript
{ imageUrl: string, style: StyleType }
```

Where StyleType is one of: `pop_art | watercolor | line_art | oil_painting | romantic | comic_book | vintage | original_enhanced`

→ **Continue AI-02 implementation. This is the critical path for Sprint 2.**

---

## 2025-12-21 - PM: Sprint 1 Assignment - Image Optimization

**Story**: UP-03
**Priority**: P0
**Sprint**: 1
**Gate**: 1 (Planning) → 2 (Implementation)

### Assignment

Backend-2, you are assigned the following Sprint 1 story:

#### UP-03: Auto-Optimize Photo for Print (5 SP)
**Acceptance Criteria:**
- Resize image to optimal print DPI (300 DPI)
- Color profile conversion (sRGB → CMYK awareness)
- Max file size: 20MB validation
- Compression without visible quality loss
- Return optimized image URL

**Files to create/modify:**
- `lib/image/optimize.ts` (new)
- `app/api/upload/route.ts` (new)
- `lib/storage/r2.ts` (for Cloudflare R2 upload)

**Technical Requirements:**
- Use Sharp library for image processing
- Upload to Cloudflare R2 (credentials in .env.local)
- Return presigned URL for optimized image
- Support HEIC conversion to JPEG

### Gate 0 Dependencies
- ✅ Cloudflare R2: GATE0-cloudflare-r2.md (Approved)

### Gate 1 Requirements (MANDATORY)
Before starting implementation:
```bash
git checkout -b feature/UP-03-image-optimization
mkdir -p .claudecode/milestones/sprint-1/UP-03/
# Create START.md and ROLLBACK-PLAN.md
git tag UP-03-start
```

### Handoff
When complete, write to `qa-inbox.md` with:
- Branch name
- API endpoint documentation
- Test results
- Coverage report

**TDD Required: Write tests FIRST. 100% coverage for lib/image/.**

---

## 2025-12-22 - PM: ACTION REQUIRED - Sync UP-03 Branch with Main

**Story**: UP-03
**Priority**: P0 - BLOCKING
**Type**: Sync Required

### Context

QA validated UP-03 and found excellent implementation (94.48% coverage, 100% on lib/image/). However, **type sync issue** is blocking approval.

**PM has merged Frontend-B's work to main.** You now need to sync.

### Required Actions

```bash
# 1. In your worktree, fetch and merge main
cd /Users/mymac/Desktop/footprint-worktrees/backend-2
git fetch --all
git merge main

# 2. Resolve any conflicts (types/order.ts likely)

# 3. Verify TypeScript compiles
npm run type-check

# 4. Verify tests still pass
npm test

# 5. If clean, resubmit to QA inbox
```

### What Changed in Main

Frontend-B's merge added:
- `components/upload/CameraRollUpload.tsx`
- `components/upload/DropZone.tsx`
- `components/upload/ImagePreview.tsx`
- Updated `types/order.ts` with new imports

### After Sync

Write to `qa-inbox.md`:
```markdown
## [DATE] - Backend-2: UP-03 Resubmission After Sync

**Story**: UP-03
**Branch**: feature/UP-03-image-optimization
**Type**: Resubmission

Synced with main. Ready for re-validation.
- TypeScript: CLEAN
- Tests: XX passing
- Coverage: XX%
```

### Urgency

**This is the LAST BLOCKER for Sprint 1 completion and Sprint 2 kickoff.**

---

## 2025-12-22 - PM: Sprint 2 Assignment - AI Style Transformation

**Sprint**: 2 - AI & Customization
**Story**: AI-02
**Priority**: P0 - Critical Path
**Gate**: 1 (Planning) → 2 (Implementation)
**Status**: ✅ ACTIVE - Begin Implementation

### Context

Sprint 1 is COMPLETE! UP-03 merged to main. You now have the image optimization foundation ready for AI transformation.

### Assignment

#### AI-02: Preview Photo in Different Styles (8 SP)

**Acceptance Criteria:**
- Click style to preview transformation
- Loading indicator during processing
- Transformation < 10 seconds
- 8 styles supported: pop_art, watercolor, line_art, oil_painting, romantic, comic_book, vintage, original_enhanced

**Your Responsibility (Backend):**
- Implement Replicate API integration
- Create `/api/transform` endpoint
- Handle rate limiting (max 10 per session)
- Store transformed images in R2
- Return R2 URL for transformed image

**Files to Create/Modify:**
| File | Action |
|------|--------|
| `lib/ai/replicate.ts` | Create - Replicate client |
| `lib/ai/styles.ts` | Create - Style prompts |
| `app/api/transform/route.ts` | Create - Transform endpoint |
| `lib/ai/__tests__/*` | Create - Tests |

### Gate 0 Reference

Replicate AI approved. Key implementation details from `GATE0-replicate-ai.md`:

```typescript
// Primary model
"black-forest-labs/flux-kontext-pro"

// Style prompts defined in research doc
const STYLE_PROMPTS = {
  pop_art: "Transform into pop art style...",
  watercolor: "Transform into watercolor painting...",
  // etc.
}
```

### Gate 1 Requirements

```bash
git checkout -b feature/AI-02-style-transform
mkdir -p .claudecode/milestones/sprint-2/AI-02/
# Create START.md and ROLLBACK-PLAN.md
git tag AI-02-start
```

### Coordination with Frontend-B

Frontend-B is implementing:
- AI-01: Style gallery UI (selects style)
- AI-02 UI: Calls your `/api/transform` endpoint

**API Contract:**
```typescript
// POST /api/transform
Request: {
  imageUrl: string;  // R2 URL from UP-03
  style: StyleType;
}

Response: {
  transformedUrl: string;  // R2 URL of transformed image
  processingTime: number;  // ms
}
```

### Handoff

When complete, write to `qa-inbox.md` with:
- Branch name
- API documentation
- Test results
- Coverage report (100% for lib/ai/)

**TDD Required: Write tests FIRST.**

---

---
