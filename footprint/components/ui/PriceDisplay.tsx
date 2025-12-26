'use client';

import { cn } from './utils';

export interface PriceDisplayProps {
  /** Amount in ILS (can be negative for discounts) */
  amount: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show strikethrough for original prices */
  strikethrough?: boolean;
  /** Show "Free" text for zero amounts */
  showZeroAsPrice?: boolean;
  /** Add thousands separator (e.g., 1,500) */
  showThousandsSeparator?: boolean;
  /** Locale for text ('en' or 'he') */
  locale?: 'en' | 'he';
  /** Color variant */
  color?: 'default' | 'success' | 'muted';
  /** Additional CSS classes */
  className?: string;
}

/**
 * PriceDisplay - ILS currency formatting component
 * Displays prices in Israeli Shekels with proper formatting
 */
export function PriceDisplay({
  amount,
  size = 'md',
  strikethrough = false,
  showZeroAsPrice = false,
  showThousandsSeparator = false,
  locale = 'he',
  color = 'default',
  className,
}: PriceDisplayProps): React.ReactElement {
  const isRtl = locale === 'he';
  const isZero = amount === 0;
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);

  // Format the numeric part
  const formatAmount = (value: number): string => {
    const hasDecimals = value % 1 !== 0;

    if (hasDecimals) {
      const formatted = value.toFixed(2);
      if (showThousandsSeparator) {
        const [intPart, decPart] = formatted.split('.');
        return `${Number(intPart).toLocaleString('en-US')}.${decPart}`;
      }
      return formatted;
    }

    if (showThousandsSeparator) {
      return value.toLocaleString('en-US');
    }

    return value.toString();
  };

  // Get display text
  const getDisplayText = (): string => {
    if (isZero && !showZeroAsPrice) {
      return locale === 'he' ? 'חינם' : 'Free';
    }

    const formattedAmount = formatAmount(absoluteAmount);
    const prefix = isNegative ? '-' : '';
    return `${prefix}₪${formattedAmount}`;
  };

  // Get aria label
  const getAriaLabel = (): string => {
    if (isZero && !showZeroAsPrice) {
      return 'Free';
    }

    const amountText = `${absoluteAmount} Israeli Shekels`;

    if (strikethrough) {
      return `Original price: ${amountText}`;
    }

    return amountText;
  };

  // Determine color class
  const getColorClass = (): string => {
    // Negative amounts (discounts) always get success color
    if (isNegative) {
      return 'text-green-500';
    }

    // Strikethrough prices get muted styling
    if (strikethrough) {
      return 'text-zinc-500';
    }

    switch (color) {
      case 'success':
        return 'text-green-500';
      case 'muted':
        return 'text-zinc-400';
      default:
        return 'text-white';
    }
  };

  return (
    <span
      data-testid="price-display"
      dir={isRtl ? 'rtl' : 'ltr'}
      aria-label={getAriaLabel()}
      className={cn(
        'font-medium',
        // Size classes
        {
          'text-sm': size === 'sm',
          'text-base': size === 'md',
          'text-xl': size === 'lg',
          'text-2xl': size === 'xl',
        },
        // Strikethrough
        strikethrough && 'line-through',
        // Color
        getColorClass(),
        className
      )}
    >
      {getDisplayText()}
    </span>
  );
}

PriceDisplay.displayName = 'PriceDisplay';
