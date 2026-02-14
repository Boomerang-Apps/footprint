/**
 * Shipment Tracking API - INT-07 AC-010
 *
 * GET /api/admin/shipments/[id]/track - Get tracking status and history
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/auth/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { getDefaultShippingService } from '@/lib/shipping/providers/shipping-service';
import { ShippingProviderError } from '@/lib/shipping/providers/types';
import { type CarrierCode, getTrackingUrl } from '@/lib/shipping/tracking';

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

    // Fetch shipment record
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

    // Get tracking from carrier API
    const shippingService = getDefaultShippingService();
    let tracking;

    try {
      tracking = await shippingService.getTracking(
        shipment.tracking_number,
        shipment.carrier as CarrierCode
      );
    } catch (error) {
      if (error instanceof ShippingProviderError) {
        logger.error(`Carrier tracking error: ${error.carrier}`, {
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

    // Update shipment status in DB if changed
    if (tracking.status !== shipment.status) {
      await supabase
        .from('shipments')
        .update({
          status: tracking.status,
          last_tracked_at: new Date().toISOString(),
        })
        .eq('id', id);
    }

    // Generate public tracking URL
    const publicTrackingUrl = getTrackingUrl(
      shipment.tracking_number,
      shipment.carrier as CarrierCode
    );

    return NextResponse.json({
      trackingNumber: shipment.tracking_number,
      carrier: shipment.carrier,
      status: tracking.status,
      estimatedDelivery: tracking.estimatedDelivery,
      events: tracking.events,
      lastUpdated: tracking.lastUpdated,
      publicTrackingUrl,
    });
  } catch (error) {
    logger.error('Track shipment error', error);
    return NextResponse.json(
      { error: 'שגיאת מערכת' },
      { status: 500 }
    );
  }
}
