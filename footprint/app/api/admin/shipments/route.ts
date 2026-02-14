/**
 * Shipments API - INT-07
 *
 * POST /api/admin/shipments - Create a new shipment for an order
 * GET /api/admin/shipments - List shipments
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/auth/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { createShipmentSchema, shipmentsQuerySchema, parseRequestBody, parseQueryParams } from '@/lib/validation/admin';
import { getDefaultShippingService } from '@/lib/shipping/providers/shipping-service';
import { ShippingProviderError } from '@/lib/shipping/providers/types';
import { type CarrierCode } from '@/lib/shipping/tracking';
import { validateAddress } from '@/lib/shipping/validation';

interface ShipmentResponse {
  success: boolean;
  shipmentId: string;
  trackingNumber: string;
  carrier: CarrierCode;
  labelUrl?: string;
}

interface ErrorResponse {
  error: string;
  code?: string;
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
  // Rate limiting — 20/min for shipment operations (AC-014)
  const rateLimited = await checkRateLimit('shipping', request);
  if (rateLimited) return rateLimited as NextResponse<ErrorResponse>;

  try {
    // 1. Admin authorization (DB-backed)
    const auth = await verifyAdmin();
    if (!auth.isAuthorized) return auth.error!;
    const user = auth.user!;

    const supabase = await createClient();

    // 2. Parse and validate request body
    const parsed = await parseRequestBody(request, createShipmentSchema);
    if (parsed.error) return parsed.error as NextResponse<ErrorResponse>;
    const { orderId, carrier, serviceType } = parsed.data;

    // 3. Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, fulfillment_status, shipping_address, total')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'הזמנה לא נמצאה' },
        { status: 404 }
      );
    }

    // 4. Validate shipping address (AC-006)
    if (!order.shipping_address) {
      return NextResponse.json(
        { error: 'להזמנה אין כתובת משלוח' },
        { status: 400 }
      );
    }

    const addressValidation = validateAddress(order.shipping_address);
    if (!addressValidation.valid) {
      const errorMessages = Object.values(addressValidation.errors).filter(Boolean);
      return NextResponse.json(
        {
          error: 'כתובת משלוח לא תקינה',
          code: 'INVALID_ADDRESS',
          ...({ validationErrors: addressValidation.errors }),
        } as ErrorResponse,
        { status: 400 }
      );
    }

    // 5. Check for existing shipment (prevent duplicates - HAZ-004)
    const { data: existingShipment } = await supabase
      .from('shipments')
      .select('id, tracking_number')
      .eq('order_id', orderId)
      .eq('status', 'created')
      .maybeSingle();

    if (existingShipment) {
      return NextResponse.json(
        { error: 'כבר קיימת משלוח פעיל להזמנה זו' },
        { status: 409 }
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

    let result;
    try {
      result = await shippingService.createShipment(shipmentRequest, carrier);
    } catch (error) {
      // AC-013: Handle carrier API errors with 502 and Hebrew message
      if (error instanceof ShippingProviderError) {
        logger.error(`Carrier API error: ${error.carrier}`, {
          code: error.code,
          message: error.message,
          retryable: error.retryable,
        });
        return NextResponse.json(
          {
            error: 'שגיאה בשירות השילוח',
            code: error.code,
          },
          { status: 502 }
        );
      }
      throw error;
    }

    // 7. Store shipment in database (AC-005)
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

    // 9. Audit log (AC-016)
    await supabase.from('admin_audit_log').insert({
      admin_id: user.id,
      action: 'shipment_created',
      details: {
        orderId,
        shipmentId: result.shipmentId,
        trackingNumber: result.trackingNumber,
        carrier: result.carrier,
        serviceType,
      },
      created_at: new Date().toISOString(),
    });

    // 10. Return success response
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
      { error: 'שגיאת מערכת' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  // Rate limiting
  const rateLimited = await checkRateLimit('shipping', request);
  if (rateLimited) return rateLimited;

  try {
    // 1. Admin authorization (DB-backed)
    const authResult = await verifyAdmin();
    if (!authResult.isAuthorized) return authResult.error!;

    const supabase = await createClient();

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const parsed = parseQueryParams(searchParams, shipmentsQuerySchema);
    if (parsed.error) return parsed.error;
    const { orderId, page, limit } = parsed.data;
    const offset = (page - 1) * limit;

    // 3. Build query
    let query = supabase
      .from('shipments')
      .select('*', { count: 'exact' });

    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    // 4. Execute query with pagination
    const { data: shipments, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Failed to fetch shipments', error);
      return NextResponse.json(
        { error: 'שגיאת מערכת' },
        { status: 500 }
      );
    }

    // 5. Return response
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
      { error: 'שגיאת מערכת' },
      { status: 500 }
    );
  }
}
