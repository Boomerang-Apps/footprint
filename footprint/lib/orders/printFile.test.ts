/**
 * Print File Generation Tests
 *
 * TDD: Tests written FIRST before implementation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock R2 storage
vi.mock('@/lib/storage/r2', () => ({
  getDownloadUrl: vi.fn(),
  uploadToR2: vi.fn(),
  getPublicUrl: vi.fn(),
}));

// Mock image optimization
vi.mock('@/lib/image/optimize', () => ({
  optimizeForPrint: vi.fn(),
  getOptionsForPrintSize: vi.fn((size: string) => ({
    targetDpi: 300,
    maxWidth: size === 'A4' ? 2480 : 3508,
    maxHeight: size === 'A4' ? 3508 : 4960,
    quality: 90,
    format: 'jpeg',
  })),
  PRINT_SIZES: {
    A5: { width: 1748, height: 2480 },
    A4: { width: 2480, height: 3508 },
    A3: { width: 3508, height: 4960 },
    A2: { width: 4960, height: 7016 },
  },
}));

// Import after mocks
import {
  generatePrintFileName,
  getPrintFileKey,
  generatePrintReadyFile,
  getOrCreatePrintFile,
  PrintFileResult,
  PrintSize,
} from './printFile';
import { getDownloadUrl, uploadToR2, getPublicUrl } from '@/lib/storage/r2';
import { optimizeForPrint } from '@/lib/image/optimize';

// Cast mocks
const mockGetDownloadUrl = getDownloadUrl as ReturnType<typeof vi.fn>;
const mockUploadToR2 = uploadToR2 as ReturnType<typeof vi.fn>;
const mockGetPublicUrl = getPublicUrl as ReturnType<typeof vi.fn>;
const mockOptimizeForPrint = optimizeForPrint as ReturnType<typeof vi.fn>;

describe('Print File Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-26T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  // ============================================================================
  // File Name Generation Tests
  // ============================================================================

  describe('generatePrintFileName', () => {
    it('should generate file name with order ID and size', () => {
      const fileName = generatePrintFileName('order_123', 'A4');
      expect(fileName).toContain('order_123');
      expect(fileName).toContain('A4');
      expect(fileName).toContain('print.jpg');
    });

    it('should include timestamp in file name', () => {
      const fileName = generatePrintFileName('order_123', 'A4');
      // Verify timestamp is present (10-digit Unix timestamp)
      expect(fileName).toMatch(/order_123_A4_\d{10}_print\.jpg/);
    });

    it('should handle different sizes', () => {
      const a5 = generatePrintFileName('order_123', 'A5');
      const a3 = generatePrintFileName('order_123', 'A3');
      const a2 = generatePrintFileName('order_123', 'A2');

      expect(a5).toContain('A5');
      expect(a3).toContain('A3');
      expect(a2).toContain('A2');
    });
  });

  // ============================================================================
  // Storage Key Generation Tests
  // ============================================================================

  describe('getPrintFileKey', () => {
    it('should generate storage key in print-ready folder', () => {
      const key = getPrintFileKey('order_123', 'A4');
      expect(key).toMatch(/^print-ready\/order_123\//);
    });

    it('should include size in key', () => {
      const key = getPrintFileKey('order_123', 'A4');
      expect(key).toContain('A4');
    });

    it('should end with .jpg extension', () => {
      const key = getPrintFileKey('order_123', 'A4');
      expect(key).toMatch(/\.jpg$/);
    });
  });

  // ============================================================================
  // Print File Generation Tests
  // ============================================================================

  describe('generatePrintReadyFile', () => {
    it('should optimize image for specified print size', async () => {
      const sourceBuffer = Buffer.from('fake-image-data');
      const optimizedBuffer = Buffer.from('optimized-image-data');

      mockOptimizeForPrint.mockResolvedValue(optimizedBuffer);
      mockUploadToR2.mockResolvedValue({
        key: 'print-ready/order_123/test.jpg',
        publicUrl: 'https://example.com/test.jpg',
        size: optimizedBuffer.length,
      });

      const result = await generatePrintReadyFile(
        sourceBuffer,
        'order_123',
        'A4'
      );

      expect(mockOptimizeForPrint).toHaveBeenCalledWith(
        sourceBuffer,
        expect.objectContaining({
          targetDpi: 300,
          maxWidth: 2480,
          maxHeight: 3508,
        })
      );
      expect(result.key).toContain('print-ready');
    });

    it('should upload optimized file to R2', async () => {
      const sourceBuffer = Buffer.from('fake-image-data');
      const optimizedBuffer = Buffer.from('optimized-image-data');

      mockOptimizeForPrint.mockResolvedValue(optimizedBuffer);
      mockUploadToR2.mockResolvedValue({
        key: 'print-ready/order_123/test.jpg',
        publicUrl: 'https://example.com/test.jpg',
        size: optimizedBuffer.length,
      });

      await generatePrintReadyFile(sourceBuffer, 'order_123', 'A4');

      expect(mockUploadToR2).toHaveBeenCalledWith(
        optimizedBuffer,
        'order_123',
        expect.stringContaining('.jpg'),
        'image/jpeg',
        'print-ready'
      );
    });

    it('should return result with file key and dimensions', async () => {
      const sourceBuffer = Buffer.from('fake-image-data');
      const optimizedBuffer = Buffer.from('optimized-image-data');

      mockOptimizeForPrint.mockResolvedValue(optimizedBuffer);
      mockUploadToR2.mockResolvedValue({
        key: 'print-ready/order_123/A4_print.jpg',
        publicUrl: 'https://example.com/A4_print.jpg',
        size: optimizedBuffer.length,
      });

      const result = await generatePrintReadyFile(
        sourceBuffer,
        'order_123',
        'A4'
      );

      expect(result).toMatchObject({
        key: expect.stringContaining('print-ready'),
        publicUrl: expect.stringContaining('http'),
        dimensions: {
          width: 2480,
          height: 3508,
          dpi: 300,
        },
      });
    });

    it('should handle A3 size correctly', async () => {
      const sourceBuffer = Buffer.from('fake-image-data');
      const optimizedBuffer = Buffer.from('optimized-image-data');

      mockOptimizeForPrint.mockResolvedValue(optimizedBuffer);
      mockUploadToR2.mockResolvedValue({
        key: 'print-ready/order_123/A3_print.jpg',
        publicUrl: 'https://example.com/A3_print.jpg',
        size: optimizedBuffer.length,
      });

      const result = await generatePrintReadyFile(
        sourceBuffer,
        'order_123',
        'A3'
      );

      expect(result.dimensions).toMatchObject({
        width: 3508,
        height: 4960,
        dpi: 300,
      });
    });
  });

  // ============================================================================
  // Get or Create Print File Tests
  // ============================================================================

  describe('getOrCreatePrintFile', () => {
    it('should generate presigned download URL', async () => {
      const sourceBuffer = Buffer.from('fake-image-data');
      const optimizedBuffer = Buffer.from('optimized-image-data');

      mockOptimizeForPrint.mockResolvedValue(optimizedBuffer);
      mockUploadToR2.mockResolvedValue({
        key: 'print-ready/order_123/A4_print.jpg',
        publicUrl: 'https://example.com/A4_print.jpg',
        size: optimizedBuffer.length,
      });
      mockGetDownloadUrl.mockResolvedValue(
        'https://presigned.example.com/download'
      );

      const result = await getOrCreatePrintFile(
        sourceBuffer,
        'order_123',
        'A4'
      );

      expect(result.downloadUrl).toBe('https://presigned.example.com/download');
      expect(result.expiresIn).toBe(3600);
    });

    it('should return file name in result', async () => {
      const sourceBuffer = Buffer.from('fake-image-data');
      const optimizedBuffer = Buffer.from('optimized-image-data');

      mockOptimizeForPrint.mockResolvedValue(optimizedBuffer);
      mockUploadToR2.mockResolvedValue({
        key: 'print-ready/order_123/A4_print.jpg',
        publicUrl: 'https://example.com/A4_print.jpg',
        size: optimizedBuffer.length,
      });
      mockGetDownloadUrl.mockResolvedValue(
        'https://presigned.example.com/download'
      );

      const result = await getOrCreatePrintFile(
        sourceBuffer,
        'order_123',
        'A4'
      );

      expect(result.fileName).toContain('order_123');
      expect(result.fileName).toContain('A4');
      expect(result.fileName).toContain('print.jpg');
    });

    it('should include dimensions in result', async () => {
      const sourceBuffer = Buffer.from('fake-image-data');
      const optimizedBuffer = Buffer.from('optimized-image-data');

      mockOptimizeForPrint.mockResolvedValue(optimizedBuffer);
      mockUploadToR2.mockResolvedValue({
        key: 'print-ready/order_123/A4_print.jpg',
        publicUrl: 'https://example.com/A4_print.jpg',
        size: optimizedBuffer.length,
      });
      mockGetDownloadUrl.mockResolvedValue(
        'https://presigned.example.com/download'
      );

      const result = await getOrCreatePrintFile(
        sourceBuffer,
        'order_123',
        'A4'
      );

      expect(result.dimensions).toEqual({
        width: 2480,
        height: 3508,
        dpi: 300,
      });
    });
  });

  // ============================================================================
  // Print Size Validation Tests
  // ============================================================================

  describe('PrintSize validation', () => {
    it('should accept valid print sizes', () => {
      const validSizes: PrintSize[] = ['A5', 'A4', 'A3', 'A2'];
      validSizes.forEach((size) => {
        const fileName = generatePrintFileName('test', size);
        expect(fileName).toContain(size);
      });
    });
  });
});
