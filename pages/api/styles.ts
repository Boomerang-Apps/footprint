import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { StyleSchema, StylesQuerySchema } from '@/types/style';
import { z } from 'zod';

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Parse and validate query parameters
    let validatedQuery;
    try {
      validatedQuery = StylesQuerySchema.parse(req.query);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validationError instanceof z.ZodError 
          ? validationError.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
          : 'Unknown validation error',
      });
    }

    // Initialize Supabase client
    const supabase = getSupabaseClient();

    // Build query
    let query = supabase
      .from('styles')
      .select('id, name, description, created_at')
      .order('name', { ascending: true });

    // Apply filters
    if (validatedQuery.search) {
      query = query.ilike('name', `%${validatedQuery.search}%`);
    }

    // Apply pagination
    if (validatedQuery.limit) {
      query = query.limit(validatedQuery.limit);
    }

    if (validatedQuery.offset) {
      query = query.range(
        validatedQuery.offset,
        validatedQuery.offset + (validatedQuery.limit || 50) - 1
      );
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch styles',
        details: error.message,
      });
    }

    // Validate response data
    const validatedStyles = [];
    if (data) {
      for (const style of data) {
        try {
          const validatedStyle = StyleSchema.parse(style);
          validatedStyles.push(validatedStyle);
        } catch (validationError) {
          console.error('Style validation error:', validationError);
          // Continue processing other styles, but log the error
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: validatedStyles,
      message: 'Styles retrieved successfully',
    });

  } catch (error) {
    console.error('API error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
