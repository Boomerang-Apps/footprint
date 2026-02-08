/**
 * Single Address API
 * GET /api/addresses/[id] - Get address by ID
 * PUT /api/addresses/[id] - Update address
 * DELETE /api/addresses/[id] - Delete address
 *
 * Story: BE-05 - Addresses CRUD API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  updateAddressSchema,
  toAddressResponse,
  DbAddress,
  AddressResponse,
} from '@/lib/validation/address';
import { logger } from '@/lib/logger';

interface ErrorResponse {
  error: string;
}

interface UpdateResponse {
  success: boolean;
  address: AddressResponse;
}

interface DeleteResponse {
  success: boolean;
}

type RouteParams = { params: { id: string } };

/**
 * GET /api/addresses/[id]
 * Returns a single address by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<AddressResponse | ErrorResponse>> {
  // Rate limiting
  const rateLimited = await checkRateLimit('general', request);
  if (rateLimited) return rateLimited as NextResponse<ErrorResponse>;

  try {
    const { id } = params;

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

    // Fetch address
    const { data: address, error: dbError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .single();

    if (dbError || !address) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (address.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(toAddressResponse(address as DbAddress));
  } catch (error) {
    logger.error('GET /api/addresses/[id] error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/addresses/[id]
 * Updates an address
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<UpdateResponse | ErrorResponse>> {
  // Rate limiting
  const rateLimited = await checkRateLimit('general', request);
  if (rateLimited) return rateLimited as NextResponse<ErrorResponse>;

  try {
    const { id } = params;

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

    // Check if address exists and belongs to user
    const { data: existingAddress, error: fetchError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    if (existingAddress.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
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

    // Validate with Zod
    const parseResult = updateAddressSchema.safeParse(body);
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
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.street !== undefined) updateData.street = validatedData.street;
    if (validatedData.apartment !== undefined) updateData.apartment = validatedData.apartment;
    if (validatedData.city !== undefined) updateData.city = validatedData.city;
    if (validatedData.postalCode !== undefined) updateData.postal_code = validatedData.postalCode;
    if (validatedData.country !== undefined) updateData.country = validatedData.country;
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;

    // Update address
    const { data: updatedAddress, error: updateError } = await supabase
      .from('addresses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedAddress) {
      logger.error('Database error updating address', updateError);
      return NextResponse.json(
        { error: 'Failed to update address' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      address: toAddressResponse(updatedAddress as DbAddress),
    });
  } catch (error) {
    logger.error('PUT /api/addresses/[id] error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/addresses/[id]
 * Deletes an address
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<DeleteResponse | ErrorResponse>> {
  // Rate limiting
  const rateLimited = await checkRateLimit('general', request);
  if (rateLimited) return rateLimited as NextResponse<ErrorResponse>;

  try {
    const { id } = params;

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

    // Check if address exists and belongs to user
    const { data: existingAddress, error: fetchError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    if (existingAddress.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if this is default address and there are other addresses
    if (existingAddress.is_default) {
      const { data: otherAddresses } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (otherAddresses && otherAddresses.length > 1) {
        return NextResponse.json(
          { error: 'Cannot delete default address while other addresses exist. Set another address as default first.' },
          { status: 400 }
        );
      }
    }

    // Delete address
    const { error: deleteError } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logger.error('Database error deleting address', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete address' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/addresses/[id] error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
