/**
 * Set Default Address API
 * PATCH /api/addresses/[id]/default - Set address as default
 *
 * Story: BE-05 - Addresses CRUD API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  toAddressResponse,
  DbAddress,
  AddressResponse,
} from '@/lib/validation/address';
import { logger } from '@/lib/logger';

interface ErrorResponse {
  error: string;
}

interface SetDefaultResponse {
  success: boolean;
  address: AddressResponse;
}

type RouteParams = { params: { id: string } };

/**
 * PATCH /api/addresses/[id]/default
 * Sets an address as the default and unsets any previous default
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<SetDefaultResponse | ErrorResponse>> {
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

    // Unset all other addresses as default for this user
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .neq('id', id);

    // Set this address as default
    const { data: updatedAddress, error: updateError } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedAddress) {
      logger.error('Database error setting default address', updateError);
      return NextResponse.json(
        { error: 'Failed to set default address' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      address: toAddressResponse(updatedAddress as DbAddress),
    });
  } catch (error) {
    logger.error('PATCH /api/addresses/[id]/default error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
