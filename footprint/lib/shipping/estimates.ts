/**
 * Delivery Estimates
 *
 * Calculates delivery time estimates based on recipient location.
 * Integrates with PC-04 shipping module for zone detection.
 */

import { SHIPPING_ESTIMATES, type ShippingRegion } from '@/lib/pricing/shipping';

export type ShippingZone = ShippingRegion;

export interface DeliveryEstimate {
  minDays: number;
  maxDays: number;
  zone: ShippingZone;
  isExpress: boolean;
}

export interface DeliveryDateRange {
  earliestDate: Date;
  latestDate: Date;
  formattedRange: string;
}

/**
 * Determine shipping zone based on country
 */
export function getShippingZone(country: string): ShippingZone {
  const normalizedCountry = country.trim().toLowerCase();

  // Israel variants
  const israelVariants = ['israel', 'ישראל', 'il'];

  if (israelVariants.includes(normalizedCountry)) {
    return 'israel';
  }

  return 'international';
}

/**
 * Get delivery estimate for recipient based on country and shipping method
 */
export function getRecipientDeliveryEstimate(
  recipientCountry: string,
  expressShipping: boolean
): DeliveryEstimate {
  const zone = getShippingZone(recipientCountry);
  const method = expressShipping ? 'express' : 'standard';
  const baseEstimate = SHIPPING_ESTIMATES[zone][method];

  return {
    minDays: baseEstimate.minDays,
    maxDays: baseEstimate.maxDays,
    zone,
    isExpress: expressShipping,
  };
}

/**
 * Format delivery estimate as human-readable string
 */
export function formatDeliveryEstimate(
  estimate: DeliveryEstimate,
  includeExpressIndicator = false
): string {
  const days =
    estimate.minDays === estimate.maxDays
      ? `${estimate.minDays} business day`
      : `${estimate.minDays}-${estimate.maxDays} business days`;

  if (includeExpressIndicator && estimate.isExpress) {
    return `${days} (Express)`;
  }

  return days;
}

/**
 * Format date as short month and day
 */
function formatShortDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Calculate actual delivery date range
 */
export function getDeliveryDateRange(
  estimate: DeliveryEstimate,
  startDate: Date = new Date()
): DeliveryDateRange {
  const earliestDate = new Date(startDate);
  earliestDate.setDate(startDate.getDate() + estimate.minDays);

  const latestDate = new Date(startDate);
  latestDate.setDate(startDate.getDate() + estimate.maxDays);

  const formattedRange = `${formatShortDate(earliestDate)} - ${formatShortDate(latestDate)}`;

  return {
    earliestDate,
    latestDate,
    formattedRange,
  };
}
