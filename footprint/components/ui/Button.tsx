'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from './utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg' | 'icon';
  /** Show loading spinner */
  loading?: boolean;
  /** Stretch to full width of container */
  fullWidth?: boolean;
  /** Render as child element (for link buttons) */
  asChild?: boolean;
}

/**
 * Button component - Primary interaction element
 * Supports multiple variants, sizes, and states
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading ? 'true' : undefined}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2',

          // Variant styles
          {
            'bg-brand-purple text-white hover:bg-brand-purple/90 shadow-brand': variant === 'primary',
            'bg-light-muted text-text-primary hover:bg-light-border': variant === 'secondary',
            'bg-transparent text-text-primary hover:bg-light-muted': variant === 'ghost',
            'bg-red-500 text-white hover:bg-red-600': variant === 'destructive',
            'border border-zinc-200 bg-transparent text-zinc-700 hover:bg-zinc-100': variant === 'outline',
          },

          // Size styles
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-base': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
            'h-8 w-8 p-0': size === 'icon',
          },

          // State styles
          {
            'opacity-50 cursor-not-allowed': isDisabled,
            'w-full': fullWidth,
          },

          className
        )}
        {...props}
      >
        {loading && (
          <svg
            data-testid="button-spinner"
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
