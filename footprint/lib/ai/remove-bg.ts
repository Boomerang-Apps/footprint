/**
 * Remove.bg API Client
 *
 * Integrates with Remove.bg (https://www.remove.bg/) for automatic background removal.
 * Free tier: 50 API calls/month
 *
 * Setup:
 * 1. Sign up at https://www.remove.bg/users/sign_up
 * 2. Get API key from https://www.remove.bg/api
 * 3. Add REMOVEBG_API_KEY to .env.local or Doppler
 */

import { fetchWithTimeout, TIMEOUT_DEFAULTS } from '@/lib/utils/fetch-with-timeout';

/**
 * Check if Remove.bg is properly configured
 */
export function isRemoveBgConfigured(): boolean {
  return !!process.env.REMOVEBG_API_KEY;
}

/**
 * Remove background from image using Remove.bg API
 *
 * @param imageUrl - Public URL of the image to process
 * @returns Base64-encoded PNG with transparent background
 * @throws Error if API key not configured or API request fails
 */
export async function removeBackground(imageUrl: string): Promise<string> {
  const apiKey = process.env.REMOVEBG_API_KEY;

  if (!apiKey) {
    throw new Error('REMOVEBG_API_KEY not configured. Add it to your environment variables.');
  }

  try {
    const formData = new FormData();
    formData.append('image_url', imageUrl);
    formData.append('size', 'auto'); // Original size
    formData.append('format', 'png'); // PNG with transparency

    const response = await fetchWithTimeout('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: formData,
      timeout: TIMEOUT_DEFAULTS.AI,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.errors?.[0]?.title ||
                          errorData.error ||
                          `Remove.bg API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    // Get the image as a buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to base64
    const base64 = buffer.toString('base64');

    return base64;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to remove background: Unknown error');
  }
}
