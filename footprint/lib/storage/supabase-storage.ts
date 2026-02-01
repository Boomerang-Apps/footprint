import { createClient } from '@supabase/supabase-js';

/**
 * Storage folder types for organizing images
 */
export type StorageFolder = 'uploads' | 'transformed' | 'print-ready' | 'thumbnails' | 'bulk-downloads';

/**
 * Result of Supabase storage upload
 */
export interface SupabaseUploadResult {
  key: string;
  publicUrl: string;
  size: number;
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

// Bucket name for image storage
const BUCKET_NAME = 'images';

/**
 * Creates a Supabase client for storage operations
 */
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(url, key);
}

/**
 * Generates a unique storage key for an image
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
 * Uploads a buffer directly to Supabase Storage
 */
export async function uploadToSupabase(
  buffer: Buffer,
  userId: string,
  fileName: string,
  contentType: string,
  folder: StorageFolder = 'uploads'
): Promise<SupabaseUploadResult> {
  const supabase = getSupabaseClient();
  const key = generateImageKey(userId, fileName, folder);

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(key, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(key);

  return {
    key: data.path,
    publicUrl: urlData.publicUrl,
    size: buffer.length,
  };
}

/**
 * Generates a presigned URL for direct browser upload
 */
export async function getUploadUrl(
  userId: string,
  fileName: string,
  contentType: string,
  folder: StorageFolder = 'uploads'
): Promise<PresignedUrlResult> {
  const supabase = getSupabaseClient();
  const key = generateImageKey(userId, fileName, folder);
  const expiresIn = 3600; // 1 hour

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUploadUrl(key);

  if (error) {
    throw new Error(`Failed to create upload URL: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(key);

  return {
    uploadUrl: data.signedUrl,
    key,
    publicUrl: urlData.publicUrl,
    expiresIn,
  };
}

/**
 * Deletes a file from Supabase Storage
 */
export async function deleteFromSupabase(key: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([key]);

  if (error) {
    throw new Error(`Failed to delete from Supabase: ${error.message}`);
  }
}

/**
 * Gets public URL for a storage key
 */
export function getPublicUrl(key: string): string {
  const supabase = getSupabaseClient();
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(key);

  return data.publicUrl;
}

/**
 * Downloads an image from Supabase Storage
 */
export async function getImageFromSupabase(key: string): Promise<Buffer> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(key);

  if (error) {
    throw new Error(`Failed to download from Supabase: ${error.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
