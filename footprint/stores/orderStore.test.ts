/**
 * Order Store Tests
 *
 * Tests for order creation flow state management,
 * focusing on discount code functionality (CO-05).
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useOrderStore } from './orderStore';

// Reset store before each test
beforeEach(() => {
  const { reset } = useOrderStore.getState();
  reset();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Order Store', () => {
  describe('Initial State', () => {
    it('should have empty discount code by default', () => {
      const state = useOrderStore.getState();
      expect(state.discountCode).toBe('');
    });

    it('should have null discount validation by default', () => {
      const state = useOrderStore.getState();
      expect(state.discountValidation).toEqual({
        isValidating: false,
        error: null,
        appliedDiscount: null,
      });
    });
  });

  describe('setDiscountCode', () => {
    it('should update discount code', () => {
      const { setDiscountCode } = useOrderStore.getState();

      act(() => {
        setDiscountCode('SAVE10');
      });

      expect(useOrderStore.getState().discountCode).toBe('SAVE10');
    });

    it('should clear previous validation error when code changes', () => {
      const store = useOrderStore.getState();

      // First, set an invalid code to get an error
      act(() => {
        store.setDiscountCode('INVALID');
      });

      // Apply to get error state
      act(() => {
        store.applyDiscountCode();
      });

      // Change code should clear error
      act(() => {
        store.setDiscountCode('SAVE10');
      });

      expect(useOrderStore.getState().discountValidation.error).toBeNull();
    });
  });

  describe('applyDiscountCode', () => {
    it('should validate and apply a valid percentage discount code', () => {
      const store = useOrderStore.getState();

      // Set up pricing first (need a subtotal)
      act(() => {
        store.setPricing({
          basePrice: 129,
          paperModifier: 0,
          framePrice: 0,
          subtotal: 129,
          shipping: 29,
          discount: 0,
          total: 158,
        });
        store.setDiscountCode('SAVE10');
      });

      act(() => {
        store.applyDiscountCode();
      });

      const state = useOrderStore.getState();
      expect(state.discountValidation.error).toBeNull();
      expect(state.discountValidation.appliedDiscount).not.toBeNull();
      expect(state.discountValidation.appliedDiscount?.valid).toBe(true);
      expect(state.discountValidation.appliedDiscount?.discount).toBe(13); // 10% of 129
    });

    it('should validate and apply a valid fixed discount code', () => {
      const store = useOrderStore.getState();

      act(() => {
        store.setPricing({
          basePrice: 129,
          paperModifier: 0,
          framePrice: 0,
          subtotal: 129,
          shipping: 29,
          discount: 0,
          total: 158,
        });
        store.setDiscountCode('FLAT20');
      });

      act(() => {
        store.applyDiscountCode();
      });

      const state = useOrderStore.getState();
      expect(state.discountValidation.appliedDiscount?.valid).toBe(true);
      expect(state.discountValidation.appliedDiscount?.discount).toBe(20);
    });

    it('should set error for invalid discount code', () => {
      const store = useOrderStore.getState();

      act(() => {
        store.setPricing({
          basePrice: 129,
          paperModifier: 0,
          framePrice: 0,
          subtotal: 129,
          shipping: 29,
          discount: 0,
          total: 158,
        });
        store.setDiscountCode('INVALID123');
      });

      act(() => {
        store.applyDiscountCode();
      });

      const state = useOrderStore.getState();
      expect(state.discountValidation.error).toBe('Invalid discount code');
      expect(state.discountValidation.appliedDiscount?.valid).toBe(false);
    });

    it('should set error for expired discount code', () => {
      const store = useOrderStore.getState();

      act(() => {
        store.setPricing({
          basePrice: 129,
          paperModifier: 0,
          framePrice: 0,
          subtotal: 129,
          shipping: 29,
          discount: 0,
          total: 158,
        });
        store.setDiscountCode('EXPIRED50');
      });

      act(() => {
        store.applyDiscountCode();
      });

      const state = useOrderStore.getState();
      expect(state.discountValidation.error).toBe('Discount code has expired');
    });

    it('should set error for empty discount code', () => {
      const store = useOrderStore.getState();

      act(() => {
        store.setPricing({
          basePrice: 129,
          paperModifier: 0,
          framePrice: 0,
          subtotal: 129,
          shipping: 29,
          discount: 0,
          total: 158,
        });
        store.setDiscountCode('');
      });

      act(() => {
        store.applyDiscountCode();
      });

      const state = useOrderStore.getState();
      expect(state.discountValidation.error).toBe('Discount code is required');
    });

    it('should enforce minimum purchase requirement', () => {
      const store = useOrderStore.getState();

      act(() => {
        store.setPricing({
          basePrice: 89,
          paperModifier: 0,
          framePrice: 0,
          subtotal: 89, // Below VIP25 minimum of 200
          shipping: 29,
          discount: 0,
          total: 118,
        });
        store.setDiscountCode('VIP25');
      });

      act(() => {
        store.applyDiscountCode();
      });

      const state = useOrderStore.getState();
      expect(state.discountValidation.error).toContain('Minimum purchase');
      expect(state.discountValidation.appliedDiscount?.valid).toBe(false);
    });

    it('should apply VIP25 when minimum purchase is met', () => {
      const store = useOrderStore.getState();

      act(() => {
        store.setPricing({
          basePrice: 249,
          paperModifier: 0,
          framePrice: 0,
          subtotal: 249, // Above VIP25 minimum of 200
          shipping: 29,
          discount: 0,
          total: 278,
        });
        store.setDiscountCode('VIP25');
      });

      act(() => {
        store.applyDiscountCode();
      });

      const state = useOrderStore.getState();
      expect(state.discountValidation.appliedDiscount?.valid).toBe(true);
      expect(state.discountValidation.appliedDiscount?.discount).toBe(62); // 25% of 249
    });

    it('should be case insensitive for discount codes', () => {
      const store = useOrderStore.getState();

      act(() => {
        store.setPricing({
          basePrice: 129,
          paperModifier: 0,
          framePrice: 0,
          subtotal: 129,
          shipping: 29,
          discount: 0,
          total: 158,
        });
        store.setDiscountCode('save10'); // lowercase
      });

      act(() => {
        store.applyDiscountCode();
      });

      const state = useOrderStore.getState();
      expect(state.discountValidation.appliedDiscount?.valid).toBe(true);
    });

    it('should update pricing with discount applied', () => {
      const store = useOrderStore.getState();

      act(() => {
        store.setPricing({
          basePrice: 129,
          paperModifier: 20,
          framePrice: 79,
          subtotal: 228,
          shipping: 29,
          discount: 0,
          total: 257,
        });
        store.setDiscountCode('SAVE20');
      });

      act(() => {
        store.applyDiscountCode();
      });

      const state = useOrderStore.getState();
      // 20% of 228 = 45.6, rounded to 46
      expect(state.discountValidation.appliedDiscount?.discount).toBe(46);
      // Pricing should be updated
      expect(state.pricing?.discount).toBe(46);
      expect(state.pricing?.total).toBe(211); // 228 - 46 + 29
    });
  });

  describe('clearDiscount', () => {
    it('should clear discount code and validation', () => {
      const store = useOrderStore.getState();

      // First apply a discount
      act(() => {
        store.setPricing({
          basePrice: 129,
          paperModifier: 0,
          framePrice: 0,
          subtotal: 129,
          shipping: 29,
          discount: 0,
          total: 158,
        });
        store.setDiscountCode('SAVE10');
      });

      act(() => {
        store.applyDiscountCode();
      });

      // Then clear it
      act(() => {
        store.clearDiscount();
      });

      const state = useOrderStore.getState();
      expect(state.discountCode).toBe('');
      expect(state.discountValidation).toEqual({
        isValidating: false,
        error: null,
        appliedDiscount: null,
      });
    });

    it('should reset pricing discount to 0', () => {
      const store = useOrderStore.getState();

      // Apply a discount
      act(() => {
        store.setPricing({
          basePrice: 129,
          paperModifier: 0,
          framePrice: 0,
          subtotal: 129,
          shipping: 29,
          discount: 0,
          total: 158,
        });
        store.setDiscountCode('SAVE10');
      });

      act(() => {
        store.applyDiscountCode();
      });

      // Clear it
      act(() => {
        store.clearDiscount();
      });

      const state = useOrderStore.getState();
      expect(state.pricing?.discount).toBe(0);
      expect(state.pricing?.total).toBe(158); // Original total restored
    });
  });

  describe('hasAppliedDiscount', () => {
    it('should return false when no discount applied', () => {
      const state = useOrderStore.getState();
      expect(state.hasAppliedDiscount()).toBe(false);
    });

    it('should return true when valid discount is applied', () => {
      const store = useOrderStore.getState();

      act(() => {
        store.setPricing({
          basePrice: 129,
          paperModifier: 0,
          framePrice: 0,
          subtotal: 129,
          shipping: 29,
          discount: 0,
          total: 158,
        });
        store.setDiscountCode('SAVE10');
      });

      act(() => {
        store.applyDiscountCode();
      });

      const state = useOrderStore.getState();
      expect(state.hasAppliedDiscount()).toBe(true);
    });

    it('should return false when invalid discount was attempted', () => {
      const store = useOrderStore.getState();

      act(() => {
        store.setPricing({
          basePrice: 129,
          paperModifier: 0,
          framePrice: 0,
          subtotal: 129,
          shipping: 29,
          discount: 0,
          total: 158,
        });
        store.setDiscountCode('INVALID');
      });

      act(() => {
        store.applyDiscountCode();
      });

      const state = useOrderStore.getState();
      expect(state.hasAppliedDiscount()).toBe(false);
    });
  });

  describe('getDiscountAmount', () => {
    it('should return 0 when no discount applied', () => {
      const state = useOrderStore.getState();
      expect(state.getDiscountAmount()).toBe(0);
    });

    it('should return discount amount when applied', () => {
      const store = useOrderStore.getState();

      act(() => {
        store.setPricing({
          basePrice: 200,
          paperModifier: 0,
          framePrice: 0,
          subtotal: 200,
          shipping: 29,
          discount: 0,
          total: 229,
        });
        store.setDiscountCode('SAVE20');
      });

      act(() => {
        store.applyDiscountCode();
      });

      const state = useOrderStore.getState();
      expect(state.getDiscountAmount()).toBe(40); // 20% of 200
    });
  });

  describe('reset', () => {
    it('should clear all discount state', () => {
      const store = useOrderStore.getState();

      // Apply a discount
      act(() => {
        store.setPricing({
          basePrice: 129,
          paperModifier: 0,
          framePrice: 0,
          subtotal: 129,
          shipping: 29,
          discount: 0,
          total: 158,
        });
        store.setDiscountCode('SAVE10');
      });

      act(() => {
        store.applyDiscountCode();
      });

      // Reset entire store
      act(() => {
        store.reset();
      });

      const state = useOrderStore.getState();
      expect(state.discountCode).toBe('');
      expect(state.discountValidation).toEqual({
        isValidating: false,
        error: null,
        appliedDiscount: null,
      });
    });
  });
});
