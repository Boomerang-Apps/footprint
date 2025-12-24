import { describe, it, expect } from 'vitest';
import {
  calculatePrice,
  getBasePrice,
  getPaperModifier,
  getFramePrice,
  BASE_PRICES,
  PAPER_MODIFIERS,
  FRAME_PRICES,
} from './calculator';
import type { SizeType, PaperType, FrameType, PriceBreakdown } from '@/types';

describe('Pricing Calculator', () => {
  describe('BASE_PRICES', () => {
    it('should have correct base prices for all sizes', () => {
      expect(BASE_PRICES.A5).toBe(89);
      expect(BASE_PRICES.A4).toBe(129);
      expect(BASE_PRICES.A3).toBe(179);
      expect(BASE_PRICES.A2).toBe(249);
    });
  });

  describe('PAPER_MODIFIERS', () => {
    it('should have correct modifiers for all paper types', () => {
      expect(PAPER_MODIFIERS.matte).toBe(0);
      expect(PAPER_MODIFIERS.glossy).toBe(20);
      expect(PAPER_MODIFIERS.canvas).toBe(50);
    });
  });

  describe('FRAME_PRICES', () => {
    it('should have correct prices for all frame types', () => {
      expect(FRAME_PRICES.none).toBe(0);
      expect(FRAME_PRICES.black).toBe(79);
      expect(FRAME_PRICES.white).toBe(79);
      expect(FRAME_PRICES.oak).toBe(99);
    });
  });

  describe('getBasePrice', () => {
    it('should return correct base price for A5', () => {
      expect(getBasePrice('A5')).toBe(89);
    });

    it('should return correct base price for A4', () => {
      expect(getBasePrice('A4')).toBe(129);
    });

    it('should return correct base price for A3', () => {
      expect(getBasePrice('A3')).toBe(179);
    });

    it('should return correct base price for A2', () => {
      expect(getBasePrice('A2')).toBe(249);
    });
  });

  describe('getPaperModifier', () => {
    it('should return 0 for matte paper', () => {
      expect(getPaperModifier('matte')).toBe(0);
    });

    it('should return 20 for glossy paper', () => {
      expect(getPaperModifier('glossy')).toBe(20);
    });

    it('should return 50 for canvas paper', () => {
      expect(getPaperModifier('canvas')).toBe(50);
    });
  });

  describe('getFramePrice', () => {
    it('should return 0 for no frame', () => {
      expect(getFramePrice('none')).toBe(0);
    });

    it('should return 79 for black frame', () => {
      expect(getFramePrice('black')).toBe(79);
    });

    it('should return 79 for white frame', () => {
      expect(getFramePrice('white')).toBe(79);
    });

    it('should return 99 for oak frame', () => {
      expect(getFramePrice('oak')).toBe(99);
    });
  });

  describe('calculatePrice', () => {
    it('should calculate price for A5 matte no frame', () => {
      const result = calculatePrice({
        size: 'A5',
        paperType: 'matte',
        frameType: 'none',
      });

      expect(result.basePrice).toBe(89);
      expect(result.paperModifier).toBe(0);
      expect(result.framePrice).toBe(0);
      expect(result.subtotal).toBe(89);
      expect(result.discount).toBe(0);
      expect(result.total).toBe(89 + result.shipping);
    });

    it('should calculate price for A4 glossy black frame', () => {
      const result = calculatePrice({
        size: 'A4',
        paperType: 'glossy',
        frameType: 'black',
      });

      expect(result.basePrice).toBe(129);
      expect(result.paperModifier).toBe(20);
      expect(result.framePrice).toBe(79);
      expect(result.subtotal).toBe(129 + 20 + 79); // 228
      expect(result.total).toBe(228 + result.shipping);
    });

    it('should calculate price for A3 canvas oak frame', () => {
      const result = calculatePrice({
        size: 'A3',
        paperType: 'canvas',
        frameType: 'oak',
      });

      expect(result.basePrice).toBe(179);
      expect(result.paperModifier).toBe(50);
      expect(result.framePrice).toBe(99);
      expect(result.subtotal).toBe(179 + 50 + 99); // 328
      expect(result.total).toBe(328 + result.shipping);
    });

    it('should calculate price for A2 matte white frame', () => {
      const result = calculatePrice({
        size: 'A2',
        paperType: 'matte',
        frameType: 'white',
      });

      expect(result.basePrice).toBe(249);
      expect(result.paperModifier).toBe(0);
      expect(result.framePrice).toBe(79);
      expect(result.subtotal).toBe(249 + 0 + 79); // 328
      expect(result.total).toBe(328 + result.shipping);
    });

    it('should include default shipping cost', () => {
      const result = calculatePrice({
        size: 'A5',
        paperType: 'matte',
        frameType: 'none',
      });

      expect(result.shipping).toBe(29); // Default Israel shipping
    });

    it('should use custom shipping cost when provided', () => {
      const result = calculatePrice({
        size: 'A5',
        paperType: 'matte',
        frameType: 'none',
        shippingCost: 49,
      });

      expect(result.shipping).toBe(49);
      expect(result.total).toBe(89 + 49);
    });

    it('should apply discount when provided', () => {
      const result = calculatePrice({
        size: 'A4',
        paperType: 'matte',
        frameType: 'none',
        discount: 20,
      });

      expect(result.basePrice).toBe(129);
      expect(result.subtotal).toBe(129);
      expect(result.discount).toBe(20);
      expect(result.total).toBe(129 - 20 + result.shipping);
    });

    it('should not allow discount to exceed subtotal', () => {
      const result = calculatePrice({
        size: 'A5',
        paperType: 'matte',
        frameType: 'none',
        discount: 100, // More than subtotal of 89
      });

      expect(result.subtotal).toBe(89);
      expect(result.discount).toBe(89); // Capped at subtotal
      expect(result.total).toBe(result.shipping); // Only shipping remains
    });

    it('should return correct PriceBreakdown structure', () => {
      const result = calculatePrice({
        size: 'A4',
        paperType: 'glossy',
        frameType: 'black',
      });

      expect(result).toHaveProperty('basePrice');
      expect(result).toHaveProperty('paperModifier');
      expect(result).toHaveProperty('framePrice');
      expect(result).toHaveProperty('subtotal');
      expect(result).toHaveProperty('shipping');
      expect(result).toHaveProperty('discount');
      expect(result).toHaveProperty('total');
    });

    // Test all combinations
    describe('all size combinations', () => {
      const sizes: SizeType[] = ['A5', 'A4', 'A3', 'A2'];
      const papers: PaperType[] = ['matte', 'glossy', 'canvas'];
      const frames: FrameType[] = ['none', 'black', 'white', 'oak'];

      sizes.forEach((size) => {
        papers.forEach((paperType) => {
          frames.forEach((frameType) => {
            it(`should calculate correctly for ${size} ${paperType} ${frameType}`, () => {
              const result = calculatePrice({ size, paperType, frameType });

              const expectedBase = BASE_PRICES[size];
              const expectedPaper = PAPER_MODIFIERS[paperType];
              const expectedFrame = FRAME_PRICES[frameType];
              const expectedSubtotal = expectedBase + expectedPaper + expectedFrame;

              expect(result.basePrice).toBe(expectedBase);
              expect(result.paperModifier).toBe(expectedPaper);
              expect(result.framePrice).toBe(expectedFrame);
              expect(result.subtotal).toBe(expectedSubtotal);
              expect(result.total).toBe(expectedSubtotal + result.shipping);
            });
          });
        });
      });
    });
  });
});
