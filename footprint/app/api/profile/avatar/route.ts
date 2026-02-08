/**
 * Avatar Upload API
 * POST /api/profile/avatar - Upload user avatar image
 *
 * Story: BE-04 - User Profile API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { uploadToR2 } from '@/lib/storage/r2';
import {
  isValidAvatarType,
  isValidAvatarSize,
  ALLOWED_AVATAR_TYPES,
  MAX_AVATAR_SIZE,
} from '@/lib/validation/profile';
import { logger } from '@/lib/logger';

interface SuccessResponse {
  avatarUrl: string;
}

interface ErrorResponse {
  error: string;
}

/**
 * POST /api/profile/avatar
 * Uploads a new avatar image for the current user
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  // Rate limiting (use upload rate limit for file uploads)
  const rateLimited = await checkRateLimit('upload', request);
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

    // Parse form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }

    // Get avatar file
    const avatarFile = formData.get('avatar');
    // Use duck typing to check for Blob-like object (has type, size, and arrayBuffer)
    const isBlob =
      avatarFile &&
      typeof avatarFile === 'object' &&
      'type' in avatarFile &&
      'size' in avatarFile &&
      'arrayBuffer' in avatarFile;
    if (!isBlob) {
      return NextResponse.json(
        { error: 'No avatar file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidAvatarType(avatarFile.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types: ${ALLOWED_AVATAR_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (!isValidAvatarSize(avatarFile.size)) {
      const maxMB = MAX_AVATAR_SIZE / (1024 * 1024);
      return NextResponse.json(
        { error: `File size exceeds ${maxMB}MB limit` },
        { status: 400 }
      );
    }

    // Convert blob to buffer
    const arrayBuffer = await avatarFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine file extension from mime type
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    const ext = extMap[avatarFile.type] || 'jpg';
    const fileName = `avatar.${ext}`;

    // Upload to R2 storage
    const uploadResult = await uploadToR2(
      buffer,
      user.id,
      fileName,
      avatarFile.type,
      'uploads' // Store avatars in uploads folder
    );

    // Update profile with new avatar URL
    const { error: dbError } = await supabase
      .from('profiles')
      .update({ avatar_url: uploadResult.publicUrl })
      .eq('id', user.id);

    if (dbError) {
      logger.error('Database error updating avatar', dbError);
      return NextResponse.json(
        { error: 'Failed to update profile with new avatar' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      avatarUrl: uploadResult.publicUrl,
    });
  } catch (error) {
    logger.error('POST /api/profile/avatar error', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}
