/**
 * POST /api/tweak
 *
 * Applies custom AI edits to an image using Nano Banana (Google Gemini).
 * Users can provide natural language prompts to modify their image.
 *
 * Request body:
 * {
 *   "imageUrl": "https://images.footprint.co.il/transformed/...",
 *   "prompt": "Remove the background and make it transparent"
 * }
 *
 * Response:
 * {
 *   "imageUrl": "https://images.footprint.co.il/tweaked/...",
 *   "processingTime": 5000
 * }
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadToSupabase } from '@/lib/storage/supabase-storage';
import {
  transformWithNanoBananaRetry,
  dataUriToBase64,
  base64ToDataUri,
} from '@/lib/ai/nano-banana';
import { removeBackground, isRemoveBgConfigured } from '@/lib/ai/remove-bg';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

interface TweakRequest {
  imageUrl: string;
  prompt: string;
}

interface TweakResponse {
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

/**
 * Fetches an image from URL and returns as base64
 */
async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  return { base64, mimeType: contentType };
}

export async function POST(
  request: Request
): Promise<NextResponse<TweakResponse | ErrorResponse>> {
  // Rate limiting: 10 tweaks per minute (AI operation)
  const rateLimited = await checkRateLimit('transform', request);
  if (rateLimited) return rateLimited as NextResponse<ErrorResponse>;

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
      logger.debug('Auth check failed, using anonymous', authError);
    }

    // 2. Parse and validate request body
    let body: TweakRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { imageUrl, prompt } = body;

    // Validate required fields
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing required field: imageUrl' },
        { status: 400 }
      );
    }

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Missing required field: prompt' },
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

    // 3. Check if Google AI API key is configured
    const googleApiKey = process.env.GOOGLE_AI_API_KEY;
    if (!googleApiKey) {
      logger.error('GOOGLE_AI_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    // 4. Fetch the image and convert to base64
    let imageBase64: string;
    let mimeType: string;
    try {
      const result = await fetchImageAsBase64(imageUrl);
      imageBase64 = result.base64;
      mimeType = result.mimeType;
    } catch (error) {
      logger.error('Failed to fetch image', error);
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: 400 }
      );
    }

    // 5. Detect if this is a background removal request
    const isBackgroundRemoval = prompt.toLowerCase().includes('remove') &&
                                 prompt.toLowerCase().includes('background');

    // 6. Process image based on operation type
    let outputBase64: string;
    let outputMimeType: string;

    if (isBackgroundRemoval && isRemoveBgConfigured()) {
      // Use Remove.bg API for background removal
      try {
        logger.info('Using Remove.bg for background removal');
        outputBase64 = await removeBackground(imageUrl);
        outputMimeType = 'image/png'; // Remove.bg always returns PNG with transparency
      } catch (error) {
        // Remove.bg failed (e.g., can't identify foreground in artistic images)
        logger.error('Remove.bg error', error);

        const errorMessage = error instanceof Error ? error.message : 'Failed to remove background';
        const userMessage = errorMessage.includes('Could not identify foreground')
          ? 'לא ניתן לזהות את הנושא בתמונה. הסרת רקע עובדת הכי טוב עם נושאים ברורים ורקע פשוט. נסו תמונה אחרת.'
          : 'שגיאה בהסרת הרקע. אנא נסו שוב מאוחר יותר.';

        return NextResponse.json(
          {
            error: userMessage,
            code: 'REMOVEBG_FAILED',
            details: errorMessage
          },
          { status: 500 }
        );
      }
    } else {
      // Use Gemini for other AI edits (enhance, change background, etc.)
      const editPrompt = `Edit this image according to the following instructions:

${prompt.trim()}

Important:
- Maintain the overall composition and subject
- Apply the requested changes naturally
- Ensure high quality output suitable for printing
- Output only the edited image`;

      try {
        const geminiResult = await callGeminiWithPrompt(imageBase64, mimeType, editPrompt);
        outputBase64 = geminiResult.imageBase64;
        outputMimeType = geminiResult.mimeType;
      } catch (geminiError) {
        logger.error('Gemini edit error', geminiError);
        return NextResponse.json(
          {
            error: geminiError instanceof Error ? geminiError.message : 'Failed to apply edit',
            code: 'TWEAK_FAILED',
          },
          { status: 500 }
        );
      }
    }

    // 7. Upload result to Supabase Storage
    let uploadResult: { key: string; publicUrl: string; size: number };
    try {
      const imageBuffer = Buffer.from(outputBase64, 'base64');
      const extension = outputMimeType.includes('png') ? 'png' : 'jpg';
      const fileName = `tweaked-${Date.now()}.${extension}`;

      uploadResult = await uploadToSupabase(
        imageBuffer,
        userId,
        fileName,
        outputMimeType,
        'transformed'
      );
    } catch (error) {
      logger.error('Upload error', error);
      return NextResponse.json(
        {
          error: 'Failed to save edited image',
          code: 'UPLOAD_FAILED',
        },
        { status: 500 }
      );
    }

    // 8. Return success response
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      imageUrl: uploadResult.publicUrl,
      processingTime,
    });
  } catch (error) {
    logger.error('Unexpected error in tweak route', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Call Gemini API directly with a custom prompt
 */
async function callGeminiWithPrompt(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<{ imageBase64: string; mimeType: string }> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY not configured');
  }

  const model = process.env.NANO_BANANA_MODEL || 'gemini-2.5-flash-image';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    logger.error(`Gemini API error: HTTP ${response.status}`, errorText);
    throw new Error(`Gemini API error: HTTP ${response.status}`);
  }

  const data = await response.json();

  // Extract the generated image from response
  const responseParts = data.candidates?.[0]?.content?.parts;
  if (!responseParts || responseParts.length === 0) {
    throw new Error('No output returned from Gemini');
  }

  // Find the image part in the response
  const imagePart = responseParts.find((part: { inlineData?: { data: string } }) => part.inlineData?.data);
  if (!imagePart || !imagePart.inlineData) {
    throw new Error('No image in Gemini response');
  }

  return {
    imageBase64: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType || 'image/png',
  };
}
