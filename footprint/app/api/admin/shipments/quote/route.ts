/**
 * Shipping Quote API - INT-07 AC-007
 *
 * GET /api/admin/shipments/quote - Get shipping cost quote from carrier
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { getDefaultShippingService } from '@/lib/shipping/providers/shipping-service';
import { ShippingProviderError } from '@/lib/shipping/providers/types';
import { type CarrierCode } from '@/lib/shipping/tracking';

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

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  const rateLimited = await checkRateLimit('shipping', request);
  if (rateLimited) return rateLimited;

  try {
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

    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'נדרשת הרשאת מנהל' },
        { status: 403 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const carrier = searchParams.get('carrier') as CarrierCode | null;

    if (!orderId) {
      return NextResponse.json(
        { error: 'חסר שדה orderId' },
        { status: 400 }
      );
    }

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, shipping_address')
      .eq('id', orderId)
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

    const shippingService = getDefaultShippingService();

    const rateRequest = {
      sender: SENDER_ADDRESS,
      recipient: {
        name: order.shipping_address.name,
        street: order.shipping_address.street,
        city: order.shipping_address.city,
        postalCode: order.shipping_address.postalCode,
        country: order.shipping_address.country || 'Israel',
        phone: order.shipping_address.phone || '',
      },
      package: DEFAULT_PACKAGE,
    };

    let rates;
    try {
      if (carrier) {
        rates = await shippingService.getRates(rateRequest, carrier);
      } else {
        rates = await shippingService.getAllRates(rateRequest);
      }
    } catch (error) {
      if (error instanceof ShippingProviderError) {
        logger.error(`Carrier quote error: ${error.carrier}`, {
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

    return NextResponse.json({
      orderId,
      rates,
    });
  } catch (error) {
    logger.error('Quote error', error);
    return NextResponse.json(
      { error: 'שגיאת מערכת' },
      { status: 500 }
    );
  }
}
