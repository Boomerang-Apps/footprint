# UP-01: Upload Photo from Camera Roll

**Started**: 2025-12-21
**Agent**: Frontend-B
**Branch**: feature/UP-01-camera-upload
**Gate**: 1 - Planning → 2 - Build

---

## Story Summary
Enable users to upload photos from their device's camera roll with support for JPG, PNG, and HEIC formats. This is the foundation of the photo upload experience for mobile users.

---

## Scope

### In Scope
- Camera roll/file picker integration for mobile and desktop
- JPG, PNG, HEIC format support
- File validation (type and size limits)
- Preview after selection
- Error handling for invalid files
- Integration with orderStore for state management

### Out of Scope
- AI style transformation (UP-03, handled by Backend-2)
- Drag-and-drop upload (UP-02, separate story)
- Multi-file upload (future enhancement)
- Image editing/cropping (future enhancement)

---

## Acceptance Criteria
- [x] Camera roll/file picker opens on user interaction
- [x] Supports JPG, PNG, HEIC formats
- [x] Validates file type before upload
- [x] Validates file size (max 20MB)
- [x] Shows preview after successful selection
- [x] Displays clear error messages for invalid files
- [x] Updates orderStore with selected image
- [x] Tests written FIRST (TDD)
- [x] 80%+ test coverage (89.13%)
- [x] TypeScript strict mode clean
- [x] Linter clean

---

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `components/upload/CameraRollUpload.tsx` | Create | Camera roll upload component |
| `components/upload/CameraRollUpload.test.tsx` | Create | Tests for camera roll upload |
| `app/(app)/create/page.tsx` | Modify | Integrate camera roll upload |
| `types/upload.ts` | Create | TypeScript types for upload functionality |

---

## Dependencies

### Blocked By
- None (foundational feature)

### Blocks
- UP-03: AI Style Selection (needs uploaded image)
- UP-04: Image Preview (needs uploaded image to preview)

---

## Safety Gate Progress
- [x] Gate 0: Research (not required - standard file upload)
- [x] Gate 1: Planning (this document)
- [x] Gate 2: Implementation (TDD - 45 tests)
- [ ] Gate 3: QA Validation (handoff to QA Agent)
- [x] Gate 4: Review (TypeScript clean, Lint clean, 89.13% coverage)
- [ ] Gate 5: Deployment (pending QA)

---

*Started by Frontend-B Agent - 2025-12-21*
