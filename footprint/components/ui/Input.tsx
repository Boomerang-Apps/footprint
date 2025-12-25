'use client';

import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from './utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Show error state styling */
  error?: boolean;
  /** Error message to display below input */
  errorMessage?: string;
}

/**
 * Input component - Text entry field
 * Supports error states, RTL, and accessibility
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, errorMessage, disabled, ...props }, ref) => {
    const errorId = useId();

    return (
      <div className="w-full">
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error && errorMessage ? errorId : undefined}
          className={cn(
            // Base styles
            'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm',
            'transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-text-muted',

            // Focus styles
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2',

            // Border styles
            error
              ? 'border-red-500 focus-visible:ring-red-500'
              : 'border-light-border hover:border-light-border-soft',

            // Disabled styles
            disabled && 'opacity-50 cursor-not-allowed bg-light-muted',

            className
          )}
          {...props}
        />
        {error && errorMessage && (
          <p id={errorId} className="mt-1.5 text-sm text-red-500">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
