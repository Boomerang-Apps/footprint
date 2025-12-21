# UP-03: Auto-Optimize Photo for Print

**Started**: 2025-12-21
**Agent**: Backend-2
**Branch**: feature/UP-03-image-optimization
**Gate**: 1 - Planning → 2 - Build

---

## Story Summary
Implement image optimization pipeline to prepare user photos for high-quality printing. Resize to 300 DPI, validate file size (20MB max), convert HEIC to JPEG, compress without visible quality loss, and upload to Cloudflare R2 storage.

---

## Scope

### In Scope
- Image resizing to 300 DPI for print quality
- HEIC to JPEG conversion
- File size validation (20MB max)
- Lossless compression using Sharp library
- Cloudflare R2 upload with presigned URLs
- Color profile awareness (sRGB → CMYK considerations)
- RESTful upload API endpoint
- Comprehensive error handling

### Out of Scope
- Actual CMYK conversion (future story - requires print lab specs)
- Batch upload (future story)
- Progress tracking for large files (future story)
- Image editing/cropping (will be in AI transformation stories)

---

## Acceptance Criteria
- [ ] Resize image to optimal print DPI (300 DPI)
- [ ] Color profile conversion (sRGB → CMYK awareness)
- [ ] Max file size: 20MB validation
- [ ] Compression without visible quality loss
- [ ] Support HEIC conversion to JPEG
- [ ] Upload to Cloudflare R2
- [ ] Return optimized image presigned URL
- [ ] Tests written (TDD)
- [ ] 100% coverage for lib/image/
- [ ] 80%+ coverage overall
- [ ] TypeScript clean
- [ ] Linter clean

---

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| footprint/lib/image/optimize.ts | Create | Image optimization logic using Sharp |
| footprint/lib/storage/r2.ts | Create | Cloudflare R2 storage integration |
| footprint/app/api/upload/route.ts | Create | Upload API endpoint |
| footprint/lib/image/optimize.test.ts | Create | Tests for image optimization |
| footprint/lib/storage/r2.test.ts | Create | Tests for R2 storage |
| footprint/app/api/upload/route.test.ts | Create | Tests for upload API |
| footprint/package.json | Modify | Add Sharp dependency |

---

## Dependencies

### Blocked By
- None (Gate 0 research for R2 already completed)

### Blocks
- UP-04: Frontend upload component (needs upload API)
- AI-01: AI style transformation (needs optimized image input)

---

## Safety Gate Progress
- [x] Gate 0: Research (GATE0-cloudflare-r2.md approved)
- [x] Gate 1: Planning (this document)
- [ ] Gate 2: Implementation (TDD)
- [ ] Gate 3: QA Validation
- [ ] Gate 4: Review
- [ ] Gate 5: Deployment

---

*Started by Backend-2 Agent - 2025-12-21*
