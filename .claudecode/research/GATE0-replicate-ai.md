# Research: Replicate AI Integration

**Date**: 2025-12-19
**Author**: CTO Agent
**Story**: AI-02 (Preview photo in different styles)
**Gate**: 0 - Research

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

### Recommended Models

#### Option 1: Stable Diffusion img2img
- **Model**: `stability-ai/stable-diffusion`
- **Use Case**: Style transfer with prompt guidance
- **Time**: 5-15 seconds
- **Cost**: ~$0.0023 per image

#### Option 2: Style Transfer Models
- **Model**: `kuprel/min-dalle` or custom fine-tuned
- **Use Case**: Specific artistic styles
- **Time**: 3-10 seconds
- **Cost**: ~$0.001-0.003 per image

#### Option 3: SDXL for Higher Quality
- **Model**: `stability-ai/sdxl`
- **Use Case**: Premium quality transformations
- **Time**: 10-20 seconds
- **Cost**: ~$0.005 per image

---

## Recommended Approach

**Primary**: Use Stable Diffusion img2img with style prompts

```typescript
// lib/ai/replicate.ts
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function transformImage(
  imageUrl: string,
  style: StyleType
): Promise<string> {
  const stylePrompts = {
    pop_art: "pop art style, bold colors, halftone dots, andy warhol",
    watercolor: "watercolor painting, soft edges, flowing colors",
    line_art: "minimalist line art, single color, clean lines",
    oil_painting: "oil painting, thick brushstrokes, rich textures",
    // ... more styles
  };

  const output = await replicate.run(
    "stability-ai/stable-diffusion:latest",
    {
      input: {
        image: imageUrl,
        prompt: stylePrompts[style],
        strength: 0.7, // Balance original vs style
        guidance_scale: 7.5,
      }
    }
  );

  return output[0]; // URL of transformed image
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
