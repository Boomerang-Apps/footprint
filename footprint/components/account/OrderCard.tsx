'use client';

import Image from 'next/image';
import { ChevronLeft, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { cn, formatOrderDate } from '@/lib/utils';
import type { Order } from '@/types';

export interface OrderCardProps {
  /** Order to display */
  order: Order;
  /** Click handler for navigation */
  onClick?: (order: Order) => void;
  /** Handler for reorder action */
  onReorder?: (order: Order) => void;
  /** Handler for track shipment action */
  onTrackShipment?: (order: Order) => void;
  /** Additional CSS classes */
  className?: string;
}

// Style translations to Hebrew
const styleTranslations: Record<string, string> = {
  avatar_cartoon: 'אווטר קריקטורה',
  watercolor: 'צבעי מים',
  oil_painting: 'ציור שמן',
  line_art: 'ציור קווי',
  line_art_watercolor: 'קווי + צבעי מים',
  original: 'מקורי משופר',
  pop_art: 'פופ ארט',
  comic: 'קומיקס',
  romantic: 'רומנטי',
  vintage: 'וינטאג׳',
};

// Frame translations to Hebrew
const frameTranslations: Record<string, string> = {
  none: 'ללא מסגרת',
  black: 'מסגרת שחורה',
  white: 'מסגרת לבנה',
  oak: 'מסגרת אלון',
};

// Action text based on order status
const getActionText = (status: Order['status']): string => {
  switch (status) {
    case 'processing':
    case 'printing':
      return 'פרטים';
    case 'shipped':
      return 'מעקב משלוח';
    case 'delivered':
      return 'הזמנה חוזרת';
    default:
      return 'פרטים';
  }
};

// Format order number with FP prefix
const formatOrderNumber = (orderId: string): string => {
  const orderNum = orderId.replace('demo_order_', '').padStart(3, '0');
  return `FP-2024-${orderNum}`;
};

/**
 * OrderCard - Individual order card component
 * Displays order information, status, and actions
 */
export function OrderCard({
  order,
  onClick,
  onReorder,
  onTrackShipment,
  className,
}: OrderCardProps): React.ReactElement {
  const primaryItem = order.items?.[0];
  const additionalItemsCount = (order.items?.length || 0) - 1;

  const handleClick = () => {
    onClick?.(order);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <Card
      data-testid="order-card"
      dir="rtl"
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99]',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`הזמנה ${formatOrderNumber(order.id)}`}
    >
      {/* Order Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">
            {formatOrderNumber(order.id)}
          </span>
          <span
            data-testid="order-date"
            className="text-xs text-gray-500"
          >
            {formatOrderDate(order.createdAt)}
          </span>
        </div>
      </CardHeader>

      {/* Order Content */}
      <CardContent className="py-0">
        <div className="flex gap-3.5">
          {/* Product Thumbnail */}
          <div className="relative flex-shrink-0">
            {primaryItem ? (
              <Image
                data-testid="order-thumbnail"
                src={primaryItem.transformedImageUrl || primaryItem.originalImageUrl}
                alt={`${styleTranslations[primaryItem.style] || primaryItem.style} artwork`}
                width={90}
                height={90}
                className="w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] lg:w-[90px] lg:h-[90px] rounded-xl object-cover bg-gray-100"
              />
            ) : (
              <div className="w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] lg:w-[90px] lg:h-[90px] rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <span className="text-2xl">🖼️</span>
              </div>
            )}

            {/* Gift Indicator */}
            {order.isGift && (
              <div
                data-testid="gift-indicator"
                className="absolute -top-1 -right-1 bg-pink-500 rounded-full p-1"
              >
                <Gift className="h-3 w-3 text-white" aria-hidden="true" />
              </div>
            )}

            {/* Multiple Items Indicator */}
            {additionalItemsCount > 0 && (
              <div className="absolute -bottom-1 -left-1 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded-full">
                +{additionalItemsCount} עוד
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 mb-1">
              {primaryItem ? (styleTranslations[primaryItem.style] || primaryItem.style) : `הזמנה ${order.orderNumber || ''}`}
            </div>
            <div className="text-xs text-gray-500 mb-2 leading-relaxed">
              {primaryItem ? `${primaryItem.size} • ${frameTranslations[primaryItem.frameType] || primaryItem.frameType}` : `${order.itemCount || 1} פריטים`}
            </div>
            <div className="text-base font-bold text-gray-900">
              <PriceDisplay
                amount={order.total}
                size="md"
                locale="he"
                color="default"
                className="text-gray-900"
              />
            </div>

            {/* Gift Message Preview */}
            {order.isGift && order.giftMessage && (
              <div className="flex items-center gap-1 mt-1">
                <Gift className="h-3.5 w-3.5 text-pink-500" aria-hidden="true" />
                <span className="text-xs text-pink-600 font-medium">מתנה</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Order Footer */}
      <CardFooter className="pt-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between w-full">
          {/* Status Badge */}
          <OrderStatusBadge status={order.status} size="sm" />

          {/* Action Button */}
          <button
            data-testid="order-action-button"
            className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              if (order.status === 'shipped' && order.trackingNumber) {
                onTrackShipment?.(order);
              } else if (order.status === 'delivered') {
                onReorder?.(order);
              } else {
                handleClick();
              }
            }}
          >
            {getActionText(order.status)}
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}

OrderCard.displayName = 'OrderCard';