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
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-medium text-red-800">
            ההזמנה בוטלה
          </p>
        </div>
      )}

      {/* Horizontal Timeline */}
      <div className="relative flex justify-between">
        {/* Progress line */}
        <div className="absolute top-5 right-5 left-5 h-0.5 bg-gray-200" />

        {visibleSteps.map((step) => {
          const status = getStepStatus(step.id, order.status);
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center gap-1.5 relative z-10">
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-colors',
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
              <span
                className={cn(
                  'text-xs text-center max-w-[70px] leading-tight',
                  status === 'upcoming' ? 'text-gray-400' : 'text-gray-900 font-medium'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

OrderTimeline.displayName = 'OrderTimeline';
