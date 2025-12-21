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
- [ ] Camera roll/file picker opens on user interaction
- [ ] Supports JPG, PNG, HEIC formats
- [ ] Validates file type before upload
- [ ] Validates file size (max 20MB)
- [ ] Shows preview after successful selection
- [ ] Displays clear error messages for invalid files
- [ ] Updates orderStore with selected image
- [ ] Tests written FIRST (TDD)
- [ ] 80%+ test coverage
- [ ] TypeScript strict mode clean
- [ ] Linter clean

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
- [ ] Gate 0: Research (not required - standard file upload)
- [x] Gate 1: Planning (this document)
- [ ] Gate 2: Implementation (TDD)
- [ ] Gate 3: QA Validation
- [ ] Gate 4: Review
- [ ] Gate 5: Deployment

---

*Started by Frontend-B Agent - 2025-12-21*
