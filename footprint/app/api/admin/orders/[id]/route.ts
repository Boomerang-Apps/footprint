/**
 * GET /api/admin/orders/[id]
 *
 * Admin endpoint to get a single order by ID with full details.
 * Only accessible by users with admin role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  // Rate limiting
  const rateLimited = await checkRateLimit('general', request);
  if (rateLimited) return rateLimited;

  try {
    const { id: orderId } = await params;

    // Verify authentication
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

    // Check admin role
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Fetch order with all related data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        fulfillment_status,
        payment_status,
        total,
        subtotal,
        shipping_cost,
        discount_amount,
        discount_code,
        customer_email,
        customer_name,
        customer_phone,
        user_id,
        shipping_address,
        is_gift,
        gift_message,
        notes,
        tracking_number,
        created_at,
        updated_at,
        paid_at,
        shipped_at,
        delivered_at
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Failed to fetch order:', orderError);
      if (orderError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: 500 }
      );
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        product_name,
        style_name,
        size,
        paper_type,
        frame_type,
        quantity,
        price,
        print_file_url,
        thumbnail_url,
        original_image_url,
        transformed_image_url
      `)
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('Failed to fetch order items:', itemsError);
    }

    // Fetch shipments
    const { data: shipments, error: shipmentsError } = await supabase
      .from('shipments')
      .select(`
        id,
        tracking_number,
        carrier,
        status,
        label_url,
        created_at
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (shipmentsError) {
      console.error('Failed to fetch shipments:', shipmentsError);
    }

    // Build response
    const response = {
      id: order.id,
      orderNumber: order.order_number,
      status: order.fulfillment_status || order.status,
      paymentStatus: order.payment_status || 'pending',
      total: order.total,
      subtotal: order.subtotal || order.total,
      shippingCost: order.shipping_cost || 0,
      discountAmount: order.discount_amount || 0,
      discountCode: order.discount_code,
      itemCount: items?.length || 0,
      items: (items || []).map((item) => ({
        id: item.id,
        productName: item.product_name || 'הדפס אמנותי',
        styleName: item.style_name || 'מקורי',
        size: item.size,
        paperType: item.paper_type,
        frameType: item.frame_type,
        quantity: item.quantity,
        price: item.price,
        printFileUrl: item.print_file_url,
        thumbnailUrl: item.thumbnail_url,
        originalImageUrl: item.original_image_url,
        transformedImageUrl: item.transformed_image_url,
      })),
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerId: order.user_id,
      shippingAddress: order.shipping_address,
      isGift: order.is_gift || false,
      giftMessage: order.gift_message,
      notes: order.notes,
      trackingNumber: order.tracking_number,
      shipments: (shipments || []).map((shipment) => ({
        id: shipment.id,
        trackingNumber: shipment.tracking_number,
        carrier: shipment.carrier,
        status: shipment.status,
        labelUrl: shipment.label_url,
        createdAt: shipment.created_at,
      })),
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      paidAt: order.paid_at,
      shippedAt: order.shipped_at,
      deliveredAt: order.delivered_at,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
