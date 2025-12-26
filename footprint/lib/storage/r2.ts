import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Storage folder types for organizing images
 */
export type StorageFolder = 'uploads' | 'transformed' | 'print-ready' | 'thumbnails';

/**
 * Error codes for R2 storage operations
 */
export type R2StorageErrorCode =
  | 'UPLOAD_FAILED'
  | 'DOWNLOAD_FAILED'
  | 'DELETE_FAILED'
  | 'PRESIGN_FAILED'
  | 'MISSING_CONFIG';

/**
 * Custom error class for R2 storage errors
 */
export class R2StorageError extends Error {
  public readonly code?: R2StorageErrorCode;
  public readonly cause?: Error;

  constructor(message: string, code?: R2StorageErrorCode, cause?: Error) {
    super(message);
    this.name = 'R2StorageError';
    this.code = code;
    this.cause = cause;
  }
}

/**
 * Result of presigned URL generation
 */
export interface PresignedUrlResult {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
}

/**
 * Result of direct R2 upload
 */
export interface R2UploadResult {
  key: string;
  publicUrl: string;
  size: number;
}

/**
 * Gets R2 configuration from environment variables
 */
function getR2Config(): {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
} {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    throw new R2StorageError(
      'Missing R2 configuration. Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL',
      'MISSING_CONFIG'
    );
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName, publicUrl };
}

/**
 * Creates an S3 client configured for Cloudflare R2
 */
function createR2Client(): S3Client {
  const config = getR2Config();

  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

/**
 * Generates a unique storage key for an image
 *
 * Format: {folder}/{userId}/{timestamp}-{uuid}.{ext}
 *
 * @param userId - The user or order ID
 * @param fileName - Original file name
 * @param folder - Storage folder type
 * @returns Unique storage key
 */
export function generateImageKey(
  userId: string,
  fileName: string,
  folder: StorageFolder
): string {
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';

  return `${folder}/${userId}/${timestamp}-${uuid}.${ext}`;
}

/**
 * Generates a presigned URL for direct browser upload to R2
 *
 * @param userId - The user ID for path organization
 * @param fileName - Original file name
 * @param contentType - MIME type of the file
 * @param folder - Storage folder (default: 'uploads')
 * @returns Presigned URL result with upload URL and public URL
 */
export async function getUploadUrl(
  userId: string,
  fileName: string,
  contentType: string,
  folder: StorageFolder = 'uploads'
): Promise<PresignedUrlResult> {
  const config = getR2Config();
  const client = createR2Client();

  const key = generateImageKey(userId, fileName, folder);
  const expiresIn = 3600; // 1 hour

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    ContentType: contentType,
  });

  try {
    const uploadUrl = await getSignedUrl(client, command, { expiresIn });

    return {
      uploadUrl,
      key,
      publicUrl: `${config.publicUrl}/${key}`,
      expiresIn,
    };
  } catch (error) {
    throw new R2StorageError(
      'Failed to generate presigned upload URL',
      'PRESIGN_FAILED',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Generates a presigned URL for downloading a file from R2
 *
 * @param key - The storage key of the file
 * @param expiresIn - URL expiration time in seconds (default: 3600)
 * @returns Presigned download URL
 */
export async function getDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const config = getR2Config();
  const client = createR2Client();

  const command = new GetObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });

  try {
    return await getSignedUrl(client, command, { expiresIn });
  } catch (error) {
    throw new R2StorageError(
      'Failed to generate presigned download URL',
      'PRESIGN_FAILED',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Uploads a buffer directly to R2 from the server
 *
 * Use this for server-side operations like image optimization.
 * For client uploads, use getUploadUrl() for presigned URLs.
 *
 * @param buffer - The file buffer to upload
 * @param userId - The user ID for path organization
 * @param fileName - Original file name
 * @param contentType - MIME type of the file
 * @param folder - Storage folder (default: 'uploads')
 * @returns Upload result with key and public URL
 */
export async function uploadToR2(
  buffer: Buffer,
  userId: string,
  fileName: string,
  contentType: string,
  folder: StorageFolder = 'uploads'
): Promise<R2UploadResult> {
  const config = getR2Config();
  const client = createR2Client();

  const key = generateImageKey(userId, fileName, folder);

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  try {
    await client.send(command);

    return {
      key,
      publicUrl: `${config.publicUrl}/${key}`,
      size: buffer.length,
    };
  } catch (error) {
    throw new R2StorageError(
      'Failed to upload file to R2',
      'UPLOAD_FAILED',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Deletes a file from R2
 *
 * @param key - The storage key of the file to delete
 */
export async function deleteFromR2(key: string): Promise<void> {
  const config = getR2Config();
  const client = createR2Client();

  const command = new DeleteObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });

  try {
    await client.send(command);
  } catch (error) {
    throw new R2StorageError(
      'Failed to delete file from R2',
      'DELETE_FAILED',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Constructs the public URL for an R2 object
 *
 * @param key - The storage key
 * @returns Public URL for the object
 */
export function getPublicUrl(key: string): string {
  const config = getR2Config();
  return `${config.publicUrl}/${key}`;
}

/**
 * Checks if a URL is an R2 storage URL
 *
 * @param url - URL to check
 * @returns true if the URL points to R2 storage
 */
export function isR2Url(url: string): boolean {
  try {
    const config = getR2Config();
    return url.startsWith(config.publicUrl);
  } catch {
    // If config is missing, check for common R2 patterns
    return url.includes('.r2.') || url.includes('r2.cloudflarestorage.com');
  }
}

/**
 * Extracts the storage key from an R2 public URL
 *
 * @param url - The public R2 URL
 * @returns The storage key
 * @throws Error if URL is not a valid R2 URL
 */
export function extractKeyFromUrl(url: string): string {
  try {
    const config = getR2Config();
    if (!url.startsWith(config.publicUrl)) {
      throw new Error('URL is not a valid R2 URL');
    }
    return url.substring(config.publicUrl.length + 1); // +1 for the /
  } catch (error) {
    if (error instanceof R2StorageError && error.code === 'MISSING_CONFIG') {
      // Try to extract key without config (for testing)
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1); // Remove leading /
    }
    throw error;
  }
}

/**
 * Downloads an image from R2 storage and returns it as a buffer
 *
 * @param url - The public R2 URL or storage key
 * @returns Image buffer
 * @throws R2StorageError if download fails
 */
export async function getImageFromR2(url: string): Promise<Buffer> {
  const config = getR2Config();
  const client = createR2Client();

  // Determine if input is a full URL or just a key
  let key: string;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    key = extractKeyFromUrl(url);
  } else {
    key = url;
  }

  const command = new GetObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });

  try {
    const response = await client.send(command);

    if (!response.Body) {
      throw new Error('Empty response body');
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const stream = response.Body as AsyncIterable<Uint8Array>;

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error) {
    throw new R2StorageError(
      `Failed to download image from R2: ${key}`,
      'DOWNLOAD_FAILED',
      error instanceof Error ? error : undefined
    );
  }
}
