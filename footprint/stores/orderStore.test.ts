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

  // =========================================================================
  // GF-05: Scheduled Delivery Date Tests
  // =========================================================================

  describe('Scheduled Delivery Date (GF-05)', () => {
    describe('Initial State', () => {
      it('should have null scheduledDeliveryDate by default', () => {
        const state = useOrderStore.getState();
        expect(state.scheduledDeliveryDate).toBeNull();
      });
    });

    describe('setScheduledDeliveryDate', () => {
      it('should set scheduled delivery date', () => {
        const { setScheduledDeliveryDate } = useOrderStore.getState();

        act(() => {
          setScheduledDeliveryDate('2025-06-25');
        });

        expect(useOrderStore.getState().scheduledDeliveryDate).toBe('2025-06-25');
      });

      it('should allow updating the date', () => {
        const store = useOrderStore.getState();

        act(() => {
          store.setScheduledDeliveryDate('2025-06-25');
        });

        act(() => {
          store.setScheduledDeliveryDate('2025-06-30');
        });

        expect(useOrderStore.getState().scheduledDeliveryDate).toBe('2025-06-30');
      });

      it('should allow setting date to null', () => {
        const store = useOrderStore.getState();

        act(() => {
          store.setScheduledDeliveryDate('2025-06-25');
        });

        act(() => {
          store.setScheduledDeliveryDate(null);
        });

        expect(useOrderStore.getState().scheduledDeliveryDate).toBeNull();
      });
    });

    describe('clearScheduledDeliveryDate', () => {
      it('should clear the scheduled delivery date', () => {
        const store = useOrderStore.getState();

        act(() => {
          store.setScheduledDeliveryDate('2025-06-25');
        });

        act(() => {
          store.clearScheduledDeliveryDate();
        });

        expect(useOrderStore.getState().scheduledDeliveryDate).toBeNull();
      });

      it('should work when date is already null', () => {
        const store = useOrderStore.getState();

        act(() => {
          store.clearScheduledDeliveryDate();
        });

        expect(useOrderStore.getState().scheduledDeliveryDate).toBeNull();
      });
    });

    describe('getMinDeliveryDate', () => {
      it('should return date 3 business days from now', () => {
        // Current mocked date: 2025-06-15 (Sunday)
        // 3 business days from Sunday = Wednesday June 18
        // (Mon=1, Tue=2, Wed=3)
        const store = useOrderStore.getState();
        const minDate = store.getMinDeliveryDate();

        expect(minDate).toBe('2025-06-18');
      });
    });

    describe('getMaxDeliveryDate', () => {
      it('should return date 30 days from now', () => {
        // Current mocked date: 2025-06-15
        // +30 days = 2025-07-15
        const store = useOrderStore.getState();
        const maxDate = store.getMaxDeliveryDate();

        expect(maxDate).toBe('2025-07-15');
      });
    });

    describe('isValidDeliveryDate', () => {
      it('should return true for date within valid range', () => {
        const store = useOrderStore.getState();

        // June 25 is within June 18 (min) and July 15 (max)
        expect(store.isValidDeliveryDate('2025-06-25')).toBe(true);
      });

      it('should return true for date on min boundary', () => {
        const store = useOrderStore.getState();
        expect(store.isValidDeliveryDate('2025-06-18')).toBe(true);
      });

      it('should return true for date on max boundary', () => {
        const store = useOrderStore.getState();
        expect(store.isValidDeliveryDate('2025-07-15')).toBe(true);
      });

      it('should return false for date before min', () => {
        const store = useOrderStore.getState();
        expect(store.isValidDeliveryDate('2025-06-16')).toBe(false);
      });

      it('should return false for date after max', () => {
        const store = useOrderStore.getState();
        expect(store.isValidDeliveryDate('2025-07-20')).toBe(false);
      });

      it('should return false for invalid date string', () => {
        const store = useOrderStore.getState();
        expect(store.isValidDeliveryDate('not-a-date')).toBe(false);
      });

      it('should return false for empty string', () => {
        const store = useOrderStore.getState();
        expect(store.isValidDeliveryDate('')).toBe(false);
      });
    });

    describe('reset', () => {
      it('should clear scheduled delivery date on reset', () => {
        const store = useOrderStore.getState();

        act(() => {
          store.setScheduledDeliveryDate('2025-06-25');
        });

        act(() => {
          store.reset();
        });

        expect(useOrderStore.getState().scheduledDeliveryDate).toBeNull();
      });
    });

    describe('persistence', () => {
      it('should persist scheduledDeliveryDate to localStorage', () => {
        const store = useOrderStore.getState();

        act(() => {
          store.setScheduledDeliveryDate('2025-06-25');
        });

        // Check the persisted state includes scheduledDeliveryDate
        const state = useOrderStore.getState();
        expect(state.scheduledDeliveryDate).toBe('2025-06-25');
      });
    });
  });

  // =========================================================================
  // AUTH-02: Guest Checkout State Tests
  // =========================================================================

  describe('Guest Checkout State (AUTH-02)', () => {
    describe('Initial State', () => {
      it('should have isGuest as false by default', () => {
        const state = useOrderStore.getState();
        expect(state.isGuest).toBe(false);
      });

      it('should have null guestInfo by default', () => {
        const state = useOrderStore.getState();
        expect(state.guestInfo).toBeNull();
      });
    });

    describe('setIsGuest', () => {
      it('should set isGuest to true', () => {
        const { setIsGuest } = useOrderStore.getState();

        act(() => {
          setIsGuest(true);
        });

        expect(useOrderStore.getState().isGuest).toBe(true);
      });

      it('should set isGuest to false', () => {
        const store = useOrderStore.getState();

        // Set to true first
        act(() => {
          store.setIsGuest(true);
        });

        // Set back to false
        act(() => {
          store.setIsGuest(false);
        });

        expect(useOrderStore.getState().isGuest).toBe(false);
      });

      it('should toggle isGuest', () => {
        const store = useOrderStore.getState();

        act(() => {
          store.setIsGuest(true);
        });
        expect(useOrderStore.getState().isGuest).toBe(true);

        act(() => {
          store.setIsGuest(false);
        });
        expect(useOrderStore.getState().isGuest).toBe(false);

        act(() => {
          store.setIsGuest(true);
        });
        expect(useOrderStore.getState().isGuest).toBe(true);
      });
    });

    describe('setGuestInfo', () => {
      const validGuestInfo = {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '050-1234567',
        marketingConsent: false,
      };

      it('should set valid guest info', () => {
        const { setGuestInfo } = useOrderStore.getState();

        act(() => {
          setGuestInfo(validGuestInfo);
        });

        const state = useOrderStore.getState();
        expect(state.guestInfo).toEqual(validGuestInfo);
      });

      it('should update existing guest info', () => {
        const store = useOrderStore.getState();

        act(() => {
          store.setGuestInfo(validGuestInfo);
        });

        const updatedInfo = {
          ...validGuestInfo,
          phone: '052-9876543',
        };

        act(() => {
          store.setGuestInfo(updatedInfo);
        });

        const state = useOrderStore.getState();
        expect(state.guestInfo).toEqual(updatedInfo);
      });

      it('should accept guest info without phone', () => {
        const store = useOrderStore.getState();
        const infoWithoutPhone = {
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          marketingConsent: true,
        };

        act(() => {
          store.setGuestInfo(infoWithoutPhone);
        });

        const state = useOrderStore.getState();
        expect(state.guestInfo).toEqual(infoWithoutPhone);
      });

      it('should throw error for invalid email', () => {
        const store = useOrderStore.getState();
        const invalidInfo = {
          ...validGuestInfo,
          email: 'not-an-email',
        };

        expect(() => {
          act(() => {
            store.setGuestInfo(invalidInfo);
          });
        }).toThrow('Invalid guest information');
      });

      it('should allow empty first name (optional for initial checkout)', () => {
        const store = useOrderStore.getState();
        const guestInfo = {
          ...validGuestInfo,
          firstName: '',
        };

        act(() => {
          store.setGuestInfo(guestInfo);
        });

        const state = useOrderStore.getState();
        expect(state.guestInfo?.firstName).toBe('');
      });

      it('should allow empty last name (optional for initial checkout)', () => {
        const store = useOrderStore.getState();
        const guestInfo = {
          ...validGuestInfo,
          lastName: '',
        };

        act(() => {
          store.setGuestInfo(guestInfo);
        });

        const state = useOrderStore.getState();
        expect(state.guestInfo?.lastName).toBe('');
      });

      it('should throw error for invalid phone', () => {
        const store = useOrderStore.getState();
        const invalidInfo = {
          ...validGuestInfo,
          phone: 'abc',
        };

        expect(() => {
          act(() => {
            store.setGuestInfo(invalidInfo);
          });
        }).toThrow('Invalid guest information');
      });
    });

    describe('clearGuestInfo', () => {
      it('should clear guest info', () => {
        const store = useOrderStore.getState();

        // Set guest info first
        act(() => {
          store.setGuestInfo({
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            marketingConsent: false,
          });
        });

        // Clear it
        act(() => {
          store.clearGuestInfo();
        });

        const state = useOrderStore.getState();
        expect(state.guestInfo).toBeNull();
        expect(state.isGuest).toBe(false);
      });

      it('should work when guest info is already null', () => {
        const store = useOrderStore.getState();

        act(() => {
          store.clearGuestInfo();
        });

        expect(useOrderStore.getState().guestInfo).toBeNull();
      });
    });

    describe('reset', () => {
      it('should clear guest state on reset', () => {
        const store = useOrderStore.getState();

        // Set guest info
        act(() => {
          store.setIsGuest(true);
          store.setGuestInfo({
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            marketingConsent: true,
          });
        });

        // Reset
        act(() => {
          store.reset();
        });

        const state = useOrderStore.getState();
        expect(state.isGuest).toBe(false);
        expect(state.guestInfo).toBeNull();
      });
    });

    describe('persistence', () => {
      it('should persist isGuest to localStorage', () => {
        const store = useOrderStore.getState();

        act(() => {
          store.setIsGuest(true);
        });

        const state = useOrderStore.getState();
        expect(state.isGuest).toBe(true);
      });

      it('should persist guestInfo to localStorage', () => {
        const store = useOrderStore.getState();
        const guestInfo = {
          email: 'persist@example.com',
          firstName: 'Persist',
          lastName: 'Test',
          phone: '050-1111111',
          marketingConsent: true,
        };

        act(() => {
          store.setGuestInfo(guestInfo);
        });

        const state = useOrderStore.getState();
        expect(state.guestInfo).toEqual(guestInfo);
      });
    });
  });
});
