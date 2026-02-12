/**
 * GET /api/admin/orders
 *
 * Admin endpoint to list all orders with filtering, sorting, and pagination.
 * Only accessible by users with admin role.
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - status: Filter by order status
 * - from: Filter orders created after this date (ISO format)
 * - to: Filter orders created before this date (ISO format)
 * - search: Search by order number or customer email
 * - sortBy: Sort field (created_at, updated_at, total, status)
 * - sortOrder: Sort direction (asc, desc)
 *
 * Response:
 * {
 *   orders: AdminOrderSummary[],
 *   total: number,
 *   page: number,
 *   limit: number,
 *   totalPages: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import type { OrderStatus } from '@/types/order';
import { logger } from '@/lib/logger';

// Valid order statuses
const VALID_STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'processing',
  'printing',
  'shipped',
  'delivered',
  'cancelled',
];

// Valid sort fields (whitelist for security)
const VALID_SORT_FIELDS = ['created_at', 'updated_at', 'total', 'status', 'order_number'];

interface AdminOrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number; // in ILS
  itemCount: number;
  customerEmail: string | null;
  customerName: string | null;
  createdAt: string;
  updatedAt: string;
  trackingNumber: string | null;
  carrier: string | null;
}

interface AdminOrdersResponse {
  orders: AdminOrderSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
  request: NextRequest
): Promise<NextResponse<AdminOrdersResponse | ErrorResponse>> {
  try {
    // 1. Rate limiting
    const rateLimitResult = await checkRateLimit('general', request);
    if (rateLimitResult) {
      return rateLimitResult as NextResponse<ErrorResponse>;
    }

    // 2. Authentication check
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

    // 3. Admin authorization check
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // 4. Parse query parameters
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status');
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    const search = searchParams.get('search');

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 5. Validate parameters
    if (status && !VALID_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!VALID_SORT_FIELDS.includes(sortBy)) {
      return NextResponse.json(
        { error: `Invalid sort field. Valid values: ${VALID_SORT_FIELDS.join(', ')}` },
        { status: 400 }
      );
    }

    // 6. Build query
    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total,
        tracking_number,
        carrier,
        created_at,
        updated_at,
        profiles!user_id (
          email,
          name
        ),
        order_items (
          id
        )
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (fromDate) {
      // Parse date and set to start of day in UTC
      query = query.gte('created_at', `${fromDate}T00:00:00.000Z`);
    }

    if (toDate) {
      // Parse date and set to end of day in UTC
      query = query.lte('created_at', `${toDate}T23:59:59.999Z`);
    }

    if (search) {
      // Search by order number (case-insensitive)
      query = query.ilike('order_number', `%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // 7. Execute query
    const { data: orders, error: queryError, count } = await query;

    if (queryError) {
      logger.error('Admin orders query error', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // 8. Transform response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedOrders: AdminOrderSummary[] = (orders || []).map((order: any) => ({
      id: order.id,
      orderNumber: order.order_number,
      status: order.status as OrderStatus,
      total: convertFromAgorot(order.total || 0),
      itemCount: order.order_items?.length || 0,
      customerEmail: order.profiles?.email || null,
      customerName: order.profiles?.name || null,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      trackingNumber: order.tracking_number,
      carrier: order.carrier,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      orders: transformedOrders,
      total,
      page,
      limit,
      totalPages,
    });

  } catch (error) {
    logger.error('Admin orders error', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
