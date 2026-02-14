/**
 * GET /api/admin/users/[id]
 *
 * Admin endpoint to get a single user's full profile with order history and addresses.
 * Only accessible by users with admin role.
 *
 * Response:
 * {
 *   id: string,
 *   email: string,
 *   name: string | null,
 *   phone: string | null,
 *   avatarUrl: string | null,
 *   preferredLanguage: 'he' | 'en',
 *   isAdmin: boolean,
 *   status: string,
 *   orderCount: number,
 *   totalSpent: number,
 *   lastOrderDate: string | null,
 *   createdAt: string,
 *   updatedAt: string,
 *   addresses: Address[],
 *   orders: OrderSummary[]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/auth/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  total: number; // in ILS
  createdAt: string;
}

interface AdminUserDetail {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  preferredLanguage: 'he' | 'en';
  isAdmin: boolean;
  status: string;
  orderCount: number;
  totalSpent: number; // in ILS
  lastOrderDate: string | null;
  createdAt: string;
  updatedAt: string;
  addresses: Address[];
  orders: OrderSummary[];
}

interface ErrorResponse {
  error: string;
}

/**
 * Converts price from agorot (stored in DB) to ILS
 */
function convertFromAgorot(agorot: number): number {
  return Math.round(agorot / 100 * 100) / 100;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<AdminUserDetail | ErrorResponse>> {
  try {
    const { id } = await params;

    // 1. Rate limiting
    const rateLimitResult = await checkRateLimit('general', request);
    if (rateLimitResult) {
      return rateLimitResult as NextResponse<ErrorResponse>;
    }

    // 2. Admin authorization (DB-backed)
    const auth = await verifyAdmin();
    if (!auth.isAuthorized) return auth.error!;

    const supabase = await createClient();

    // 3. Fetch user with related data
    const { data: profile, error: queryError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        name,
        phone,
        avatar_url,
        preferred_language,
        is_admin,
        status,
        created_at,
        updated_at,
        order_count,
        total_spent,
        last_order_date,
        addresses (
          id,
          name,
          street,
          city,
          postal_code,
          is_default
        ),
        orders (
          id,
          order_number,
          status,
          total,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (queryError) {
      // Check if it's a "not found" error
      if (queryError.message.includes('Row not found') || queryError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'משתמש לא נמצא' },
          { status: 404 }
        );
      }

      logger.error('Admin user query error', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'משתמש לא נמצא' },
        { status: 404 }
      );
    }

    // 5. Transform response to camelCase
    const transformedAddresses: Address[] = (profile.addresses || []).map((addr: Record<string, unknown>) => ({
      id: addr.id as string,
      name: addr.name as string,
      street: addr.street as string,
      city: addr.city as string,
      postalCode: addr.postal_code as string,
      isDefault: addr.is_default as boolean,
    }));

    const transformedOrders: OrderSummary[] = (profile.orders || []).map((order: Record<string, unknown>) => ({
      id: order.id as string,
      orderNumber: order.order_number as string,
      status: order.status as string,
      total: convertFromAgorot((order.total as number) || 0),
      createdAt: order.created_at as string,
    }));

    const transformedUser: AdminUserDetail = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      phone: profile.phone,
      avatarUrl: profile.avatar_url,
      preferredLanguage: profile.preferred_language || 'he',
      isAdmin: profile.is_admin,
      status: profile.status || 'active',
      orderCount: profile.order_count || 0,
      totalSpent: convertFromAgorot(profile.total_spent || 0),
      lastOrderDate: profile.last_order_date,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      addresses: transformedAddresses,
      orders: transformedOrders,
    };

    return NextResponse.json(transformedUser);

  } catch (error) {
    logger.error('Admin user error', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
