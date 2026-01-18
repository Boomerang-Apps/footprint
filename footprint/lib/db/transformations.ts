/**
 * Transformation Tracking Database Service
 *
 * Tracks all AI transformations for:
 * - Cost monitoring ($0.039 per Nano Banana image)
 * - Usage analytics
 * - Audit trail
 * - Caching (avoid duplicate transformations)
 */

import { createClient } from '@/lib/supabase/server';

/**
 * AI Provider type
 */
export type AIProviderType = 'nano-banana' | 'replicate';

/**
 * Transformation status
 */
export type TransformationStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Transformation record structure
 */
export interface Transformation {
  id: string;
  user_id: string;
  original_image_key: string;
  transformed_image_key: string | null;
  style: string;
  provider: AIProviderType;
  status: TransformationStatus;
  tokens_used: number | null;
  estimated_cost: number | null;
  processing_time_ms: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

/**
 * Input for creating a new transformation record
 */
export interface CreateTransformationInput {
  userId: string;
  originalImageKey: string;
  style: string;
  provider: AIProviderType;
}

/**
 * Input for completing a transformation
 */
export interface CompleteTransformationInput {
  transformedImageKey: string;
  tokensUsed?: number;
  estimatedCost?: number;
  processingTimeMs: number;
}

/**
 * Input for failing a transformation
 */
export interface FailTransformationInput {
  errorMessage: string;
  processingTimeMs: number;
}

/**
 * Creates a new transformation record (status: pending)
 */
export async function createTransformation(
  input: CreateTransformationInput
): Promise<Transformation> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transformations')
    .insert({
      user_id: input.userId,
      original_image_key: input.originalImageKey,
      style: input.style,
      provider: input.provider,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create transformation record: ${error.message}`);
  }

  return data as Transformation;
}

/**
 * Updates transformation status to processing
 */
export async function startTransformation(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('transformations')
    .update({ status: 'processing' })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to start transformation: ${error.message}`);
  }
}

/**
 * Completes a transformation successfully
 */
export async function completeTransformation(
  id: string,
  input: CompleteTransformationInput
): Promise<Transformation> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transformations')
    .update({
      status: 'completed',
      transformed_image_key: input.transformedImageKey,
      tokens_used: input.tokensUsed || null,
      estimated_cost: input.estimatedCost || null,
      processing_time_ms: input.processingTimeMs,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to complete transformation: ${error.message}`);
  }

  return data as Transformation;
}

/**
 * Marks a transformation as failed
 */
export async function failTransformation(
  id: string,
  input: FailTransformationInput
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('transformations')
    .update({
      status: 'failed',
      error_message: input.errorMessage,
      processing_time_ms: input.processingTimeMs,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update transformation status: ${error.message}`);
  }
}

/**
 * Gets a transformation by ID
 */
export async function getTransformation(id: string): Promise<Transformation | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transformations')
    .select()
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to get transformation: ${error.message}`);
  }

  return data as Transformation;
}

/**
 * Gets all transformations for a user
 */
export async function getUserTransformations(
  userId: string,
  limit: number = 50
): Promise<Transformation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transformations')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get user transformations: ${error.message}`);
  }

  return data as Transformation[];
}

/**
 * Gets total cost for a user in a date range
 */
export async function getUserCost(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transformations')
    .select('estimated_cost')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (error) {
    throw new Error(`Failed to get user cost: ${error.message}`);
  }

  return data.reduce((sum, t) => sum + (t.estimated_cost || 0), 0);
}

/**
 * Gets transformation statistics
 */
export async function getTransformationStats(
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalTransformations: number;
  successfulTransformations: number;
  failedTransformations: number;
  totalCost: number;
  averageProcessingTime: number;
  byProvider: Record<string, number>;
  byStyle: Record<string, number>;
}> {
  const supabase = await createClient();

  let query = supabase.from('transformations').select('*');

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }
  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get stats: ${error.message}`);
  }

  const transformations = data as Transformation[];
  const completed = transformations.filter((t) => t.status === 'completed');
  const failed = transformations.filter((t) => t.status === 'failed');

  const byProvider: Record<string, number> = {};
  const byStyle: Record<string, number> = {};

  transformations.forEach((t) => {
    byProvider[t.provider] = (byProvider[t.provider] || 0) + 1;
    byStyle[t.style] = (byStyle[t.style] || 0) + 1;
  });

  const totalProcessingTime = completed.reduce(
    (sum, t) => sum + (t.processing_time_ms || 0),
    0
  );

  return {
    totalTransformations: transformations.length,
    successfulTransformations: completed.length,
    failedTransformations: failed.length,
    totalCost: completed.reduce((sum, t) => sum + (t.estimated_cost || 0), 0),
    averageProcessingTime:
      completed.length > 0 ? totalProcessingTime / completed.length : 0,
    byProvider,
    byStyle,
  };
}

/**
 * Checks if a transformation already exists (for caching)
 * Uses original image key + style as cache key
 */
export async function findExistingTransformation(
  originalImageKey: string,
  style: string
): Promise<Transformation | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transformations')
    .select()
    .eq('original_image_key', originalImageKey)
    .eq('style', style)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    // Don't throw for other errors, just return null (cache miss)
    return null;
  }

  return data as Transformation;
}
