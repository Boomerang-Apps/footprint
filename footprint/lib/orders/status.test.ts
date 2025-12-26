/**
 * Order Status Management Tests
 *
 * TDD: Tests written FIRST before implementation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  OrderStatus,
  isValidStatusTransition,
  getStatusLabel,
  getValidNextStatuses,
  createStatusHistoryEntry,
  StatusHistoryEntry,
} from './status';

describe('Order Status Management', () => {
  // ============================================================================
  // Status Transition Validation Tests
  // ============================================================================

  describe('isValidStatusTransition', () => {
    it('should allow pending -> paid', () => {
      expect(isValidStatusTransition('pending', 'paid')).toBe(true);
    });

    it('should allow paid -> processing', () => {
      expect(isValidStatusTransition('paid', 'processing')).toBe(true);
    });

    it('should allow processing -> printing', () => {
      expect(isValidStatusTransition('processing', 'printing')).toBe(true);
    });

    it('should allow printing -> shipped', () => {
      expect(isValidStatusTransition('printing', 'shipped')).toBe(true);
    });

    it('should allow shipped -> delivered', () => {
      expect(isValidStatusTransition('shipped', 'delivered')).toBe(true);
    });

    it('should allow cancellation from pending', () => {
      expect(isValidStatusTransition('pending', 'cancelled')).toBe(true);
    });

    it('should allow cancellation from paid', () => {
      expect(isValidStatusTransition('paid', 'cancelled')).toBe(true);
    });

    it('should allow cancellation from processing', () => {
      expect(isValidStatusTransition('processing', 'cancelled')).toBe(true);
    });

    it('should NOT allow cancellation from printing', () => {
      expect(isValidStatusTransition('printing', 'cancelled')).toBe(false);
    });

    it('should NOT allow cancellation from shipped', () => {
      expect(isValidStatusTransition('shipped', 'cancelled')).toBe(false);
    });

    it('should NOT allow cancellation from delivered', () => {
      expect(isValidStatusTransition('delivered', 'cancelled')).toBe(false);
    });

    it('should NOT allow backwards transition paid -> pending', () => {
      expect(isValidStatusTransition('paid', 'pending')).toBe(false);
    });

    it('should NOT allow skipping states processing -> shipped', () => {
      expect(isValidStatusTransition('processing', 'shipped')).toBe(false);
    });

    it('should NOT allow transition from cancelled', () => {
      expect(isValidStatusTransition('cancelled', 'pending')).toBe(false);
      expect(isValidStatusTransition('cancelled', 'processing')).toBe(false);
    });

    it('should NOT allow transition to same status', () => {
      expect(isValidStatusTransition('pending', 'pending')).toBe(false);
      expect(isValidStatusTransition('paid', 'paid')).toBe(false);
    });

    it('should NOT allow transition from delivered (terminal state)', () => {
      expect(isValidStatusTransition('delivered', 'shipped')).toBe(false);
      expect(isValidStatusTransition('delivered', 'cancelled')).toBe(false);
    });
  });

  // ============================================================================
  // Status Labels Tests
  // ============================================================================

  describe('getStatusLabel', () => {
    it('should return Hebrew label for pending', () => {
      expect(getStatusLabel('pending')).toBe('ממתין לתשלום');
    });

    it('should return Hebrew label for paid', () => {
      expect(getStatusLabel('paid')).toBe('שולם');
    });

    it('should return Hebrew label for processing', () => {
      expect(getStatusLabel('processing')).toBe('בטיפול');
    });

    it('should return Hebrew label for printing', () => {
      expect(getStatusLabel('printing')).toBe('בהדפסה');
    });

    it('should return Hebrew label for shipped', () => {
      expect(getStatusLabel('shipped')).toBe('נשלח');
    });

    it('should return Hebrew label for delivered', () => {
      expect(getStatusLabel('delivered')).toBe('נמסר');
    });

    it('should return Hebrew label for cancelled', () => {
      expect(getStatusLabel('cancelled')).toBe('בוטל');
    });

    it('should return English label when locale is en', () => {
      expect(getStatusLabel('pending', 'en')).toBe('Pending Payment');
      expect(getStatusLabel('paid', 'en')).toBe('Paid');
      expect(getStatusLabel('processing', 'en')).toBe('Processing');
      expect(getStatusLabel('printing', 'en')).toBe('Printing');
      expect(getStatusLabel('shipped', 'en')).toBe('Shipped');
      expect(getStatusLabel('delivered', 'en')).toBe('Delivered');
      expect(getStatusLabel('cancelled', 'en')).toBe('Cancelled');
    });
  });

  // ============================================================================
  // Valid Next Statuses Tests
  // ============================================================================

  describe('getValidNextStatuses', () => {
    it('should return [paid, cancelled] for pending', () => {
      expect(getValidNextStatuses('pending')).toEqual(['paid', 'cancelled']);
    });

    it('should return [processing, cancelled] for paid', () => {
      expect(getValidNextStatuses('paid')).toEqual(['processing', 'cancelled']);
    });

    it('should return [printing, cancelled] for processing', () => {
      expect(getValidNextStatuses('processing')).toEqual(['printing', 'cancelled']);
    });

    it('should return [shipped] for printing (no cancel)', () => {
      expect(getValidNextStatuses('printing')).toEqual(['shipped']);
    });

    it('should return [delivered] for shipped', () => {
      expect(getValidNextStatuses('shipped')).toEqual(['delivered']);
    });

    it('should return empty array for delivered (terminal)', () => {
      expect(getValidNextStatuses('delivered')).toEqual([]);
    });

    it('should return empty array for cancelled (terminal)', () => {
      expect(getValidNextStatuses('cancelled')).toEqual([]);
    });
  });

  // ============================================================================
  // Status History Entry Tests
  // ============================================================================

  describe('createStatusHistoryEntry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-12-25T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should create entry with required fields', () => {
      const entry = createStatusHistoryEntry('shipped', 'admin_123');

      expect(entry.status).toBe('shipped');
      expect(entry.changedBy).toBe('admin_123');
      expect(entry.timestamp).toEqual(new Date('2025-12-25T12:00:00Z'));
      expect(entry.note).toBeUndefined();
    });

    it('should create entry with optional note', () => {
      const entry = createStatusHistoryEntry('shipped', 'admin_123', 'Sent via Israel Post');

      expect(entry.status).toBe('shipped');
      expect(entry.note).toBe('Sent via Israel Post');
    });

    it('should use current timestamp', () => {
      vi.setSystemTime(new Date('2025-12-26T15:30:00Z'));
      const entry = createStatusHistoryEntry('processing', 'admin_456');

      expect(entry.timestamp).toEqual(new Date('2025-12-26T15:30:00Z'));
    });
  });
});
