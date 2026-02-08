/**
 * Order Tracking Page - Wave 3 UI-04B
 *
 * Customer-facing page to track order status and view details.
 * Accessible via: /track/[orderId] (public route)
 *
 * Features:
 * - Order status display with OrderTimeline
 * - Order details (items, pricing, addresses)
 * - Delivery tracking link
 * - Order history view
 * - RTL support
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { api } from '@/lib/api/client';
import type { Order } from '@/types/order';
import { OrderTimeline } from '@/components/ui/OrderTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/types/database';
import { getStatusLabel } from '@/lib/orders/status';
import { generateTrackingUrl, type CarrierCode } from '@/lib/orders/tracking';
import { Calendar, Package, Truck, MapPin, Gift, CreditCard, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

interface OrderTrackingPageProps {
  params: {
    orderId: string;
  };
}

// Generate metadata for SEO and sharing
export async function generateMetadata({ params }: OrderTrackingPageProps): Promise<Metadata> {
  return {
    title: `Order Tracking - ${params.orderId} | Footprint`,
    description: 'Track your Footprint order status and delivery information.',
    robots: 'noindex', // Don't index tracking pages for privacy
  };
}

// Loading component for Suspense
function OrderTrackingLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="text-center space-y-2">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse" />
        </div>

        {/* Timeline skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>

        {/* Details skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="h-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="h-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Main tracking page component
async function OrderTrackingContent({ orderId }: { orderId: string }) {
  let order: Order;

  try {
    order = await api.orders.get(orderId);
  } catch {
    notFound();
  }

  if (!order) {
    notFound();
  }

  // Generate tracking URL if available
  const trackingUrl = order.trackingNumber && order.carrier
    ? generateTrackingUrl(order.trackingNumber, order.carrier as CarrierCode)
    : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
              {getStatusLabel(order.status, 'en')}
            </Badge>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              Ordered on {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Order Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTimeline
              currentStatus={order.status}
              layout="horizontal"
              className="py-4"
            />
          </CardContent>
        </Card>

        {/* Tracking Information */}
        {order.trackingNumber && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping & Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-medium">Tracking Number</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {order.trackingNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Carrier: {order.carrier?.replace('_', ' ').toUpperCase() || 'N/A'}
                  </p>
                </div>
                {trackingUrl && (
                  <Button asChild>
                    <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
                      Track Package
                    </a>
                  </Button>
                )}
              </div>
              {order.shippedAt && (
                <div className="text-sm text-muted-foreground">
                  Shipped on {new Date(order.shippedAt).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4">
                  {/* Item thumbnail */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>

                  {/* Item details */}
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {item.style} Print
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Size: {item.size}</div>
                      <div>Paper: {item.paperType}</div>
                      {item.frameType !== 'none' && <div>Frame: {item.frameType}</div>}
                    </div>
                  </div>

                  {/* Item price */}
                  <div className="text-right">
                    <div className="font-medium">{formatPrice(item.price)}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Shipping & Billing */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div className="font-medium">{order.shippingAddress.name}</div>
                  <div>{order.shippingAddress.street}</div>
                  <div>
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </div>
                  <div>{order.shippingAddress.country}</div>
                  {order.shippingAddress.phone && (
                    <div className="flex items-center gap-2 pt-2">
                      <Phone className="h-4 w-4" />
                      {order.shippingAddress.phone}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Gift Information */}
            {order.isGift && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Gift Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Gift Order</Badge>
                      {order.giftWrap && <Badge variant="outline">Gift Wrapped</Badge>}
                    </div>
                    {order.giftMessage && (
                      <div>
                        <div className="font-medium">Message:</div>
                        <div className="text-muted-foreground italic">&ldquo;{order.giftMessage}&rdquo;</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatPrice(order.shipping)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Need Help with Your Order?</h3>
            <p className="text-muted-foreground mb-4">
              Contact our customer support team for assistance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="outline" asChild>
                <a href="mailto:support@footprint.co.il" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Support
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="tel:+972-50-123-4567" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Call Support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  return (
    <Suspense fallback={<OrderTrackingLoading />}>
      <OrderTrackingContent orderId={params.orderId} />
    </Suspense>
  );
}