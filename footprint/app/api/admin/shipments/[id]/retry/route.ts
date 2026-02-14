/**
 * Retry Failed Shipment API - INT-07 AC-011
 *
 * PATCH /api/admin/shipments/[id]/retry - Retry a failed shipment creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/auth/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { getDefaultShippingService } from '@/lib/shipping/providers/shipping-service';
import { ShippingProviderError } from '@/lib/shipping/providers/types';
import { type CarrierCode } from '@/lib/shipping/tracking';

interface RouteContext {
  params: Promise<{ id: string }>;
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

const DEFAULT_PACKAGE = {
  length: 35,
  width: 30,
  height: 5,
  weight: 500,
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const rateLimited = await checkRateLimit('shipping', request);
  if (rateLimited) return rateLimited;

  try {
    const { id } = await context.params;

    const auth = await verifyAdmin();
    if (!auth.isAuthorized) return auth.error!;
    const user = auth.user!;

    const supabase = await createClient();

    // Fetch existing shipment
    const { data: shipment, error: fetchError } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !shipment) {
      return NextResponse.json(
        { error: 'משלוח לא נמצא' },
        { status: 404 }
      );
    }

    // Only allow retry on failed shipments
    if (shipment.status !== 'failed') {
      return NextResponse.json(
        { error: 'ניתן לנסות שוב רק משלוחים שנכשלו' },
        { status: 400 }
      );
    }

    // Fetch order details for retry
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, shipping_address, total')
      .eq('id', shipment.order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'הזמנה לא נמצאה' },
        { status: 404 }
      );
    }

    if (!order.shipping_address) {
      return NextResponse.json(
        { error: 'להזמנה אין כתובת משלוח' },
        { status: 400 }
      );
    }

    // Retry shipment creation
    const shippingService = getDefaultShippingService();
    let result;

    try {
      result = await shippingService.createShipment(
        {
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
          serviceType: (shipment.service_type as 'standard' | 'express' | 'registered') || 'registered',
          declaredValue: order.total,
          description: 'Baby footprint art',
          reference: order.order_number,
        },
        shipment.carrier as CarrierCode
      );
    } catch (error) {
      // AC-013: Handle carrier API errors
      if (error instanceof ShippingProviderError) {
        logger.error(`Carrier retry error: ${error.carrier}`, {
          code: error.code,
          message: error.message,
        });

        // Update retry count
        await supabase
          .from('shipments')
          .update({
            retry_count: (shipment.retry_count || 0) + 1,
            last_error: error.message,
          })
          .eq('id', id);

        return NextResponse.json(
          { error: 'שגיאה בשירות השילוח', code: error.code },
          { status: 502 }
        );
      }
      throw error;
    }

    // Update shipment record with new details
    await supabase
      .from('shipments')
      .update({
        shipment_id: result.shipmentId,
        tracking_number: result.trackingNumber,
        status: 'created',
        label_url: result.labelUrl,
        retry_count: (shipment.retry_count || 0) + 1,
        last_error: null,
      })
      .eq('id', id);

    // Update order
    await supabase
      .from('orders')
      .update({
        fulfillment_status: 'shipped',
        tracking_number: result.trackingNumber,
        shipped_at: new Date().toISOString(),
      })
      .eq('id', shipment.order_id);

    // Audit log
    await supabase.from('admin_audit_log').insert({
      admin_id: user.id,
      action: 'shipment_retried',
      details: {
        shipmentId: id,
        orderId: shipment.order_id,
        newTrackingNumber: result.trackingNumber,
        retryCount: (shipment.retry_count || 0) + 1,
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      shipmentId: result.shipmentId,
      trackingNumber: result.trackingNumber,
      carrier: result.carrier,
      labelUrl: result.labelUrl,
    });
  } catch (error) {
    logger.error('Retry shipment error', error);
    return NextResponse.json(
      { error: 'שגיאת מערכת' },
      { status: 500 }
    );
  }
}
