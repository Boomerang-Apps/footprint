/**
 * Shipment by ID API - INT-07
 *
 * GET /api/admin/shipments/[id] - Get single shipment details
 * DELETE /api/admin/shipments/[id] - Cancel a shipment (AC-012)
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

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const rateLimited = await checkRateLimit('shipping', request);
  if (rateLimited) return rateLimited;

  try {
    const { id } = await context.params;

    const auth = await verifyAdmin();
    if (!auth.isAuthorized) return auth.error!;

    const supabase = await createClient();

    const { data: shipment, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !shipment) {
      return NextResponse.json(
        { error: 'משלוח לא נמצא' },
        { status: 404 }
      );
    }

    return NextResponse.json({ shipment });
  } catch (error) {
    logger.error('Get shipment error', error);
    return NextResponse.json(
      { error: 'שגיאת מערכת' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const rateLimited = await checkRateLimit('shipping', request);
  if (rateLimited) return rateLimited;

  try {
    const { id } = await context.params;

    const authDel = await verifyAdmin();
    if (!authDel.isAuthorized) return authDel.error!;
    const user = authDel.user!;

    const supabase = await createClient();

    // Fetch shipment
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

    // Check if shipment can be cancelled
    if (shipment.status === 'delivered' || shipment.status === 'cancelled') {
      return NextResponse.json(
        { error: 'לא ניתן לבטל משלוח שכבר נמסר או בוטל' },
        { status: 400 }
      );
    }

    // Try to cancel with carrier (AC-012)
    const shippingService = getDefaultShippingService();
    let carrierCancelled = false;

    try {
      carrierCancelled = await shippingService.cancelShipment(
        shipment.shipment_id,
        shipment.carrier as CarrierCode
      );
    } catch (error) {
      if (error instanceof ShippingProviderError) {
        logger.error(`Carrier cancel error: ${error.carrier}`, {
          code: error.code,
          message: error.message,
        });
        return NextResponse.json(
          { error: 'שגיאה בשירות השילוח', code: error.code },
          { status: 502 }
        );
      }
      throw error;
    }

    // Update shipment status in database
    await supabase
      .from('shipments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: user.id,
      })
      .eq('id', id);

    // Audit log (AC-016)
    await supabase.from('admin_audit_log').insert({
      admin_id: user.id,
      action: 'shipment_cancelled',
      details: {
        shipmentId: id,
        orderId: shipment.order_id,
        carrier: shipment.carrier,
        carrierCancelled,
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      carrierCancelled,
      message: carrierCancelled
        ? 'משלוח בוטל בהצלחה'
        : 'משלוח סומן כמבוטל (לא בוטל אצל הספק)',
    });
  } catch (error) {
    logger.error('Cancel shipment error', error);
    return NextResponse.json(
      { error: 'שגיאת מערכת' },
      { status: 500 }
    );
  }
}
