/**
 * Delivery Date Utilities (GF-05)
 *
 * Functions for calculating and validating scheduled delivery dates.
 * Used by orderStore to manage scheduled delivery date state.
 */

/**
 * Minimum number of business days required for processing and shipping.
 */
export const MIN_DELIVERY_DAYS = 3;

/**
 * Maximum number of days in the future a delivery can be scheduled.
 */
export const MAX_DELIVERY_DAYS = 30;

/**
 * Checks if a date is a business day (Monday-Friday).
 * @param date - The date to check
 * @returns true if the date is a weekday (Mon-Fri)
 */
export function isBusinessDay(date: Date): boolean {
  const day = date.getDay();
  // 0 = Sunday, 6 = Saturday
  return day !== 0 && day !== 6;
}

/**
 * Adds a specified number of business days to a date.
 * Skips weekends when counting days.
 * If starting on a weekend, the first business day (Monday) counts as day 1.
 * @param date - The starting date
 * @param days - Number of business days to add
 * @returns A new Date with the specified business days added
 */
export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);

  // Handle 0 days case
  if (days === 0) {
    return result;
  }

  let addedDays = 0;

  // If starting on a weekend, move to Monday and count it as the first day
  if (!isBusinessDay(result)) {
    while (!isBusinessDay(result)) {
      result.setDate(result.getDate() + 1);
    }
    addedDays = 1;
  }

  // Add remaining business days
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    if (isBusinessDay(result)) {
      addedDays++;
    }
  }

  return result;
}

/**
 * Gets the minimum allowed delivery date based on processing time.
 * @param fromDate - The starting date (defaults to current date)
 * @returns The earliest date delivery can be scheduled
 */
export function getMinDeliveryDate(fromDate?: Date): Date {
  const baseDate = fromDate || new Date();
  return addBusinessDays(baseDate, MIN_DELIVERY_DAYS);
}

/**
 * Gets the maximum allowed delivery date.
 * @param fromDate - The starting date (defaults to current date)
 * @returns The latest date delivery can be scheduled
 */
export function getMaxDeliveryDate(fromDate?: Date): Date {
  const baseDate = fromDate || new Date();
  const maxDate = new Date(baseDate);
  maxDate.setDate(maxDate.getDate() + MAX_DELIVERY_DAYS);
  return maxDate;
}

/**
 * Validates if a delivery date is within the acceptable range.
 * @param date - The date to validate
 * @param fromDate - The reference date (defaults to current date)
 * @returns true if the date is valid for scheduling delivery
 */
export function isValidDeliveryDate(date: Date, fromDate?: Date): boolean {
  const minDate = getMinDeliveryDate(fromDate);
  const maxDate = getMaxDeliveryDate(fromDate);

  // Normalize to start of day for comparison
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  const normalizedMin = new Date(minDate);
  normalizedMin.setHours(0, 0, 0, 0);

  const normalizedMax = new Date(maxDate);
  normalizedMax.setHours(0, 0, 0, 0);

  return normalizedDate >= normalizedMin && normalizedDate <= normalizedMax;
}

/**
 * Formats a Date object as an ISO date string (YYYY-MM-DD).
 * @param date - The date to format
 * @returns ISO date string
 */
export function formatDeliveryDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parses an ISO date string to a Date object.
 * @param dateString - The date string to parse (YYYY-MM-DD or ISO format)
 * @returns Date object or null if invalid
 */
export function parseDeliveryDate(dateString: string): Date | null {
  if (!dateString || dateString.trim() === '') {
    return null;
  }

  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}
