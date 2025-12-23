/**
 * Address Validation
 *
 * Validates Israeli addresses for shipping purposes.
 * Supports both Hebrew and English input.
 */

import type { Address } from '@/types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface AddressValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof Address, string>>;
}

/**
 * List of known Israeli cities (English and Hebrew)
 */
export const ISRAELI_CITIES: string[] = [
  // Major cities - English
  'Tel Aviv',
  'Jerusalem',
  'Haifa',
  'Rishon LeZion',
  'Petah Tikva',
  'Ashdod',
  'Netanya',
  'Beer Sheva',
  'Holon',
  'Bnei Brak',
  'Ramat Gan',
  'Bat Yam',
  'Rehovot',
  'Ashkelon',
  'Herzliya',
  'Kfar Saba',
  'Hadera',
  'Modiin',
  'Nazareth',
  'Lod',
  'Ramla',
  'Raanana',
  'Givatayim',
  'Eilat',
  // Major cities - Hebrew
  'תל אביב',
  'ירושלים',
  'חיפה',
  'ראשון לציון',
  'פתח תקווה',
  'אשדוד',
  'נתניה',
  'באר שבע',
  'חולון',
  'בני ברק',
  'רמת גן',
  'בת ים',
  'רחובות',
  'אשקלון',
  'הרצליה',
  'כפר סבא',
  'חדרה',
  'מודיעין',
  'נצרת',
  'לוד',
  'רמלה',
  'רעננה',
  'גבעתיים',
  'אילת',
];

/**
 * Normalize city name for comparison
 */
function normalizeCity(city: string): string {
  return city.trim().toLowerCase();
}

/**
 * Check if a city is a valid Israeli city
 */
export function isValidIsraeliCity(city: string): boolean {
  if (!city || !city.trim()) {
    return false;
  }

  const normalizedInput = normalizeCity(city);
  return ISRAELI_CITIES.some(
    (validCity) => normalizeCity(validCity) === normalizedInput
  );
}

/**
 * Validate Israeli postal code (7 digits)
 */
export function validatePostalCode(postalCode: string): ValidationResult {
  // Remove spaces and check for 7 digits
  const cleaned = postalCode.replace(/\s/g, '');

  if (!/^\d{7}$/.test(cleaned)) {
    return {
      valid: false,
      error: 'Postal code must be 7 digits',
    };
  }

  return { valid: true };
}

/**
 * Israeli phone number regex patterns
 */
const PHONE_PATTERNS = {
  // Mobile: 05X-XXXXXXX or 05XXXXXXXX
  mobile: /^0[5][0-9][-]?[0-9]{7}$/,
  // Landline: 0X-XXXXXXX or 0XXXXXXXX (area codes 02-09)
  landline: /^0[2-9][-]?[0-9]{7}$/,
  // International: +972 or 972 prefix
  international: /^(\+?972)[-]?[0-9][-]?[0-9]{7,8}$/,
};

/**
 * Validate Israeli phone number
 */
export function validatePhone(phone: string): ValidationResult {
  const cleaned = phone.replace(/[\s-]/g, '');

  const isValid =
    PHONE_PATTERNS.mobile.test(phone.replace(/\s/g, '')) ||
    PHONE_PATTERNS.landline.test(phone.replace(/\s/g, '')) ||
    PHONE_PATTERNS.international.test(cleaned);

  if (!isValid) {
    return {
      valid: false,
      error: 'Invalid Israeli phone number',
    };
  }

  return { valid: true };
}

/**
 * Format phone number to standard Israeli format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  let digits = phone.replace(/\D/g, '');

  // Handle international format (+972 or 972)
  if (digits.startsWith('972')) {
    digits = '0' + digits.slice(3);
  }

  // Format as XXX-XXXXXXX for 10-digit numbers
  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  // Return original if can't format
  return phone;
}

/**
 * Validate city name
 */
export function validateCity(city: string): ValidationResult {
  if (!city || !city.trim()) {
    return {
      valid: false,
      error: 'City is required',
    };
  }

  if (!isValidIsraeliCity(city)) {
    return {
      valid: false,
      error: 'City not recognized',
    };
  }

  return { valid: true };
}

/**
 * Validate a complete address
 */
export function validateAddress(address: Address): AddressValidationResult {
  const errors: Partial<Record<keyof Address, string>> = {};

  // Validate name
  if (!address.name || !address.name.trim()) {
    errors.name = 'Name is required';
  }

  // Validate street
  if (!address.street || !address.street.trim()) {
    errors.street = 'Street address is required';
  }

  // Validate city
  const cityResult = validateCity(address.city);
  if (!cityResult.valid) {
    errors.city = cityResult.error;
  }

  // Validate postal code
  const postalResult = validatePostalCode(address.postalCode);
  if (!postalResult.valid) {
    errors.postalCode = postalResult.error;
  }

  // Validate phone (optional)
  if (address.phone) {
    const phoneResult = validatePhone(address.phone);
    if (!phoneResult.valid) {
      errors.phone = phoneResult.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
