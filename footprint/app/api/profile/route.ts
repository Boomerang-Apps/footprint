/**
 * User Profile API
 * GET /api/profile - Get current user's profile
 * PUT /api/profile - Update current user's profile
 *
 * Story: BE-04 - User Profile API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  updateProfileSchema,
  toProfileResponse,
  DbProfile,
  ProfileResponse,
} from '@/lib/validation/profile';
import { logger } from '@/lib/logger';

interface ErrorResponse {
  error: string;
}

interface UpdateSuccessResponse {
  success: boolean;
  profile: ProfileResponse;
}

/**
 * GET /api/profile
 * Returns the current user's profile data
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ProfileResponse | ErrorResponse>> {
  // Rate limiting
  const rateLimited = await checkRateLimit('general', request);
  if (rateLimited) return rateLimited as NextResponse<ErrorResponse>;

  try {
    // Authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Fetch profile from database
    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError) {
      logger.error('Database error fetching profile', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // Convert to camelCase response
    return NextResponse.json(toProfileResponse(profile as DbProfile));
  } catch (error) {
    logger.error('GET /api/profile error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Updates the current user's profile
 */
export async function PUT(
  request: NextRequest
): Promise<NextResponse<UpdateSuccessResponse | ErrorResponse>> {
  // Rate limiting
  const rateLimited = await checkRateLimit('general', request);
  if (rateLimited) return rateLimited as NextResponse<ErrorResponse>;

  try {
    // Authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate with Zod schema
    const parseResult = updateProfileSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors
        .map((e) => e.message)
        .join(', ');
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    const validatedData = parseResult.data;

    // Convert camelCase to snake_case for database
    const updateData: Record<string, unknown> = {};
    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
    }
    if (validatedData.phone !== undefined) {
      updateData.phone = validatedData.phone;
    }
    if (validatedData.preferredLanguage !== undefined) {
      updateData.preferred_language = validatedData.preferredLanguage;
    }

    // Update profile in database
    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (dbError) {
      logger.error('Database error updating profile', dbError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: toProfileResponse(profile as DbProfile),
    });
  } catch (error) {
    logger.error('PUT /api/profile error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
