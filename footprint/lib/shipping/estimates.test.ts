import { describe, it, expect } from 'vitest';
import {
  getShippingZone,
  getRecipientDeliveryEstimate,
  formatDeliveryEstimate,
  getDeliveryDateRange,
  DeliveryEstimate,
  ShippingZone,
} from './estimates';

describe('Delivery Estimates', () => {
  describe('getShippingZone', () => {
    it('should return israel zone for Israel', () => {
      expect(getShippingZone('Israel')).toBe('israel');
      expect(getShippingZone('ישראל')).toBe('israel');
    });

    it('should be case insensitive', () => {
      expect(getShippingZone('ISRAEL')).toBe('israel');
      expect(getShippingZone('israel')).toBe('israel');
    });

    it('should return international zone for other countries', () => {
      expect(getShippingZone('USA')).toBe('international');
      expect(getShippingZone('Germany')).toBe('international');
      expect(getShippingZone('France')).toBe('international');
    });

    it('should default to international for unknown', () => {
      expect(getShippingZone('')).toBe('international');
      expect(getShippingZone('Unknown')).toBe('international');
    });
  });

  describe('getRecipientDeliveryEstimate', () => {
    describe('Israel standard shipping', () => {
      it('should return 3-5 days for Israel standard', () => {
        const estimate = getRecipientDeliveryEstimate('Israel', false);

        expect(estimate.minDays).toBe(3);
        expect(estimate.maxDays).toBe(5);
        expect(estimate.zone).toBe('israel');
        expect(estimate.isExpress).toBe(false);
      });
    });

    describe('Israel express shipping', () => {
      it('should return 1-2 days for Israel express', () => {
        const estimate = getRecipientDeliveryEstimate('Israel', true);

        expect(estimate.minDays).toBe(1);
        expect(estimate.maxDays).toBe(2);
        expect(estimate.zone).toBe('israel');
        expect(estimate.isExpress).toBe(true);
      });
    });

    describe('International standard shipping', () => {
      it('should return 7-14 days for international standard', () => {
        const estimate = getRecipientDeliveryEstimate('USA', false);

        expect(estimate.minDays).toBe(7);
        expect(estimate.maxDays).toBe(14);
        expect(estimate.zone).toBe('international');
        expect(estimate.isExpress).toBe(false);
      });
    });

    describe('International express shipping', () => {
      it('should return 3-5 days for international express', () => {
        const estimate = getRecipientDeliveryEstimate('Germany', true);

        expect(estimate.minDays).toBe(3);
        expect(estimate.maxDays).toBe(5);
        expect(estimate.zone).toBe('international');
        expect(estimate.isExpress).toBe(true);
      });
    });

    it('should handle Hebrew country name', () => {
      const estimate = getRecipientDeliveryEstimate('ישראל', false);

      expect(estimate.zone).toBe('israel');
      expect(estimate.minDays).toBe(3);
    });
  });

  describe('formatDeliveryEstimate', () => {
    it('should format Israel standard delivery', () => {
      const estimate: DeliveryEstimate = {
        minDays: 3,
        maxDays: 5,
        zone: 'israel',
        isExpress: false,
      };

      expect(formatDeliveryEstimate(estimate)).toBe('3-5 business days');
    });

    it('should format express delivery', () => {
      const estimate: DeliveryEstimate = {
        minDays: 1,
        maxDays: 2,
        zone: 'israel',
        isExpress: true,
      };

      expect(formatDeliveryEstimate(estimate)).toBe('1-2 business days');
    });

    it('should handle single day estimate', () => {
      const estimate: DeliveryEstimate = {
        minDays: 1,
        maxDays: 1,
        zone: 'israel',
        isExpress: true,
      };

      expect(formatDeliveryEstimate(estimate)).toBe('1 business day');
    });

    it('should include express indicator when requested', () => {
      const estimate: DeliveryEstimate = {
        minDays: 1,
        maxDays: 2,
        zone: 'israel',
        isExpress: true,
      };

      expect(formatDeliveryEstimate(estimate, true)).toBe('1-2 business days (Express)');
    });
  });

  describe('getDeliveryDateRange', () => {
    it('should calculate delivery date range from today', () => {
      const estimate: DeliveryEstimate = {
        minDays: 3,
        maxDays: 5,
        zone: 'israel',
        isExpress: false,
      };

      const range = getDeliveryDateRange(estimate);

      expect(range.earliestDate).toBeInstanceOf(Date);
      expect(range.latestDate).toBeInstanceOf(Date);
      expect(range.latestDate.getTime()).toBeGreaterThan(range.earliestDate.getTime());
    });

    it('should calculate dates based on min/max days', () => {
      const estimate: DeliveryEstimate = {
        minDays: 3,
        maxDays: 5,
        zone: 'israel',
        isExpress: false,
      };

      const today = new Date();
      const range = getDeliveryDateRange(estimate);

      // Earliest should be 3 days from now
      const expectedEarliest = new Date(today);
      expectedEarliest.setDate(today.getDate() + 3);

      // Latest should be 5 days from now
      const expectedLatest = new Date(today);
      expectedLatest.setDate(today.getDate() + 5);

      // Compare dates (ignoring time)
      expect(range.earliestDate.toDateString()).toBe(expectedEarliest.toDateString());
      expect(range.latestDate.toDateString()).toBe(expectedLatest.toDateString());
    });

    it('should accept custom start date', () => {
      const estimate: DeliveryEstimate = {
        minDays: 2,
        maxDays: 4,
        zone: 'israel',
        isExpress: true,
      };

      const startDate = new Date('2025-01-15');
      const range = getDeliveryDateRange(estimate, startDate);

      expect(range.earliestDate.toDateString()).toBe(new Date('2025-01-17').toDateString());
      expect(range.latestDate.toDateString()).toBe(new Date('2025-01-19').toDateString());
    });

    it('should return formatted string', () => {
      const estimate: DeliveryEstimate = {
        minDays: 3,
        maxDays: 5,
        zone: 'israel',
        isExpress: false,
      };

      const startDate = new Date('2025-06-10');
      const range = getDeliveryDateRange(estimate, startDate);

      expect(range.formattedRange).toBe('Jun 13 - Jun 15');
    });
  });

  describe('ShippingZone type', () => {
    it('should accept valid zones', () => {
      const zones: ShippingZone[] = ['israel', 'international'];
      expect(zones).toHaveLength(2);
    });
  });

  describe('DeliveryEstimate interface', () => {
    it('should have all required properties', () => {
      const estimate: DeliveryEstimate = {
        minDays: 1,
        maxDays: 2,
        zone: 'israel',
        isExpress: true,
      };

      expect(estimate).toHaveProperty('minDays');
      expect(estimate).toHaveProperty('maxDays');
      expect(estimate).toHaveProperty('zone');
      expect(estimate).toHaveProperty('isExpress');
    });
  });
});
