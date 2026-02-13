'use client';

import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { cn, formatOrderDate } from '@/lib/utils';
import { getStyleById } from '@/lib/ai/styles-ui';
import type { Order } from '@/types';
import type { StyleType } from '@/types/product';

export interface OrderCardProps {
  /** Order to display */
  order: Order;
  /** Click handler for navigation */
  onClick?: (order: Order) => void;
  /** Additional CSS classes */
  className?: string;
}

// Format order number with FP prefix
const formatOrderNumber = (orderId: string): string => {
  const orderNum = orderId.replace('demo_order_', '').padStart(3, '0');
  return `FP-2024-${orderNum}`;
};

/**
 * OrderCard - Individual order card component
 * Displays order with gradient thumbnail, status badge, and green price
 *
 * @story ORD-01
 * @acceptance-criteria AC-004, AC-005, AC-006, AC-007
 */
export function OrderCard({
  order,
  onClick,
  className,
}: OrderCardProps): React.ReactElement {
  const primaryItem = order.items?.[0];
  const styleInfo = primaryItem ? getStyleById(primaryItem.style as StyleType) : undefined;

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
      <CardContent className="py-0 pb-4">
        <div className="flex gap-3.5">
          {/* Gradient Thumbnail */}
          <div
            data-testid="order-gradient"
            className={cn(
              'w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] rounded-xl flex-shrink-0 bg-gradient-to-br',
              styleInfo?.gradient || 'from-purple-100 to-pink-100'
            )}
          />

          {/* Order Details */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 mb-1">
              {primaryItem
                ? `${styleInfo?.nameHe || primaryItem.style} · ${primaryItem.size}`
                : `הזמנה ${order.orderNumber || ''}`}
            </div>
            <div className="mb-2">
              <OrderStatusBadge status={order.status} size="sm" />
            </div>
            <PriceDisplay
              amount={order.total}
              size="md"
              locale="he"
              color="success"
            />
          </div>

          {/* Chevron */}
          <div className="flex items-center flex-shrink-0">
            <ChevronLeft className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

OrderCard.displayName = 'OrderCard';
