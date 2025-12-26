/**
 * Face Detection and Smart Cropping Service
 *
 * Provides intelligent crop suggestions for images using content-aware analysis.
 * Detects important image features (faces, edges, high contrast areas) and suggests
 * optimal crop regions for various aspect ratios.
 *
 * Uses smartcrop-sharp for content-aware cropping analysis.
 */

import sharp from 'sharp';
import * as smartcrop from 'smartcrop-sharp';

/**
 * Extended crop type that includes the score property.
 * The smartcrop types are incomplete and don't include score,
 * but it exists in the actual response.
 */
interface SmartcropCropWithScore {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
}

/**
 * Represents a rectangular region in an image
 */
export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * A suggested crop with confidence score
 */
export interface CropSuggestion {
  region: CropRegion;
  score: number;
}

/**
 * Parsed aspect ratio as width and height values
 */
export interface AspectRatio {
  width: number;
  height: number;
}

/**
 * Result of smart crop analysis
 */
export interface SmartCropResult {
  imageWidth: number;
  imageHeight: number;
  crops: Record<string, CropSuggestion>;
}

/**
 * Options for smart cropping
 */
export interface SmartCropOptions {
  /** Aspect ratios to calculate crops for (default: ['1:1', '4:5', '3:4']) */
  aspectRatios?: string[];
}

/**
 * Print aspect ratios for standard paper sizes
 * A-series paper has a 1:√2 ratio (approximately 1:1.414)
 */
export const PRINT_ASPECT_RATIOS = {
  A5: '1:1.414',
  A4: '1:1.414',
  A3: '1:1.414',
  A2: '1:1.414',
  SQUARE: '1:1',
} as const;

/**
 * Default aspect ratios for crop suggestions
 */
export const DEFAULT_ASPECT_RATIOS = ['1:1', '4:5', '3:4'];

/**
 * Parses an aspect ratio string into width and height values
 *
 * @param ratio - Aspect ratio string in format "width:height" (e.g., "16:9", "1:1.414")
 * @returns Parsed aspect ratio object
 * @throws Error if format is invalid or values are not positive
 */
export function parseAspectRatio(ratio: string): AspectRatio {
  const parts = ratio.split(':');

  if (parts.length !== 2) {
    throw new Error(`Invalid aspect ratio format: "${ratio}". Expected format: "width:height"`);
  }

  const width = parseFloat(parts[0]);
  const height = parseFloat(parts[1]);

  if (isNaN(width) || isNaN(height)) {
    throw new Error(`Invalid aspect ratio format: "${ratio}". Values must be numbers`);
  }

  if (width <= 0 || height <= 0) {
    throw new Error(`Aspect ratio values must be positive: "${ratio}"`);
  }

  return { width, height };
}

/**
 * Validates if a string is a valid aspect ratio format
 *
 * @param ratio - String to validate
 * @returns true if valid aspect ratio format
 */
export function isValidAspectRatio(ratio: string): boolean {
  try {
    parseAspectRatio(ratio);
    return true;
  } catch {
    return false;
  }
}

/**
 * Calculates a centered crop region for a given aspect ratio
 *
 * This function calculates the largest possible crop that fits within
 * the image dimensions while maintaining the specified aspect ratio.
 * The crop is centered in the image.
 *
 * @param imageWidth - Width of the source image
 * @param imageHeight - Height of the source image
 * @param aspectRatio - Target aspect ratio string (e.g., "1:1", "4:5")
 * @returns Centered crop region
 */
export function calculateCropRegion(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: string
): CropRegion {
  const { width: ratioWidth, height: ratioHeight } = parseAspectRatio(aspectRatio);
  const targetRatio = ratioWidth / ratioHeight;
  const imageRatio = imageWidth / imageHeight;

  let cropWidth: number;
  let cropHeight: number;

  if (imageRatio > targetRatio) {
    // Image is wider than target ratio - constrain by height
    cropHeight = imageHeight;
    cropWidth = imageHeight * targetRatio;
  } else {
    // Image is taller than target ratio - constrain by width
    cropWidth = imageWidth;
    cropHeight = imageWidth / targetRatio;
  }

  // Round to integers
  cropWidth = Math.round(cropWidth);
  cropHeight = Math.round(cropHeight);

  // Center the crop
  const x = Math.round((imageWidth - cropWidth) / 2);
  const y = Math.round((imageHeight - cropHeight) / 2);

  return {
    x,
    y,
    width: cropWidth,
    height: cropHeight,
  };
}

/**
 * Gets smart crop suggestions for an image
 *
 * Analyzes the image content to find optimal crop regions that preserve
 * important features (faces, edges, high contrast areas) for each
 * specified aspect ratio.
 *
 * @param imageBuffer - Image buffer to analyze
 * @param options - Cropping options
 * @returns Smart crop result with suggestions for each aspect ratio
 * @throws Error if image buffer is invalid or empty
 */
export async function getSuggestedCrops(
  imageBuffer: Buffer,
  options: SmartCropOptions = {}
): Promise<SmartCropResult> {
  // Validate buffer
  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error('Invalid image buffer: buffer is empty');
  }

  // Get image metadata
  let metadata;
  try {
    metadata = await sharp(imageBuffer).metadata();
  } catch (error) {
    throw new Error(
      `Invalid image buffer: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }

  if (!metadata.width || !metadata.height) {
    throw new Error('Invalid image: could not determine dimensions');
  }

  const imageWidth = metadata.width;
  const imageHeight = metadata.height;

  const aspectRatios = options.aspectRatios || DEFAULT_ASPECT_RATIOS;
  const crops: Record<string, CropSuggestion> = {};

  // Calculate crops for each aspect ratio
  for (const ratio of aspectRatios) {
    if (!isValidAspectRatio(ratio)) {
      continue;
    }

    // Calculate basic crop region for this aspect ratio
    const basicRegion = calculateCropRegion(imageWidth, imageHeight, ratio);

    try {
      // Use smartcrop to find optimal position for this crop size
      const result = await smartcrop.crop(imageBuffer, {
        width: basicRegion.width,
        height: basicRegion.height,
      });

      // Cast to include score (smartcrop types are incomplete)
      const topCrop = result.topCrop as SmartcropCropWithScore;

      crops[ratio] = {
        region: {
          x: topCrop.x,
          y: topCrop.y,
          width: topCrop.width,
          height: topCrop.height,
        },
        score: normalizeScore(topCrop.score),
      };
    } catch {
      // Fall back to centered crop if smartcrop fails
      crops[ratio] = {
        region: basicRegion,
        score: 0.5, // Neutral score for fallback
      };
    }
  }

  return {
    imageWidth,
    imageHeight,
    crops,
  };
}

/**
 * Normalizes smartcrop score to 0-1 range
 *
 * Smartcrop scores can be any positive number representing
 * the quality of the crop. We use a sigmoid-like normalization
 * to map to 0-1 range, where higher scores approach 1.
 *
 * @param score - Raw score from smartcrop (can be any positive number)
 * @returns Normalized score between 0 and 1
 */
function normalizeScore(score: number): number {
  // Handle edge cases
  if (typeof score !== 'number' || isNaN(score)) {
    return 0.5; // Default neutral score
  }

  if (score <= 0) {
    return 0;
  }

  // Use sigmoid-like normalization
  // Scores typically range from 0 to ~1000+ for good crops
  // This maps: 0 -> 0, 100 -> ~0.5, 500 -> ~0.83, 1000+ -> ~0.9+
  const normalized = score / (score + 100);

  // Clamp to 0-1 range for safety
  return Math.max(0, Math.min(1, normalized));
}
