/**
 * Crop Calculator Tests
 */

import { describe, expect, it } from 'vitest';
import {
  parseAspectRatio,
  calculateFaceGroupBounds,
  calculateAverageRotation,
  calculateCenteredCrop,
  calculateFaceCrop,
  calculateOptimalCrop,
  isValidCropRegion,
  adjustCropToFit,
  DEFAULT_CROP_OPTIONS,
} from './crop-calculator';
import type { DetectedFace } from '@/types/image';

describe('crop-calculator', () => {
  describe('parseAspectRatio', () => {
    it('should parse valid aspect ratio', () => {
      const result = parseAspectRatio('16:9');
      expect(result.width).toBe(16);
      expect(result.height).toBe(9);
    });

    it('should parse decimal aspect ratio', () => {
      const result = parseAspectRatio('1:1.414');
      expect(result.width).toBe(1);
      expect(result.height).toBeCloseTo(1.414);
    });

    it('should parse 1:1 aspect ratio', () => {
      const result = parseAspectRatio('1:1');
      expect(result.width).toBe(1);
      expect(result.height).toBe(1);
    });

    it('should throw for invalid format', () => {
      expect(() => parseAspectRatio('16-9')).toThrow('Invalid aspect ratio format');
      expect(() => parseAspectRatio('16')).toThrow('Invalid aspect ratio format');
      expect(() => parseAspectRatio('')).toThrow('Invalid aspect ratio format');
    });

    it('should throw for non-numeric values', () => {
      expect(() => parseAspectRatio('a:b')).toThrow('Invalid aspect ratio values');
    });

    it('should throw for zero or negative values', () => {
      expect(() => parseAspectRatio('0:9')).toThrow('Invalid aspect ratio values');
      expect(() => parseAspectRatio('16:-1')).toThrow('Invalid aspect ratio values');
    });
  });

  describe('calculateFaceGroupBounds', () => {
    it('should return null for empty faces array', () => {
      const result = calculateFaceGroupBounds([]);
      expect(result).toBeNull();
    });

    it('should return bounds for single face', () => {
      const faces: DetectedFace[] = [
        {
          boundingBox: { x: 100, y: 50, width: 200, height: 250 },
          confidence: 0.9,
        },
      ];

      const result = calculateFaceGroupBounds(faces);

      expect(result).toEqual({
        x: 100,
        y: 50,
        width: 200,
        height: 250,
      });
    });

    it('should calculate bounds encompassing multiple faces', () => {
      const faces: DetectedFace[] = [
        {
          boundingBox: { x: 100, y: 50, width: 100, height: 120 },
          confidence: 0.9,
        },
        {
          boundingBox: { x: 300, y: 80, width: 100, height: 120 },
          confidence: 0.85,
        },
      ];

      const result = calculateFaceGroupBounds(faces);

      expect(result).toEqual({
        x: 100,
        y: 50,
        width: 300, // 300 + 100 - 100 = 300
        height: 150, // 80 + 120 - 50 = 150
      });
    });

    it('should handle overlapping faces', () => {
      const faces: DetectedFace[] = [
        {
          boundingBox: { x: 100, y: 100, width: 200, height: 200 },
          confidence: 0.9,
        },
        {
          boundingBox: { x: 150, y: 150, width: 200, height: 200 },
          confidence: 0.85,
        },
      ];

      const result = calculateFaceGroupBounds(faces);

      expect(result).toEqual({
        x: 100,
        y: 100,
        width: 250,
        height: 250,
      });
    });
  });

  describe('calculateAverageRotation', () => {
    it('should return 0 for faces without rotation', () => {
      const faces: DetectedFace[] = [
        { boundingBox: { x: 0, y: 0, width: 100, height: 100 }, confidence: 0.9 },
        { boundingBox: { x: 0, y: 0, width: 100, height: 100 }, confidence: 0.9 },
      ];

      const result = calculateAverageRotation(faces);
      expect(result).toBe(0);
    });

    it('should calculate average rotation', () => {
      const faces: DetectedFace[] = [
        { boundingBox: { x: 0, y: 0, width: 100, height: 100 }, confidence: 0.9, rotation: 10 },
        { boundingBox: { x: 0, y: 0, width: 100, height: 100 }, confidence: 0.9, rotation: 20 },
      ];

      const result = calculateAverageRotation(faces);
      expect(result).toBe(15);
    });

    it('should skip faces with zero rotation', () => {
      const faces: DetectedFace[] = [
        { boundingBox: { x: 0, y: 0, width: 100, height: 100 }, confidence: 0.9, rotation: 0 },
        { boundingBox: { x: 0, y: 0, width: 100, height: 100 }, confidence: 0.9, rotation: 10 },
      ];

      const result = calculateAverageRotation(faces);
      expect(result).toBe(10);
    });
  });

  describe('calculateCenteredCrop', () => {
    it('should calculate centered 1:1 crop for landscape image', () => {
      const result = calculateCenteredCrop(800, 600, '1:1');

      expect(result.width).toBe(600);
      expect(result.height).toBe(600);
      expect(result.x).toBe(100);
      expect(result.y).toBe(0);
    });

    it('should calculate centered 1:1 crop for portrait image', () => {
      const result = calculateCenteredCrop(600, 800, '1:1');

      expect(result.width).toBe(600);
      expect(result.height).toBe(600);
      expect(result.x).toBe(0);
      expect(result.y).toBe(100);
    });

    it('should calculate 4:5 crop', () => {
      const result = calculateCenteredCrop(1000, 1000, '4:5');

      expect(result.width).toBe(800);
      expect(result.height).toBe(1000);
      expect(result.x).toBe(100);
      expect(result.y).toBe(0);
    });

    it('should calculate 16:9 crop', () => {
      const result = calculateCenteredCrop(1920, 1080, '16:9');

      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe('calculateFaceCrop', () => {
    it('should return centered crop when no faces', () => {
      const result = calculateFaceCrop(800, 600, [], { aspectRatio: '1:1' });

      expect(result.includesFaces).toBe(false);
      expect(result.faceCount).toBe(0);
      expect(result.score).toBe(0.5);
    });

    it('should filter faces by confidence', () => {
      const faces: DetectedFace[] = [
        {
          boundingBox: { x: 300, y: 200, width: 100, height: 120 },
          confidence: 0.3, // Below default threshold
        },
      ];

      const result = calculateFaceCrop(800, 600, faces, { aspectRatio: '1:1' });

      expect(result.includesFaces).toBe(false);
      expect(result.faceCount).toBe(0);
    });

    it('should center single face', () => {
      const faces: DetectedFace[] = [
        {
          boundingBox: { x: 300, y: 150, width: 100, height: 120 },
          confidence: 0.9,
        },
      ];

      const result = calculateFaceCrop(800, 600, faces, { aspectRatio: '1:1' });

      expect(result.includesFaces).toBe(true);
      expect(result.faceCount).toBe(1);
      expect(result.score).toBeGreaterThan(0.5);

      // Face should be in the crop region
      const faceCenter = { x: 350, y: 210 };
      expect(result.region.x).toBeLessThanOrEqual(faceCenter.x);
      expect(result.region.x + result.region.width).toBeGreaterThanOrEqual(faceCenter.x);
    });

    it('should include all faces in group crop', () => {
      const faces: DetectedFace[] = [
        {
          boundingBox: { x: 100, y: 150, width: 100, height: 120 },
          confidence: 0.9,
        },
        {
          boundingBox: { x: 500, y: 180, width: 100, height: 120 },
          confidence: 0.85,
        },
      ];

      const result = calculateFaceCrop(800, 600, faces, { aspectRatio: '1:1' });

      expect(result.includesFaces).toBe(true);
      expect(result.faceCount).toBe(2);

      // Both faces should be in crop region
      for (const face of faces) {
        const faceCenterX = face.boundingBox.x + face.boundingBox.width / 2;
        const faceCenterY = face.boundingBox.y + face.boundingBox.height / 2;

        expect(result.region.x).toBeLessThanOrEqual(faceCenterX);
        expect(result.region.x + result.region.width).toBeGreaterThanOrEqual(faceCenterX);
        expect(result.region.y).toBeLessThanOrEqual(faceCenterY);
        expect(result.region.y + result.region.height).toBeGreaterThanOrEqual(faceCenterY);
      }
    });

    it('should respect aspect ratio', () => {
      const faces: DetectedFace[] = [
        {
          boundingBox: { x: 300, y: 200, width: 100, height: 120 },
          confidence: 0.9,
        },
      ];

      const result = calculateFaceCrop(800, 600, faces, { aspectRatio: '4:5' });

      const cropRatio = result.region.width / result.region.height;
      expect(cropRatio).toBeCloseTo(4 / 5, 1);
    });

    it('should stay within image bounds', () => {
      // Face at edge of image
      const faces: DetectedFace[] = [
        {
          boundingBox: { x: 750, y: 550, width: 50, height: 50 },
          confidence: 0.9,
        },
      ];

      const result = calculateFaceCrop(800, 600, faces, { aspectRatio: '1:1' });

      expect(result.region.x).toBeGreaterThanOrEqual(0);
      expect(result.region.y).toBeGreaterThanOrEqual(0);
      expect(result.region.x + result.region.width).toBeLessThanOrEqual(800);
      expect(result.region.y + result.region.height).toBeLessThanOrEqual(600);
    });
  });

  describe('calculateOptimalCrop', () => {
    it('should return complete crop result', () => {
      const faces: DetectedFace[] = [
        {
          boundingBox: { x: 300, y: 200, width: 100, height: 120 },
          confidence: 0.9,
        },
      ];

      const result = calculateOptimalCrop(800, 600, faces, { aspectRatio: '1:1' });

      expect(result).toHaveProperty('imageWidth', 800);
      expect(result).toHaveProperty('imageHeight', 600);
      expect(result).toHaveProperty('suggestedCrop');
      expect(result).toHaveProperty('suggestedRotation');
      expect(result).toHaveProperty('detectedFaces');
      expect(result).toHaveProperty('targetAspectRatio', '1:1');
    });

    it('should suggest rotation correction for tilted faces', () => {
      const faces: DetectedFace[] = [
        {
          boundingBox: { x: 300, y: 200, width: 100, height: 120 },
          confidence: 0.9,
          rotation: 8, // Tilted 8 degrees
        },
      ];

      const result = calculateOptimalCrop(800, 600, faces, {
        aspectRatio: '1:1',
        suggestRotation: true,
      });

      expect(result.suggestedRotation).toBeCloseTo(-8, 0);
    });

    it('should not suggest rotation for slight tilts', () => {
      const faces: DetectedFace[] = [
        {
          boundingBox: { x: 300, y: 200, width: 100, height: 120 },
          confidence: 0.9,
          rotation: 2, // Only 2 degrees
        },
      ];

      const result = calculateOptimalCrop(800, 600, faces, {
        aspectRatio: '1:1',
        suggestRotation: true,
      });

      expect(result.suggestedRotation).toBe(0);
    });

    it('should not suggest rotation beyond max limit', () => {
      const faces: DetectedFace[] = [
        {
          boundingBox: { x: 300, y: 200, width: 100, height: 120 },
          confidence: 0.9,
          rotation: 30, // Beyond default max of 15
        },
      ];

      const result = calculateOptimalCrop(800, 600, faces, {
        aspectRatio: '1:1',
        suggestRotation: true,
        maxRotationSuggestion: 15,
      });

      expect(result.suggestedRotation).toBe(0);
    });
  });

  describe('isValidCropRegion', () => {
    it('should validate crop within bounds', () => {
      const crop = { x: 100, y: 100, width: 200, height: 200 };
      expect(isValidCropRegion(crop, 800, 600)).toBe(true);
    });

    it('should reject crop with negative position', () => {
      const crop = { x: -10, y: 100, width: 200, height: 200 };
      expect(isValidCropRegion(crop, 800, 600)).toBe(false);
    });

    it('should reject crop exceeding image bounds', () => {
      const crop = { x: 700, y: 100, width: 200, height: 200 };
      expect(isValidCropRegion(crop, 800, 600)).toBe(false);
    });

    it('should reject zero-size crop', () => {
      const crop = { x: 100, y: 100, width: 0, height: 200 };
      expect(isValidCropRegion(crop, 800, 600)).toBe(false);
    });
  });

  describe('adjustCropToFit', () => {
    it('should clamp position to image bounds', () => {
      const crop = { x: -50, y: -30, width: 200, height: 200 };
      const result = adjustCropToFit(crop, 800, 600);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.width).toBe(200);
      expect(result.height).toBe(200);
    });

    it('should clamp dimensions to image size', () => {
      const crop = { x: 0, y: 0, width: 1000, height: 800 };
      const result = adjustCropToFit(crop, 800, 600);

      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });

    it('should adjust position when crop at edge', () => {
      const crop = { x: 700, y: 500, width: 200, height: 200 };
      const result = adjustCropToFit(crop, 800, 600);

      expect(result.x + result.width).toBeLessThanOrEqual(800);
      expect(result.y + result.height).toBeLessThanOrEqual(600);
    });
  });

  describe('DEFAULT_CROP_OPTIONS', () => {
    it('should have expected default values', () => {
      expect(DEFAULT_CROP_OPTIONS.aspectRatio).toBe('1:1');
      expect(DEFAULT_CROP_OPTIONS.minHeadroom).toBe(0.15);
      expect(DEFAULT_CROP_OPTIONS.maxHeadroom).toBe(0.25);
      expect(DEFAULT_CROP_OPTIONS.padding).toBe(0.1);
      expect(DEFAULT_CROP_OPTIONS.minFaceConfidence).toBe(0.5);
      expect(DEFAULT_CROP_OPTIONS.suggestRotation).toBe(true);
      expect(DEFAULT_CROP_OPTIONS.maxRotationSuggestion).toBe(15);
    });
  });
});
