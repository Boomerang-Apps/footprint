/**
 * Shipping Calculator
 *
 * Calculates shipping costs and delivery estimates based on region and method.
 * All prices are in ILS (Israeli New Shekel).
 */

export type ShippingRegion = 'israel' | 'international';
export type ShippingMethod = 'standard' | 'express';

export interface ShippingEstimate {
  minDays: number;
  maxDays: number;
}

export interface ShippingResult {
  cost: number;
  region: ShippingRegion;
  method: ShippingMethod;
  estimate: ShippingEstimate;
}

export interface CalculateShippingInput {
  region?: ShippingRegion;
  method?: ShippingMethod;
}

/**
 * Shipping rates by region and method (ILS)
 */
export const SHIPPING_RATES: Record<ShippingRegion, Record<ShippingMethod, number>> = {
  israel: {
    standard: 29,
    express: 49,
  },
  international: {
    standard: 79,
    express: 129,
  },
};

/**
 * Delivery estimates by region and method (business days)
 */
export const SHIPPING_ESTIMATES: Record<ShippingRegion, Record<ShippingMethod, ShippingEstimate>> = {
  israel: {
    standard: { minDays: 3, maxDays: 5 },
    express: { minDays: 1, maxDays: 2 },
  },
  international: {
    standard: { minDays: 7, maxDays: 14 },
    express: { minDays: 3, maxDays: 5 },
  },
};

/**
 * Calculate shipping cost and estimate
 *
 * @param input - Shipping options (defaults to Israel standard)
 * @returns Shipping result with cost and estimate
 */
export function calculateShipping(input: CalculateShippingInput = {}): ShippingResult {
  const region = input.region ?? 'israel';
  const method = input.method ?? 'standard';

  return {
    cost: SHIPPING_RATES[region][method],
    region,
    method,
    estimate: SHIPPING_ESTIMATES[region][method],
  };
}

/**
 * Get formatted shipping estimate string
 *
 * @param region - Shipping region
 * @param method - Shipping method
 * @returns Formatted estimate string (e.g., "3-5 business days")
 */
export function getShippingEstimate(region: ShippingRegion, method: ShippingMethod): string {
  const estimate = SHIPPING_ESTIMATES[region][method];
  return `${estimate.minDays}-${estimate.maxDays} business days`;
}
