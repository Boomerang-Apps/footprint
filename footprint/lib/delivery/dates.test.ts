/**
 * Delivery Date Utilities Tests (GF-05)
 *
 * TDD: RED phase - Write tests first
 * Tests for delivery date validation and calculation functions.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  MIN_DELIVERY_DAYS,
  MAX_DELIVERY_DAYS,
  isBusinessDay,
  addBusinessDays,
  getMinDeliveryDate,
  getMaxDeliveryDate,
  isValidDeliveryDate,
  formatDeliveryDate,
  parseDeliveryDate,
} from './dates';

describe('Delivery Date Utilities', () => {
  beforeEach(() => {
    // Mock system time to a known date: Wednesday, June 18, 2025
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-18T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Constants', () => {
    it('should have MIN_DELIVERY_DAYS set to 3', () => {
      expect(MIN_DELIVERY_DAYS).toBe(3);
    });

    it('should have MAX_DELIVERY_DAYS set to 30', () => {
      expect(MAX_DELIVERY_DAYS).toBe(30);
    });
  });

  describe('isBusinessDay', () => {
    it('should return true for Monday', () => {
      const monday = new Date('2025-06-16'); // Monday
      expect(isBusinessDay(monday)).toBe(true);
    });

    it('should return true for Tuesday', () => {
      const tuesday = new Date('2025-06-17'); // Tuesday
      expect(isBusinessDay(tuesday)).toBe(true);
    });

    it('should return true for Wednesday', () => {
      const wednesday = new Date('2025-06-18'); // Wednesday
      expect(isBusinessDay(wednesday)).toBe(true);
    });

    it('should return true for Thursday', () => {
      const thursday = new Date('2025-06-19'); // Thursday
      expect(isBusinessDay(thursday)).toBe(true);
    });

    it('should return true for Friday', () => {
      const friday = new Date('2025-06-20'); // Friday
      expect(isBusinessDay(friday)).toBe(true);
    });

    it('should return false for Saturday', () => {
      const saturday = new Date('2025-06-21'); // Saturday
      expect(isBusinessDay(saturday)).toBe(false);
    });

    it('should return false for Sunday', () => {
      const sunday = new Date('2025-06-22'); // Sunday
      expect(isBusinessDay(sunday)).toBe(false);
    });
  });

  describe('addBusinessDays', () => {
    it('should add 1 business day on a weekday', () => {
      const wednesday = new Date('2025-06-18'); // Wednesday
      const result = addBusinessDays(wednesday, 1);
      expect(result.toISOString().split('T')[0]).toBe('2025-06-19'); // Thursday
    });

    it('should add 3 business days spanning a weekend', () => {
      // Thursday + 3 business days = Tuesday (skipping Sat/Sun)
      const thursday = new Date('2025-06-19'); // Thursday
      const result = addBusinessDays(thursday, 3);
      expect(result.toISOString().split('T')[0]).toBe('2025-06-24'); // Tuesday
    });

    it('should handle adding business days from Friday', () => {
      // Friday + 1 business day = Monday
      const friday = new Date('2025-06-20'); // Friday
      const result = addBusinessDays(friday, 1);
      expect(result.toISOString().split('T')[0]).toBe('2025-06-23'); // Monday
    });

    it('should handle adding business days from Saturday', () => {
      // Saturday + 1 business day = Monday
      const saturday = new Date('2025-06-21'); // Saturday
      const result = addBusinessDays(saturday, 1);
      expect(result.toISOString().split('T')[0]).toBe('2025-06-23'); // Monday
    });

    it('should handle adding business days from Sunday', () => {
      // Sunday + 1 business day = Monday
      const sunday = new Date('2025-06-22'); // Sunday
      const result = addBusinessDays(sunday, 1);
      expect(result.toISOString().split('T')[0]).toBe('2025-06-23'); // Monday
    });

    it('should add 5 business days (a full business week)', () => {
      // Wednesday + 5 business days = Wednesday next week
      const wednesday = new Date('2025-06-18'); // Wednesday
      const result = addBusinessDays(wednesday, 5);
      expect(result.toISOString().split('T')[0]).toBe('2025-06-25'); // Wednesday
    });

    it('should return same date when adding 0 business days', () => {
      const wednesday = new Date('2025-06-18');
      const result = addBusinessDays(wednesday, 0);
      expect(result.toISOString().split('T')[0]).toBe('2025-06-18');
    });
  });

  describe('getMinDeliveryDate', () => {
    it('should return date 3 business days from now by default', () => {
      // Current: Wednesday June 18
      // +3 business days = Monday June 23
      const minDate = getMinDeliveryDate();
      expect(minDate.toISOString().split('T')[0]).toBe('2025-06-23');
    });

    it('should accept custom fromDate parameter', () => {
      const fromDate = new Date('2025-06-16'); // Monday
      // +3 business days = Thursday June 19
      const minDate = getMinDeliveryDate(fromDate);
      expect(minDate.toISOString().split('T')[0]).toBe('2025-06-19');
    });

    it('should handle fromDate on Friday', () => {
      const friday = new Date('2025-06-20'); // Friday
      // +3 business days = Wednesday June 25 (skips weekend)
      const minDate = getMinDeliveryDate(friday);
      expect(minDate.toISOString().split('T')[0]).toBe('2025-06-25');
    });
  });

  describe('getMaxDeliveryDate', () => {
    it('should return date 30 days from now by default', () => {
      // Current: June 18, 2025
      // +30 days = July 18, 2025
      const maxDate = getMaxDeliveryDate();
      expect(maxDate.toISOString().split('T')[0]).toBe('2025-07-18');
    });

    it('should accept custom fromDate parameter', () => {
      const fromDate = new Date('2025-06-01');
      // +30 days = July 1, 2025
      const maxDate = getMaxDeliveryDate(fromDate);
      expect(maxDate.toISOString().split('T')[0]).toBe('2025-07-01');
    });
  });

  describe('isValidDeliveryDate', () => {
    it('should return true for date within valid range', () => {
      // Valid: between min (June 23) and max (July 18)
      const validDate = new Date('2025-06-25');
      expect(isValidDeliveryDate(validDate)).toBe(true);
    });

    it('should return true for date exactly on min boundary', () => {
      const minDate = new Date('2025-06-23');
      expect(isValidDeliveryDate(minDate)).toBe(true);
    });

    it('should return true for date exactly on max boundary', () => {
      const maxDate = new Date('2025-07-18');
      expect(isValidDeliveryDate(maxDate)).toBe(true);
    });

    it('should return false for date before min delivery date', () => {
      const tooEarly = new Date('2025-06-20');
      expect(isValidDeliveryDate(tooEarly)).toBe(false);
    });

    it('should return false for date after max delivery date', () => {
      const tooLate = new Date('2025-07-20');
      expect(isValidDeliveryDate(tooLate)).toBe(false);
    });

    it('should return false for past dates', () => {
      const pastDate = new Date('2025-06-17');
      expect(isValidDeliveryDate(pastDate)).toBe(false);
    });

    it('should accept custom fromDate parameter', () => {
      const fromDate = new Date('2025-06-01');
      const deliveryDate = new Date('2025-06-10');
      expect(isValidDeliveryDate(deliveryDate, fromDate)).toBe(true);
    });

    it('should return true for weekends within valid range', () => {
      // Weekends are valid delivery dates (delivery can happen on weekends)
      const saturday = new Date('2025-06-28');
      expect(isValidDeliveryDate(saturday)).toBe(true);
    });
  });

  describe('formatDeliveryDate', () => {
    it('should format date as ISO date string', () => {
      const date = new Date('2025-06-25T10:30:00Z');
      expect(formatDeliveryDate(date)).toBe('2025-06-25');
    });

    it('should handle dates with different times', () => {
      const date = new Date('2025-07-01T23:59:59Z');
      expect(formatDeliveryDate(date)).toBe('2025-07-01');
    });
  });

  describe('parseDeliveryDate', () => {
    it('should parse ISO date string to Date object', () => {
      const dateString = '2025-06-25';
      const result = parseDeliveryDate(dateString);
      expect(result).not.toBeNull();
      expect(result!.toISOString().split('T')[0]).toBe('2025-06-25');
    });

    it('should return null for invalid date string', () => {
      const invalid = 'not-a-date';
      expect(parseDeliveryDate(invalid)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseDeliveryDate('')).toBeNull();
    });

    it('should handle date strings with time component', () => {
      const dateString = '2025-06-25T10:00:00Z';
      const result = parseDeliveryDate(dateString);
      expect(result?.toISOString().split('T')[0]).toBe('2025-06-25');
    });
  });

  describe('Edge Cases', () => {
    it('should handle year boundary correctly', () => {
      // Set time to late December
      vi.setSystemTime(new Date('2025-12-29T10:00:00Z'));

      const minDate = getMinDeliveryDate();
      // Should roll over to January 2026
      expect(minDate.getFullYear()).toBe(2026);
    });

    it('should handle leap year February correctly', () => {
      // Set time to February in a leap year (2024 was leap, 2028 will be)
      vi.setSystemTime(new Date('2028-02-25T10:00:00Z'));

      const maxDate = getMaxDeliveryDate();
      // February 25 + 30 days = March 26
      expect(maxDate.toISOString().split('T')[0]).toBe('2028-03-26');
    });
  });
});
