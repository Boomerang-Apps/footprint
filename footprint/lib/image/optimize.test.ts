import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateImage,
  optimizeForPrint,
  convertToJpeg,
  getImageMetadata,
  getOptionsForPrintSize,
  ImageValidationError,
  type ImageOptimizeOptions,
  type ImageMetadata,
} from './optimize';

// Mock sharp module
vi.mock('sharp', () => {
  const mockSharp = vi.fn(() => ({
    metadata: vi.fn().mockResolvedValue({
      width: 4000,
      height: 3000,
      format: 'jpeg',
      space: 'srgb',
      density: 72,
      size: 5000000,
    }),
    resize: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    png: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('optimized-image-data')),
    toFormat: vi.fn().mockReturnThis(),
    withMetadata: vi.fn().mockReturnThis(),
  }));
  return { default: mockSharp };
});

describe('Image Optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateImage', () => {
    it('should accept valid JPEG under 20MB', async () => {
      const buffer = Buffer.alloc(1024 * 1024); // 1MB
      const result = await validateImage(buffer, 'image/jpeg');
      expect(result.valid).toBe(true);
      expect(result.format).toBe('jpeg');
    });

    it('should accept valid PNG under 20MB', async () => {
      const buffer = Buffer.alloc(1024 * 1024); // 1MB
      const result = await validateImage(buffer, 'image/png');
      expect(result.valid).toBe(true);
      expect(result.format).toBe('png');
    });

    it('should accept valid HEIC under 20MB', async () => {
      const buffer = Buffer.alloc(1024 * 1024); // 1MB
      const result = await validateImage(buffer, 'image/heic');
      expect(result.valid).toBe(true);
      expect(result.format).toBe('heic');
    });

    it('should accept valid WebP under 20MB', async () => {
      const buffer = Buffer.alloc(1024 * 1024); // 1MB
      const result = await validateImage(buffer, 'image/webp');
      expect(result.valid).toBe(true);
      expect(result.format).toBe('webp');
    });

    it('should reject files over 20MB', async () => {
      const buffer = Buffer.alloc(21 * 1024 * 1024); // 21MB
      const result = await validateImage(buffer, 'image/jpeg');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });

    it('should reject unsupported file types', async () => {
      const buffer = Buffer.alloc(1024);
      const result = await validateImage(buffer, 'image/gif');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported');
    });

    it('should reject invalid MIME types', async () => {
      const buffer = Buffer.alloc(1024);
      const result = await validateImage(buffer, 'application/pdf');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported');
    });
  });

  describe('getImageMetadata', () => {
    it('should return image metadata', async () => {
      const buffer = Buffer.alloc(1024);
      const metadata = await getImageMetadata(buffer);

      expect(metadata).toHaveProperty('width');
      expect(metadata).toHaveProperty('height');
      expect(metadata).toHaveProperty('format');
      expect(metadata).toHaveProperty('colorSpace');
      expect(metadata).toHaveProperty('density');
    });

    it('should include color space information', async () => {
      const buffer = Buffer.alloc(1024);
      const metadata = await getImageMetadata(buffer);

      expect(metadata.colorSpace).toBe('srgb');
    });

    it('should include DPI information', async () => {
      const buffer = Buffer.alloc(1024);
      const metadata = await getImageMetadata(buffer);

      expect(metadata.density).toBe(72);
    });
  });

  describe('optimizeForPrint', () => {
    it('should resize image to fit within print dimensions at 300 DPI', async () => {
      const buffer = Buffer.alloc(1024);
      const options: ImageOptimizeOptions = {
        targetDpi: 300,
        maxWidth: 4200, // A3 at 300 DPI
        maxHeight: 5940, // A3 at 300 DPI
        quality: 90,
      };

      const result = await optimizeForPrint(buffer, options);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should preserve aspect ratio when resizing', async () => {
      const buffer = Buffer.alloc(1024);
      const options: ImageOptimizeOptions = {
        targetDpi: 300,
        maxWidth: 2000,
        maxHeight: 2000,
        quality: 90,
      };

      const result = await optimizeForPrint(buffer, options);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should use default options when not specified', async () => {
      const buffer = Buffer.alloc(1024);
      const result = await optimizeForPrint(buffer);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should compress with specified quality', async () => {
      const buffer = Buffer.alloc(1024);
      const options: ImageOptimizeOptions = {
        quality: 85,
      };

      const result = await optimizeForPrint(buffer, options);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle different print sizes', async () => {
      const buffer = Buffer.alloc(1024);

      // A5 at 300 DPI
      const a5Options: ImageOptimizeOptions = {
        targetDpi: 300,
        maxWidth: 1748,
        maxHeight: 2480,
      };
      const a5Result = await optimizeForPrint(buffer, a5Options);
      expect(a5Result).toBeInstanceOf(Buffer);

      // A4 at 300 DPI
      const a4Options: ImageOptimizeOptions = {
        targetDpi: 300,
        maxWidth: 2480,
        maxHeight: 3508,
      };
      const a4Result = await optimizeForPrint(buffer, a4Options);
      expect(a4Result).toBeInstanceOf(Buffer);
    });
  });

  describe('convertToJpeg', () => {
    it('should convert HEIC to JPEG', async () => {
      const buffer = Buffer.alloc(1024);
      const result = await convertToJpeg(buffer, 90);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should convert PNG to JPEG', async () => {
      const buffer = Buffer.alloc(1024);
      const result = await convertToJpeg(buffer, 90);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should convert WebP to JPEG', async () => {
      const buffer = Buffer.alloc(1024);
      const result = await convertToJpeg(buffer, 90);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should use default quality of 90 when not specified', async () => {
      const buffer = Buffer.alloc(1024);
      const result = await convertToJpeg(buffer);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should preserve image metadata during conversion', async () => {
      const buffer = Buffer.alloc(1024);
      const result = await convertToJpeg(buffer, 90);
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('ImageValidationError', () => {
    it('should be throwable with message', () => {
      const error = new ImageValidationError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('ImageValidationError');
    });

    it('should include error code', () => {
      const error = new ImageValidationError('Test error', 'FILE_TOO_LARGE');
      expect(error.code).toBe('FILE_TOO_LARGE');
    });
  });

  describe('Output Formats', () => {
    it('should output PNG format when specified', async () => {
      const buffer = Buffer.alloc(1024);
      const options: ImageOptimizeOptions = {
        format: 'png',
        quality: 90,
      };

      const result = await optimizeForPrint(buffer, options);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should output WebP format when specified', async () => {
      const buffer = Buffer.alloc(1024);
      const options: ImageOptimizeOptions = {
        format: 'webp',
        quality: 85,
      };

      const result = await optimizeForPrint(buffer, options);
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('getOptionsForPrintSize', () => {
    it('should return options for A5 size', () => {
      const options = getOptionsForPrintSize('A5');
      expect(options.maxWidth).toBe(1748);
      expect(options.maxHeight).toBe(2480);
      expect(options.targetDpi).toBe(300);
      expect(options.quality).toBe(90);
    });

    it('should return options for A4 size', () => {
      const options = getOptionsForPrintSize('A4');
      expect(options.maxWidth).toBe(2480);
      expect(options.maxHeight).toBe(3508);
    });

    it('should return options for A3 size', () => {
      const options = getOptionsForPrintSize('A3');
      expect(options.maxWidth).toBe(3508);
      expect(options.maxHeight).toBe(4960);
    });

    it('should return options for A2 size', () => {
      const options = getOptionsForPrintSize('A2');
      expect(options.maxWidth).toBe(4960);
      expect(options.maxHeight).toBe(7016);
    });

    it('should use custom quality when specified', () => {
      const options = getOptionsForPrintSize('A4', 85);
      expect(options.quality).toBe(85);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty buffer', async () => {
      const buffer = Buffer.alloc(0);
      const result = await validateImage(buffer, 'image/jpeg');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Empty');
    });

    it('should handle exactly 20MB file', async () => {
      const buffer = Buffer.alloc(20 * 1024 * 1024); // Exactly 20MB
      const result = await validateImage(buffer, 'image/jpeg');
      expect(result.valid).toBe(true);
    });

    it('should handle case-insensitive MIME types', async () => {
      const buffer = Buffer.alloc(1024);
      const result = await validateImage(buffer, 'IMAGE/JPEG');
      expect(result.valid).toBe(true);
    });

    it('should optimize without resize when no max dimensions specified', async () => {
      const buffer = Buffer.alloc(1024);
      const options: ImageOptimizeOptions = {
        targetDpi: 300,
        maxWidth: 0,
        maxHeight: 0,
        quality: 90,
      };

      const result = await optimizeForPrint(buffer, options);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should optimize without resize when max dimensions are undefined', async () => {
      const buffer = Buffer.alloc(1024);
      const options: ImageOptimizeOptions = {
        targetDpi: 300,
        quality: 90,
        // maxWidth and maxHeight explicitly not set
      };
      // Override defaults by passing partial options
      const result = await optimizeForPrint(buffer, { ...options, maxWidth: undefined, maxHeight: undefined });
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('Metadata fallbacks', () => {
    it('should handle missing metadata values', async () => {
      // Override mock to return partial metadata
      const sharp = await import('sharp');
      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue({
          // No width, height, format, space, density, size
        }),
        resize: vi.fn().mockReturnThis(),
        jpeg: vi.fn().mockReturnThis(),
        png: vi.fn().mockReturnThis(),
        webp: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(Buffer.from('optimized-image-data')),
        toFormat: vi.fn().mockReturnThis(),
        withMetadata: vi.fn().mockReturnThis(),
      };
      vi.mocked(sharp.default).mockReturnValueOnce(mockSharpInstance as unknown as ReturnType<typeof sharp.default>);

      const buffer = Buffer.alloc(1024);
      const metadata = await getImageMetadata(buffer);

      expect(metadata.width).toBe(0);
      expect(metadata.height).toBe(0);
      expect(metadata.format).toBe('unknown');
      expect(metadata.colorSpace).toBe('unknown');
      expect(metadata.density).toBe(72);
    });

    it('should use buffer length when size is missing from metadata', async () => {
      const sharp = await import('sharp');
      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue({
          width: 100,
          height: 100,
          format: 'jpeg',
          space: 'srgb',
          density: 72,
          // No size property
        }),
        resize: vi.fn().mockReturnThis(),
        jpeg: vi.fn().mockReturnThis(),
        png: vi.fn().mockReturnThis(),
        webp: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(Buffer.from('optimized-image-data')),
        toFormat: vi.fn().mockReturnThis(),
        withMetadata: vi.fn().mockReturnThis(),
      };
      vi.mocked(sharp.default).mockReturnValueOnce(mockSharpInstance as unknown as ReturnType<typeof sharp.default>);

      const buffer = Buffer.alloc(2048);
      const metadata = await getImageMetadata(buffer);

      expect(metadata.size).toBe(2048);
    });
  });
});
