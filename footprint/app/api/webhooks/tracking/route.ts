/**
 * Tracking Webhook - INT-07
 *
 * POST /api/webhooks/tracking
 *
 * Receives tracking updates from shipping providers.
 * Updates shipment status and syncs with order fulfillment status.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { mapIsraelPostStatus } from '@/lib/shipping/providers/israel-post';
import { type TrackingStatus } from '@/lib/shipping/providers/types';

interface WebhookPayload {
  trackingNumber: string;
  status: string;
  timestamp: string;
  location?: string;
  description?: string;
}

interface TrackingEvent {
  timestamp: string;
  status: TrackingStatus;
  rawStatus: string;
  location?: string;
  description?: string;
}

/**
 * Verify webhook signature
 */
function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Map provider status codes to normalized status
 */
function normalizeStatus(provider: string, rawStatus: string): TrackingStatus {
  switch (provider) {
    case 'israel_post':
      return mapIsraelPostStatus(rawStatus);
    default:
      // Generic mapping for other providers
      const statusMap: Record<string, TrackingStatus> = {
        PENDING: 'pending',
        PICKED_UP: 'picked_up',
        IN_TRANSIT: 'in_transit',
        OUT_FOR_DELIVERY: 'out_for_delivery',
        DELIVERED: 'delivered',
        FAILED: 'failed_delivery',
        RETURNED: 'returned',
      };
      return statusMap[rawStatus] || 'pending';
  }
}

/**
 * Check if status is a terminal state (order fulfilled)
 */
function isDeliveredStatus(status: TrackingStatus): boolean {
  return status === 'delivered';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Get provider and signature from headers
    const provider = request.headers.get('X-Provider') || 'israel_post';
    const signature = request.headers.get('X-Webhook-Signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 401 }
      );
    }

    // 2. Get raw body for signature verification
    const rawBody = await request.text();

    // 3. Get webhook secret for provider
    const secretEnvKey = `${provider.toUpperCase()}_WEBHOOK_SECRET`;
    const secret = process.env[secretEnvKey];

    if (!secret) {
      console.error(`Missing webhook secret for provider: ${provider}`);
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      );
    }

    // 4. Verify signature
    if (!verifySignature(rawBody, signature, secret)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // 5. Parse payload
    const payload: WebhookPayload = JSON.parse(rawBody);
    const { trackingNumber, status, timestamp, location, description } = payload;

    // 6. Normalize status
    const normalizedStatus = normalizeStatus(provider, status);

    // 7. Create tracking event
    const event: TrackingEvent = {
      timestamp,
      status: normalizedStatus,
      rawStatus: status,
      location,
      description,
    };

    // 8. Get Supabase client
    const supabase = await createClient();

    // 9. Find shipment by tracking number
    const { data: shipment, error: fetchError } = await supabase
      .from('shipments')
      .select('id, tracking_number, order_id, status, tracking_events')
      .eq('tracking_number', trackingNumber)
      .single();

    if (fetchError) {
      console.error('Failed to fetch shipment:', fetchError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found for tracking number' },
        { status: 404 }
      );
    }

    // 10. Update shipment with new event
    const existingEvents = shipment.tracking_events || [];
    const updatedEvents = [...existingEvents, event];

    const { error: updateError } = await supabase
      .from('shipments')
      .update({
        status: normalizedStatus,
        tracking_events: updatedEvents,
        last_tracking_update: timestamp,
        updated_at: new Date().toISOString(),
      })
      .eq('id', shipment.id);

    if (updateError) {
      console.error('Failed to update shipment:', updateError);
      return NextResponse.json(
        { error: 'Failed to update shipment' },
        { status: 500 }
      );
    }

    // 11. If delivered, update order status
    if (isDeliveredStatus(normalizedStatus)) {
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({
          fulfillment_status: 'delivered',
          delivered_at: timestamp,
          updated_at: new Date().toISOString(),
        })
        .eq('id', shipment.order_id);

      if (orderUpdateError) {
        console.error('Failed to update order status:', orderUpdateError);
        // Don't fail the webhook - shipment was updated
      }
    }

    // 12. Return success
    return NextResponse.json({
      success: true,
      shipmentId: shipment.id,
      status: normalizedStatus,
      eventCount: updatedEvents.length,
    });
  } catch (error) {
    console.error('Tracking webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
