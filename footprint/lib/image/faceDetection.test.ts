/**
 * Face Detection and Smart Cropping - TDD Tests
 *
 * Tests for content-aware cropping with face/subject detection.
 * Uses smartcrop-sharp for intelligent crop region calculation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import sharp from 'sharp';

// Import the module we're going to implement
import {
  type CropSuggestion,
  type CropRegion,
  type AspectRatio,
  type SmartCropResult,
  type SmartCropOptions,
  calculateCropRegion,
  getSuggestedCrops,
  isValidAspectRatio,
  parseAspectRatio,
  PRINT_ASPECT_RATIOS,
  DEFAULT_ASPECT_RATIOS,
} from './faceDetection';

// Test image buffers - we'll create simple test images
async function createTestImage(
  width: number,
  height: number,
  color: { r: number; g: number; b: number } = { r: 255, g: 255, b: 255 }
): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: color,
    },
  })
    .jpeg()
    .toBuffer();
}

describe('faceDetection', () => {
  describe('parseAspectRatio', () => {
    it('should parse "1:1" as { width: 1, height: 1 }', () => {
      const result = parseAspectRatio('1:1');
      expect(result).toEqual({ width: 1, height: 1 });
    });

    it('should parse "4:5" correctly', () => {
      const result = parseAspectRatio('4:5');
      expect(result).toEqual({ width: 4, height: 5 });
    });

    it('should parse "16:9" correctly', () => {
      const result = parseAspectRatio('16:9');
      expect(result).toEqual({ width: 16, height: 9 });
    });

    it('should parse "3:4" correctly', () => {
      const result = parseAspectRatio('3:4');
      expect(result).toEqual({ width: 3, height: 4 });
    });

    it('should handle decimal ratios like "1:1.414"', () => {
      const result = parseAspectRatio('1:1.414');
      expect(result).toEqual({ width: 1, height: 1.414 });
    });

    it('should throw for invalid format', () => {
      expect(() => parseAspectRatio('invalid')).toThrow('Invalid aspect ratio format');
    });

    it('should throw for zero width', () => {
      expect(() => parseAspectRatio('0:1')).toThrow('Aspect ratio values must be positive');
    });

    it('should throw for negative values', () => {
      expect(() => parseAspectRatio('-1:1')).toThrow('Aspect ratio values must be positive');
    });
  });

  describe('isValidAspectRatio', () => {
    it('should return true for valid aspect ratios', () => {
      expect(isValidAspectRatio('1:1')).toBe(true);
      expect(isValidAspectRatio('4:5')).toBe(true);
      expect(isValidAspectRatio('16:9')).toBe(true);
    });

    it('should return false for invalid aspect ratios', () => {
      expect(isValidAspectRatio('invalid')).toBe(false);
      expect(isValidAspectRatio('')).toBe(false);
      expect(isValidAspectRatio('1:')).toBe(false);
      expect(isValidAspectRatio(':1')).toBe(false);
    });
  });

  describe('PRINT_ASPECT_RATIOS', () => {
    it('should define A-series paper ratios', () => {
      expect(PRINT_ASPECT_RATIOS.A5).toBe('1:1.414');
      expect(PRINT_ASPECT_RATIOS.A4).toBe('1:1.414');
      expect(PRINT_ASPECT_RATIOS.A3).toBe('1:1.414');
      expect(PRINT_ASPECT_RATIOS.A2).toBe('1:1.414');
    });

    it('should define square ratio', () => {
      expect(PRINT_ASPECT_RATIOS.SQUARE).toBe('1:1');
    });
  });

  describe('DEFAULT_ASPECT_RATIOS', () => {
    it('should include common aspect ratios', () => {
      expect(DEFAULT_ASPECT_RATIOS).toContain('1:1');
      expect(DEFAULT_ASPECT_RATIOS).toContain('4:5');
      expect(DEFAULT_ASPECT_RATIOS).toContain('3:4');
    });
  });

  describe('calculateCropRegion', () => {
    it('should calculate crop region for 1:1 from 800x600 image', () => {
      const region = calculateCropRegion(800, 600, '1:1');

      // For 1:1 from 800x600, crop should be 600x600 centered
      expect(region.width).toBe(600);
      expect(region.height).toBe(600);
      expect(region.x).toBe(100); // (800 - 600) / 2
      expect(region.y).toBe(0);
    });

    it('should calculate crop region for 4:5 from 800x600 image', () => {
      const region = calculateCropRegion(800, 600, '4:5');

      // 4:5 ratio, height constrained to 600, width = 600 * (4/5) = 480
      expect(region.height).toBe(600);
      expect(region.width).toBe(480);
      expect(region.x).toBe(160); // (800 - 480) / 2
      expect(region.y).toBe(0);
    });

    it('should calculate crop region for 16:9 from 800x600 image', () => {
      const region = calculateCropRegion(800, 600, '16:9');

      // 16:9 ratio, width constrained to 800, height = 800 * (9/16) = 450
      expect(region.width).toBe(800);
      expect(region.height).toBe(450);
      expect(region.x).toBe(0);
      expect(region.y).toBe(75); // (600 - 450) / 2
    });

    it('should calculate crop region for portrait image', () => {
      const region = calculateCropRegion(600, 800, '1:1');

      // For 1:1 from 600x800, crop should be 600x600
      expect(region.width).toBe(600);
      expect(region.height).toBe(600);
      expect(region.x).toBe(0);
      expect(region.y).toBe(100); // (800 - 600) / 2
    });

    it('should round crop dimensions to integers', () => {
      const region = calculateCropRegion(800, 601, '1:1');

      expect(Number.isInteger(region.width)).toBe(true);
      expect(Number.isInteger(region.height)).toBe(true);
      expect(Number.isInteger(region.x)).toBe(true);
      expect(Number.isInteger(region.y)).toBe(true);
    });

    it('should handle A-series paper ratio', () => {
      const region = calculateCropRegion(800, 1000, '1:1.414');

      // A-series ratio is approximately 1:1.414 (√2)
      // From 800x1000, width constrained to 800, height = 800 * 1.414 ≈ 1131
      // But image is only 1000 tall, so height = 1000, width = 1000 / 1.414 ≈ 707
      expect(region.height).toBe(1000);
      expect(region.width).toBeCloseTo(707, 0);
    });
  });

  describe('getSuggestedCrops', () => {
    it('should return crop suggestions for an image buffer', async () => {
      const imageBuffer = await createTestImage(800, 600);

      const result = await getSuggestedCrops(imageBuffer);

      expect(result).toBeDefined();
      expect(result.imageWidth).toBe(800);
      expect(result.imageHeight).toBe(600);
      expect(result.crops).toBeDefined();
    });

    it('should return crops for default aspect ratios', async () => {
      const imageBuffer = await createTestImage(800, 600);

      const result = await getSuggestedCrops(imageBuffer);

      // Should have crops for default ratios
      expect(result.crops['1:1']).toBeDefined();
      expect(result.crops['4:5']).toBeDefined();
      expect(result.crops['3:4']).toBeDefined();
    });

    it('should return crops for custom aspect ratios', async () => {
      const imageBuffer = await createTestImage(800, 600);

      const result = await getSuggestedCrops(imageBuffer, {
        aspectRatios: ['16:9', '1:1'],
      });

      expect(result.crops['16:9']).toBeDefined();
      expect(result.crops['1:1']).toBeDefined();
      expect(result.crops['4:5']).toBeUndefined();
    });

    it('should include score for each crop', async () => {
      const imageBuffer = await createTestImage(800, 600);

      const result = await getSuggestedCrops(imageBuffer);

      const squareCrop = result.crops['1:1'];
      expect(squareCrop.score).toBeGreaterThanOrEqual(0);
      expect(squareCrop.score).toBeLessThanOrEqual(1);
    });

    it('should include crop region for each suggestion', async () => {
      const imageBuffer = await createTestImage(800, 600);

      const result = await getSuggestedCrops(imageBuffer);

      const squareCrop = result.crops['1:1'];
      expect(squareCrop.region).toBeDefined();
      expect(squareCrop.region.x).toBeGreaterThanOrEqual(0);
      expect(squareCrop.region.y).toBeGreaterThanOrEqual(0);
      expect(squareCrop.region.width).toBeGreaterThan(0);
      expect(squareCrop.region.height).toBeGreaterThan(0);
    });

    it('should handle very small images', async () => {
      const imageBuffer = await createTestImage(100, 100);

      const result = await getSuggestedCrops(imageBuffer);

      expect(result.crops['1:1']).toBeDefined();
      expect(result.crops['1:1'].region.width).toBe(100);
    });

    it('should handle very wide images', async () => {
      const imageBuffer = await createTestImage(2000, 500);

      const result = await getSuggestedCrops(imageBuffer);

      expect(result.crops['1:1']).toBeDefined();
      expect(result.crops['1:1'].region.width).toBe(500);
      expect(result.crops['1:1'].region.height).toBe(500);
    });

    it('should handle very tall images', async () => {
      const imageBuffer = await createTestImage(500, 2000);

      const result = await getSuggestedCrops(imageBuffer);

      expect(result.crops['1:1']).toBeDefined();
      expect(result.crops['1:1'].region.width).toBe(500);
      expect(result.crops['1:1'].region.height).toBe(500);
    });

    it('should throw for invalid image buffer', async () => {
      const invalidBuffer = Buffer.from('not an image');

      await expect(getSuggestedCrops(invalidBuffer)).rejects.toThrow();
    });

    it('should throw for empty buffer', async () => {
      const emptyBuffer = Buffer.from([]);

      await expect(getSuggestedCrops(emptyBuffer)).rejects.toThrow();
    });
  });

  describe('CropSuggestion interface', () => {
    it('should have required properties', async () => {
      const imageBuffer = await createTestImage(800, 600);

      const result = await getSuggestedCrops(imageBuffer);
      const crop = result.crops['1:1'];

      // TypeScript will enforce this, but let's verify at runtime
      expect(crop).toHaveProperty('region');
      expect(crop).toHaveProperty('score');
      expect(crop.region).toHaveProperty('x');
      expect(crop.region).toHaveProperty('y');
      expect(crop.region).toHaveProperty('width');
      expect(crop.region).toHaveProperty('height');
    });
  });

  describe('SmartCropResult interface', () => {
    it('should contain image dimensions', async () => {
      const imageBuffer = await createTestImage(1024, 768);

      const result = await getSuggestedCrops(imageBuffer);

      expect(result.imageWidth).toBe(1024);
      expect(result.imageHeight).toBe(768);
    });

    it('should contain crops dictionary', async () => {
      const imageBuffer = await createTestImage(800, 600);

      const result = await getSuggestedCrops(imageBuffer);

      expect(typeof result.crops).toBe('object');
      expect(Object.keys(result.crops).length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle square images', async () => {
      const imageBuffer = await createTestImage(500, 500);

      const result = await getSuggestedCrops(imageBuffer);

      const squareCrop = result.crops['1:1'];
      expect(squareCrop.region.width).toBe(500);
      expect(squareCrop.region.height).toBe(500);
      expect(squareCrop.region.x).toBe(0);
      expect(squareCrop.region.y).toBe(0);
    });

    it('should not exceed image bounds', async () => {
      const imageBuffer = await createTestImage(800, 600);

      const result = await getSuggestedCrops(imageBuffer);

      for (const [_, crop] of Object.entries(result.crops)) {
        expect(crop.region.x).toBeGreaterThanOrEqual(0);
        expect(crop.region.y).toBeGreaterThanOrEqual(0);
        expect(crop.region.x + crop.region.width).toBeLessThanOrEqual(800);
        expect(crop.region.y + crop.region.height).toBeLessThanOrEqual(600);
      }
    });

    it('should handle A-series print ratios', async () => {
      const imageBuffer = await createTestImage(800, 1000);

      const result = await getSuggestedCrops(imageBuffer, {
        aspectRatios: ['1:1.414'],
      });

      expect(result.crops['1:1.414']).toBeDefined();
      const crop = result.crops['1:1.414'];

      // Verify the ratio is approximately correct
      const actualRatio = crop.region.width / crop.region.height;
      const expectedRatio = 1 / 1.414;
      expect(actualRatio).toBeCloseTo(expectedRatio, 2);
    });
  });
});
