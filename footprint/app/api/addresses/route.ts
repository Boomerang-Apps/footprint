/**
 * Addresses API
 * GET /api/addresses - List user's addresses
 * POST /api/addresses - Create new address
 *
 * Story: BE-05 - Addresses CRUD API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  createAddressSchema,
  toAddressResponse,
  DbAddress,
  AddressResponse,
} from '@/lib/validation/address';
import { logger } from '@/lib/logger';

interface ErrorResponse {
  error: string;
}

interface ListResponse {
  addresses: AddressResponse[];
}

interface CreateResponse {
  success: boolean;
  address: AddressResponse;
}

/**
 * GET /api/addresses
 * Returns list of user's saved addresses
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ListResponse | ErrorResponse>> {
  // Rate limiting
  const rateLimited = await checkRateLimit('general', request);
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

    // Fetch addresses
    const { data: addresses, error: dbError } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    if (dbError) {
      logger.error('Database error fetching addresses', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch addresses' },
        { status: 500 }
      );
    }

    // Convert to camelCase response
    const responseAddresses = (addresses || []).map((addr: DbAddress) =>
      toAddressResponse(addr)
    );

    return NextResponse.json({ addresses: responseAddresses });
  } catch (error) {
    logger.error('GET /api/addresses error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/addresses
 * Creates a new address
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<CreateResponse | ErrorResponse>> {
  // Rate limiting
  const rateLimited = await checkRateLimit('general', request);
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
    const parseResult = createAddressSchema.safeParse(body);
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

    // Check if user has existing addresses
    const { data: existingAddresses } = await supabase
      .from('addresses')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    // First address should be default
    const isFirstAddress = !existingAddresses || existingAddresses.length === 0;

    // Insert address
    const { data: newAddress, error: insertError } = await supabase
      .from('addresses')
      .insert({
        user_id: user.id,
        name: validatedData.name,
        street: validatedData.street,
        apartment: validatedData.apartment || null,
        city: validatedData.city,
        postal_code: validatedData.postalCode,
        country: validatedData.country || 'Israel',
        phone: validatedData.phone || null,
        is_default: isFirstAddress,
      })
      .select()
      .single();

    if (insertError || !newAddress) {
      logger.error('Database error creating address', insertError);
      return NextResponse.json(
        { error: 'Failed to create address' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        address: toAddressResponse(newAddress as DbAddress),
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('POST /api/addresses error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
