/**
 * Tracking Number Management
 *
 * Handles tracking number validation, carrier information, and URL generation
 * for order shipment tracking.
 */

/**
 * Supported carrier codes
 */
export type CarrierCode = 'israel_post' | 'dhl' | 'fedex' | 'ups' | 'other';

/**
 * Carrier information
 */
export interface CarrierInfo {
  code: CarrierCode;
  name: string;
  nameHe: string;
  trackingUrlPattern: string | null;
}

/**
 * Tracking validation result
 */
export interface TrackingValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Tracking information for an order
 */
export interface TrackingInfo {
  trackingNumber: string;
  carrier: CarrierCode;
  trackingUrl: string | null;
  addedBy: string;
  addedAt: Date;
  note?: string;
}

/**
 * Carrier definitions with tracking URL patterns
 */
export const CARRIERS: Record<CarrierCode, CarrierInfo> = {
  israel_post: {
    code: 'israel_post',
    name: 'Israel Post',
    nameHe: 'דואר ישראל',
    trackingUrlPattern: 'https://israelpost.co.il/itemtrace?itemcode={tracking}',
  },
  dhl: {
    code: 'dhl',
    name: 'DHL',
    nameHe: 'DHL',
    trackingUrlPattern: 'https://www.dhl.com/il-he/home/tracking.html?tracking-id={tracking}',
  },
  fedex: {
    code: 'fedex',
    name: 'FedEx',
    nameHe: 'FedEx',
    trackingUrlPattern: 'https://www.fedex.com/fedextrack/?trknbr={tracking}',
  },
  ups: {
    code: 'ups',
    name: 'UPS',
    nameHe: 'UPS',
    trackingUrlPattern: 'https://www.ups.com/track?tracknum={tracking}',
  },
  other: {
    code: 'other',
    name: 'Other',
    nameHe: 'אחר',
    trackingUrlPattern: null,
  },
};

/**
 * Valid carrier codes list
 */
const VALID_CARRIER_CODES: CarrierCode[] = [
  'israel_post',
  'dhl',
  'fedex',
  'ups',
  'other',
];

/**
 * Checks if a string is a valid carrier code
 *
 * @param code - The carrier code to validate
 * @returns true if valid carrier code
 */
export function isValidCarrier(code: string): code is CarrierCode {
  return VALID_CARRIER_CODES.includes(code as CarrierCode);
}

/**
 * Validates a tracking number for a specific carrier
 *
 * @param trackingNumber - The tracking number to validate
 * @param carrier - The carrier code
 * @returns Validation result with error message if invalid
 */
export function validateTrackingNumber(
  trackingNumber: string,
  carrier: CarrierCode
): TrackingValidationResult {
  if (!trackingNumber || trackingNumber.trim() === '') {
    return {
      valid: false,
      error: 'Tracking number is required',
    };
  }

  const trimmed = trackingNumber.trim().toUpperCase();

  switch (carrier) {
    case 'israel_post':
      // Format: RR/RL/EA/EE + 9 digits + IL (13 chars total)
      if (trimmed.length !== 13) {
        return {
          valid: false,
          error: 'Israel Post tracking must be 13 characters',
        };
      }
      if (!/^(RR|RL|EA|EE)\d{9}IL$/.test(trimmed)) {
        return {
          valid: false,
          error: 'Invalid Israel Post tracking format. Must start with RR, RL, EA, or EE followed by 9 digits and IL',
        };
      }
      return { valid: true };

    case 'dhl':
      // Format: 10 digits
      if (!/^\d{10}$/.test(trimmed)) {
        return {
          valid: false,
          error: 'DHL tracking must be exactly 10 digits',
        };
      }
      return { valid: true };

    case 'fedex':
      // Format: 12-22 digits
      if (!/^\d{12,22}$/.test(trimmed)) {
        return {
          valid: false,
          error: 'FedEx tracking must be 12-22 digits',
        };
      }
      return { valid: true };

    case 'ups':
      // Format: 1Z + 16 alphanumeric (18 chars total)
      if (trimmed.length !== 18) {
        return {
          valid: false,
          error: 'UPS tracking must be 18 characters',
        };
      }
      if (!/^1Z[A-Z0-9]{16}$/.test(trimmed)) {
        return {
          valid: false,
          error: 'Invalid UPS tracking format. Must start with 1Z followed by 16 alphanumeric characters',
        };
      }
      return { valid: true };

    case 'other':
      // Accept any non-empty string
      return { valid: true };

    default:
      return {
        valid: false,
        error: 'Unknown carrier',
      };
  }
}

/**
 * Generates a tracking URL for a carrier
 *
 * @param trackingNumber - The tracking number
 * @param carrier - The carrier code
 * @returns Tracking URL or null if carrier doesn't support URLs
 */
export function generateTrackingUrl(
  trackingNumber: string,
  carrier: CarrierCode
): string | null {
  const carrierInfo = CARRIERS[carrier];

  if (!carrierInfo.trackingUrlPattern) {
    return null;
  }

  return carrierInfo.trackingUrlPattern.replace('{tracking}', trackingNumber);
}

/**
 * Creates a tracking info object
 *
 * @param trackingNumber - The tracking number
 * @param carrier - The carrier code
 * @param addedBy - User ID who added the tracking
 * @param note - Optional note
 * @returns TrackingInfo object
 */
export function createTrackingInfo(
  trackingNumber: string,
  carrier: CarrierCode,
  addedBy: string,
  note?: string
): TrackingInfo {
  return {
    trackingNumber,
    carrier,
    trackingUrl: generateTrackingUrl(trackingNumber, carrier),
    addedBy,
    addedAt: new Date(),
    ...(note !== undefined && { note }),
  };
}
