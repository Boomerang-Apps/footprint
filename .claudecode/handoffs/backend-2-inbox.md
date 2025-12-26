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

## 2025-12-26 - PM: UP-05 Assignment - Face Detection Cropping

**Story**: UP-05
**Priority**: P1
**Type**: Parallel Assignment (4 agents)
**Sprint**: 6
**Points**: 2

### Context

UP-03 (Image Optimization) is merged with 100% coverage. Now add intelligent face detection for smart cropping suggestions.

### Assignment

Implement face detection and smart crop suggestions for uploaded photos.

### Requirements

1. **Face Detection Library**
   ```typescript
   // lib/image/faceDetection.ts
   import sharp from 'sharp';

   interface FaceRegion {
     x: number;
     y: number;
     width: number;
     height: number;
     confidence: number;
   }

   interface CropSuggestion {
     region: { x: number; y: number; width: number; height: number };
     aspectRatio: string;  // '1:1', '4:5', '3:4'
     score: number;        // 0-1 confidence
   }

   export async function detectFaces(imageBuffer: Buffer): Promise<FaceRegion[]>;
   export async function suggestCrops(imageBuffer: Buffer, targetRatios: string[]): Promise<CropSuggestion[]>;
   ```

2. **Smart Crop Algorithm**
   - Use smartcrop-sharp or similar library
   - Prioritize faces in crop region
   - Support common aspect ratios: 1:1, 4:5, 3:4, 16:9
   - Fallback to center crop if no faces detected

3. **API Endpoint**
   ```typescript
   // POST /api/detect-crop
   // Request: { imageUrl: string, aspectRatios: string[] }
   // Response: { faces: FaceRegion[], suggestions: CropSuggestion[] }
   ```

### Files to Create/Modify

| File | Action |
|------|--------|
| `lib/image/faceDetection.ts` | Create |
| `lib/image/faceDetection.test.ts` | Create |
| `app/api/detect-crop/route.ts` | Create |
| `app/api/detect-crop/route.test.ts` | Create |

### Acceptance Criteria

- [ ] detectFaces returns face regions with confidence
- [ ] suggestCrops returns ranked crop suggestions
- [ ] API endpoint accepts image URL and returns suggestions
- [ ] Handles images with no faces (fallback to center)
- [ ] Handles multiple faces (prioritize largest/centered)
- [ ] Performance: < 2 seconds for detection
- [ ] Tests written (TDD)
- [ ] Coverage: 80%+ minimum
- [ ] TypeScript clean

### Gate 1 Checklist (MANDATORY)

- [ ] Create branch: `git checkout -b feature/UP-05-face-detection`
- [ ] Create START.md: `.claudecode/milestones/sprint-6/UP-05/START.md`
- [ ] Create ROLLBACK-PLAN.md
- [ ] Create tag: `git tag UP-05-start`

### Technical Notes

- Consider using `smartcrop-sharp` npm package
- R2 image URLs from UP-03 can be used as input
- Cache detection results for same image

### On Completion

Write handoff to: `.claudecode/handoffs/qa-inbox.md`

---

## 2025-12-21 - PM: UP-03 Assignment [COMPLETED]

**From**: PM Agent
**To**: Backend-2 Agent
**Priority**: P0 - BLOCKING
**Type**: Safety Protocol Reminder

---

### ⚠️ Gate 1 Files Required BEFORE Implementation

Backend-2, before starting any code implementation, you MUST complete Gate 1 requirements.

**Required Actions (BEFORE any code)**:

1. **Create milestone directory**:
```bash
mkdir -p .claudecode/milestones/sprint-1/UP-03/
```

2. **Create START.md** with:
   - Story ID: UP-03
   - Title: Auto-Optimize Photo for Print
   - Acceptance criteria (from assignment below)
   - Implementation approach
   - Files to create: `lib/image/optimize.ts`, `app/api/upload/route.ts`, `lib/storage/r2.ts`
   - Dependencies: Sharp library, Cloudflare R2

3. **Create ROLLBACK-PLAN.md** with:
   - Rollback steps if implementation fails
   - Files that can be safely deleted
   - Git commands to revert

4. **Create git tag**:
```bash
git tag UP-03-start
```

5. **Write tests FIRST** (TDD required - 100% coverage for lib/image/)

6. **Then reply to PM inbox** confirming Gate 1 complete

**Reference**: `.claudecode/workflows/MANDATORY-SAFETY-FRAMEWORK.md`

**This is a BLOCKING requirement. Do not write implementation code until Gate 1 is complete.**

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

---
