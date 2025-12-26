# INT-02: Connect Style Selection to AI Transform

## Story
**ID**: INT-02
**Title**: Connect Style Selection to AI Transform
**Agent**: Frontend-B
**Sprint**: 5
**Points**: TBD

## Objective
Integrate the style selection page with the /api/transform endpoint to show real AI-transformed previews instead of simulated processing.

## Current State
- Style page simulates AI processing with `setTimeout`
- Shows original image during "processing"
- No actual API call to transform endpoint
- transformedImage in store is never used

## Target State
- On style select, call `/api/transform` with originalImage URL and style
- Store returned transformedUrl in orderStore.transformedImage
- Display transformed image in preview (not original)
- Handle transform errors with retry option
- Show real processing time

## Technical Approach

### 1. Modify handleStyleSelect
```typescript
const handleStyleSelect = useCallback(async (styleId: StyleType, styleNameHe: string) => {
  setSelectedStyle(styleId);
  setIsTransforming(true);
  setTransformError(null);

  try {
    const response = await fetch('/api/transform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: originalImage,
        style: styleId,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    setTransformedImage(data.transformedUrl);
  } catch (error) {
    setTransformError(error.message);
  } finally {
    setIsTransforming(false);
  }
}, [originalImage, setSelectedStyle, setTransformedImage, setIsTransforming]);
```

### 2. Update Preview Display
- Show transformedImage if available, otherwise originalImage
- Keep AI processing overlay for loading state

### 3. Add Error Handling
- Show error message with retry button
- Allow user to retry failed transforms

## Dependencies
- `/api/transform` endpoint (Backend-2) - READY
- orderStore.transformedImage (Backend-1) - READY
- INT-01 complete (originalImage is R2 URL) - READY

## Acceptance Criteria
- [ ] Style selection calls /api/transform endpoint
- [ ] Transformed image stored in orderStore.transformedImage
- [ ] Preview shows transformed image (not original)
- [ ] Transform errors displayed with retry option
- [ ] Continue button disabled during transform
- [ ] Tests written (TDD)
- [ ] 80%+ coverage

## Files to Modify
| File | Change |
|------|--------|
| `app/(app)/create/style/page.tsx` | Integrate transform API |
| `app/(app)/create/style/page.test.tsx` | Add transform tests |

## Branch
`feature/int-02-style-transform-integration`

## Start Tag
`INT-02-start`

---
**Started**: 2025-12-26
**Agent**: Frontend-B
