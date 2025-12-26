'use client';

import { cn } from './utils';

export interface StepConfig {
  /** Unique key for the step */
  key: string;
  /** English label */
  labelEn: string;
  /** Hebrew label */
  labelHe: string;
}

export interface StepProgressProps {
  /** Array of step configurations */
  steps: StepConfig[];
  /** Current step (1-indexed) */
  currentStep: number;
  /** Locale for labels ('en' or 'he') */
  locale?: 'en' | 'he';
  /** Additional CSS classes */
  className?: string;
}

/**
 * StepProgress - 5-step progress indicator for order flow
 * Shows current step, completed steps, and supports Hebrew/RTL
 */
export function StepProgress({
  steps,
  currentStep,
  locale = 'en',
  className,
}: StepProgressProps): React.ReactElement {
  const isRtl = locale === 'he';
  const ariaLabel = isRtl ? 'התקדמות ההזמנה' : 'Order progress';

  const getLabel = (step: StepConfig): string => {
    return isRtl ? step.labelHe : step.labelEn;
  };

  const isCompleted = (stepIndex: number): boolean => {
    return stepIndex < currentStep;
  };

  const isCurrent = (stepIndex: number): boolean => {
    return stepIndex === currentStep;
  };

  const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'upcoming' => {
    if (isCompleted(stepIndex)) return 'completed';
    if (isCurrent(stepIndex)) return 'current';
    return 'upcoming';
  };

  return (
    <nav
      aria-label={ariaLabel}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={cn('w-full', className)}
    >
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const status = getStepStatus(stepNumber);
          const showCheck = status === 'completed';
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.key}
              data-testid={`step-${stepNumber}`}
              aria-current={status === 'current' ? 'step' : undefined}
              aria-label={status === 'completed' ? `Step ${stepNumber}: ${getLabel(step)} - completed` : undefined}
              className="flex flex-1 items-center"
            >
              {/* Step indicator and label */}
              <div className="flex flex-col items-center">
                {/* Circle indicator */}
                <div
                  data-testid={`step-indicator-${stepNumber}`}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    {
                      'bg-brand-purple text-white': status === 'completed' || status === 'current',
                      'bg-zinc-700 text-zinc-400': status === 'upcoming',
                    }
                  )}
                >
                  {showCheck ? (
                    <CheckIcon stepNumber={stepNumber} />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'mt-2 text-xs font-medium transition-colors',
                    {
                      'text-white': status === 'completed' || status === 'current',
                      'text-zinc-500': status === 'upcoming',
                    }
                  )}
                >
                  {getLabel(step)}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  data-testid={`connector-${stepNumber}-${stepNumber + 1}`}
                  className={cn(
                    'mx-2 h-0.5 flex-1 transition-colors',
                    {
                      'bg-brand-purple': isCompleted(stepNumber + 1) || isCurrent(stepNumber + 1),
                      'bg-zinc-700': !isCompleted(stepNumber + 1) && !isCurrent(stepNumber + 1),
                    }
                  )}
                  aria-hidden="true"
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
 * Check icon component for completed steps
 */
function CheckIcon({ stepNumber }: { stepNumber: number }): React.ReactElement {
  return (
    <svg
      data-testid={`step-check-${stepNumber}`}
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

StepProgress.displayName = 'StepProgress';
