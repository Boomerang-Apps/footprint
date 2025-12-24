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

## 2025-12-21 - PM: ⚠️ GATE 1 COMPLIANCE REQUIRED - URGENT

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
