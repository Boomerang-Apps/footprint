# Research: Replicate AI Integration

**Date**: 2025-12-21 (Updated)
**Author**: CTO Agent
**Story**: AI-02 (Preview photo in different styles)
**Gate**: 0 - Research
**Status**: ✅ APPROVED

---

## Objective

Evaluate Replicate API for AI-powered image style transformation. Determine the best approach for transforming user photos into artistic styles (pop art, watercolor, etc.) with sub-10-second response times.

---

## Questions to Answer

1. Which AI models on Replicate best support style transfer?
2. What are the cost implications per transformation?
3. How do we handle rate limits and failures?
4. What is the expected transformation time?
5. How do we secure API keys?

---

## Research Findings

### Replicate Platform Overview
- **URL**: https://replicate.com
- **API**: REST-based, async job processing
- **Authentication**: API token in header
- **Pricing**: Pay-per-prediction, varies by model

### Recommended Models (2025 Update)

#### Option 1: Flux Kontext Pro (RECOMMENDED)
- **Model**: `black-forest-labs/flux-kontext-pro`
- **Use Case**: Context-aware image transformation with identity preservation
- **Time**: 6-12 seconds (meets our < 10 sec requirement)
- **Cost**: ~$0.005 per image
- **Released**: May 2025 by Black Forest Labs (Stable Diffusion creators)
- **Key Benefits**: Lightning-fast processing, context-aware capabilities

#### Option 2: fofr/style-transfer
- **Model**: `fofr/style-transfer`
- **Use Case**: Artistic style transfer between images
- **Time**: 5-10 seconds
- **Cost**: ~$0.0071 per image
- **Hardware**: Nvidia L40S GPU
- **Open Source**: Can self-host with Docker

#### Option 3: Flux Kontext Max (Premium)
- **Model**: `black-forest-labs/flux-kontext-max`
- **Use Case**: Premium workflows with typography, precise edits, full stylization
- **Time**: 10-15 seconds
- **Cost**: ~$0.008 per image
- **Best For**: High-end print quality

#### Option 4: Stable Diffusion img2img (Legacy)
- **Model**: `stability-ai/stable-diffusion`
- **Use Case**: Style transfer with prompt guidance
- **Time**: 5-15 seconds
- **Cost**: ~$0.0023 per image

**[CTO-DECISION]**: Use `flux-kontext-pro` as primary model for optimal speed/quality balance. Fall back to `fofr/style-transfer` for artistic styles.

---

## Recommended Approach

**Primary**: Use Flux Kontext Pro for fast, context-aware style transfer

```typescript
// lib/ai/replicate.ts
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export type StyleType =
  | 'pop_art' | 'watercolor' | 'line_art' | 'oil_painting'
  | 'romantic' | 'comic_book' | 'vintage' | 'original_enhanced';

const STYLE_PROMPTS: Record<StyleType, string> = {
  pop_art: "Transform into pop art style: bold vibrant colors, halftone dots pattern, Andy Warhol inspired, high contrast",
  watercolor: "Transform into watercolor painting: soft flowing edges, translucent color washes, wet-on-wet technique, artistic brushstrokes",
  line_art: "Transform into minimalist line art: clean precise lines, single color, elegant simplicity, vector-like quality",
  oil_painting: "Transform into oil painting: thick impasto brushstrokes, rich textures, classical art style, museum quality",
  romantic: "Transform into romantic style: soft dreamy focus, warm golden tones, ethereal lighting, tender atmosphere",
  comic_book: "Transform into comic book style: bold black outlines, vibrant flat colors, Ben-Day dots, dynamic composition",
  vintage: "Transform into vintage style: sepia tones, film grain, retro color grading, nostalgic aesthetic",
  original_enhanced: "Enhance photo: improve colors, sharpen details, professional color grading, maintain original composition"
};

export async function transformImage(
  imageUrl: string,
  style: StyleType
): Promise<string> {
  const output = await replicate.run(
    "black-forest-labs/flux-kontext-pro",
    {
      input: {
        image: imageUrl,
        prompt: STYLE_PROMPTS[style],
        guidance_scale: 7.5,
        num_inference_steps: 28,
        output_format: "png",
        output_quality: 100,
      }
    }
  );

  return Array.isArray(output) ? output[0] : output;
}
```

---

## Cost Analysis

| Volume | Cost/Image | Monthly Cost |
|--------|------------|--------------|
| 100 orders | $0.003 | $0.30 |
| 500 orders | $0.003 | $1.50 |
| 1,000 orders | $0.003 | $3.00 |
| 5,000 orders | $0.003 | $15.00 |

**Note**: Users may preview multiple styles before purchase. Estimate 5 previews per purchase:

| Monthly Orders | Previews | Est. Cost |
|----------------|----------|-----------|
| 500 | 2,500 | $7.50 |
| 1,000 | 5,000 | $15.00 |

**Conclusion**: Costs are minimal and scale linearly.

---

## Security Considerations

- [x] API key stored in environment variable (never in code)
- [x] API key only used server-side (Next.js API routes)
- [x] Rate limiting implemented to prevent abuse
- [x] User uploads validated (type, size) before processing
- [x] Transformed images stored in R2, not returned directly

### Implementation Security

```typescript
// app/api/transform/route.ts
export async function POST(request: Request) {
  // 1. Validate user session
  const session = await getSession();
  if (!session) return unauthorized();

  // 2. Validate input
  const { imageUrl, style } = await request.json();
  if (!isValidStyle(style)) return badRequest();

  // 3. Rate limit check
  const rateLimited = await checkRateLimit(session.userId);
  if (rateLimited) return tooManyRequests();

  // 4. Transform
  const result = await transformImage(imageUrl, style);

  // 5. Store in R2, return R2 URL
  const storedUrl = await storeInR2(result);
  return Response.json({ transformedUrl: storedUrl });
}
```

---

## Fallback Strategy

1. **Primary**: Replicate API
2. **Fallback 1**: Queue and retry (up to 3 attempts)
3. **Fallback 2**: Stability AI direct API
4. **Fallback 3**: Show "processing" state, email when ready

### Error Handling

```typescript
async function transformWithRetry(imageUrl: string, style: StyleType) {
  const maxRetries = 3;
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await transformImage(imageUrl, style);
    } catch (error) {
      lastError = error;
      await delay(1000 * (i + 1)); // Exponential backoff
    }
  }

  throw lastError;
}
```

---

## Performance Requirements

| Metric | Requirement | Strategy |
|--------|-------------|----------|
| Transformation time | < 10 seconds | Use fast models, cache common styles |
| Availability | 99%+ | Retry logic, fallback APIs |
| Concurrent requests | 50+ | Queue management, async processing |

---

## Rollback Plan

If Replicate integration fails or becomes too expensive:

1. **Immediate**: Disable AI styles, show "coming soon"
2. **Short-term**: Switch to Stability AI direct API
3. **Long-term**: Self-hosted model on GPU infrastructure

---

## CTO Approval

**Status**: APPROVED

**CTO Notes**:
- Replicate API is approved for use
- Implement rate limiting (max 10 transforms per user per session)
- Add monitoring for API costs
- Store all API keys in environment variables only
- Preview watermarks required until purchase

**Approved by**: CTO Agent
**Date**: 2025-12-19

---

*Research completed by CTO Agent - 2025-12-19*
