'use client';

import { cn } from './utils';

// Match database OrderStatus type
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'printing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderTimelineProps {
  /** Current order status */
  currentStatus: OrderStatus;
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
  step: number;
}

// Map database statuses to 4 visual steps
const STATUS_TO_STEP: Record<OrderStatus, number> = {
  pending: 0,
  paid: 1,
  processing: 2,
  printing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
};

const STEPS = [
  { step: 1, labelEn: 'Received', labelHe: 'התקבלה' },
  { step: 2, labelEn: 'Paid', labelHe: 'שולם' },
  { step: 3, labelEn: 'In Production', labelHe: 'בהכנה' },
  { step: 4, labelEn: 'Shipped', labelHe: 'נשלח' },
  { step: 5, labelEn: 'Delivered', labelHe: 'הגיע' },
];

/**
 * OrderTimeline - 5-step order status tracker
 * Displays order progress matching database flow
 */
export function OrderTimeline({
  currentStatus,
  locale = 'he',
  layout = 'vertical',
  className,
}: OrderTimelineProps): React.ReactElement {
  const isRtl = locale === 'he';
  const ariaLabel = isRtl ? 'סטטוס הזמנה' : 'Order status';
  const isVertical = layout === 'vertical';

  const getLabel = (step: typeof STEPS[0]): string => {
    return isRtl ? step.labelHe : step.labelEn;
  };

  const currentStep = STATUS_TO_STEP[currentStatus] ?? 0;

  const isCompleted = (stepIndex: number): boolean => {
    return stepIndex < currentStep;
  };

  const isCurrent = (stepIndex: number): boolean => {
    return stepIndex === currentStep;
  };

  // Horizontal layout
  if (!isVertical) {
    return (
      <nav
        aria-label={ariaLabel}
        dir={isRtl ? 'rtl' : 'ltr'}
        className={cn('w-full py-2', className)}
      >
        <ol className="flex items-start">
          {STEPS.map((step, index) => {
            const completed = isCompleted(index);
            const current = isCurrent(index);
            const isActive = completed || current;

            return (
              <li
                key={step.step}
                data-testid={`status-step-${index}`}
                aria-current={current ? 'step' : undefined}
                className="flex-1 flex flex-col items-center"
              >
                {/* Circle */}
                <div
                  data-testid={`status-indicator-${index}`}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all',
                    isActive
                      ? 'bg-zinc-900 text-white'
                      : 'bg-white text-zinc-400 border-2 border-zinc-200'
                  )}
                >
                  {completed ? (
                    <CheckIcon />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'mt-2 text-xs font-medium text-center',
                    isActive ? 'text-zinc-900' : 'text-zinc-400'
                  )}
                >
                  {getLabel(step)}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  // Vertical layout
  return (
    <nav
      aria-label={ariaLabel}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={cn('w-full', className)}
    >
      <ol className="flex flex-col space-y-3">
        {STEPS.map((step, index) => {
          const completed = isCompleted(index);
          const current = isCurrent(index);
          const isLast = index === STEPS.length - 1;

          return (
            <li
              key={step.step}
              data-testid={`status-step-${index}`}
              aria-current={current ? 'step' : undefined}
              className="flex items-start gap-3"
            >
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    completed || current
                      ? 'bg-zinc-900 text-white'
                      : 'bg-white text-zinc-400 border-2 border-zinc-200'
                  )}
                >
                  {completed ? <CheckIcon /> : <span>{index + 1}</span>}
                </div>

                {/* Vertical line */}
                {!isLast && (
                  <div
                    aria-hidden="true"
                    className={cn(
                      'w-0.5 h-6 mt-1 transition-colors',
                      isCompleted(index + 1) || isCurrent(index + 1)
                        ? 'bg-brand-purple'
                        : 'bg-zinc-200'
                    )}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-sm font-medium pt-1.5 transition-colors',
                  completed || current ? 'text-zinc-900' : 'text-zinc-400'
                )}
              >
                {getLabel(step)}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CheckIcon(): React.ReactElement {
  return (
    <svg
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
