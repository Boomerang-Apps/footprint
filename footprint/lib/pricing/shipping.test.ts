import { describe, it, expect } from 'vitest';
import {
  calculateShipping,
  getShippingEstimate,
  SHIPPING_RATES,
  SHIPPING_ESTIMATES,
  ShippingRegion,
  ShippingMethod,
} from './shipping';

describe('Shipping Calculator', () => {
  describe('SHIPPING_RATES', () => {
    it('should have correct rates for Israel standard', () => {
      expect(SHIPPING_RATES.israel.standard).toBe(29);
    });

    it('should have correct rates for Israel express', () => {
      expect(SHIPPING_RATES.israel.express).toBe(49);
    });

    it('should have correct rates for international standard', () => {
      expect(SHIPPING_RATES.international.standard).toBe(79);
    });

    it('should have correct rates for international express', () => {
      expect(SHIPPING_RATES.international.express).toBe(129);
    });
  });

  describe('SHIPPING_ESTIMATES', () => {
    it('should have correct estimates for Israel standard', () => {
      expect(SHIPPING_ESTIMATES.israel.standard).toEqual({
        minDays: 3,
        maxDays: 5,
      });
    });

    it('should have correct estimates for Israel express', () => {
      expect(SHIPPING_ESTIMATES.israel.express).toEqual({
        minDays: 1,
        maxDays: 2,
      });
    });

    it('should have correct estimates for international standard', () => {
      expect(SHIPPING_ESTIMATES.international.standard).toEqual({
        minDays: 7,
        maxDays: 14,
      });
    });

    it('should have correct estimates for international express', () => {
      expect(SHIPPING_ESTIMATES.international.express).toEqual({
        minDays: 3,
        maxDays: 5,
      });
    });
  });

  describe('calculateShipping', () => {
    it('should calculate Israel standard shipping', () => {
      const result = calculateShipping({
        region: 'israel',
        method: 'standard',
      });

      expect(result.cost).toBe(29);
      expect(result.region).toBe('israel');
      expect(result.method).toBe('standard');
      expect(result.estimate.minDays).toBe(3);
      expect(result.estimate.maxDays).toBe(5);
    });

    it('should calculate Israel express shipping', () => {
      const result = calculateShipping({
        region: 'israel',
        method: 'express',
      });

      expect(result.cost).toBe(49);
      expect(result.region).toBe('israel');
      expect(result.method).toBe('express');
      expect(result.estimate.minDays).toBe(1);
      expect(result.estimate.maxDays).toBe(2);
    });

    it('should calculate international standard shipping', () => {
      const result = calculateShipping({
        region: 'international',
        method: 'standard',
      });

      expect(result.cost).toBe(79);
      expect(result.region).toBe('international');
      expect(result.method).toBe('standard');
      expect(result.estimate.minDays).toBe(7);
      expect(result.estimate.maxDays).toBe(14);
    });

    it('should calculate international express shipping', () => {
      const result = calculateShipping({
        region: 'international',
        method: 'express',
      });

      expect(result.cost).toBe(129);
      expect(result.region).toBe('international');
      expect(result.method).toBe('express');
      expect(result.estimate.minDays).toBe(3);
      expect(result.estimate.maxDays).toBe(5);
    });

    it('should default to Israel standard when no params provided', () => {
      const result = calculateShipping({});

      expect(result.cost).toBe(29);
      expect(result.region).toBe('israel');
      expect(result.method).toBe('standard');
    });

    it('should default to standard method when only region provided', () => {
      const result = calculateShipping({ region: 'international' });

      expect(result.method).toBe('standard');
      expect(result.cost).toBe(79);
    });

    it('should default to Israel when only method provided', () => {
      const result = calculateShipping({ method: 'express' });

      expect(result.region).toBe('israel');
      expect(result.cost).toBe(49);
    });
  });

  describe('getShippingEstimate', () => {
    it('should return formatted estimate for Israel standard', () => {
      const estimate = getShippingEstimate('israel', 'standard');
      expect(estimate).toBe('3-5 business days');
    });

    it('should return formatted estimate for Israel express', () => {
      const estimate = getShippingEstimate('israel', 'express');
      expect(estimate).toBe('1-2 business days');
    });

    it('should return formatted estimate for international standard', () => {
      const estimate = getShippingEstimate('international', 'standard');
      expect(estimate).toBe('7-14 business days');
    });

    it('should return formatted estimate for international express', () => {
      const estimate = getShippingEstimate('international', 'express');
      expect(estimate).toBe('3-5 business days');
    });
  });

  describe('ShippingRegion type', () => {
    it('should accept valid regions', () => {
      const regions: ShippingRegion[] = ['israel', 'international'];
      expect(regions).toHaveLength(2);
    });
  });

  describe('ShippingMethod type', () => {
    it('should accept valid methods', () => {
      const methods: ShippingMethod[] = ['standard', 'express'];
      expect(methods).toHaveLength(2);
    });
  });

  // Test all region/method combinations
  describe('all shipping combinations', () => {
    const regions: ShippingRegion[] = ['israel', 'international'];
    const methods: ShippingMethod[] = ['standard', 'express'];

    regions.forEach((region) => {
      methods.forEach((method) => {
        it(`should calculate correctly for ${region} ${method}`, () => {
          const result = calculateShipping({ region, method });

          expect(result.cost).toBe(SHIPPING_RATES[region][method]);
          expect(result.estimate).toEqual(SHIPPING_ESTIMATES[region][method]);
          expect(result.region).toBe(region);
          expect(result.method).toBe(method);
        });
      });
    });
  });
});
