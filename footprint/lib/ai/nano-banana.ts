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

/**
 * Nano Banana model configuration
 */
const NANO_BANANA_MODEL = 'gemini-2.5-flash-preview-image-generation';
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
 */
function buildPrompt(style: StyleType, customInstructions?: string): string {
  const basePrompt = STYLE_PROMPTS[style];
  const instructions = customInstructions || '';

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
 * @returns Transformation result with base64 image and metadata
 * @throws Error if transformation fails
 */
export async function transformWithNanoBanana(
  imageBase64: string,
  style: StyleType,
  mimeType: string = 'image/jpeg'
): Promise<NanoBananaResult> {
  if (!isValidStyle(style)) {
    throw new Error(`Invalid style: ${style}`);
  }

  const apiKey = getApiKey();
  const prompt = buildPrompt(style);

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
      temperature: 0.8,
      maxOutputTokens: 8192,
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

  const response = await fetch(
    `${API_BASE_URL}/models/${NANO_BANANA_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      (errorData as GeminiResponse).error?.message || `HTTP ${response.status}`;
    throw new Error(`Nano Banana API error: ${errorMessage}`);
  }

  const data: GeminiResponse = await response.json();

  // Check for API-level errors
  if (data.error) {
    throw new Error(`Nano Banana API error: ${data.error.message}`);
  }

  // Extract the generated image from response
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts || parts.length === 0) {
    throw new Error('No output returned from Nano Banana');
  }

  // Find the image part in the response
  const imagePart = parts.find((part) => part.inlineData?.data);
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
 * @returns Transformation result
 * @throws Last error encountered after all retries fail
 */
export async function transformWithNanoBananaRetry(
  imageBase64: string,
  style: StyleType,
  mimeType: string = 'image/jpeg',
  maxRetries: number = 3
): Promise<NanoBananaResult> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await transformWithNanoBanana(imageBase64, style, mimeType);
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
        console.log(
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
