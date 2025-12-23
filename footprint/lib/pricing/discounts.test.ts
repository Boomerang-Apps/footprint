import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateDiscountCode,
  applyDiscount,
  getDiscountValue,
  isDiscountCodeExpired,
  DiscountCode,
  DiscountType,
  ValidateDiscountResult,
} from './discounts';

describe('Discount System', () => {
  // Mock current date for consistent testing
  const mockDate = new Date('2025-06-15T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('DiscountType', () => {
    it('should support percentage type', () => {
      const type: DiscountType = 'percentage';
      expect(type).toBe('percentage');
    });

    it('should support fixed type', () => {
      const type: DiscountType = 'fixed';
      expect(type).toBe('fixed');
    });
  });

  describe('validateDiscountCode', () => {
    it('should validate a valid percentage discount code', () => {
      const result = validateDiscountCode('SAVE10');

      expect(result.valid).toBe(true);
      expect(result.code).toBeDefined();
      expect(result.code?.type).toBe('percentage');
      expect(result.code?.value).toBe(10);
    });

    it('should validate a valid fixed discount code', () => {
      const result = validateDiscountCode('FLAT20');

      expect(result.valid).toBe(true);
      expect(result.code).toBeDefined();
      expect(result.code?.type).toBe('fixed');
      expect(result.code?.value).toBe(20);
    });

    it('should be case insensitive', () => {
      const result1 = validateDiscountCode('save10');
      const result2 = validateDiscountCode('SAVE10');
      const result3 = validateDiscountCode('Save10');

      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
      expect(result3.valid).toBe(true);
    });

    it('should reject invalid code', () => {
      const result = validateDiscountCode('INVALID123');

      expect(result.valid).toBe(false);
      expect(result.code).toBeUndefined();
      expect(result.error).toBe('Invalid discount code');
    });

    it('should reject empty code', () => {
      const result = validateDiscountCode('');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Discount code is required');
    });

    it('should reject whitespace-only code', () => {
      const result = validateDiscountCode('   ');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Discount code is required');
    });

    it('should reject expired code', () => {
      const result = validateDiscountCode('EXPIRED50');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Discount code has expired');
    });

    it('should validate code with minimum purchase requirement', () => {
      const result = validateDiscountCode('VIP25');

      expect(result.valid).toBe(true);
      expect(result.code?.minPurchase).toBe(200);
    });

    it('should validate WELCOME code for new users', () => {
      const result = validateDiscountCode('WELCOME');

      expect(result.valid).toBe(true);
      expect(result.code?.type).toBe('percentage');
      expect(result.code?.value).toBe(15);
    });
  });

  describe('isDiscountCodeExpired', () => {
    it('should return false for code without expiry', () => {
      const code: DiscountCode = {
        code: 'TEST',
        type: 'percentage',
        value: 10,
      };

      expect(isDiscountCodeExpired(code)).toBe(false);
    });

    it('should return false for code with future expiry', () => {
      const code: DiscountCode = {
        code: 'TEST',
        type: 'percentage',
        value: 10,
        expiresAt: new Date('2025-12-31'),
      };

      expect(isDiscountCodeExpired(code)).toBe(false);
    });

    it('should return true for code with past expiry', () => {
      const code: DiscountCode = {
        code: 'TEST',
        type: 'percentage',
        value: 10,
        expiresAt: new Date('2025-01-01'),
      };

      expect(isDiscountCodeExpired(code)).toBe(true);
    });
  });

  describe('getDiscountValue', () => {
    it('should calculate percentage discount', () => {
      const code: DiscountCode = {
        code: 'SAVE10',
        type: 'percentage',
        value: 10,
      };

      expect(getDiscountValue(code, 100)).toBe(10);
      expect(getDiscountValue(code, 200)).toBe(20);
      expect(getDiscountValue(code, 150)).toBe(15);
    });

    it('should calculate fixed discount', () => {
      const code: DiscountCode = {
        code: 'FLAT20',
        type: 'fixed',
        value: 20,
      };

      expect(getDiscountValue(code, 100)).toBe(20);
      expect(getDiscountValue(code, 200)).toBe(20);
      expect(getDiscountValue(code, 50)).toBe(20);
    });

    it('should not exceed subtotal for fixed discount', () => {
      const code: DiscountCode = {
        code: 'FLAT50',
        type: 'fixed',
        value: 50,
      };

      expect(getDiscountValue(code, 30)).toBe(30);
    });

    it('should respect max discount for percentage', () => {
      const code: DiscountCode = {
        code: 'SAVE50',
        type: 'percentage',
        value: 50,
        maxDiscount: 100,
      };

      expect(getDiscountValue(code, 500)).toBe(100); // 50% of 500 = 250, capped at 100
      expect(getDiscountValue(code, 100)).toBe(50); // 50% of 100 = 50, under cap
    });

    it('should round percentage discount to nearest whole number', () => {
      const code: DiscountCode = {
        code: 'SAVE10',
        type: 'percentage',
        value: 10,
      };

      expect(getDiscountValue(code, 99)).toBe(10); // 9.9 rounds to 10
      expect(getDiscountValue(code, 91)).toBe(9); // 9.1 rounds to 9
    });
  });

  describe('applyDiscount', () => {
    it('should apply valid discount to subtotal', () => {
      const result = applyDiscount('SAVE10', 200);

      expect(result.valid).toBe(true);
      expect(result.originalSubtotal).toBe(200);
      expect(result.discount).toBe(20);
      expect(result.newSubtotal).toBe(180);
    });

    it('should apply fixed discount', () => {
      const result = applyDiscount('FLAT20', 200);

      expect(result.valid).toBe(true);
      expect(result.discount).toBe(20);
      expect(result.newSubtotal).toBe(180);
    });

    it('should reject invalid code', () => {
      const result = applyDiscount('INVALID', 200);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid discount code');
      expect(result.discount).toBe(0);
      expect(result.newSubtotal).toBe(200);
    });

    it('should reject if subtotal below minimum purchase', () => {
      const result = applyDiscount('VIP25', 100); // VIP25 requires min 200

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Minimum purchase');
      expect(result.discount).toBe(0);
    });

    it('should apply discount when subtotal meets minimum', () => {
      const result = applyDiscount('VIP25', 250);

      expect(result.valid).toBe(true);
      expect(result.discount).toBe(63); // 25% of 250 = 62.5, Math.round to 63
    });

    it('should not allow discount to exceed subtotal', () => {
      const result = applyDiscount('FLAT20', 15);

      expect(result.valid).toBe(true);
      expect(result.discount).toBe(15);
      expect(result.newSubtotal).toBe(0);
    });
  });

  describe('Known discount codes', () => {
    const testCases = [
      { code: 'SAVE10', type: 'percentage', value: 10 },
      { code: 'SAVE20', type: 'percentage', value: 20 },
      { code: 'FLAT20', type: 'fixed', value: 20 },
      { code: 'FLAT50', type: 'fixed', value: 50 },
      { code: 'VIP25', type: 'percentage', value: 25, minPurchase: 200 },
      { code: 'WELCOME', type: 'percentage', value: 15 },
    ];

    testCases.forEach(({ code, type, value, minPurchase }) => {
      it(`should validate ${code} as ${type} with value ${value}`, () => {
        const result = validateDiscountCode(code);

        expect(result.valid).toBe(true);
        expect(result.code?.type).toBe(type);
        expect(result.code?.value).toBe(value);
        if (minPurchase) {
          expect(result.code?.minPurchase).toBe(minPurchase);
        }
      });
    });
  });
});
