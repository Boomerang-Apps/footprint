/**
 * POST /api/transform
 *
 * Transforms an uploaded image into an artistic style using AI.
 * Supports both Nano Banana (Gemini) and Replicate providers.
 *
 * Request body:
 * {
 *   "imageUrl": "https://images.footprint.co.il/uploads/...",
 *   "style": "pop_art" | "watercolor" | "line_art" | ...
 *   "provider": "nano-banana" | "replicate" (optional, defaults to nano-banana)
 * }
 *
 * Response:
 * {
 *   "transformedUrl": "https://images.footprint.co.il/transformed/...",
 *   "style": "pop_art",
 *   "provider": "nano-banana",
 *   "processingTime": 6500,
 *   "cost": 0.039,
 *   "transformationId": "uuid"
 * }
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  transformImage,
  isValidStyle,
  ALLOWED_STYLES,
  AIProvider,
} from '@/lib/ai';
import { uploadToSupabase } from '@/lib/storage/supabase-storage';
import {
  createTransformation,
  startTransformation,
  completeTransformation,
  failTransformation,
  findExistingTransformation,
} from '@/lib/db/transformations';
import {
  getStyleReferences,
  hasStyleReferences,
} from '@/lib/ai/style-references';
import { loadReferenceImages, type ReferenceImage } from '@/lib/ai/nano-banana';

interface TransformRequest {
  imageUrl: string;
  style: string;
  provider?: AIProvider;
}

interface TransformResponse {
  transformedUrl: string;
  style: string;
  provider: AIProvider;
  processingTime: number;
  cost?: number;
  transformationId: string;
  cached?: boolean;
}

interface ErrorResponse {
  error: string;
  code?: string;
}

/**
 * Validates that a string is a valid URL
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extracts R2 key from URL
 */
function extractR2Key(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove leading slash and return path
    return urlObj.pathname.replace(/^\//, '');
  } catch {
    return url;
  }
}

export async function POST(
  request: Request
): Promise<NextResponse<TransformResponse | ErrorResponse>> {
  const startTime = Date.now();
  let transformationId: string | null = null;

  try {
    // 1. Try to authenticate user, allow anonymous for development
    let userId = 'anonymous';

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = userId;
      }
    } catch (authError) {
      console.log('Auth check failed, using anonymous transform:', authError);
    }

    // 2. Parse and validate request body
    let body: TransformRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { imageUrl, style, provider = 'nano-banana' } = body;

    // Validate required fields
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing required field: imageUrl' },
        { status: 400 }
      );
    }

    if (!style) {
      return NextResponse.json(
        { error: 'Missing required field: style' },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!isValidUrl(imageUrl)) {
      return NextResponse.json(
        { error: 'Invalid imageUrl format' },
        { status: 400 }
      );
    }

    // Validate style
    if (!isValidStyle(style)) {
      return NextResponse.json(
        {
          error: `Invalid style: "${style}". Allowed styles: ${ALLOWED_STYLES.join(', ')}`,
          code: 'INVALID_STYLE',
        },
        { status: 400 }
      );
    }

    // Validate provider
    if (provider !== 'nano-banana' && provider !== 'replicate') {
      return NextResponse.json(
        {
          error: `Invalid provider: "${provider}". Allowed: nano-banana, replicate`,
          code: 'INVALID_PROVIDER',
        },
        { status: 400 }
      );
    }

    const originalImageKey = extractR2Key(imageUrl);

    // 3. Check cache for existing transformation
    try {
      const cached = await findExistingTransformation(originalImageKey, style);
      if (cached && cached.transformed_image_key) {
        // Return cached result
        const cachedUrl = `${process.env.R2_PUBLIC_URL}/${cached.transformed_image_key}`;
        return NextResponse.json({
          transformedUrl: cachedUrl,
          style,
          provider: cached.provider as AIProvider,
          processingTime: Date.now() - startTime,
          cost: 0, // No cost for cached results
          transformationId: cached.id,
          cached: true,
        });
      }
    } catch {
      // Cache lookup failed, continue with transformation
    }

    // 4. Create transformation record
    try {
      const record = await createTransformation({
        userId: userId,
        originalImageKey,
        style,
        provider,
      });
      transformationId = record.id;
      await startTransformation(transformationId);
    } catch (error) {
      console.error('Failed to create transformation record:', error);
      // Continue without tracking if DB fails
    }

    // 5. Load style references if available
    let referenceImages: ReferenceImage[] = [];
    if (hasStyleReferences(style)) {
      try {
        const refPaths = getStyleReferences(style);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        referenceImages = await loadReferenceImages(refPaths, baseUrl);
        console.log(`Loaded ${referenceImages.length} reference images for style: ${style}`);
      } catch (refError) {
        console.warn('Failed to load reference images:', refError);
        // Continue without references
      }
    }

    // 6. Transform image using AI
    let result;
    try {
      result = await transformImage(imageUrl, style, { provider, referenceImages });
    } catch (error) {
      console.error('AI transformation error:', error);

      // Record failure
      if (transformationId) {
        await failTransformation(transformationId, {
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          processingTimeMs: Date.now() - startTime,
        }).catch(console.error);
      }

      return NextResponse.json(
        {
          error: 'Image transformation failed. Please try again.',
          code: 'TRANSFORM_FAILED',
        },
        { status: 500 }
      );
    }

    // 6. Upload transformed image to Supabase Storage
    let uploadResult: { key: string; publicUrl: string; size: number };
    try {
      let imageBuffer: Buffer;

      if (result.imageBase64) {
        // Nano Banana returns base64
        imageBuffer = Buffer.from(result.imageBase64, 'base64');
      } else if (result.imageUrl) {
        // Replicate returns URL, fetch it
        const response = await fetch(result.imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch transformed image: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      } else {
        throw new Error('No image data in transformation result');
      }

      const fileName = `${style}-${Date.now()}.png`;

      uploadResult = await uploadToSupabase(
        imageBuffer,
        userId,
        fileName,
        result.mimeType || 'image/png',
        'transformed'
      );
    } catch (error) {
      console.error('R2 upload error:', error);

      // Record failure
      if (transformationId) {
        await failTransformation(transformationId, {
          errorMessage: error instanceof Error ? error.message : 'Upload failed',
          processingTimeMs: Date.now() - startTime,
        }).catch(console.error);
      }

      return NextResponse.json(
        {
          error: 'Failed to save transformed image. Please try again.',
          code: 'UPLOAD_FAILED',
        },
        { status: 500 }
      );
    }

    // 7. Complete transformation record
    const processingTime = Date.now() - startTime;

    if (transformationId) {
      try {
        await completeTransformation(transformationId, {
          transformedImageKey: uploadResult.key,
          tokensUsed: result.tokensUsed,
          estimatedCost: result.estimatedCost,
          processingTimeMs: processingTime,
        });
      } catch (error) {
        console.error('Failed to complete transformation record:', error);
      }
    }

    // 8. Return success response
    return NextResponse.json({
      transformedUrl: uploadResult.publicUrl,
      style,
      provider: result.provider,
      processingTime,
      cost: result.estimatedCost,
      transformationId: transformationId || 'unknown',
    });
  } catch (error) {
    console.error('Unexpected error in transform route:', error);

    // Record failure
    if (transformationId) {
      await failTransformation(transformationId, {
        errorMessage: error instanceof Error ? error.message : 'Unexpected error',
        processingTimeMs: Date.now() - startTime,
      }).catch(console.error);
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
