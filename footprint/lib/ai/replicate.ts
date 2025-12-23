/**
 * Replicate AI Integration for Style Transformation
 *
 * Uses Flux Kontext Pro model for fast, context-aware image style transfer.
 * Approved in Gate 0: .claudecode/research/GATE0-replicate-ai.md
 */

import Replicate from 'replicate';

/**
 * Available artistic styles for image transformation
 */
export type StyleType =
  | 'pop_art'
  | 'watercolor'
  | 'line_art'
  | 'oil_painting'
  | 'romantic'
  | 'comic_book'
  | 'vintage'
  | 'original_enhanced';

/**
 * List of all allowed styles for validation
 */
export const ALLOWED_STYLES: readonly StyleType[] = [
  'pop_art',
  'watercolor',
  'line_art',
  'oil_painting',
  'romantic',
  'comic_book',
  'vintage',
  'original_enhanced',
] as const;

/**
 * Prompt templates for each artistic style
 * These are optimized for the Flux Kontext Pro model
 */
export const STYLE_PROMPTS: Record<StyleType, string> = {
  pop_art:
    'Transform into pop art style: bold vibrant colors, halftone dots pattern, Andy Warhol inspired, high contrast',
  watercolor:
    'Transform into watercolor painting: soft flowing edges, translucent color washes, wet-on-wet technique, artistic brushstrokes',
  line_art:
    'Transform into minimalist line art: clean precise lines, single color, elegant simplicity, vector-like quality',
  oil_painting:
    'Transform into oil painting: thick impasto brushstrokes, rich textures, classical art style, museum quality',
  romantic:
    'Transform into romantic style: soft dreamy focus, warm golden tones, ethereal lighting, tender atmosphere',
  comic_book:
    'Transform into comic book style: bold black outlines, vibrant flat colors, Ben-Day dots, dynamic composition',
  vintage:
    'Transform into vintage style: sepia tones, film grain, retro color grading, nostalgic aesthetic',
  original_enhanced:
    'Enhance photo: improve colors, sharpen details, professional color grading, maintain original composition',
};

/**
 * Model configuration
 */
const PRIMARY_MODEL = 'black-forest-labs/flux-kontext-pro';

/**
 * Default model parameters
 */
const DEFAULT_PARAMS = {
  guidance_scale: 7.5,
  num_inference_steps: 28,
  output_format: 'png' as const,
  output_quality: 100,
};

/**
 * Validates if a string is a valid StyleType
 */
export function isValidStyle(style: string): style is StyleType {
  if (!style) return false;
  return ALLOWED_STYLES.includes(style as StyleType);
}

/**
 * Gets the prompt for a given style
 * @throws Error if style is invalid
 */
export function getStylePrompt(style: StyleType): string {
  if (!isValidStyle(style)) {
    throw new Error(`Invalid style: ${style}`);
  }
  return STYLE_PROMPTS[style];
}

/**
 * Creates a Replicate client with API token from environment
 * @throws Error if REPLICATE_API_TOKEN is not set
 */
function getReplicateClient(): Replicate {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error('REPLICATE_API_TOKEN is not configured');
  }
  return new Replicate({ auth: token });
}

/**
 * Transforms an image using the specified artistic style
 *
 * @param imageUrl - URL of the source image (must be publicly accessible)
 * @param style - The artistic style to apply
 * @returns URL of the transformed image from Replicate
 * @throws Error if transformation fails or no output is returned
 */
export async function transformImage(
  imageUrl: string,
  style: StyleType
): Promise<string> {
  const replicate = getReplicateClient();
  const prompt = getStylePrompt(style);

  const output = await replicate.run(PRIMARY_MODEL, {
    input: {
      image: imageUrl,
      prompt,
      ...DEFAULT_PARAMS,
    },
  });

  // Handle different output formats from Replicate
  if (!output) {
    throw new Error('No output returned from Replicate');
  }

  if (Array.isArray(output)) {
    if (output.length === 0) {
      throw new Error('No output returned from Replicate');
    }
    return output[0] as unknown as string;
  }

  return output as unknown as string;
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
 * Uses exponential backoff: 1s, 2s, 4s, etc.
 *
 * @param imageUrl - URL of the source image
 * @param style - The artistic style to apply
 * @param maxRetries - Maximum number of attempts (default: 3)
 * @returns URL of the transformed image
 * @throws Last error encountered after all retries fail
 */
export async function transformWithRetry(
  imageUrl: string,
  style: StyleType,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await transformImage(imageUrl, style);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s, etc.
        const backoffMs = 1000 * Math.pow(2, attempt - 1);
        await delay(backoffMs);
      }
    }
  }

  throw lastError;
}
