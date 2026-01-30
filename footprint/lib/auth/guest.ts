/**
 * Guest Validation
 *
 * Validation functions for guest checkout.
 * Validates email format and complete guest information.
 */

/**
 * Guest information for checkout without account
 */
export interface GuestInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  marketingConsent: boolean;
}

/**
 * Validation result with errors
 */
export interface GuestValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Email validation regex (simplified and practical)
 * Allows common email characters but excludes problematic ones
 * Local part: letters, numbers, dots, plus, hyphen, underscore
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Name validation regex
 * Allows letters, spaces, hyphens, apostrophes
 * Common across many cultures including Hebrew names
 */
const NAME_REGEX = /^[a-zA-Z\u0590-\u05FF\s'-]+$/;

/**
 * Phone validation regex
 * Accepts digits, spaces, dashes, plus sign, parentheses
 * Flexible to handle various formats
 */
const PHONE_REGEX = /^[\d\s\-+()]+$/;

/**
 * Validates email format
 *
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export function isValidGuestEmail(email: string): boolean {
  const trimmed = email.trim();

  // Empty check
  if (!trimmed) {
    return false;
  }

  // Format check
  if (!EMAIL_REGEX.test(trimmed)) {
    return false;
  }

  // Basic sanity checks
  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domain] = parts;

  // Check local part exists
  if (!localPart || localPart.length === 0) {
    return false;
  }

  // Check domain has TLD
  if (!domain || !domain.includes('.')) {
    return false;
  }

  // Domain validation
  const domainParts = domain.split('.');
  for (const part of domainParts) {
    if (part.length < 2) {
      return false; // Each domain part should be at least 2 chars
    }
  }

  // Check minimum length (a@b.c would be too short)
  if (trimmed.length < 6) {
    return false;
  }

  return true;
}

/**
 * Validates a name field (first or last name)
 *
 * @param name - Name to validate
 * @param fieldName - Field name for error messages
 * @param errors - Array to collect errors
 * @returns True if name is valid
 */
function validateName(name: string, fieldName: string, errors: string[]): boolean {
  const trimmed = name.trim();
  let isValid = true;

  // Required check
  if (!trimmed) {
    errors.push(`${fieldName} is required`);
    return false;
  }

  // Length checks
  if (trimmed.length < 2) {
    errors.push(`${fieldName} must be at least 2 characters`);
    isValid = false;
  }

  if (trimmed.length > 50) {
    errors.push(`${fieldName} must be at most 50 characters`);
    isValid = false;
  }

  // Character check
  if (!NAME_REGEX.test(trimmed)) {
    errors.push(`${fieldName} contains invalid characters`);
    isValid = false;
  }

  return isValid;
}

/**
 * Validates phone number format
 *
 * @param phone - Phone number to validate
 * @param errors - Array to collect errors
 * @returns True if phone is valid
 */
function validatePhone(phone: string | undefined, errors: string[]): boolean {
  // Phone is optional
  if (!phone || phone.trim() === '') {
    return true;
  }

  const trimmed = phone.trim();

  // Length checks (reasonable phone number length)
  if (trimmed.length < 7 || trimmed.length > 20) {
    errors.push('Phone number format is invalid');
    return false;
  }

  // Character check
  if (!PHONE_REGEX.test(trimmed)) {
    errors.push('Phone number format is invalid');
    return false;
  }

  // Must contain at least 7 digits
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 7) {
    errors.push('Phone number format is invalid');
    return false;
  }

  return true;
}

/**
 * Validates complete guest information
 *
 * @param info - Guest information to validate
 * @returns Validation result with errors
 */
export function isValidGuestInfo(info: GuestInfo): GuestValidationResult {
  const errors: string[] = [];

  // Email validation
  const trimmedEmail = info.email.trim();
  if (!trimmedEmail) {
    errors.push('Email is required');
  } else if (!isValidGuestEmail(trimmedEmail)) {
    errors.push('Email format is invalid');
  }

  // First name validation
  validateName(info.firstName, 'First name', errors);

  // Last name validation
  validateName(info.lastName, 'Last name', errors);

  // Phone validation (optional)
  validatePhone(info.phone, errors);

  return {
    valid: errors.length === 0,
    errors,
  };
}
