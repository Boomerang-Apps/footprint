/**
 * Status Transitions Tests - BE-07
 *
 * Tests for fulfillment status transition validation
 */

import { describe, it, expect } from 'vitest';
import {
  isValidFulfillmentTransition,
  getValidNextStatuses,
  isValidFulfillmentStatus,
  getStatusLabel,
  validateBatchTransitions,
  FULFILLMENT_STATUSES,
  type FulfillmentStatus,
} from './status-transitions';

describe('Status Transitions (BE-07)', () => {
  describe('isValidFulfillmentTransition', () => {
    it('should allow pending → printing', () => {
      expect(isValidFulfillmentTransition('pending', 'printing')).toBe(true);
    });

    it('should allow pending → cancelled', () => {
      expect(isValidFulfillmentTransition('pending', 'cancelled')).toBe(true);
    });

    it('should allow printing → ready_to_ship', () => {
      expect(isValidFulfillmentTransition('printing', 'ready_to_ship')).toBe(true);
    });

    it('should allow printing → pending (rollback)', () => {
      expect(isValidFulfillmentTransition('printing', 'pending')).toBe(true);
    });

    it('should allow ready_to_ship → shipped', () => {
      expect(isValidFulfillmentTransition('ready_to_ship', 'shipped')).toBe(true);
    });

    it('should allow ready_to_ship → printing (rollback)', () => {
      expect(isValidFulfillmentTransition('ready_to_ship', 'printing')).toBe(true);
    });

    it('should allow shipped → delivered', () => {
      expect(isValidFulfillmentTransition('shipped', 'delivered')).toBe(true);
    });

    it('should reject pending → shipped (skip)', () => {
      expect(isValidFulfillmentTransition('pending', 'shipped')).toBe(false);
    });

    it('should reject delivered → any status', () => {
      expect(isValidFulfillmentTransition('delivered', 'pending')).toBe(false);
      expect(isValidFulfillmentTransition('delivered', 'shipped')).toBe(false);
    });

    it('should reject cancelled → any status', () => {
      expect(isValidFulfillmentTransition('cancelled', 'pending')).toBe(false);
      expect(isValidFulfillmentTransition('cancelled', 'printing')).toBe(false);
    });

    it('should reject shipped → pending (invalid rollback)', () => {
      expect(isValidFulfillmentTransition('shipped', 'pending')).toBe(false);
    });
  });

  describe('getValidNextStatuses', () => {
    it('should return [printing, cancelled] for pending', () => {
      expect(getValidNextStatuses('pending')).toEqual(['printing', 'cancelled']);
    });

    it('should return [ready_to_ship, pending] for printing', () => {
      expect(getValidNextStatuses('printing')).toEqual(['ready_to_ship', 'pending']);
    });

    it('should return [shipped, printing] for ready_to_ship', () => {
      expect(getValidNextStatuses('ready_to_ship')).toEqual(['shipped', 'printing']);
    });

    it('should return [delivered] for shipped', () => {
      expect(getValidNextStatuses('shipped')).toEqual(['delivered']);
    });

    it('should return [] for delivered', () => {
      expect(getValidNextStatuses('delivered')).toEqual([]);
    });

    it('should return [] for cancelled', () => {
      expect(getValidNextStatuses('cancelled')).toEqual([]);
    });
  });

  describe('isValidFulfillmentStatus', () => {
    it('should return true for all valid statuses', () => {
      FULFILLMENT_STATUSES.forEach((status) => {
        expect(isValidFulfillmentStatus(status)).toBe(true);
      });
    });

    it('should return false for invalid status', () => {
      expect(isValidFulfillmentStatus('invalid')).toBe(false);
      expect(isValidFulfillmentStatus('')).toBe(false);
      expect(isValidFulfillmentStatus('PENDING')).toBe(false);
    });
  });

  describe('getStatusLabel', () => {
    it('should return Hebrew labels', () => {
      expect(getStatusLabel('pending')).toBe('ממתין');
      expect(getStatusLabel('printing')).toBe('בהדפסה');
      expect(getStatusLabel('ready_to_ship')).toBe('מוכן למשלוח');
      expect(getStatusLabel('shipped')).toBe('נשלח');
      expect(getStatusLabel('delivered')).toBe('נמסר');
      expect(getStatusLabel('cancelled')).toBe('בוטל');
    });
  });

  describe('validateBatchTransitions', () => {
    it('should validate all orders successfully for valid transitions', () => {
      const orders = [
        { id: 'order-1', currentStatus: 'pending' as FulfillmentStatus },
        { id: 'order-2', currentStatus: 'pending' as FulfillmentStatus },
        { id: 'order-3', currentStatus: 'pending' as FulfillmentStatus },
      ];

      const result = validateBatchTransitions(orders, 'printing');

      expect(result.valid).toEqual(['order-1', 'order-2', 'order-3']);
      expect(result.invalid).toEqual([]);
    });

    it('should reject invalid transitions', () => {
      const orders = [
        { id: 'order-1', currentStatus: 'pending' as FulfillmentStatus },
        { id: 'order-2', currentStatus: 'delivered' as FulfillmentStatus },
        { id: 'order-3', currentStatus: 'cancelled' as FulfillmentStatus },
      ];

      const result = validateBatchTransitions(orders, 'printing');

      expect(result.valid).toEqual(['order-1']);
      expect(result.invalid).toHaveLength(2);
      expect(result.invalid[0].orderId).toBe('order-2');
      expect(result.invalid[1].orderId).toBe('order-3');
    });

    it('should include Hebrew error messages', () => {
      const orders = [
        { id: 'order-1', currentStatus: 'delivered' as FulfillmentStatus },
      ];

      const result = validateBatchTransitions(orders, 'pending');

      expect(result.invalid[0].reason).toContain('נמסר');
      expect(result.invalid[0].reason).toContain('ממתין');
    });

    it('should handle empty orders array', () => {
      const result = validateBatchTransitions([], 'printing');

      expect(result.valid).toEqual([]);
      expect(result.invalid).toEqual([]);
    });

    it('should handle mixed valid and invalid transitions', () => {
      const orders = [
        { id: 'order-1', currentStatus: 'printing' as FulfillmentStatus },
        { id: 'order-2', currentStatus: 'ready_to_ship' as FulfillmentStatus },
        { id: 'order-3', currentStatus: 'pending' as FulfillmentStatus },
      ];

      const result = validateBatchTransitions(orders, 'ready_to_ship');

      expect(result.valid).toEqual(['order-1']);
      expect(result.invalid).toHaveLength(2);
    });
  });
});
