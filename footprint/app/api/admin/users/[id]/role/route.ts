/**
 * PATCH /api/admin/users/[id]/role
 *
 * Admin endpoint to update a user's admin status.
 * Only accessible by users with admin role.
 * Self-demotion is not allowed.
 *
 * Request body:
 * {
 *   isAdmin: boolean
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   user: {
 *     id: string,
 *     email: string,
 *     isAdmin: boolean,
 *     updatedAt: string
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

interface RoleUpdateRequest {
  isAdmin: boolean;
}

interface UserRoleResponse {
  id: string;
  email: string;
  isAdmin: boolean;
  updatedAt: string;
}

interface SuccessResponse {
  success: boolean;
  user: UserRoleResponse;
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
    let body: RoleUpdateRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    if (typeof body.isAdmin !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid input: isAdmin must be a boolean' },
        { status: 400 }
      );
    }

    // 5. Prevent self-demotion
    if (targetUserId === user.id && body.isAdmin === false) {
      return NextResponse.json(
        { error: 'לא ניתן להסיר הרשאות מעצמך' },
        { status: 400 }
      );
    }

    // 6. Update user role
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: body.isAdmin })
      .eq('id', targetUserId)
      .select('id, email, is_admin, updated_at')
      .single();

    if (updateError) {
      // Check if it's a "not found" error
      if (updateError.message.includes('Row not found') || updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'משתמש לא נמצא' },
          { status: 404 }
        );
      }

      console.error('Role update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      );
    }

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'משתמש לא נמצא' },
        { status: 404 }
      );
    }

    // 7. Log audit entry
    await supabase.from('admin_audit_log').insert({
      actor_id: user.id,
      target_id: targetUserId,
      action: 'role_change',
      details: { isAdmin: body.isAdmin },
      created_at: new Date().toISOString(),
    });

    // 8. Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        isAdmin: updatedUser.is_admin,
        updatedAt: updatedUser.updated_at,
      },
    });

  } catch (error) {
    console.error('Role update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}
