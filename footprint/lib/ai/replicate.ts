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
  | 'original'
  | 'watercolor'
  | 'line_art'
  | 'line_art_watercolor'
  | 'pop_art'
  | 'wpap';

/**
 * List of all allowed styles for validation
 */
export const ALLOWED_STYLES: readonly StyleType[] = [
  'original',
  'watercolor',
  'line_art',
  'line_art_watercolor',
  'pop_art',
  'wpap',
] as const;

/**
 * Prompt templates for each artistic style
 * These are optimized for Gemini/Nano Banana image generation
 * See nano-banana-styles.md for full documentation
 */
export const STYLE_PROMPTS: Record<StyleType, string> = {
  original:
    'Keep the original photo exactly as-is with no artistic transformation applied. Maintain all original colors, lighting, composition, and details unchanged.',

  watercolor:
    'Transform into a beautiful watercolor painting. Style: soft flowing edges with gentle color bleeds, translucent color washes with visible paper texture, wet-on-wet watercolor technique with organic color mixing, delicate brushstrokes following natural forms, light airy feel with areas of white showing through, subtle granulation effects. Colors should be soft and slightly desaturated with gentle transitions. Preserve subject likeness while creating hand-painted watercolor artwork suitable for framing.',

  line_art:
    'Transform into elegant minimalist line art. Style: clean precise contour lines with consistent weight, single color (black) on white background, minimal detail capturing only essential forms, elegant simplicity with purposeful negative space, vector-like quality with smooth confident strokes. Focus on capturing the essence and character of the subject. Result should look like professional illustration suitable for high-end printing.',

  line_art_watercolor:
    'Transform into a combination of line art and watercolor. Style: clean precise ink outlines defining main forms, soft watercolor washes filling inside the linework, confident slightly loose lines, translucent slightly imperfect watercolor fills, colors bleeding slightly beyond lines in places for artistic touch. Ink and wash illustration style where outlines anchor composition while watercolor adds warmth and life. Hand-crafted artistic feel suitable for premium printing.',

  pop_art:
    'Transform into bold Pop Art style inspired by Andy Warhol and Roy Lichtenstein. Style: vibrant saturated colors like hot pink, electric blue, bright yellow and orange, visible halftone dot patterns in shadow areas, strong black outlines defining shapes, high contrast with simplified tonal areas, graphic poster-like quality with clean color separations, screen-printed aesthetic. Preserve subject likeness while creating iconic pop art portrait suitable for framing.',

  wpap: 'Transform the uploaded portrait into WPAP (Wedha\'s Pop Art Portrait) style. Preserve exact facial likeness, proportions, and identity first. Build the portrait using sharp angular polygon planes only — faceted geometry with strong high-contrast light and shadow blocks that follow facial anatomy and the original light direction. Use bold vibrant saturated colors with solid flat fills only. No gradients, no soft shading, no smooth blending, no airbrush effects. Each color region must be a single solid flat color. Crisp Illustrator-like vector edges, poster style composition. No texture, no brush strokes, no realism, no blur, no painterly effects. Preserve hairstyle, glasses, beard, and facial hair accurately. Simple flat solid background. Modern digital vector illustration, print-ready resolution.',
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
