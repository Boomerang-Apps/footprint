/**
 * Tracking Module - INT-07
 *
 * Defines carrier codes and tracking-related types for shipping.
 */

/**
 * Supported carrier codes
 */
export type CarrierCode =
  | 'israel_post'
  | 'dhl'
  | 'fedex'
  | 'ups'
  | 'other';

/**
 * Tracking number validation patterns
 */
export const CARRIER_PATTERNS: Record<CarrierCode, RegExp | null> = {
  israel_post: /^(RR|RL|EA|EE)\d{9}IL$/i,
  dhl: /^\d{10}$/,
  fedex: /^\d{12,22}$/,
  ups: /^1Z[A-Z0-9]{16}$/i,
  other: null,
};

/**
 * Detect carrier from tracking number format
 */
export function detectCarrier(trackingNumber: string): CarrierCode | null {
  const trimmed = trackingNumber.trim().toUpperCase();

  for (const [carrier, pattern] of Object.entries(CARRIER_PATTERNS)) {
    if (pattern && pattern.test(trimmed)) {
      return carrier as CarrierCode;
    }
  }

  return null;
}

/**
 * Validate tracking number format for a specific carrier
 */
export function validateTrackingNumber(
  trackingNumber: string,
  carrier: CarrierCode
): boolean {
  const pattern = CARRIER_PATTERNS[carrier];
  if (!pattern) {
    return true; // No validation for 'other'
  }
  return pattern.test(trackingNumber.trim().toUpperCase());
}

/**
 * Carrier display names
 */
export const CARRIER_NAMES: Record<CarrierCode, string> = {
  israel_post: 'Israel Post',
  dhl: 'DHL',
  fedex: 'FedEx',
  ups: 'UPS',
  other: 'Other',
};

/**
 * Carrier tracking URLs
 */
export const CARRIER_TRACKING_URLS: Record<CarrierCode, string | null> = {
  israel_post: 'https://israelpost.co.il/itemtrace?itemcode=',
  dhl: 'https://www.dhl.com/track?trackingId=',
  fedex: 'https://www.fedex.com/fedextrack/?trknbr=',
  ups: 'https://www.ups.com/track?tracknum=',
  other: null,
};

/**
 * Get tracking URL for a shipment
 */
export function getTrackingUrl(
  trackingNumber: string,
  carrier: CarrierCode
): string | null {
  const baseUrl = CARRIER_TRACKING_URLS[carrier];
  if (!baseUrl) {
    return null;
  }
  return `${baseUrl}${encodeURIComponent(trackingNumber)}`;
}
