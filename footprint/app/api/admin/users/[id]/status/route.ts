/**
 * PATCH /api/admin/users/[id]/status
 *
 * Admin endpoint to update a user's account status (active/inactive).
 * Only accessible by users with admin role.
 * Self-deactivation is not allowed.
 * Deactivating a user invalidates all their sessions.
 *
 * Request body:
 * {
 *   status: 'active' | 'inactive' | 'suspended'
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   user: {
 *     id: string,
 *     email: string,
 *     status: string,
 *     updatedAt: string
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

// Valid status values
const VALID_STATUSES = ['active', 'inactive', 'suspended'];

interface StatusUpdateRequest {
  status: string;
}

interface UserStatusResponse {
  id: string;
  email: string;
  status: string;
  updatedAt: string;
}

interface SuccessResponse {
  success: boolean;
  user: UserStatusResponse;
}

interface ErrorResponse {
  error: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const { id: targetUserId } = await params;

    // 1. Rate limiting (stricter for admin actions)
    const rateLimitResult = await checkRateLimit('strict', request);
    if (rateLimitResult) {
      return rateLimitResult as NextResponse<ErrorResponse>;
    }

    // 2. Authentication check
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

    // 3. Admin authorization check
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // 4. Parse and validate request body
    let body: StatusUpdateRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // 5. Prevent self-deactivation
    if (targetUserId === user.id && body.status !== 'active') {
      return NextResponse.json(
        { error: 'לא ניתן להשבית את החשבון שלך' },
        { status: 400 }
      );
    }

    // 6. Update user status
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({ status: body.status })
      .eq('id', targetUserId)
      .select('id, email, status, updated_at')
      .single();

    if (updateError) {
      // Check if it's a "not found" error
      if (updateError.message.includes('Row not found') || updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'משתמש לא נמצא' },
          { status: 404 }
        );
      }

      logger.error('Status update error', updateError);
      return NextResponse.json(
        { error: 'Failed to update user status' },
        { status: 500 }
      );
    }

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'משתמש לא נמצא' },
        { status: 404 }
      );
    }

    // 7. If deactivating, invalidate user's sessions
    if (body.status === 'inactive' || body.status === 'suspended') {
      try {
        const adminClient = createAdminClient();
        await adminClient.auth.admin.signOut(targetUserId, 'global');
      } catch (signOutError) {
        // Log but don't fail the request
        logger.error('Failed to invalidate user sessions', signOutError);
      }
    }

    // 8. Log audit entry
    await supabase.from('admin_audit_log').insert({
      actor_id: user.id,
      target_id: targetUserId,
      action: 'status_change',
      details: { status: body.status },
      created_at: new Date().toISOString(),
    });

    // 9. Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        status: updatedUser.status,
        updatedAt: updatedUser.updated_at,
      },
    });

  } catch (error) {
    logger.error('Status update error', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}
