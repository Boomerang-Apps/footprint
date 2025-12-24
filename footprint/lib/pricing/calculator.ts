/**
 * Price Calculator
 *
 * Calculates print prices based on size, paper type, and frame options.
 * All prices are in ILS (Israeli New Shekel).
 */

import type { SizeType, PaperType, FrameType, PriceBreakdown } from '@/types';

/**
 * Base prices by print size (ILS)
 */
export const BASE_PRICES: Record<SizeType, number> = {
  A5: 89,
  A4: 129,
  A3: 179,
  A2: 249,
};

/**
 * Paper type price modifiers (ILS)
 * Added to base price
 */
export const PAPER_MODIFIERS: Record<PaperType, number> = {
  matte: 0,
  glossy: 20,
  canvas: 50,
};

/**
 * Frame prices (ILS)
 * Added to base price
 */
export const FRAME_PRICES: Record<FrameType, number> = {
  none: 0,
  black: 79,
  white: 79,
  oak: 99,
};

/**
 * Default shipping cost for Israel (ILS)
 */
export const DEFAULT_SHIPPING_COST = 29;

/**
 * Get base price for a given size
 */
export function getBasePrice(size: SizeType): number {
  return BASE_PRICES[size];
}

/**
 * Get paper modifier for a given paper type
 */
export function getPaperModifier(paperType: PaperType): number {
  return PAPER_MODIFIERS[paperType];
}

/**
 * Get frame price for a given frame type
 */
export function getFramePrice(frameType: FrameType): number {
  return FRAME_PRICES[frameType];
}

/**
 * Input for price calculation
 */
export interface CalculatePriceInput {
  size: SizeType;
  paperType: PaperType;
  frameType: FrameType;
  shippingCost?: number;
  discount?: number;
}

/**
 * Calculate total price with breakdown
 *
 * @param input - Product configuration
 * @returns Price breakdown with all components
 */
export function calculatePrice(input: CalculatePriceInput): PriceBreakdown {
  const { size, paperType, frameType, shippingCost, discount = 0 } = input;

  const basePrice = getBasePrice(size);
  const paperModifier = getPaperModifier(paperType);
  const framePrice = getFramePrice(frameType);
  const shipping = shippingCost ?? DEFAULT_SHIPPING_COST;

  const subtotal = basePrice + paperModifier + framePrice;

  // Discount cannot exceed subtotal (no negative product price)
  const appliedDiscount = Math.min(discount, subtotal);

  const total = subtotal - appliedDiscount + shipping;

  return {
    basePrice,
    paperModifier,
    framePrice,
    subtotal,
    shipping,
    discount: appliedDiscount,
    total,
  };
}
