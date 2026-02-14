/**
 * Admin Authentication Utility
 *
 * Provides helper functions for verifying admin access on protected routes.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * Admin verification result
 */
export interface AdminAuthResult {
  isAuthorized: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: NextResponse<any>;
}

/**
 * Admin email allowlist (optional additional security)
 * When set, only these emails can access admin routes even if they have admin role
 */
const ADMIN_EMAIL_ALLOWLIST = process.env.ADMIN_EMAIL_ALLOWLIST
  ? process.env.ADMIN_EMAIL_ALLOWLIST.split(',').map((e) => e.trim().toLowerCase())
  : null;

/**
 * Verifies if the current user is an admin
 *
 * Checks:
 * 1. User is authenticated
 * 2. User has is_admin=true in profiles table (DB-backed, not client-controllable)
 * 3. (Optional) User email is in the allowlist if configured
 *
 * @returns AdminAuthResult with user data if authorized, or error response if not
 */
export async function verifyAdmin(): Promise<AdminAuthResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Check authentication
    if (authError || !user) {
      return {
        isAuthorized: false,
        error: NextResponse.json(
          { error: 'נדרשת הזדהות' },
          { status: 401 }
        ),
      };
    }

    // Check admin role via DB (profiles.is_admin) — not client-controllable JWT claims
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return {
        isAuthorized: false,
        error: NextResponse.json(
          { error: 'נדרשת הרשאת מנהל' },
          { status: 403 }
        ),
      };
    }

    // Optional: Check email allowlist
    if (ADMIN_EMAIL_ALLOWLIST && user.email) {
      const normalizedEmail = user.email.toLowerCase();
      if (!ADMIN_EMAIL_ALLOWLIST.includes(normalizedEmail)) {
        logger.warn(`Admin access denied for email not in allowlist: ${user.email}`);
        return {
          isAuthorized: false,
          error: NextResponse.json(
            { error: 'נדרשת הרשאת מנהל' },
            { status: 403 }
          ),
        };
      }
    }

    // Success - user is authorized admin
    return {
      isAuthorized: true,
      user: {
        id: user.id,
        email: user.email || '',
        role: 'admin',
      },
    };
  } catch (error) {
    logger.error('Admin verification error', error);
    return {
      isAuthorized: false,
      error: NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Higher-order function to wrap an API handler with admin auth
 *
 * Usage:
 * export const POST = withAdminAuth(async (request, adminUser) => {
 *   // Your handler code - adminUser is guaranteed to be valid
 * });
 */
export function withAdminAuth<T>(
  handler: (
    request: Request,
    adminUser: { id: string; email: string; role: string }
  ) => Promise<NextResponse<T>>
): (request: Request) => Promise<NextResponse<T> | NextResponse> {
  return async (request: Request) => {
    const authResult = await verifyAdmin();

    if (!authResult.isAuthorized || !authResult.user) {
      return authResult.error!;
    }

    return handler(request, authResult.user);
  };
}
