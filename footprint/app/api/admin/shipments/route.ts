/**
 * Shipments API - INT-07
 *
 * POST /api/admin/shipments - Create a new shipment for an order
 * GET /api/admin/shipments - List shipments
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { getDefaultShippingService } from '@/lib/shipping/providers/shipping-service';
import { type CarrierCode } from '@/lib/shipping/tracking';

interface CreateShipmentBody {
  orderId: string;
  carrier?: CarrierCode;
  serviceType?: 'standard' | 'express' | 'registered';
}

interface ShipmentResponse {
  success: boolean;
  shipmentId: string;
  trackingNumber: string;
  carrier: CarrierCode;
  labelUrl?: string;
}

interface ErrorResponse {
  error: string;
}

// Default sender address (Footprint shop)
const SENDER_ADDRESS = {
  name: 'Footprint',
  company: 'Footprint Ltd',
  street: process.env.SHOP_ADDRESS_STREET || 'Rothschild 1',
  city: process.env.SHOP_ADDRESS_CITY || 'Tel Aviv',
  postalCode: process.env.SHOP_ADDRESS_POSTAL || '6688101',
  country: 'Israel',
  phone: process.env.SHOP_PHONE || '03-1234567',
  email: process.env.SHOP_EMAIL || 'shop@footprint.co.il',
};

// Default package dimensions
const DEFAULT_PACKAGE = {
  length: 35,
  width: 30,
  height: 5,
  weight: 500, // grams
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<ShipmentResponse | ErrorResponse>> {
  // Rate limiting
  const rateLimited = await checkRateLimit('general', request);
  if (rateLimited) return rateLimited as NextResponse<ErrorResponse>;

  try {
    // 1. Verify authentication
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

    // 2. Check admin role
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    let body: CreateShipmentBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { orderId, carrier, serviceType = 'registered' } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing required field: orderId' },
        { status: 400 }
      );
    }

    // 4. Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, fulfillment_status, shipping_address, total')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // 5. Validate shipping address
    if (!order.shipping_address) {
      return NextResponse.json(
        { error: 'Order has no shipping address' },
        { status: 400 }
      );
    }

    // 6. Create shipment with provider
    const shippingService = getDefaultShippingService();

    const shipmentRequest = {
      orderId: order.id,
      orderNumber: order.order_number,
      sender: SENDER_ADDRESS,
      recipient: {
        name: order.shipping_address.name,
        street: order.shipping_address.street,
        street2: order.shipping_address.street2,
        city: order.shipping_address.city,
        postalCode: order.shipping_address.postalCode,
        country: order.shipping_address.country || 'Israel',
        phone: order.shipping_address.phone,
        email: order.shipping_address.email,
      },
      package: DEFAULT_PACKAGE,
      serviceType,
      declaredValue: order.total,
      description: 'Baby footprint art',
      reference: order.order_number,
    };

    const result = await shippingService.createShipment(shipmentRequest, carrier);

    // 7. Store shipment in database
    const { error: insertError } = await supabase.from('shipments').insert({
      order_id: orderId,
      shipment_id: result.shipmentId,
      tracking_number: result.trackingNumber,
      carrier: result.carrier,
      status: 'created',
      label_url: result.labelUrl,
      created_by: user.id,
      service_type: serviceType,
    });

    if (insertError) {
      logger.error('Failed to store shipment', insertError);
      // Don't fail - shipment was created with carrier
    }

    // 8. Update order fulfillment status
    await supabase
      .from('orders')
      .update({
        fulfillment_status: 'shipped',
        tracking_number: result.trackingNumber,
        shipped_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    // 9. Return success response
    return NextResponse.json(
      {
        success: true,
        shipmentId: result.shipmentId,
        trackingNumber: result.trackingNumber,
        carrier: result.carrier,
        labelUrl: result.labelUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Shipment creation error', error);
    return NextResponse.json(
      { error: 'Failed to create shipment' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  // Rate limiting
  const rateLimited = await checkRateLimit('general', request);
  if (rateLimited) return rateLimited;

  try {
    // 1. Verify authentication
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

    // 2. Check admin role
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    // 4. Build query
    let query = supabase
      .from('shipments')
      .select('*', { count: 'exact' });

    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    // 5. Execute query with pagination
    const { data: shipments, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Failed to fetch shipments', error);
      return NextResponse.json(
        { error: 'Failed to fetch shipments' },
        { status: 500 }
      );
    }

    // 6. Return response
    return NextResponse.json({
      shipments: shipments || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    logger.error('Shipments fetch error', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipments' },
      { status: 500 }
    );
  }
}
