/**
 * GET /api/admin/fulfillment/orders
 *
 * Admin endpoint to list orders for fulfillment dashboard.
 * Returns orders grouped by status with statistics.
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50, max: 100)
 * - status: Filter by specific status
 * - startDate: Filter orders created after this date (ISO format)
 * - endDate: Filter orders created before this date (ISO format)
 * - search: Search by order number or customer name/email
 * - size: Filter by product size (A2, A3, A4, A5)
 * - paper: Filter by paper type (matte, glossy, canvas)
 * - frame: Filter by frame type
 *
 * Response:
 * {
 *   orders: FulfillmentOrder[],
 *   grouped: { pending: [], printing: [], ready_to_ship: [], shipped: [] },
 *   stats: { pendingCount, printingCount, readyCount, shippedTodayCount },
 *   total: number,
 *   page: number,
 *   limit: number,
 *   totalPages: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { FULFILLMENT_STATUSES, type FulfillmentStatus } from '@/lib/fulfillment/status-transitions';

interface FulfillmentOrder {
  id: string;
  orderNumber: string;
  status: FulfillmentStatus;
  total: number;
  itemCount: number;
  customerEmail: string | null;
  customerName: string | null;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl: string | null;
  items: Array<{
    id: string;
    size: string;
    paperType: string;
    frameType: string | null;
  }>;
}

interface FulfillmentStats {
  pendingCount: number;
  printingCount: number;
  readyCount: number;
  shippedTodayCount: number;
}

interface FulfillmentOrdersResponse {
  orders: FulfillmentOrder[];
  grouped: Record<FulfillmentStatus, FulfillmentOrder[]>;
  stats: FulfillmentStats;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ErrorResponse {
  error: string;
}

function convertFromAgorot(agorot: number): number {
  return Math.round(agorot / 100 * 100) / 100;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<FulfillmentOrdersResponse | ErrorResponse>> {
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
        { error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      );
    }

    // 3. Admin authorization check
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'נדרשת הרשאת מנהל' },
        { status: 403 }
      );
    }

    // 4. Parse query parameters
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const offset = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const size = searchParams.get('size');
    const paper = searchParams.get('paper');
    const frame = searchParams.get('frame');

    // 5. Build query
    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total,
        created_at,
        updated_at,
        profiles!user_id (
          email,
          name
        ),
        order_items (
          id,
          size,
          paper_type,
          frame_type,
          thumbnail_url
        )
      `, { count: 'exact' });

    // Apply status filter (only fulfillment statuses)
    if (status && FULFILLMENT_STATUSES.includes(status as FulfillmentStatus)) {
      query = query.eq('status', status);
    } else {
      // Default: only show fulfillment-relevant statuses
      query = query.in('status', ['pending', 'printing', 'ready_to_ship', 'shipped']);
    }

    // Date range filter
    if (startDate) {
      query = query.gte('created_at', `${startDate}T00:00:00.000Z`);
    }

    if (endDate) {
      query = query.lte('created_at', `${endDate}T23:59:59.999Z`);
    }

    // Search filter
    if (search) {
      query = query.ilike('order_number', `%${search}%`);
    }

    // Sort by created_at descending
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // 6. Execute query
    const { data: orders, error: queryError, count } = await query;

    if (queryError) {
      logger.error('Fulfillment orders query error', queryError);
      return NextResponse.json(
        { error: 'שגיאת מערכת' },
        { status: 500 }
      );
    }

    // 7. Transform and filter by product attributes if needed
    let transformedOrders: FulfillmentOrder[] = (orders || []).map((order: any) => {
      const items = order.order_items || [];
      return {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status as FulfillmentStatus,
        total: convertFromAgorot(order.total || 0),
        itemCount: items.length,
        customerEmail: order.profiles?.email || null,
        customerName: order.profiles?.name || null,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        thumbnailUrl: items[0]?.thumbnail_url || null,
        items: items.map((item: any) => ({
          id: item.id,
          size: item.size,
          paperType: item.paper_type,
          frameType: item.frame_type,
        })),
      };
    });

    // Filter by product attributes (post-query filtering)
    if (size) {
      transformedOrders = transformedOrders.filter((order) =>
        order.items.some((item) => item.size === size)
      );
    }

    if (paper) {
      transformedOrders = transformedOrders.filter((order) =>
        order.items.some((item) => item.paperType === paper)
      );
    }

    if (frame) {
      transformedOrders = transformedOrders.filter((order) =>
        order.items.some((item) => item.frameType === frame)
      );
    }

    // 8. Group orders by status
    const grouped: Record<FulfillmentStatus, FulfillmentOrder[]> = {
      pending: [],
      printing: [],
      ready_to_ship: [],
      shipped: [],
      delivered: [],
      cancelled: [],
    };

    transformedOrders.forEach((order) => {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      }
    });

    // 9. Calculate stats
    const today = new Date().toISOString().split('T')[0];
    const stats: FulfillmentStats = {
      pendingCount: grouped.pending.length,
      printingCount: grouped.printing.length,
      readyCount: grouped.ready_to_ship.length,
      shippedTodayCount: transformedOrders.filter(
        (o) => o.status === 'shipped' && o.updatedAt.startsWith(today)
      ).length,
    };

    // 10. Return response
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      orders: transformedOrders,
      grouped,
      stats,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    logger.error('Fulfillment orders error', error);
    return NextResponse.json(
      { error: 'שגיאת מערכת' },
      { status: 500 }
    );
  }
}
