'use client';

import { cn } from './utils';

export type OrderStatus = 'received' | 'processing' | 'shipped' | 'delivered';

export interface OrderTimelineProps {
  /** Current order status */
  currentStatus: OrderStatus;
  /** Estimated dates for each status */
  estimatedDates?: Record<OrderStatus, string>;
  /** Locale for labels ('en' or 'he') */
  locale?: 'en' | 'he';
  /** Layout direction */
  layout?: 'vertical' | 'horizontal';
  /** Additional CSS classes */
  className?: string;
}

interface StatusConfig {
  key: OrderStatus;
  labelEn: string;
  labelHe: string;
}

const STATUSES: StatusConfig[] = [
  { key: 'received', labelEn: 'Order Received', labelHe: 'הזמנה התקבלה' },
  { key: 'processing', labelEn: 'Processing', labelHe: 'בהכנה' },
  { key: 'shipped', labelEn: 'Shipped', labelHe: 'נשלח' },
  { key: 'delivered', labelEn: 'Delivered', labelHe: 'נמסר' },
];

/**
 * OrderTimeline - 4-step order status tracker
 * Displays order progress with completed, current, and upcoming states
 */
export function OrderTimeline({
  currentStatus,
  estimatedDates,
  locale = 'he',
  layout = 'vertical',
  className,
}: OrderTimelineProps): React.ReactElement {
  const isRtl = locale === 'he';
  const ariaLabel = isRtl ? 'סטטוס הזמנה' : 'Order status';
  const isVertical = layout === 'vertical';

  const getLabel = (status: StatusConfig): string => {
    return isRtl ? status.labelHe : status.labelEn;
  };

  const getStatusIndex = (status: OrderStatus): number => {
    return STATUSES.findIndex((s) => s.key === status);
  };

  const currentIndex = getStatusIndex(currentStatus);

  const isCompleted = (statusIndex: number): boolean => {
    return statusIndex < currentIndex;
  };

  const isCurrent = (statusIndex: number): boolean => {
    return statusIndex === currentIndex;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
  };

  return (
    <nav
      aria-label={ariaLabel}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={cn('w-full', className)}
    >
      <ol
        className={cn('flex', {
          'flex-col space-y-4': isVertical,
          'flex-row items-center justify-between': !isVertical,
        })}
      >
        {STATUSES.map((status, index) => {
          const statusIndex = index;
          const completed = isCompleted(statusIndex);
          const current = isCurrent(statusIndex);
          const showCheck = completed;
          const isLast = index === STATUSES.length - 1;
          const nextStatus = !isLast ? STATUSES[index + 1] : null;

          return (
            <li
              key={status.key}
              data-testid={`status-${status.key}`}
              aria-current={current ? 'step' : undefined}
              aria-label={
                completed
                  ? `${getLabel(status)} - completed`
                  : undefined
              }
              className={cn('flex', {
                'flex-1': !isVertical,
                'items-start': isVertical,
                'items-center': !isVertical,
              })}
            >
              {/* Status indicator and content */}
              <div
                className={cn('flex', {
                  'flex-row items-start': isVertical,
                  'flex-col items-center': !isVertical,
                })}
              >
                {/* Circle indicator */}
                <div
                  data-testid={`status-indicator-${status.key}`}
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    {
                      'bg-brand-purple text-white': completed || current,
                      'bg-zinc-700 text-zinc-400': !completed && !current,
                    }
                  )}
                >
                  {showCheck ? (
                    <CheckIcon statusKey={status.key} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Label and date */}
                <div
                  className={cn({
                    'ml-3 rtl:mr-3 rtl:ml-0': isVertical,
                    'mt-2 text-center': !isVertical,
                  })}
                >
                  <span
                    className={cn(
                      'block text-sm font-medium transition-colors',
                      {
                        'text-white': completed || current,
                        'text-zinc-500': !completed && !current,
                      }
                    )}
                  >
                    {getLabel(status)}
                  </span>

                  {estimatedDates?.[status.key] && (
                    <span
                      data-testid={`date-${status.key}`}
                      className="block text-xs text-zinc-400"
                    >
                      {formatDate(estimatedDates[status.key])}
                    </span>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {nextStatus && (
                <div
                  data-testid={`connector-${status.key}-${nextStatus.key}`}
                  aria-hidden="true"
                  className={cn('transition-colors', {
                    // Vertical layout
                    'ml-4 rtl:mr-4 rtl:ml-0 mt-2 h-8 w-0.5': isVertical,
                    // Horizontal layout
                    'mx-2 h-0.5 flex-1': !isVertical,
                    // Colors
                    'bg-brand-purple': isCompleted(statusIndex + 1) || isCurrent(statusIndex + 1),
                    'bg-zinc-700': !isCompleted(statusIndex + 1) && !isCurrent(statusIndex + 1),
                  })}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Check icon component for completed statuses
 */
function CheckIcon({ statusKey }: { statusKey: string }): React.ReactElement {
  return (
    <svg
      data-testid={`status-check-${statusKey}`}
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

OrderTimeline.displayName = 'OrderTimeline';
