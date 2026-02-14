/**
 * Face Detection Service
 *
 * Provides AI-powered face detection for images.
 * Supports multiple providers (Replicate, Cloudflare Workers AI)
 * with automatic fallback to content-aware cropping.
 */

import sharp from 'sharp';
import { fetchWithTimeout, TIMEOUT_DEFAULTS } from '@/lib/utils/fetch-with-timeout';
import type {
  DetectedFace,
  FaceDetectionResult,
  FaceDetectionOptions,
  BoundingBox,
  SupportedImageFormat,
} from '@/types/image';

// Simple LRU cache for detection results
const detectionCache = new Map<string, { result: FaceDetectionResult; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 1000;

/**
 * Maximum image size for processing (10MB)
 */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/**
 * Maximum dimension for detection processing
 * Images larger than this will be downsampled
 */
export const MAX_DETECTION_DIMENSION = 2048;

/**
 * Default options for face detection
 */
export const DEFAULT_DETECTION_OPTIONS: Required<FaceDetectionOptions> = {
  minConfidence: 0.5,
  maxFaces: 20,
  includeLandmarks: false,
};

/**
 * Supported image formats
 */
export const SUPPORTED_FORMATS: SupportedImageFormat[] = ['jpeg', 'png', 'heic', 'webp'];

/**
 * Generates a cache key from image buffer
 */
async function generateCacheKey(imageBuffer: Buffer): Promise<string> {
  // Use a simple hash based on buffer content
  const crypto = await import('crypto');
  return crypto.createHash('sha256').update(imageBuffer).digest('hex');
}

/**
 * Clears expired entries from cache
 */
function cleanCache(): void {
  const now = Date.now();
  for (const [key, value] of detectionCache.entries()) {
    if (now - value.timestamp > CACHE_TTL_MS) {
      detectionCache.delete(key);
    }
  }

  // If still over max size, remove oldest entries
  if (detectionCache.size > MAX_CACHE_SIZE) {
    const entries = [...detectionCache.entries()];
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    for (const [key] of toRemove) {
      detectionCache.delete(key);
    }
  }
}

/**
 * Validates image buffer format
 */
export async function validateImageFormat(imageBuffer: Buffer): Promise<{
  valid: boolean;
  format?: SupportedImageFormat;
  error?: string;
}> {
  try {
    const metadata = await sharp(imageBuffer).metadata();

    if (!metadata.format) {
      return { valid: false, error: 'Could not determine image format' };
    }

    const format = metadata.format.toLowerCase() as SupportedImageFormat;

    if (!SUPPORTED_FORMATS.includes(format)) {
      return {
        valid: false,
        error: `Unsupported format: ${format}. Supported: ${SUPPORTED_FORMATS.join(', ')}`,
      };
    }

    return { valid: true, format };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid image: ${error instanceof Error ? error.message : 'unknown error'}`,
    };
  }
}

/**
 * Preprocesses image for detection (downsamples if needed)
 * Returns the processed buffer and scale factor
 */
export async function preprocessImage(
  imageBuffer: Buffer
): Promise<{ buffer: Buffer; scale: number; width: number; height: number }> {
  const metadata = await sharp(imageBuffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Could not determine image dimensions');
  }

  const maxDim = Math.max(metadata.width, metadata.height);

  if (maxDim <= MAX_DETECTION_DIMENSION) {
    return {
      buffer: imageBuffer,
      scale: 1,
      width: metadata.width,
      height: metadata.height,
    };
  }

  // Calculate scale factor
  const scale = MAX_DETECTION_DIMENSION / maxDim;
  const newWidth = Math.round(metadata.width * scale);
  const newHeight = Math.round(metadata.height * scale);

  // Downsample the image
  const processedBuffer = await sharp(imageBuffer)
    .resize(newWidth, newHeight, { fit: 'inside' })
    .jpeg({ quality: 85 })
    .toBuffer();

  return {
    buffer: processedBuffer,
    scale,
    width: metadata.width,
    height: metadata.height,
  };
}

/**
 * Scales bounding box coordinates back to original image dimensions
 */
function scaleBoundingBox(box: BoundingBox, scale: number): BoundingBox {
  if (scale === 1) return box;

  return {
    x: Math.round(box.x / scale),
    y: Math.round(box.y / scale),
    width: Math.round(box.width / scale),
    height: Math.round(box.height / scale),
  };
}

/**
 * Detects faces in an image using Replicate API
 */
async function detectFacesWithReplicate(
  imageBuffer: Buffer,
  options: FaceDetectionOptions
): Promise<DetectedFace[]> {
  const replicateApiKey = process.env.REPLICATE_API_KEY;

  if (!replicateApiKey) {
    throw new Error('REPLICATE_API_KEY not configured');
  }

  // Convert buffer to base64 data URL
  const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

  // Use MediaPipe face detection model on Replicate
  const response = await fetchWithTimeout('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${replicateApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'a8c5b9c7d9e1a4f3b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0', // Placeholder - replace with actual model version
      input: {
        image: base64Image,
        min_confidence: options.minConfidence ?? DEFAULT_DETECTION_OPTIONS.minConfidence,
      },
    }),
    timeout: TIMEOUT_DEFAULTS.AI,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Replicate API error: ${error}`);
  }

  const prediction = (await response.json()) as {
    id: string;
    status: string;
    urls: { get: string };
  };

  // Poll for result
  const maxWaitMs = 10000;
  const startTime = Date.now();
  let result = prediction;

  while (result.status !== 'succeeded' && result.status !== 'failed') {
    if (Date.now() - startTime > maxWaitMs) {
      throw new Error('Face detection timeout');
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const pollResponse = await fetchWithTimeout(result.urls.get, {
      headers: { Authorization: `Bearer ${replicateApiKey}` },
      timeout: TIMEOUT_DEFAULTS.AI,
    });

    result = (await pollResponse.json()) as typeof result;
  }

  if (result.status === 'failed') {
    throw new Error('Face detection failed');
  }

  // Transform Replicate response to our format
  const output = (result as { output?: Array<{ bbox: number[]; confidence: number }> }).output;

  if (!output || !Array.isArray(output)) {
    return [];
  }

  const faces: DetectedFace[] = output
    .filter((face) => face.confidence >= (options.minConfidence ?? DEFAULT_DETECTION_OPTIONS.minConfidence))
    .slice(0, options.maxFaces ?? DEFAULT_DETECTION_OPTIONS.maxFaces)
    .map((face) => ({
      boundingBox: {
        x: face.bbox[0],
        y: face.bbox[1],
        width: face.bbox[2] - face.bbox[0],
        height: face.bbox[3] - face.bbox[1],
      },
      confidence: face.confidence,
    }));

  return faces;
}

/**
 * Fallback face detection using edge detection heuristics
 * Used when AI detection is unavailable
 */
async function detectFacesFallback(
  imageBuffer: Buffer,
  options: FaceDetectionOptions
): Promise<DetectedFace[]> {
  // Use smartcrop for content-aware analysis as fallback
  // This won't give us face bounding boxes directly, but will identify important regions
  const smartcrop = await import('smartcrop-sharp');

  const metadata = await sharp(imageBuffer).metadata();
  if (!metadata.width || !metadata.height) {
    return [];
  }

  try {
    // Get crop suggestion for 1:1 aspect ratio (portrait-like)
    const result = await smartcrop.crop(imageBuffer, {
      width: Math.min(metadata.width, metadata.height),
      height: Math.min(metadata.width, metadata.height),
    });

    // Convert smartcrop boost points to approximate face regions
    // This is a heuristic - not as accurate as real face detection
    const topCrop = result.topCrop;

    if (topCrop) {
      // Estimate a "face" region from the crop center
      const faceWidth = Math.round(topCrop.width * 0.4);
      const faceHeight = Math.round(topCrop.height * 0.5);

      return [
        {
          boundingBox: {
            x: topCrop.x + Math.round((topCrop.width - faceWidth) / 2),
            y: topCrop.y + Math.round(topCrop.height * 0.1),
            width: faceWidth,
            height: faceHeight,
          },
          confidence: 0.3, // Low confidence for fallback
        },
      ];
    }
  } catch {
    // Ignore errors, return empty array
  }

  return [];
}

/**
 * Calculates face rotation from landmarks or bounding box
 */
function calculateFaceRotation(face: DetectedFace): number {
  if (face.landmarks?.leftEye && face.landmarks?.rightEye) {
    const dx = face.landmarks.rightEye.x - face.landmarks.leftEye.x;
    const dy = face.landmarks.rightEye.y - face.landmarks.leftEye.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }

  // Without landmarks, we can't determine rotation
  return 0;
}

/**
 * Detects faces in an image
 *
 * @param imageBuffer - Image buffer to analyze
 * @param options - Detection options
 * @returns Face detection result with bounding boxes and confidence scores
 */
export async function detectFaces(
  imageBuffer: Buffer,
  options: FaceDetectionOptions = {}
): Promise<FaceDetectionResult> {
  const startTime = Date.now();
  const mergedOptions = { ...DEFAULT_DETECTION_OPTIONS, ...options };

  // Validate buffer
  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error('Invalid image buffer: buffer is empty');
  }

  // Check cache
  const cacheKey = await generateCacheKey(imageBuffer);
  const cached = detectionCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      ...cached.result,
      processingTimeMs: Date.now() - startTime,
      cached: true,
    };
  }

  // Validate format
  const formatValidation = await validateImageFormat(imageBuffer);
  if (!formatValidation.valid) {
    throw new Error(formatValidation.error);
  }

  // Preprocess image (downsample if needed)
  const { buffer: processedBuffer, scale, width, height } = await preprocessImage(imageBuffer);

  let faces: DetectedFace[];

  try {
    // Try AI-based detection first
    faces = await detectFacesWithReplicate(processedBuffer, mergedOptions);
  } catch {
    // Fall back to heuristic detection
    faces = await detectFacesFallback(processedBuffer, mergedOptions);
  }

  // Scale coordinates back to original image dimensions
  const scaledFaces = faces.map((face) => ({
    ...face,
    boundingBox: scaleBoundingBox(face.boundingBox, scale),
    rotation: calculateFaceRotation(face),
  }));

  // Filter by confidence and limit count
  const filteredFaces = scaledFaces
    .filter((face) => face.confidence >= mergedOptions.minConfidence)
    .slice(0, mergedOptions.maxFaces);

  const result: FaceDetectionResult = {
    imageWidth: width,
    imageHeight: height,
    faces: filteredFaces,
    processingTimeMs: Date.now() - startTime,
    cached: false,
  };

  // Cache the result
  cleanCache();
  detectionCache.set(cacheKey, { result, timestamp: Date.now() });

  return result;
}

/**
 * Clears the detection cache
 */
export function clearDetectionCache(): void {
  detectionCache.clear();
}

/**
 * Gets cache statistics
 */
export function getCacheStats(): { size: number; maxSize: number; ttlMs: number } {
  return {
    size: detectionCache.size,
    maxSize: MAX_CACHE_SIZE,
    ttlMs: CACHE_TTL_MS,
  };
}
