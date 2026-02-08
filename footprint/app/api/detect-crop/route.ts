/**
 * Smart Crop Detection API
 *
 * POST /api/detect-crop
 *
 * Analyzes an image and returns intelligent crop suggestions for
 * various aspect ratios. Uses content-aware analysis to identify
 * important regions (faces, edges, high contrast areas).
 */

import { NextResponse } from 'next/server';
import { getSuggestedCrops, isValidAspectRatio } from '@/lib/image/faceDetection';
import { getImageFromR2, isR2Url } from '@/lib/storage/r2';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * Request body for smart crop detection
 */
interface DetectCropRequest {
  /** URL of the image to analyze (must be an R2 URL) */
  imageUrl: string;
  /** Optional array of aspect ratios to calculate crops for */
  aspectRatios?: string[];
}

/**
 * Validates the request body
 */
function validateRequest(
  body: unknown
): { valid: true; data: DetectCropRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const data = body as Record<string, unknown>;

  // Validate imageUrl
  if (!data.imageUrl) {
    return { valid: false, error: 'imageUrl is required' };
  }

  if (typeof data.imageUrl !== 'string') {
    return { valid: false, error: 'imageUrl must be a string' };
  }

  if (data.imageUrl.trim() === '') {
    return { valid: false, error: 'imageUrl cannot be empty' };
  }

  // Validate aspectRatios if provided
  if (data.aspectRatios !== undefined) {
    if (!Array.isArray(data.aspectRatios)) {
      return { valid: false, error: 'aspectRatios must be an array' };
    }

    for (const ratio of data.aspectRatios) {
      if (typeof ratio !== 'string') {
        return { valid: false, error: 'aspectRatios must be an array of strings' };
      }
      if (!isValidAspectRatio(ratio)) {
        return { valid: false, error: `Invalid aspect ratio: "${ratio}"` };
      }
    }
  }

  return {
    valid: true,
    data: {
      imageUrl: data.imageUrl as string,
      aspectRatios: data.aspectRatios as string[] | undefined,
    },
  };
}

/**
 * POST /api/detect-crop
 *
 * Analyzes an image and returns smart crop suggestions.
 *
 * Request Body:
 * {
 *   "imageUrl": "https://r2.footprint.co.il/uploads/...",
 *   "aspectRatios": ["1:1", "4:5", "3:4"]  // optional
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "imageWidth": 800,
 *   "imageHeight": 600,
 *   "crops": {
 *     "1:1": { "region": { x, y, width, height }, "score": 0.85 },
 *     "4:5": { "region": { x, y, width, height }, "score": 0.78 }
 *   }
 * }
 */
export async function POST(request: Request): Promise<Response> {
  // Rate limiting: 10 per minute (image processing)
  const rateLimited = await checkRateLimit('transform', request);
  if (rateLimited) return rateLimited;

  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // TypeScript now knows validation.valid === true, so data exists
    const { imageUrl, aspectRatios } = validation.data;

    // Verify URL is an R2 URL
    if (!isR2Url(imageUrl)) {
      return NextResponse.json(
        { success: false, error: 'imageUrl must be an R2 storage URL' },
        { status: 400 }
      );
    }

    // Fetch image from R2
    let imageBuffer: Buffer;
    try {
      imageBuffer = await getImageFromR2(imageUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        { success: false, error: `Image not found: ${message}` },
        { status: 404 }
      );
    }

    // Get crop suggestions
    const result = await getSuggestedCrops(imageBuffer, {
      aspectRatios,
    });

    // Return successful response
    return NextResponse.json({
      success: true,
      imageWidth: result.imageWidth,
      imageHeight: result.imageHeight,
      crops: result.crops,
    });
  } catch (error) {
    console.error('Smart crop detection error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
