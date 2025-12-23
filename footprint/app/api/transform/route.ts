/**
 * POST /api/transform
 *
 * Transforms an uploaded image into an artistic style using AI.
 * Requires authentication. Stores result in R2.
 *
 * Request body:
 * {
 *   "imageUrl": "https://images.footprint.co.il/uploads/...",
 *   "style": "pop_art" | "watercolor" | "line_art" | ...
 * }
 *
 * Response:
 * {
 *   "transformedUrl": "https://images.footprint.co.il/transformed/...",
 *   "style": "pop_art",
 *   "processingTime": 6500
 * }
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { transformWithRetry, isValidStyle, ALLOWED_STYLES } from '@/lib/ai/replicate';
import { uploadToR2 } from '@/lib/storage/r2';

interface TransformRequest {
  imageUrl: string;
  style: string;
}

interface TransformResponse {
  transformedUrl: string;
  style: string;
  processingTime: number;
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
 * Fetches image from URL and returns as buffer
 */
async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(
  request: Request
): Promise<NextResponse<TransformResponse | ErrorResponse>> {
  const startTime = Date.now();

  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to transform images' },
        { status: 401 }
      );
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

    const { imageUrl, style } = body;

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

    // 3. Transform image using Replicate
    let replicateOutputUrl: string;
    try {
      replicateOutputUrl = await transformWithRetry(imageUrl, style);
    } catch (error) {
      console.error('Replicate transformation error:', error);
      return NextResponse.json(
        {
          error: 'Image transformation failed. Please try again.',
          code: 'TRANSFORM_FAILED',
        },
        { status: 500 }
      );
    }

    // 4. Fetch transformed image and upload to R2
    let r2Result: { key: string; publicUrl: string; size: number };
    try {
      const imageBuffer = await fetchImageAsBuffer(replicateOutputUrl);
      const fileName = `${style}-${Date.now()}.png`;

      r2Result = await uploadToR2(
        imageBuffer,
        user.id,
        fileName,
        'image/png',
        'transformed'
      );
    } catch (error) {
      console.error('R2 upload error:', error);
      return NextResponse.json(
        {
          error: 'Failed to save transformed image. Please try again.',
          code: 'UPLOAD_FAILED',
        },
        { status: 500 }
      );
    }

    // 5. Return success response
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      transformedUrl: r2Result.publicUrl,
      style,
      processingTime,
    });
  } catch (error) {
    console.error('Unexpected error in transform route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
