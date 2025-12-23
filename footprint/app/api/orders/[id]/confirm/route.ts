/**
 * Order Confirmation API
 *
 * POST /api/orders/[id]/confirm - Send confirmation email
 * GET /api/orders/[id]/confirm - Get confirmation details + WhatsApp URL
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  sendOrderConfirmationEmail,
  generateWhatsAppShareUrl,
} from '@/lib/email/resend';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  customer_name: string;
  customer_email: string;
  shipping_address: ShippingAddress;
}

interface ConfirmResponse {
  success: boolean;
  emailId?: string;
}

interface ConfirmDetailsResponse {
  orderNumber: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  whatsappUrl: string;
}

interface ErrorResponse {
  error: string;
}

type RouteParams = { params: Promise<{ id: string }> };

/**
 * Fetches an order by ID and verifies ownership.
 */
async function getOrderById(
  orderId: string,
  userId: string
): Promise<Order | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !data) {
    return null;
  }

  // Verify ownership
  if (data.user_id !== userId) {
    return null;
  }

  return data as Order;
}

/**
 * POST /api/orders/[id]/confirm
 *
 * Sends order confirmation email.
 */
export async function POST(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<ConfirmResponse | ErrorResponse>> {
  try {
    const { id: orderId } = await params;

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

    // 2. Get order
    const order = await getOrderById(orderId, user.id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // 3. Send confirmation email
    const emailResult = await sendOrderConfirmationEmail({
      to: order.customer_email,
      customerName: order.customer_name,
      orderNumber: order.order_number,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      shippingAddress: order.shipping_address,
    });

    if (!emailResult.success) {
      console.error('Failed to send confirmation email:', emailResult.error);
      return NextResponse.json(
        { error: `Failed to send email: ${emailResult.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailId: emailResult.emailId,
    });
  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders/[id]/confirm
 *
 * Returns order confirmation details including WhatsApp share URL.
 */
export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<ConfirmDetailsResponse | ErrorResponse>> {
  try {
    const { id: orderId } = await params;

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

    // 2. Get order
    const order = await getOrderById(orderId, user.id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // 3. Generate WhatsApp share URL
    const whatsappUrl = generateWhatsAppShareUrl(order.order_number);

    return NextResponse.json({
      orderNumber: order.order_number,
      status: order.status,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      shippingAddress: order.shipping_address,
      whatsappUrl,
    });
  } catch (error) {
    console.error('Get confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to get confirmation details' },
      { status: 500 }
    );
  }
}
