/**
 * Nano Banana (Google Gemini) Integration for Style Transformation
 *
 * Uses Gemini 2.5 Flash Image model for AI-powered image style transfer.
 * Model nickname: "Nano Banana"
 *
 * Cost: ~$0.039 per image (1,290 output tokens)
 * Speed: 5-10 seconds per transformation
 *
 * @see https://ai.google.dev/gemini-api/docs/image-generation
 */

import { StyleType, STYLE_PROMPTS, isValidStyle } from './replicate';
import {
  getStyleReferences,
  getStyleReferencePrompt,
  hasStyleReferences,
} from './style-references';
import { logger } from '@/lib/logger';

/**
 * Nano Banana model configuration
 *
 * Uses gemini-2.5-flash-image as default (stable, works globally)
 * Note: gemini-2.0-flash-preview-image-generation does NOT work in Middle East/Europe/Africa
 *
 * @see https://ai.google.dev/gemini-api/docs/models
 * @see https://ai.google.dev/gemini-api/docs/image-generation
 */
const NANO_BANANA_MODEL = process.env.NANO_BANANA_MODEL || 'gemini-2.5-flash-image';
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Response structure from Gemini API
 */
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

/**
 * Transformation result with metadata
 */
export interface NanoBananaResult {
  imageBase64: string;
  mimeType: string;
  tokensUsed: number;
  estimatedCost: number;
}

/**
 * Reference image data for style consistency
 */
export interface ReferenceImage {
  base64: string;
  mimeType: string;
}

/**
 * Gets the Google AI API key from environment
 * @throws Error if GOOGLE_AI_API_KEY is not set
 */
function getApiKey(): string {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY is not configured');
  }
  return apiKey;
}

/**
 * Builds the style transfer prompt for Nano Banana
 * If reference images are provided, uses them as style inspiration (not exact copies)
 */
function buildPrompt(
  style: StyleType,
  customInstructions?: string,
  hasReferences: boolean = false
): string {
  const basePrompt = STYLE_PROMPTS[style];
  const instructions = customInstructions || '';
  const referencePrompt = hasReferences ? getStyleReferencePrompt(style) : '';

  // If we have reference images, use them for style inspiration
  if (hasReferences && referencePrompt) {
    return `Transform the source photograph into an artistic image using the style concepts, colors, and techniques shown in the reference images.

STYLE REFERENCE IMAGES: The first images demonstrate the artistic style to apply. Use these as INSPIRATION for:
- Color palette and tones
- Brush stroke or line technique
- Overall artistic mood and texture
- Visual style and rendering approach

${referencePrompt}

SOURCE PHOTOGRAPH: The last image is the photograph to transform. Keep all content, subjects, and composition from this image.

STYLE DESCRIPTION:
${basePrompt}

${instructions}

IMPORTANT:
- Use the references for STYLE INSPIRATION only - do NOT copy their content
- PRESERVE the exact subjects, people, and composition from the source photograph
- Apply the artistic style while maintaining the subject's likeness and features
- Render the source image content with the artistic techniques from the references
- Ensure high quality output suitable for professional printing`;
  }

  // Standard prompt without reference images
  return `Transform this photograph using the following artistic style:

${basePrompt}

${instructions}

Important instructions:
- Maintain the subject's likeness and key features
- Apply the style consistently across the entire image
- Ensure high quality output suitable for printing
- Output only the transformed image`;
}

/**
 * Transforms an image using Nano Banana (Gemini 2.5 Flash Image)
 *
 * @param imageBase64 - Base64 encoded image data (without data URI prefix)
 * @param style - The artistic style to apply
 * @param mimeType - MIME type of the input image (default: image/jpeg)
 * @param referenceImages - Optional array of reference images for style consistency
 * @returns Transformation result with base64 image and metadata
 * @throws Error if transformation fails
 */
export async function transformWithNanoBanana(
  imageBase64: string,
  style: StyleType,
  mimeType: string = 'image/jpeg',
  referenceImages: ReferenceImage[] = []
): Promise<NanoBananaResult> {
  if (!isValidStyle(style)) {
    throw new Error(`Invalid style: ${style}`);
  }

  const apiKey = getApiKey();
  const hasRefs = referenceImages.length > 0;
  const prompt = buildPrompt(style, undefined, hasRefs);

  // Check if the model supports aspectRatio (only gemini-2.5-flash-image does)
  const supportsAspectRatio = NANO_BANANA_MODEL.includes('2.5-flash-image');

  // Build parts array: reference images first, then source image, then prompt
  const parts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> = [];

  // Add reference images first (if any)
  for (const ref of referenceImages) {
    parts.push({
      inlineData: {
        mimeType: ref.mimeType,
        data: ref.base64,
      },
    });
  }

  // Add the source image
  parts.push({
    inlineData: {
      mimeType,
      data: imageBase64,
    },
  });

  // Add the prompt
  parts.push({
    text: prompt,
  });

  if (hasRefs) {
    logger.info(`Nano Banana: Using ${referenceImages.length} reference images for style: ${style}`);
  }

  const requestBody = {
    contents: [
      {
        parts,
      },
    ],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      ...(supportsAspectRatio && {
        imageConfig: {
          aspectRatio: '1:1',
        },
      }),
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  };

  const url = `${API_BASE_URL}/models/${NANO_BANANA_MODEL}:generateContent`;
  logger.info(`Nano Banana: Calling model ${NANO_BANANA_MODEL}`);

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
    logger.error(`Nano Banana API error: HTTP ${response.status}`, errorText);

    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // Use raw text if not JSON
      if (errorText) errorMessage = errorText.substring(0, 200);
    }
    throw new Error(`Nano Banana API error: ${errorMessage}`);
  }

  const data: GeminiResponse = await response.json();

  // Check for API-level errors
  if (data.error) {
    throw new Error(`Nano Banana API error: ${data.error.message}`);
  }

  // Extract the generated image from response
  const responseParts = data.candidates?.[0]?.content?.parts;
  if (!responseParts || responseParts.length === 0) {
    throw new Error('No output returned from Nano Banana');
  }

  // Find the image part in the response
  const imagePart = responseParts.find((part) => part.inlineData?.data);
  if (!imagePart || !imagePart.inlineData) {
    throw new Error('No image in Nano Banana response');
  }

  // Calculate cost (1,290 tokens per image at $30/1M tokens = $0.039)
  const tokensUsed = data.usageMetadata?.totalTokenCount || 1290;
  const estimatedCost = (tokensUsed / 1_000_000) * 30;

  return {
    imageBase64: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType || 'image/png',
    tokensUsed,
    estimatedCost,
  };
}

/**
 * Delay helper for retry logic
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Transforms an image with automatic retry on failure
 *
 * Uses exponential backoff: 1s, 2s, 4s
 *
 * @param imageBase64 - Base64 encoded image data
 * @param style - The artistic style to apply
 * @param mimeType - MIME type of the input image
 * @param maxRetries - Maximum number of attempts (default: 3)
 * @param referenceImages - Optional array of reference images for style consistency
 * @returns Transformation result
 * @throws Last error encountered after all retries fail
 */
export async function transformWithNanoBananaRetry(
  imageBase64: string,
  style: StyleType,
  mimeType: string = 'image/jpeg',
  maxRetries: number = 3,
  referenceImages: ReferenceImage[] = []
): Promise<NanoBananaResult> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await transformWithNanoBanana(imageBase64, style, mimeType, referenceImages);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on validation errors
      if (lastError.message.includes('Invalid style')) {
        throw lastError;
      }

      // Don't retry on API key errors
      if (lastError.message.includes('not configured')) {
        throw lastError;
      }

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const backoffMs = 1000 * Math.pow(2, attempt - 1);
        logger.warn(
          `Nano Banana attempt ${attempt} failed, retrying in ${backoffMs}ms...`
        );
        await delay(backoffMs);
      }
    }
  }

  throw lastError;
}

/**
 * Converts a base64 data URI to raw base64 string
 */
export function dataUriToBase64(dataUri: string): {
  base64: string;
  mimeType: string;
} {
  const matches = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    // Assume it's already raw base64
    return { base64: dataUri, mimeType: 'image/jpeg' };
  }
  return {
    base64: matches[2],
    mimeType: matches[1],
  };
}

/**
 * Converts raw base64 to data URI
 */
export function base64ToDataUri(base64: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Loads reference images from URLs and converts to base64
 * Use this to load reference images from /public/style-references/
 *
 * @param urls - Array of image URLs (can be relative paths like /style-references/watercolor/ref1.jpg)
 * @param baseUrl - Base URL for relative paths (e.g., process.env.NEXT_PUBLIC_APP_URL)
 * @returns Array of ReferenceImage objects ready for use
 */
export async function loadReferenceImages(
  urls: string[],
  baseUrl: string
): Promise<ReferenceImage[]> {
  const references: ReferenceImage[] = [];

  for (const url of urls) {
    try {
      // Build full URL if relative path
      const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

      const response = await fetch(fullUrl);
      if (!response.ok) {
        logger.warn(`Failed to load reference image: ${fullUrl}`);
        continue;
      }

      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      references.push({
        base64,
        mimeType: contentType,
      });
    } catch (error) {
      logger.warn(`Error loading reference image ${url}`, error);
    }
  }

  return references;
}

/**
 * Re-export style reference helpers for convenience
 */
export { getStyleReferences, hasStyleReferences } from './style-references';
