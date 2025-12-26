/**
 * Print File Generation
 *
 * Handles generation and retrieval of high-resolution print-ready files
 * with correct dimensions (300 DPI) and color profile (sRGB).
 */

import { getDownloadUrl, uploadToR2 } from '@/lib/storage/r2';
import {
  optimizeForPrint,
  getOptionsForPrintSize,
  PRINT_SIZES,
} from '@/lib/image/optimize';

/**
 * Supported print sizes
 */
export type PrintSize = 'A5' | 'A4' | 'A3' | 'A2';

/**
 * Dimensions for a print file
 */
export interface PrintDimensions {
  width: number;
  height: number;
  dpi: number;
}

/**
 * Result of print file generation
 */
export interface PrintFileResult {
  key: string;
  publicUrl: string;
  dimensions: PrintDimensions;
}

/**
 * Result of print file download request
 */
export interface PrintDownloadResult {
  downloadUrl: string;
  fileName: string;
  dimensions: PrintDimensions;
  expiresIn: number;
}

/**
 * Generates a file name for a print-ready file
 *
 * Format: {orderId}_{size}_{timestamp}_print.jpg
 *
 * @param orderId - The order ID
 * @param size - The print size (A5, A4, A3, A2)
 * @returns File name string
 */
export function generatePrintFileName(orderId: string, size: PrintSize): string {
  const timestamp = Math.floor(Date.now() / 1000);
  return `${orderId}_${size}_${timestamp}_print.jpg`;
}

/**
 * Generates the storage key for a print-ready file
 *
 * Format: print-ready/{orderId}/{size}_{timestamp}_print.jpg
 *
 * @param orderId - The order ID
 * @param size - The print size
 * @returns Storage key string
 */
export function getPrintFileKey(orderId: string, size: PrintSize): string {
  const fileName = generatePrintFileName(orderId, size);
  return `print-ready/${orderId}/${fileName}`;
}

/**
 * Gets the dimensions for a print size
 *
 * @param size - The print size
 * @returns Dimensions with width, height, and DPI
 */
function getDimensionsForSize(size: PrintSize): PrintDimensions {
  const dimensions = PRINT_SIZES[size];
  return {
    width: dimensions.width,
    height: dimensions.height,
    dpi: 300,
  };
}

/**
 * Generates a print-ready file from source image
 *
 * Optimizes the image for the specified print size at 300 DPI
 * and uploads to R2 storage.
 *
 * @param sourceBuffer - The source image buffer
 * @param orderId - The order ID
 * @param size - The target print size
 * @returns Print file result with key, URL, and dimensions
 */
export async function generatePrintReadyFile(
  sourceBuffer: Buffer,
  orderId: string,
  size: PrintSize
): Promise<PrintFileResult> {
  // Get optimization options for the print size
  const options = getOptionsForPrintSize(size, 90);

  // Optimize image for print
  const optimizedBuffer = await optimizeForPrint(sourceBuffer, options);

  // Generate file name and upload
  const fileName = generatePrintFileName(orderId, size);

  const uploadResult = await uploadToR2(
    optimizedBuffer,
    orderId,
    fileName,
    'image/jpeg',
    'print-ready'
  );

  return {
    key: uploadResult.key,
    publicUrl: uploadResult.publicUrl,
    dimensions: getDimensionsForSize(size),
  };
}

/**
 * Gets or creates a print-ready file and returns a download URL
 *
 * This is the main function called by the admin download API.
 * It generates a print-ready file from the source image and
 * returns a presigned download URL.
 *
 * @param sourceBuffer - The source image buffer (transformed image)
 * @param orderId - The order ID
 * @param size - The target print size
 * @returns Download result with presigned URL, file name, and dimensions
 */
export async function getOrCreatePrintFile(
  sourceBuffer: Buffer,
  orderId: string,
  size: PrintSize
): Promise<PrintDownloadResult> {
  // Generate the print-ready file
  const printFile = await generatePrintReadyFile(sourceBuffer, orderId, size);

  // Get presigned download URL (expires in 1 hour)
  const expiresIn = 3600;
  const downloadUrl = await getDownloadUrl(printFile.key, expiresIn);

  return {
    downloadUrl,
    fileName: generatePrintFileName(orderId, size),
    dimensions: printFile.dimensions,
    expiresIn,
  };
}

/**
 * Validates if a string is a valid print size
 *
 * @param size - The size string to validate
 * @returns True if valid print size
 */
export function isValidPrintSize(size: string): size is PrintSize {
  return ['A5', 'A4', 'A3', 'A2'].includes(size);
}
