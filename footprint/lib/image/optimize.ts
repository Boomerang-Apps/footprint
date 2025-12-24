import sharp from 'sharp';

/**
 * Maximum allowed file size in bytes (20MB)
 */
export const MAX_FILE_SIZE = 20 * 1024 * 1024;

/**
 * Allowed image MIME types
 */
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/webp',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

/**
 * Error codes for image validation
 */
export type ImageValidationErrorCode =
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_TYPE'
  | 'EMPTY_FILE'
  | 'INVALID_IMAGE';

/**
 * Custom error class for image validation errors
 */
export class ImageValidationError extends Error {
  public readonly code?: ImageValidationErrorCode;

  constructor(message: string, code?: ImageValidationErrorCode) {
    super(message);
    this.name = 'ImageValidationError';
    this.code = code;
  }
}

/**
 * Result of image validation
 */
export interface ImageValidationResult {
  valid: boolean;
  format?: string;
  error?: string;
  code?: ImageValidationErrorCode;
}

/**
 * Image metadata extracted from buffer
 */
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  colorSpace: string;
  density: number;
  size: number;
}

/**
 * Options for image optimization
 */
export interface ImageOptimizeOptions {
  /** Target DPI for print (default: 300) */
  targetDpi?: number;
  /** Maximum width in pixels */
  maxWidth?: number;
  /** Maximum height in pixels */
  maxHeight?: number;
  /** JPEG/WebP quality 1-100 (default: 90) */
  quality?: number;
  /** Output format (default: 'jpeg') */
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Default optimization options
 */
const DEFAULT_OPTIONS: Required<ImageOptimizeOptions> = {
  targetDpi: 300,
  maxWidth: 4200, // A3 at 300 DPI
  maxHeight: 5940, // A3 at 300 DPI
  quality: 90,
  format: 'jpeg',
};

/**
 * Normalizes MIME type to lowercase
 */
function normalizeMimeType(mimeType: string): string {
  return mimeType.toLowerCase();
}

/**
 * Extracts format from MIME type
 */
function formatFromMimeType(mimeType: string): string {
  const normalized = normalizeMimeType(mimeType);
  const formatMap: Record<string, string> = {
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/heic': 'heic',
    'image/webp': 'webp',
  };
  return formatMap[normalized] || 'unknown';
}

/**
 * Validates an image buffer against size and type constraints
 *
 * @param buffer - The image buffer to validate
 * @param mimeType - The MIME type of the image
 * @returns Validation result with format or error
 */
export async function validateImage(
  buffer: Buffer,
  mimeType: string
): Promise<ImageValidationResult> {
  // Check for empty buffer
  if (buffer.length === 0) {
    return {
      valid: false,
      error: 'Empty file provided',
      code: 'EMPTY_FILE',
    };
  }

  // Check file size
  if (buffer.length > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size (${(buffer.length / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed size (20MB)`,
      code: 'FILE_TOO_LARGE',
    };
  }

  // Check MIME type
  const normalizedMime = normalizeMimeType(mimeType);
  if (!ALLOWED_MIME_TYPES.includes(normalizedMime as AllowedMimeType)) {
    return {
      valid: false,
      error: `Unsupported file type: ${mimeType}. Allowed types: JPEG, PNG, HEIC, WebP`,
      code: 'UNSUPPORTED_TYPE',
    };
  }

  const format = formatFromMimeType(normalizedMime);

  return {
    valid: true,
    format,
  };
}

/**
 * Extracts metadata from an image buffer
 *
 * @param buffer - The image buffer
 * @returns Image metadata including dimensions, format, and color space
 */
export async function getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
  const metadata = await sharp(buffer).metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    colorSpace: metadata.space || 'unknown',
    density: metadata.density || 72,
    size: metadata.size || buffer.length,
  };
}

/**
 * Optimizes an image for print production
 *
 * Resizes the image to fit within specified dimensions while maintaining
 * aspect ratio, applies compression, and embeds color profile metadata.
 *
 * @param buffer - The source image buffer
 * @param options - Optimization options
 * @returns Optimized image buffer
 */
export async function optimizeForPrint(
  buffer: Buffer,
  options: ImageOptimizeOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let pipeline = sharp(buffer);

  // Resize to fit within max dimensions while preserving aspect ratio
  if (opts.maxWidth || opts.maxHeight) {
    pipeline = pipeline.resize({
      width: opts.maxWidth,
      height: opts.maxHeight,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Set output format with quality
  switch (opts.format) {
    case 'png':
      pipeline = pipeline.png({ quality: opts.quality });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality: opts.quality });
      break;
    case 'jpeg':
    default:
      pipeline = pipeline.jpeg({ quality: opts.quality, mozjpeg: true });
      break;
  }

  // Preserve metadata including color profile
  pipeline = pipeline.withMetadata({
    density: opts.targetDpi,
  });

  return pipeline.toBuffer();
}

/**
 * Converts any supported image format to JPEG
 *
 * Useful for converting HEIC/WebP/PNG to JPEG for broader compatibility.
 *
 * @param buffer - The source image buffer
 * @param quality - JPEG quality 1-100 (default: 90)
 * @returns JPEG image buffer
 */
export async function convertToJpeg(
  buffer: Buffer,
  quality: number = 90
): Promise<Buffer> {
  return sharp(buffer)
    .jpeg({ quality, mozjpeg: true })
    .withMetadata()
    .toBuffer();
}

/**
 * Print size configurations in pixels at 300 DPI
 */
export const PRINT_SIZES = {
  A5: { width: 1748, height: 2480 },
  A4: { width: 2480, height: 3508 },
  A3: { width: 3508, height: 4960 },
  A2: { width: 4960, height: 7016 },
} as const;

export type PrintSize = keyof typeof PRINT_SIZES;

/**
 * Gets optimization options for a specific print size
 *
 * @param size - The print size (A5, A4, A3, A2)
 * @param quality - JPEG quality 1-100 (default: 90)
 * @returns Optimization options for the specified size
 */
export function getOptionsForPrintSize(
  size: PrintSize,
  quality: number = 90
): ImageOptimizeOptions {
  const dimensions = PRINT_SIZES[size];
  return {
    targetDpi: 300,
    maxWidth: dimensions.width,
    maxHeight: dimensions.height,
    quality,
    format: 'jpeg',
  };
}
