import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    let validatedQuery;
    try {
      validatedQuery = StylesQuerySchema.parse(queryParams);
    } catch (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: validationError instanceof z.ZodError 
            ? validationError.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
            : 'Unknown validation error',
        },
        { status: 400 }
      );
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
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch styles',
          details: error.message,
        },
        { status: 500 }
      );
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

    return NextResponse.json(
      {
        success: true,
        data: validatedStyles,
        message: 'Styles retrieved successfully',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
