import {
  CheckCircle,
  Clock,
  Truck,
  Printer,
  X,
  Check,
} from 'lucide-react';
import { cn } from './utils';
import type { OrderStatus } from '@/types';

export interface OrderStatusBadgeProps {
  /** Order status to display */
  status: OrderStatus;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Additional CSS classes */
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'ממתין לתשלום',
    icon: Clock,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    ariaLabel: 'Order Status: Pending Payment',
  },
  paid: {
    label: 'שולם',
    icon: Check,
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    ariaLabel: 'Order Status: Paid',
  },
  processing: {
    label: 'בהכנה',
    icon: Clock,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    ariaLabel: 'Order Status: Processing',
  },
  printing: {
    label: 'בהדפסה',
    icon: Printer,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    ariaLabel: 'Order Status: Printing',
  },
  shipped: {
    label: 'נשלח',
    icon: Truck,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    ariaLabel: 'Order Status: Shipped',
  },
  delivered: {
    label: 'הגיע',
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    ariaLabel: 'Order Status: Delivered',
  },
  cancelled: {
    label: 'בוטל',
    icon: X,
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    ariaLabel: 'Order Status: Cancelled',
  },
} as const;

/**
 * OrderStatusBadge - Visual indicator for order status
 * Displays order status with appropriate icon, color, and Hebrew text
 */
export function OrderStatusBadge({
  status,
  size = 'md',
  className,
}: OrderStatusBadgeProps): React.ReactElement {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      data-testid="order-status-badge"
      aria-label={config.ariaLabel}
      className={cn(
        // Base styles
        'inline-flex items-center gap-1.5 rounded-full font-medium',

        // Background and text colors
        config.bgColor,
        config.textColor,

        // Size styles
        {
          'px-2 py-1 text-xs': size === 'sm',
          'px-3 py-1.5 text-sm': size === 'md',
        },

        className
      )}
    >
      <Icon
        data-testid="status-icon"
        className={cn(
          size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'
        )}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}

OrderStatusBadge.displayName = 'OrderStatusBadge';