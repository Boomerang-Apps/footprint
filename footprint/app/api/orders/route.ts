/**
 * Orders API
 *
 * GET /api/orders - List authenticated user's orders with optional status filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateTrackingUrl } from '@/lib/orders/tracking';
import { getStatusLabel } from '@/lib/orders/status';
import type { OrderStatus } from '@/types/order';

interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  total: number;
  itemCount: number;
  createdAt: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  carrier: string | null;
}

interface OrdersListResponse {
  orders: OrderListItem[];
  total: number;
}

interface ErrorResponse {
  error: string;
}

/**
 * GET /api/orders
 *
 * Returns list of authenticated user's orders with optional status filtering.
 * Orders are sorted by createdAt descending (newest first).
 * Includes tracking information when available.
 *
 * Query Parameters:
 * - status: Filter orders by status (optional)
 *
 * Response Format:
 * - orders: Array of order objects with basic info
 * - total: Number of orders returned
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<OrdersListResponse | ErrorResponse>> {
  try {
    // 1. Rate limiting
    const rateLimitResult = await checkRateLimit('general', request);
    if (rateLimitResult) {
      return rateLimitResult;
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

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    // 4. Validate status filter if provided
    const validStatuses: OrderStatus[] = [
      'pending',
      'paid',
      'processing',
      'printing',
      'shipped',
      'delivered',
      'cancelled',
    ];

    if (statusFilter && !validStatuses.includes(statusFilter as OrderStatus)) {
      return NextResponse.json(
        { error: `Invalid status filter. Valid options: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // 5. Build query
    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total,
        created_at,
        tracking_number,
        carrier,
        order_items(count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply status filter if provided
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    // 6. Execute query
    const { data: orders, error: queryError } = await query;

    if (queryError) {
      console.error('Orders query error:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    if (!orders) {
      return NextResponse.json({
        orders: [],
        total: 0,
      });
    }

    // 7. Transform response data
    const ordersList: OrderListItem[] = orders.map((order) => {
      const trackingUrl = order.tracking_number && order.carrier
        ? generateTrackingUrl(order.tracking_number, order.carrier)
        : null;

      return {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status as OrderStatus,
        statusLabel: getStatusLabel(order.status as OrderStatus, 'en'),
        total: order.total,
        itemCount: Array.isArray(order.order_items) ? order.order_items.length : 0,
        createdAt: order.created_at,
        trackingNumber: order.tracking_number,
        trackingUrl,
        carrier: order.carrier,
      };
    });

    return NextResponse.json({
      orders: ordersList,
      total: ordersList.length,
    });

  } catch (error) {
    console.error('Orders list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}