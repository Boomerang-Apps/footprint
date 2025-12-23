/**
 * Pricing Module
 *
 * Exports all pricing-related utilities for calculating
 * product prices, shipping costs, and discount codes.
 */

// Calculator exports
export {
  calculatePrice,
  getBasePrice,
  getPaperModifier,
  getFramePrice,
  BASE_PRICES,
  PAPER_MODIFIERS,
  FRAME_PRICES,
  DEFAULT_SHIPPING_COST,
  type CalculatePriceInput,
} from './calculator';

// Shipping exports
export {
  calculateShipping,
  getShippingEstimate,
  SHIPPING_RATES,
  SHIPPING_ESTIMATES,
  type ShippingRegion,
  type ShippingMethod,
  type ShippingEstimate,
  type ShippingResult,
  type CalculateShippingInput,
} from './shipping';

// Discount exports
export {
  validateDiscountCode,
  applyDiscount,
  getDiscountValue,
  isDiscountCodeExpired,
  type DiscountType,
  type DiscountCode,
  type ValidateDiscountResult,
  type ApplyDiscountResult,
} from './discounts';
