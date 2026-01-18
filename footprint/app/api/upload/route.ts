import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUploadUrl, uploadToSupabase } from '@/lib/storage/supabase-storage';
import {
  validateImage,
  optimizeForPrint,
  convertToJpeg,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
} from '@/lib/image/optimize';

/**
 * Request body for presigned URL mode
 */
interface PresignedUrlRequest {
  mode: 'presigned';
  fileName: string;
  contentType: string;
  fileSize: number;
}

/**
 * Validates the presigned URL request body
 */
function validatePresignedRequest(body: unknown): body is PresignedUrlRequest {
  if (typeof body !== 'object' || body === null) return false;

  const req = body as Record<string, unknown>;
  return (
    req.mode === 'presigned' &&
    typeof req.fileName === 'string' &&
    typeof req.contentType === 'string' &&
    typeof req.fileSize === 'number'
  );
}

/**
 * POST /api/upload
 *
 * Handles image uploads in two modes:
 *
 * 1. Presigned URL mode (mode: 'presigned')
 *    - Returns a presigned URL for direct browser upload to R2
 *    - Request body: { mode: 'presigned', fileName, contentType, fileSize }
 *
 * 2. Direct upload mode (mode: 'direct')
 *    - Receives the image file directly via FormData
 *    - Optimizes the image for print and uploads to R2
 *    - FormData: file, mode: 'direct', optimize?: 'true'
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // Authenticate user
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const contentType = request.headers.get('content-type') || '';

    // Handle presigned URL mode (JSON body)
    if (contentType.includes('application/json')) {
      return handlePresignedMode(request, user.id);
    }

    // Handle direct upload mode (FormData)
    if (contentType.includes('multipart/form-data')) {
      return handleDirectMode(request, user.id);
    }

    return NextResponse.json(
      { error: 'Invalid content type. Use application/json or multipart/form-data' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handles presigned URL generation for client-side uploads
 */
async function handlePresignedMode(
  request: Request,
  userId: string
): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  if (!validatePresignedRequest(body)) {
    return NextResponse.json(
      { error: 'Missing required fields: fileName, contentType, fileSize' },
      { status: 400 }
    );
  }

  const { fileName, contentType, fileSize } = body;

  // Validate file size
  if (fileSize > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
      { status: 400 }
    );
  }

  // Validate content type
  const normalizedType = contentType.toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(normalizedType as typeof ALLOWED_MIME_TYPES[number])) {
    return NextResponse.json(
      { error: `Unsupported file type: ${contentType}. Allowed: JPEG, PNG, HEIC, WebP` },
      { status: 400 }
    );
  }

  try {
    const result = await getUploadUrl(userId, fileName, contentType);

    return NextResponse.json({
      uploadUrl: result.uploadUrl,
      publicUrl: result.publicUrl,
      key: result.key,
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    console.error('Presigned URL error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

/**
 * Handles direct file upload with server-side optimization
 */
async function handleDirectMode(
  request: Request,
  userId: string
): Promise<Response> {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Invalid form data' },
      { status: 400 }
    );
  }

  const file = formData.get('file');
  const shouldOptimize = formData.get('optimize') === 'true';

  // Check if file is a Blob-like object (has arrayBuffer method)
  const isBlob = file && typeof file === 'object' && 'arrayBuffer' in file && typeof (file as Blob).arrayBuffer === 'function';
  if (!isBlob) {
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400 }
    );
  }

  const blobFile = file as Blob;

  // Get file name from FormData or use default
  const fileName = 'name' in blobFile ? (blobFile as File).name : 'image.jpg';
  const contentType = blobFile.type || 'image/jpeg';

  // Read file buffer
  const arrayBuffer = await file.arrayBuffer();
  let buffer: Buffer = Buffer.from(arrayBuffer);

  // Validate image
  const validation = await validateImage(buffer, contentType);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error || 'Invalid image' },
      { status: 400 }
    );
  }

  // Convert HEIC to JPEG
  if (contentType.toLowerCase() === 'image/heic') {
    buffer = await convertToJpeg(buffer);
  }

  // Optimize for print if requested
  if (shouldOptimize) {
    buffer = await optimizeForPrint(buffer);
  }

  try {
    // Determine final content type and filename
    const finalContentType =
      contentType.toLowerCase() === 'image/heic' ? 'image/jpeg' : contentType;
    const finalFileName =
      contentType.toLowerCase() === 'image/heic'
        ? fileName.replace(/\.heic$/i, '.jpg')
        : fileName;

    const result = await uploadToSupabase(
      buffer,
      userId,
      finalFileName,
      finalContentType
    );

    return NextResponse.json({
      publicUrl: result.publicUrl,
      key: result.key,
      size: result.size,
    });
  } catch (error) {
    console.error('Direct upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
