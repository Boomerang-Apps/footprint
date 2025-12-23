# START.md - AI-02: Preview Photo in Different Styles

**Story**: AI-02
**Sprint**: 2
**Agent**: Backend-2 (API portion)
**Story Points**: 8 (shared with Frontend-B)
**Created**: 2025-12-23

---

## Story Description

Enable users to preview their uploaded photo transformed into different artistic styles using AI. The transformation should complete in under 10 seconds and display a loading indicator during processing.

---

## Acceptance Criteria

- [ ] Click style thumbnail triggers transformation
- [ ] Loading indicator shown during processing
- [ ] Transformation completes in < 10 seconds
- [ ] Transformed image displayed in preview
- [ ] Watermark applied to preview (full quality on purchase)
- [ ] Error handling with retry option

---

## Backend-2 Scope

This is the Backend-2 portion of the story. Frontend-B will handle the UI components.

### Files to Create

| File | Purpose |
|------|---------|
| `lib/ai/replicate.ts` | Replicate API client, style prompts, transform function |
| `lib/ai/replicate.test.ts` | Unit tests for Replicate module |
| `app/api/transform/route.ts` | POST endpoint for style transformation |
| `app/api/transform/route.test.ts` | API route tests |

### Files to Modify

| File | Changes |
|------|---------|
| `lib/storage/r2.ts` | Add transformed images folder support |

---

## Technical Approach

### 1. Replicate Client (`lib/ai/replicate.ts`)

```typescript
// Core exports
export type StyleType =
  | 'pop_art' | 'watercolor' | 'line_art' | 'oil_painting'
  | 'romantic' | 'comic_book' | 'vintage' | 'original_enhanced';

export const STYLE_PROMPTS: Record<StyleType, string>;
export async function transformImage(imageUrl: string, style: StyleType): Promise<string>;
export async function transformWithRetry(imageUrl: string, style: StyleType, maxRetries?: number): Promise<string>;
```

### 2. API Endpoint (`app/api/transform/route.ts`)

```
POST /api/transform
Content-Type: application/json

Request:
{
  "imageUrl": "https://images.footprint.co.il/uploads/...",
  "style": "pop_art"
}

Response (200):
{
  "transformedUrl": "https://images.footprint.co.il/transformed/...",
  "style": "pop_art",
  "processingTime": 6500
}

Response (401): Unauthorized
Response (400): Invalid style or missing imageUrl
Response (429): Rate limited (max 10 transforms per session)
Response (500): Transformation failed
```

### 3. Model Selection

**Primary**: `black-forest-labs/flux-kontext-pro`
- Fast processing (6-12 seconds)
- Context-aware transformation
- Cost: ~$0.005 per image

**Fallback**: `fofr/style-transfer`
- Artistic style transfer
- 5-10 seconds
- Cost: ~$0.007 per image

---

## Dependencies

### External
- Replicate API (APPROVED in Gate 0)
- `replicate` npm package (already in package.json)

### Internal
- `lib/storage/r2.ts` - Store transformed images
- `lib/supabase/server.ts` - User authentication

---

## Environment Variables Required

```bash
REPLICATE_API_TOKEN=r8_xxxxx  # Replicate API token
```

---

## Testing Strategy (TDD)

### Unit Tests (`lib/ai/replicate.test.ts`)
1. Style prompt mapping for all 8 styles
2. transformImage calls Replicate API correctly
3. transformWithRetry handles failures
4. Rate limiting logic
5. Error handling

### Integration Tests (`app/api/transform/route.test.ts`)
1. Successful transformation returns URL
2. Unauthenticated request returns 401
3. Invalid style returns 400
4. Missing imageUrl returns 400
5. Rate limit exceeded returns 429
6. Replicate error returns 500

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Transformation time | < 10 seconds |
| API response time | < 12 seconds (including upload to R2) |
| Rate limit | 10 transforms per user per session |

---

## Security Checklist

- [ ] API token in environment variable only
- [ ] Server-side only (no client exposure)
- [ ] User authentication required
- [ ] Rate limiting implemented
- [ ] Input validation (style enum, URL format)
- [ ] Transformed images stored in R2 (not returned directly from Replicate)

---

## Rollback Trigger Conditions

- Replicate API consistently failing (>50% error rate)
- Processing time >30 seconds
- Cost exceeds budget ($50/day)
- Security vulnerability discovered

---

**Gate 1 Status**: READY FOR IMPLEMENTATION

*Created by Backend-2 Agent - 2025-12-23*
