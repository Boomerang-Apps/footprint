'use client';

/**
 * OrderTimeline
 *
 * Displays a visual timeline of order status changes.
 *
 * @story UA-02
 * @acceptance-criteria AC-006
 */

import { Check, Clock, Package, Truck, Home, Printer } from 'lucide-react';
import { cn, formatOrderDate } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

interface OrderTimelineProps {
  order: Order;
}

interface TimelineStep {
  id: OrderStatus;
  label: string;
  icon: React.ElementType;
  description?: string;
}

const timelineSteps: TimelineStep[] = [
  {
    id: 'pending',
    label: 'הזמנה התקבלה',
    icon: Clock,
    description: 'ההזמנה נקלטה במערכת',
  },
  {
    id: 'processing',
    label: 'בעיבוד',
    icon: Package,
    description: 'ההזמנה מוכנה להדפסה',
  },
  {
    id: 'printing',
    label: 'בהדפסה',
    icon: Printer,
    description: 'היצירה בתהליך הדפסה',
  },
  {
    id: 'shipped',
    label: 'נשלח',
    icon: Truck,
    description: 'החבילה בדרך אליך',
  },
  {
    id: 'delivered',
    label: 'הגיע',
    icon: Home,
    description: 'ההזמנה נמסרה בהצלחה',
  },
];

// Status order for comparison
const statusOrder: OrderStatus[] = [
  'pending',
  'paid',
  'processing',
  'printing',
  'shipped',
  'delivered',
];

function getStepStatus(
  stepId: OrderStatus,
  currentStatus: OrderStatus
): 'completed' | 'current' | 'upcoming' {
  const stepIndex = statusOrder.indexOf(stepId);
  const currentIndex = statusOrder.indexOf(currentStatus);

  // Handle cancelled/refunded orders
  if (currentStatus === 'cancelled') {
    return 'upcoming';
  }

  if (stepIndex < currentIndex) {
    return 'completed';
  } else if (stepIndex === currentIndex) {
    return 'current';
  }
  return 'upcoming';
}

function getStatusDate(
  stepId: OrderStatus,
  order: Order
): Date | null {
  // Use order dates based on status
  if (stepId === 'pending' || stepId === 'paid' || stepId === 'processing' || stepId === 'printing') {
    return new Date(order.createdAt);
  }

  if (stepId === 'shipped' && order.shippedAt) {
    return new Date(order.shippedAt);
  }

  if (stepId === 'delivered' && order.deliveredAt) {
    return new Date(order.deliveredAt);
  }

  return null;
}

export function OrderTimeline({ order }: OrderTimelineProps): React.ReactElement {
  // Filter steps based on order type (some orders skip certain steps)
  const visibleSteps = timelineSteps.filter((step) => {
    // Skip pending for orders that are already paid
    if (step.id === 'pending' && order.paidAt) {
      return statusOrder.indexOf(order.status) === 0;
    }
    return true;
  });

  return (
    <div className="relative" dir="rtl">
      {/* Cancelled Status */}
      {order.status === 'cancelled' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-medium text-red-800">
            ההזמנה בוטלה
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-0">
        {visibleSteps.map((step, index) => {
          const status = getStepStatus(step.id, order.status);
          const date = getStatusDate(step.id, order);
          const isLast = index === visibleSteps.length - 1;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative flex gap-4">
              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    'absolute right-[19px] top-10 w-0.5 h-[calc(100%-16px)]',
                    status === 'completed' ? 'bg-purple-600' : 'bg-gray-200'
                  )}
                />
              )}

              {/* Icon Circle */}
              <div
                className={cn(
                  'relative z-10 flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-colors',
                  status === 'completed' && 'bg-purple-600 text-white',
                  status === 'current' && 'bg-purple-100 text-purple-600 ring-4 ring-purple-50',
                  status === 'upcoming' && 'bg-gray-100 text-gray-400'
                )}
              >
                {status === 'completed' ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>

              {/* Content */}
              <div className={cn('flex-1 pb-8', isLast && 'pb-0')}>
                <div className="flex items-center justify-between">
                  <h4
                    className={cn(
                      'text-sm font-medium',
                      status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'
                    )}
                  >
                    {step.label}
                  </h4>
                  {date && status !== 'upcoming' && (
                    <span className="text-xs text-gray-500">
                      {formatOrderDate(date)}
                    </span>
                  )}
                </div>
                {step.description && status === 'current' && (
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

OrderTimeline.displayName = 'OrderTimeline';
