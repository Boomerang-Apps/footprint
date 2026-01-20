/**
 * POST /api/remove-bg
 *
 * Removes the background from an image using AI.
 *
 * Request body:
 * {
 *   "imageUrl": "https://images.footprint.co.il/transformed/..."
 * }
 *
 * Response:
 * {
 *   "imageUrl": "https://images.footprint.co.il/nobg/...",
 *   "processingTime": 3500
 * }
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadToSupabase } from '@/lib/storage/supabase-storage';

interface RemoveBgRequest {
  imageUrl: string;
}

interface RemoveBgResponse {
  imageUrl: string;
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

export async function POST(
  request: Request
): Promise<NextResponse<RemoveBgResponse | ErrorResponse>> {
  const startTime = Date.now();

  try {
    // 1. Try to authenticate user, allow anonymous for development
    let userId = 'anonymous';

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch (authError) {
      console.log('Auth check failed, using anonymous:', authError);
    }

    // 2. Parse and validate request body
    let body: RemoveBgRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { imageUrl } = body;

    // Validate required fields
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing required field: imageUrl' },
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

    // 3. Check if Replicate API token is configured
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      console.error('REPLICATE_API_TOKEN not configured');
      return NextResponse.json(
        { error: 'Background removal service not configured' },
        { status: 503 }
      );
    }

    // 4. Call Replicate rembg model for background removal
    let outputUrl: string;
    try {
      // Create prediction
      const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${replicateToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // rembg model for background removal
          version: 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
          input: {
            image: imageUrl,
          },
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        console.error('Replicate create prediction error:', error);
        throw new Error(error.detail || 'Failed to start background removal');
      }

      const prediction = await createResponse.json();

      // Poll for completion
      let result = prediction;
      const maxAttempts = 60; // 60 seconds max
      let attempts = 0;

      while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const pollResponse = await fetch(result.urls.get, {
          headers: {
            'Authorization': `Token ${replicateToken}`,
          },
        });

        if (!pollResponse.ok) {
          throw new Error('Failed to poll prediction status');
        }

        result = await pollResponse.json();
        attempts++;
      }

      if (result.status === 'failed') {
        throw new Error(result.error || 'Background removal failed');
      }

      if (result.status !== 'succeeded') {
        throw new Error('Background removal timed out');
      }

      outputUrl = result.output;
    } catch (error) {
      console.error('Background removal error:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Background removal failed',
          code: 'REMOVE_BG_FAILED',
        },
        { status: 500 }
      );
    }

    // 5. Download the result and upload to Supabase Storage
    let uploadResult: { key: string; publicUrl: string; size: number };
    try {
      const response = await fetch(outputUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch result image: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);

      const fileName = `nobg-${Date.now()}.png`;

      uploadResult = await uploadToSupabase(
        imageBuffer,
        userId,
        fileName,
        'image/png',
        'transformed'
      );
    } catch (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        {
          error: 'Failed to save processed image',
          code: 'UPLOAD_FAILED',
        },
        { status: 500 }
      );
    }

    // 6. Return success response
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      imageUrl: uploadResult.publicUrl,
      processingTime,
    });
  } catch (error) {
    console.error('Unexpected error in remove-bg route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
