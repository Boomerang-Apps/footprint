/**
 * Unified AI Service for Image Transformation
 *
 * Supports multiple AI providers:
 * - Nano Banana (Google Gemini 2.5 Flash Image) - Default
 * - Replicate (Flux Kontext Pro) - Fallback
 *
 * Provider selection is controlled by environment variable:
 * AI_PROVIDER=nano-banana | replicate (default: nano-banana)
 */

import {
  transformWithNanoBananaRetry,
  NanoBananaResult,
  dataUriToBase64,
  base64ToDataUri,
  type ReferenceImage,
} from './nano-banana';
import {
  transformWithRetry as transformWithReplicateRetry,
  StyleType,
  ALLOWED_STYLES,
  STYLE_PROMPTS,
  isValidStyle,
} from './replicate';
import { logger } from '@/lib/logger';

// Re-export common types and utilities
export type { StyleType };
export { ALLOWED_STYLES, STYLE_PROMPTS, isValidStyle };

/**
 * AI provider options
 */
export type AIProvider = 'nano-banana' | 'replicate';

/**
 * Transformation result with provider info
 */
export interface TransformResult {
  imageUrl?: string;
  imageBase64?: string;
  mimeType: string;
  provider: AIProvider;
  tokensUsed?: number;
  estimatedCost?: number;
  processingTimeMs: number;
}

/**
 * Transformation options
 */
export interface TransformOptions {
  provider?: AIProvider;
  maxRetries?: number;
  referenceImages?: ReferenceImage[];
}

/**
 * Gets the configured AI provider
 */
function getProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase();
  if (provider === 'replicate') {
    return 'replicate';
  }
  return 'nano-banana'; // Default
}

/**
 * Checks if Nano Banana is configured
 */
function isNanoBananaConfigured(): boolean {
  return !!process.env.GOOGLE_AI_API_KEY;
}

/**
 * Checks if Replicate is configured
 */
function isReplicateConfigured(): boolean {
  return !!process.env.REPLICATE_API_TOKEN;
}

/**
 * Transforms an image using the configured AI provider
 *
 * For Nano Banana: Pass imageBase64 (base64 string or data URI)
 * For Replicate: Pass imageUrl (publicly accessible URL)
 *
 * @param input - Image input (base64 for Nano Banana, URL for Replicate)
 * @param style - Artistic style to apply
 * @param options - Optional configuration
 * @returns Transformation result with image data
 */
export async function transformImage(
  input: string,
  style: StyleType,
  options: TransformOptions = {}
): Promise<TransformResult> {
  const startTime = Date.now();
  const preferredProvider = options.provider || getProvider();

  // Validate style
  if (!isValidStyle(style)) {
    throw new Error(`Invalid style: ${style}. Allowed: ${ALLOWED_STYLES.join(', ')}`);
  }

  // Try preferred provider first
  if (preferredProvider === 'nano-banana' && isNanoBananaConfigured()) {
    try {
      return await transformWithNanoBananaProvider(input, style, startTime, options.maxRetries, options.referenceImages);
    } catch (error) {
      logger.error('Nano Banana failed', error);

      // Fall back to Replicate if configured
      if (isReplicateConfigured()) {
        logger.info('Falling back to Replicate...');
        return await transformWithReplicateProvider(input, style, startTime, options.maxRetries);
      }
      throw error;
    }
  }

  // Try Replicate
  if (isReplicateConfigured()) {
    try {
      return await transformWithReplicateProvider(input, style, startTime, options.maxRetries);
    } catch (error) {
      logger.error('Replicate failed', error);

      // Fall back to Nano Banana if configured
      if (isNanoBananaConfigured()) {
        logger.info('Falling back to Nano Banana...');
        return await transformWithNanoBananaProvider(input, style, startTime, options.maxRetries, options.referenceImages);
      }
      throw error;
    }
  }

  throw new Error('No AI provider configured. Set GOOGLE_AI_API_KEY or REPLICATE_API_TOKEN');
}

/**
 * Transform using Nano Banana provider
 */
async function transformWithNanoBananaProvider(
  input: string,
  style: StyleType,
  startTime: number,
  maxRetries?: number,
  referenceImages?: ReferenceImage[]
): Promise<TransformResult> {
  // Convert input to base64 if needed
  const { base64, mimeType } = input.startsWith('data:')
    ? dataUriToBase64(input)
    : input.startsWith('http')
      ? await fetchImageAsBase64(input)
      : { base64: input, mimeType: 'image/jpeg' };

  const result: NanoBananaResult = await transformWithNanoBananaRetry(
    base64,
    style,
    mimeType,
    maxRetries,
    referenceImages || []
  );

  return {
    imageBase64: result.imageBase64,
    mimeType: result.mimeType,
    provider: 'nano-banana',
    tokensUsed: result.tokensUsed,
    estimatedCost: result.estimatedCost,
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * Transform using Replicate provider
 */
async function transformWithReplicateProvider(
  input: string,
  style: StyleType,
  startTime: number,
  maxRetries?: number
): Promise<TransformResult> {
  // Replicate requires a URL
  let imageUrl = input;

  // If input is base64, we'd need to upload it first
  // For now, assume Replicate always gets a URL
  if (input.startsWith('data:') || !input.startsWith('http')) {
    throw new Error('Replicate requires a publicly accessible image URL');
  }

  const outputUrl = await transformWithReplicateRetry(imageUrl, style, maxRetries);

  return {
    imageUrl: outputUrl,
    mimeType: 'image/png',
    provider: 'replicate',
    processingTimeMs: Date.now() - startTime,
  };
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

/**
 * Gets available providers based on configuration
 */
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = [];
  if (isNanoBananaConfigured()) providers.push('nano-banana');
  if (isReplicateConfigured()) providers.push('replicate');
  return providers;
}

/**
 * Gets the current default provider
 */
export function getCurrentProvider(): AIProvider {
  return getProvider();
}
