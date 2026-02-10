/**
 * Remove.bg API Integration for Background Removal
 *
 * API: https://www.remove.bg/api
 * Pricing: Free tier includes 50 images/month
 *
 * @see https://www.remove.bg/api#remove-background
 */

import { logger } from '@/lib/logger';

interface RemoveBgResponse {
  data: {
    result_b64: string;
  };
}

interface RemoveBgError {
  errors: Array<{
    title: string;
    detail: string;
  }>;
}

/**
 * Remove background from an image using Remove.bg API
 *
 * @param imageUrl - URL of the image to process
 * @returns Base64 encoded PNG image with transparent background
 * @throws Error if API key is not configured or API call fails
 */
export async function removeBackground(imageUrl: string): Promise<string> {
  const apiKey = process.env.REMOVEBG_API_KEY;

  if (!apiKey) {
    throw new Error('REMOVEBG_API_KEY not configured');
  }

  try {
    logger.info('Remove.bg: Processing image', { imageUrl });

    const formData = new FormData();
    formData.append('image_url', imageUrl);
    formData.append('size', 'auto'); // auto, preview, full, medium, hd, 4k
    formData.append('format', 'png'); // Always PNG for transparency

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json() as RemoveBgError;
      const errorCode = errorData.errors?.[0]?.code;
      const errorTitle = errorData.errors?.[0]?.title || `API error: ${response.status}`;

      logger.error('Remove.bg API error', { status: response.status, error: errorData });

      // Provide user-friendly error messages
      if (errorCode === 'unknown_foreground') {
        throw new Error('לא ניתן לזהות נושא ברור בתמונה. הסרת רקע עובדת בצורה מיטבית עם תמונות מקוריות לפני עיבוד אמנותי.');
      }

      throw new Error(`Remove.bg: ${errorTitle}`);
    }

    // Get the image as base64
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    logger.info('Remove.bg: Background removed successfully');

    return base64;
  } catch (error) {
    logger.error('Remove.bg: Failed to remove background', error);
    throw error;
  }
}

/**
 * Check if Remove.bg API is configured
 */
export function isRemoveBgConfigured(): boolean {
  return !!process.env.REMOVEBG_API_KEY;
}
