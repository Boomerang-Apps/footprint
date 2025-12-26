# INT-01: Connect Upload to R2 Storage

## Story
**ID**: INT-01
**Title**: Connect Upload to R2 Storage
**Agent**: Frontend-B
**Sprint**: 5
**Points**: TBD

## Objective
Integrate the upload page with the /api/upload endpoint to store images in R2 instead of local blob URLs.

## Current State
- Upload page creates local blob URL via `URL.createObjectURL(file)`
- URL stored in `orderStore.originalImage`
- No backend upload happening
- No upload progress indication

## Target State
- On file select, call `/api/upload` with direct mode
- Store returned R2 public URL in orderStore
- Show upload progress percentage
- Handle upload errors gracefully

## Technical Approach

### 1. Extend orderStore with upload state
```typescript
// New state fields
uploadProgress: number; // 0-100
uploadError: string | null;
isUploading: boolean;

// New actions
setUploadProgress: (progress: number) => void;
setUploadError: (error: string | null) => void;
setIsUploading: (value: boolean) => void;
```

### 2. Create upload service hook
```typescript
// hooks/useUpload.ts
export function useUpload() {
  // Call /api/upload with direct mode
  // Track progress via XMLHttpRequest or fetch
  // Update orderStore with R2 URL on success
}
```

### 3. Modify create/page.tsx
- Replace `URL.createObjectURL` with upload API call
- Show progress bar during upload
- Show error message on failure
- Disable "Continue" button until upload completes

## Dependencies
- `/api/upload` endpoint (Backend-2) - READY
- R2 storage (Backend-2) - READY
- orderStore (Backend-1) - READY

## Acceptance Criteria
- [ ] Image upload calls /api/upload endpoint
- [ ] R2 public URL stored in orderStore.originalImage
- [ ] Upload progress shown (0-100%)
- [ ] Upload errors displayed to user
- [ ] "Continue" button disabled during upload
- [ ] Tests written (TDD)
- [ ] 80%+ coverage

## Files to Modify
| File | Change |
|------|--------|
| `stores/orderStore.ts` | Add upload state fields |
| `app/(app)/create/page.tsx` | Integrate upload API |
| `app/(app)/create/page.test.tsx` | Add upload tests |
| `hooks/useUpload.ts` | Create upload hook (optional) |

## Branch
`feature/int-01-upload-r2-integration`

## Start Tag
`INT-01-start`

---
**Started**: 2025-12-26
**Agent**: Frontend-B
