/**
 * Face Detection API
 *
 * POST /api/images/detect-faces
 *
 * Detects faces in images and returns bounding boxes with confidence scores.
 * Also calculates optimal crop suggestions when aspect ratio is provided.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { detectFaces, validateImageFormat, MAX_IMAGE_SIZE } from '@/lib/image/face-detection';
import { calculateOptimalCrop } from '@/lib/image/crop-calculator';
import { getImageFromR2, isR2Url } from '@/lib/storage/r2';
import type {
  ImageAnalysisResponse,
  ImageAnalysisError,
  FaceDetectionOptions,
} from '@/types/image';
import { logger } from '@/lib/logger';

/**
 * Request body for face detection
 */
interface DetectFacesRequest {
  /** URL of the image to analyze (must be an R2 URL) or base64 data */
  image: string;
  /** Options for face detection */
  options?: FaceDetectionOptions;
  /** Target aspect ratio for crop calculation (e.g., "1:1", "4:5") */
  aspectRatio?: string;
}

/**
 * Validates the request body
 */
function validateRequest(
  body: unknown
): { valid: true; data: DetectFacesRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const data = body as Record<string, unknown>;

  // Validate image
  if (!data.image) {
    return { valid: false, error: 'image is required' };
  }

  if (typeof data.image !== 'string') {
    return { valid: false, error: 'image must be a string (URL or base64)' };
  }

  if (data.image.trim() === '') {
    return { valid: false, error: 'image cannot be empty' };
  }

  // Validate options if provided
  if (data.options !== undefined && typeof data.options !== 'object') {
    return { valid: false, error: 'options must be an object' };
  }

  // Validate aspectRatio if provided
  if (data.aspectRatio !== undefined) {
    if (typeof data.aspectRatio !== 'string') {
      return { valid: false, error: 'aspectRatio must be a string' };
    }

    const parts = data.aspectRatio.split(':');
    if (parts.length !== 2) {
      return { valid: false, error: 'aspectRatio must be in format "width:height"' };
    }

    const width = parseFloat(parts[0]);
    const height = parseFloat(parts[1]);

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      return { valid: false, error: 'Invalid aspectRatio values' };
    }
  }

  return {
    valid: true,
    data: {
      image: data.image as string,
      options: data.options as FaceDetectionOptions | undefined,
      aspectRatio: data.aspectRatio as string | undefined,
    },
  };
}

/**
 * Gets image buffer from URL or base64 string
 */
async function getImageBuffer(image: string): Promise<Buffer> {
  // Check if it's a base64 data URL
  if (image.startsWith('data:image/')) {
    const base64Data = image.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid base64 image data');
    }
    return Buffer.from(base64Data, 'base64');
  }

  // Check if it's an R2 URL
  if (isR2Url(image)) {
    return await getImageFromR2(image);
  }

  // Otherwise, try to fetch as a URL
  if (image.startsWith('http://') || image.startsWith('https://')) {
    const response = await fetch(image);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  throw new Error('Invalid image: must be a URL or base64 data');
}

/**
 * POST /api/images/detect-faces
 *
 * Detects faces in an image and optionally calculates crop suggestions.
 *
 * Request Body:
 * {
 *   "image": "https://r2.footprint.co.il/uploads/..." or "data:image/...",
 *   "options": {
 *     "minConfidence": 0.5,
 *     "maxFaces": 10,
 *     "includeLandmarks": false
 *   },
 *   "aspectRatio": "1:1"  // optional
 * }
 *
 * Response:
 * {
 *   "faceDetection": {
 *     "imageWidth": 800,
 *     "imageHeight": 600,
 *     "faces": [
 *       { "boundingBox": { x, y, width, height }, "confidence": 0.95, "rotation": 2.5 }
 *     ],
 *     "processingTimeMs": 1234,
 *     "cached": false
 *   },
 *   "cropSuggestion": {
 *     "suggestedCrop": { "region": { x, y, width, height }, "score": 0.85 },
 *     "suggestedRotation": 0,
 *     "detectedFaces": [...],
 *     "targetAspectRatio": "1:1"
 *   }
 * }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ImageAnalysisResponse | ImageAnalysisError>> {
  const startTime = Date.now();

  try {
    // 1. Rate limiting
    const rateLimitResult = await checkRateLimit('general', request);
    if (rateLimitResult) {
      return rateLimitResult as NextResponse<ImageAnalysisError>;
    }

    // 2. Authentication check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Unauthorized - Please sign in',
          code: 'UNAUTHORIZED' as const,
        },
        { status: 401 }
      );
    }

    // 3. Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'Invalid JSON body',
          code: 'INVALID_IMAGE' as const,
        },
        { status: 400 }
      );
    }

    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.error,
          code: 'INVALID_IMAGE' as const,
        },
        { status: 400 }
      );
    }

    const { image, options, aspectRatio } = validation.data;

    // 4. Get image buffer
    let imageBuffer: Buffer;
    try {
      imageBuffer = await getImageBuffer(image);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load image';
      return NextResponse.json(
        {
          error: message,
          code: 'INVALID_IMAGE' as const,
        },
        { status: 400 }
      );
    }

    // 5. Check image size
    if (imageBuffer.length > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        {
          error: `Image size exceeds maximum of ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
          code: 'INVALID_IMAGE' as const,
        },
        { status: 400 }
      );
    }

    // 6. Validate image format
    const formatValidation = await validateImageFormat(imageBuffer);
    if (!formatValidation.valid) {
      return NextResponse.json(
        {
          error: formatValidation.error ?? 'Invalid image format',
          code: 'INVALID_IMAGE' as const,
        },
        { status: 400 }
      );
    }

    // 7. Perform face detection with timeout
    const DETECTION_TIMEOUT_MS = 10000; // 10 second timeout
    let faceDetectionResult;

    try {
      const detectionPromise = detectFaces(imageBuffer, options);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Detection timeout')), DETECTION_TIMEOUT_MS);
      });

      faceDetectionResult = await Promise.race([detectionPromise, timeoutPromise]);
    } catch (error) {
      if (error instanceof Error && error.message === 'Detection timeout') {
        return NextResponse.json(
          {
            error: 'Face detection timed out',
            code: 'TIMEOUT' as const,
          },
          { status: 504 }
        );
      }

      logger.error('Face detection error', error);
      return NextResponse.json(
        {
          error: 'Face detection failed',
          code: 'DETECTION_FAILED' as const,
          details: error instanceof Error ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    // 8. Calculate crop suggestion if aspect ratio provided
    const response: ImageAnalysisResponse = {
      faceDetection: faceDetectionResult,
    };

    if (aspectRatio) {
      try {
        const cropResult = calculateOptimalCrop(
          faceDetectionResult.imageWidth,
          faceDetectionResult.imageHeight,
          faceDetectionResult.faces,
          { aspectRatio }
        );
        response.cropSuggestion = cropResult;
      } catch (error) {
        logger.error('Crop calculation error', error);
        // Don't fail the request, just skip crop suggestion
      }
    }

    // Log performance metrics
    const totalTime = Date.now() - startTime;
    logger.info(
      `Face detection completed: ${faceDetectionResult.faces.length} faces, ${faceDetectionResult.processingTimeMs}ms detection, ${totalTime}ms total`
    );

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Face detection API error', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'UNKNOWN' as const,
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
