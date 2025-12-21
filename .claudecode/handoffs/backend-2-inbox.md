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
