# UP-05: Face Detection Cropping

**Started**: 2025-12-26
**Agent**: Backend-2
**Branch**: feature/UP-05-face-detection-cropping
**Gate**: 1 - Planning
**Linear**: N/A

---

## Story Summary

Implement automatic face detection in uploaded photos with smart crop suggestions. When a photo contains faces, the system should detect them and suggest optimal crop regions that keep faces properly positioned. Users can accept suggestions or manually override.

---

## Scope

### In Scope
- Face detection service using smartcrop-sharp library
- Smart crop region calculation (rule of thirds, face positioning)
- Multiple crop suggestion variants (portrait, square, landscape)
- API endpoint for face detection and crop suggestions
- Support for print aspect ratios (A5, A4, A3, A2)

### Out of Scope
- Frontend crop UI (Frontend-B responsibility)
- Multiple face prioritization (v2 feature)
- Face recognition/identification (privacy concern)
- Real-time video face tracking

---

## Technical Approach

### Library Selection: smartcrop-sharp

**Why smartcrop-sharp?**
- Integrates with existing Sharp image pipeline
- No external API calls (runs locally)
- Open source, MIT licensed
- Detects faces AND important image features
- Returns crop regions with confidence scores

**Alternative Considered:**
- face-api.js: More accurate but heavier, requires TensorFlow.js
- Replicate face detection: Would add external API dependency/cost
- AWS Rekognition: External API, cost per image

**Decision**: Use smartcrop-sharp for simplicity and zero API cost

### API Design

```typescript
// POST /api/detect-crop
// Request
{
  "imageUrl": "https://r2.footprint.co.il/uploads/xxx.jpg",
  "aspectRatios": ["1:1", "4:5", "3:4"]  // Optional, defaults to print sizes
}

// Response
{
  "faces": [
    { "x": 120, "y": 80, "width": 200, "height": 250 }
  ],
  "crops": {
    "1:1": { "x": 50, "y": 20, "width": 400, "height": 400, "score": 0.85 },
    "4:5": { "x": 30, "y": 0, "width": 400, "height": 500, "score": 0.78 },
    "3:4": { "x": 20, "y": 0, "width": 450, "height": 600, "score": 0.72 }
  },
  "hasFaces": true
}
```

### Print Aspect Ratios

| Print Size | Aspect Ratio | Crop Priority |
|------------|--------------|---------------|
| A5 | 1:1.414 | Portrait |
| A4 | 1:1.414 | Portrait |
| A3 | 1:1.414 | Portrait |
| A2 | 1:1.414 | Portrait |
| Square (custom) | 1:1 | Square |

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| footprint/lib/image/faceDetection.ts | Create | Face detection and crop service |
| footprint/lib/image/faceDetection.test.ts | Create | TDD tests |
| footprint/app/api/detect-crop/route.ts | Create | API endpoint |
| footprint/app/api/detect-crop/route.test.ts | Create | API tests |
| footprint/package.json | Modify | Add smartcrop-sharp dependency |

---

## Dependencies

### NPM Packages (New)
- `smartcrop-sharp`: ^2.0.0 - Face/feature detection with Sharp

### Uses Existing
- `sharp`: Already installed for image optimization
- `lib/storage/r2.ts`: For fetching images from R2

### Blocked By
- None

### Blocks
- Frontend crop UI component

---

## Acceptance Criteria

- [ ] Face detection returns bounding boxes for detected faces
- [ ] Smart crop suggestions provided for multiple aspect ratios
- [ ] Crops keep faces in upper third (rule of thirds)
- [ ] API returns crop regions with confidence scores
- [ ] Works with images up to 20MB
- [ ] Handles images with no faces gracefully
- [ ] Tests written (TDD approach)
- [ ] 80%+ coverage for new code
- [ ] TypeScript clean
- [ ] Lint clean

---

## Test Plan

### Unit Tests (lib/image/faceDetection.ts)
- detectFaces() returns face bounding boxes
- calculateCrops() generates correct aspect ratio crops
- cropContainsFace() validates face inclusion
- handles no-face images gracefully
- handles invalid images with proper errors

### Integration Tests (API)
- POST /api/detect-crop returns crop suggestions
- Handles various image sizes
- Returns 400 for invalid requests
- Returns 404 for missing images
- Handles R2 fetch failures

### Test Images
- Portrait with single face (centered)
- Portrait with face off-center
- Group photo with multiple faces
- Landscape without faces
- Very small image (edge case)

---

## Safety Gate Progress

- [ ] Gate 0: Research (N/A - using library, no external API)
- [ ] Gate 1: Planning (this document)
- [ ] Gate 2: Implementation (TDD)
- [ ] Gate 3: QA Validation
- [ ] Gate 4: Review
- [ ] Gate 5: Deployment

---

*Started by Backend-2 Agent - 2025-12-26*
