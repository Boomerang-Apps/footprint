/**
 * Zod validation schemas for User Profile API
 * Story: BE-04 - User Profile API
 */

import { z } from 'zod';

/**
 * Israeli phone number regex
 * Accepts formats: 050-1234567, 0501234567, 052-1234567, etc.
 */
const israeliPhoneRegex = /^0[2-9]\d{1}-?\d{7}$/;

/**
 * Schema for updating user profile (PUT /api/profile)
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  phone: z
    .string()
    .regex(israeliPhoneRegex, 'Invalid phone format. Use Israeli format (e.g., 050-1234567)')
    .optional()
    .nullable(),
  preferredLanguage: z
    .enum(['he', 'en'], {
      errorMap: () => ({ message: 'Language must be either "he" or "en"' }),
    })
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Allowed MIME types for avatar upload
 */
export const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/**
 * Maximum avatar file size in bytes (2MB)
 */
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

/**
 * Validates avatar file type
 */
export function isValidAvatarType(mimeType: string): boolean {
  return ALLOWED_AVATAR_TYPES.includes(mimeType as (typeof ALLOWED_AVATAR_TYPES)[number]);
}

/**
 * Validates avatar file size
 */
export function isValidAvatarSize(size: number): boolean {
  return size <= MAX_AVATAR_SIZE;
}

/**
 * Profile response shape (camelCase for API responses)
 */
export interface ProfileResponse {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  preferredLanguage: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Database profile shape (snake_case)
 */
export interface DbProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  preferred_language: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Converts database profile (snake_case) to API response (camelCase)
 */
export function toProfileResponse(dbProfile: DbProfile): ProfileResponse {
  return {
    id: dbProfile.id,
    email: dbProfile.email,
    name: dbProfile.name,
    phone: dbProfile.phone,
    avatarUrl: dbProfile.avatar_url,
    preferredLanguage: dbProfile.preferred_language,
    isAdmin: dbProfile.is_admin,
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at,
  };
}
