/**
 * Discount System
 *
 * Validates and applies discount codes to orders.
 * Supports percentage and fixed amount discounts.
 */

export type DiscountType = 'percentage' | 'fixed';

export interface DiscountCode {
  code: string;
  type: DiscountType;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  expiresAt?: Date;
}

export interface ValidateDiscountResult {
  valid: boolean;
  code?: DiscountCode;
  error?: string;
}

export interface ApplyDiscountResult {
  valid: boolean;
  originalSubtotal: number;
  discount: number;
  newSubtotal: number;
  code?: DiscountCode;
  error?: string;
}

/**
 * Available discount codes
 * In production, these would come from a database
 */
const DISCOUNT_CODES: Record<string, DiscountCode> = {
  SAVE10: {
    code: 'SAVE10',
    type: 'percentage',
    value: 10,
  },
  SAVE20: {
    code: 'SAVE20',
    type: 'percentage',
    value: 20,
  },
  FLAT20: {
    code: 'FLAT20',
    type: 'fixed',
    value: 20,
  },
  FLAT50: {
    code: 'FLAT50',
    type: 'fixed',
    value: 50,
  },
  VIP25: {
    code: 'VIP25',
    type: 'percentage',
    value: 25,
    minPurchase: 200,
  },
  WELCOME: {
    code: 'WELCOME',
    type: 'percentage',
    value: 15,
  },
  EXPIRED50: {
    code: 'EXPIRED50',
    type: 'percentage',
    value: 50,
    expiresAt: new Date('2025-01-01'),
  },
};

/**
 * Check if a discount code has expired
 */
export function isDiscountCodeExpired(code: DiscountCode): boolean {
  if (!code.expiresAt) {
    return false;
  }
  return new Date() > code.expiresAt;
}

/**
 * Validate a discount code
 *
 * @param codeInput - The discount code string to validate
 * @returns Validation result with code details if valid
 */
export function validateDiscountCode(codeInput: string): ValidateDiscountResult {
  const trimmedCode = codeInput.trim();

  if (!trimmedCode) {
    return {
      valid: false,
      error: 'Discount code is required',
    };
  }

  const normalizedCode = trimmedCode.toUpperCase();
  const discountCode = DISCOUNT_CODES[normalizedCode];

  if (!discountCode) {
    return {
      valid: false,
      error: 'Invalid discount code',
    };
  }

  if (isDiscountCodeExpired(discountCode)) {
    return {
      valid: false,
      error: 'Discount code has expired',
    };
  }

  return {
    valid: true,
    code: discountCode,
  };
}

/**
 * Calculate the discount value for a given code and subtotal
 *
 * @param code - The discount code
 * @param subtotal - The order subtotal
 * @returns The discount amount
 */
export function getDiscountValue(code: DiscountCode, subtotal: number): number {
  let discount: number;

  if (code.type === 'percentage') {
    discount = Math.round((subtotal * code.value) / 100);

    // Apply max discount cap if specified
    if (code.maxDiscount !== undefined && discount > code.maxDiscount) {
      discount = code.maxDiscount;
    }
  } else {
    // Fixed discount
    discount = code.value;
  }

  // Discount cannot exceed subtotal
  return Math.min(discount, subtotal);
}

/**
 * Apply a discount code to an order subtotal
 *
 * @param codeInput - The discount code string
 * @param subtotal - The order subtotal
 * @returns Result with discount amount and new subtotal
 */
export function applyDiscount(codeInput: string, subtotal: number): ApplyDiscountResult {
  const validation = validateDiscountCode(codeInput);

  if (!validation.valid || !validation.code) {
    return {
      valid: false,
      originalSubtotal: subtotal,
      discount: 0,
      newSubtotal: subtotal,
      error: validation.error,
    };
  }

  const code = validation.code;

  // Check minimum purchase requirement
  if (code.minPurchase !== undefined && subtotal < code.minPurchase) {
    return {
      valid: false,
      originalSubtotal: subtotal,
      discount: 0,
      newSubtotal: subtotal,
      error: `Minimum purchase of ${code.minPurchase} ILS required`,
    };
  }

  const discount = getDiscountValue(code, subtotal);
  const newSubtotal = subtotal - discount;

  return {
    valid: true,
    originalSubtotal: subtotal,
    discount,
    newSubtotal,
    code,
  };
}
