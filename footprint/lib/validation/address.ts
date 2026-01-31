/**
 * Zod validation schemas for Addresses API
 * Story: BE-05 - Addresses CRUD API
 */

import { z } from 'zod';

/**
 * Israeli postal code regex (7 digits)
 */
const postalCodeRegex = /^\d{7}$/;

/**
 * Israeli phone number regex
 * Accepts formats: 050-1234567, 0501234567, 052-1234567, etc.
 */
const israeliPhoneRegex = /^0[2-9]\d{1}-?\d{7}$/;

/**
 * Schema for creating a new address (POST /api/addresses)
 */
export const createAddressSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),
  street: z
    .string()
    .min(1, 'Street is required')
    .max(200, 'Street must be at most 200 characters'),
  apartment: z
    .string()
    .max(50, 'Apartment must be at most 50 characters')
    .optional()
    .nullable(),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be at most 100 characters'),
  postalCode: z
    .string()
    .regex(postalCodeRegex, 'Postal code must be 7 digits'),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country must be at most 100 characters')
    .default('Israel'),
  phone: z
    .string()
    .regex(israeliPhoneRegex, 'Invalid phone format. Use Israeli format (e.g., 050-1234567)')
    .optional()
    .nullable(),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;

/**
 * Schema for updating an address (PUT /api/addresses/[id])
 */
export const updateAddressSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  street: z
    .string()
    .min(1, 'Street is required')
    .max(200, 'Street must be at most 200 characters')
    .optional(),
  apartment: z
    .string()
    .max(50, 'Apartment must be at most 50 characters')
    .optional()
    .nullable(),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be at most 100 characters')
    .optional(),
  postalCode: z
    .string()
    .regex(postalCodeRegex, 'Postal code must be 7 digits')
    .optional(),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country must be at most 100 characters')
    .optional(),
  phone: z
    .string()
    .regex(israeliPhoneRegex, 'Invalid phone format. Use Israeli format (e.g., 050-1234567)')
    .optional()
    .nullable(),
});

export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

/**
 * Address response shape (camelCase for API responses)
 */
export interface AddressResponse {
  id: string;
  name: string;
  street: string;
  apartment: string | null;
  city: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Database address shape (snake_case)
 */
export interface DbAddress {
  id: string;
  user_id: string;
  name: string;
  street: string;
  apartment: string | null;
  city: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Converts database address (snake_case) to API response (camelCase)
 */
export function toAddressResponse(dbAddress: DbAddress): AddressResponse {
  return {
    id: dbAddress.id,
    name: dbAddress.name,
    street: dbAddress.street,
    apartment: dbAddress.apartment,
    city: dbAddress.city,
    postalCode: dbAddress.postal_code,
    country: dbAddress.country,
    phone: dbAddress.phone,
    isDefault: dbAddress.is_default,
    createdAt: dbAddress.created_at,
    updatedAt: dbAddress.updated_at,
  };
}
