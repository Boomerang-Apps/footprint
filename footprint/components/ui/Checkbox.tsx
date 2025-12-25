'use client';

import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from './utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label text to display next to checkbox */
  label?: string;
  /** Position of label relative to checkbox (for RTL support) */
  labelPosition?: 'start' | 'end';
}

/**
 * Checkbox component - Boolean toggle
 * Supports RTL label positioning
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, labelPosition = 'end', disabled, id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;

    const checkbox = (
      <input
        ref={ref}
        type="checkbox"
        id={id}
        disabled={disabled}
        className={cn(
          // Base styles
          'h-4 w-4 rounded border border-light-border',
          'accent-brand-purple',
          'transition-colors',

          // Focus styles
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2',

          // Disabled styles
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        {...props}
      />
    );

    const labelElement = label ? (
      <label
        htmlFor={id}
        className={cn(
          'text-sm text-text-primary',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {label}
      </label>
    ) : null;

    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        {labelPosition === 'start' && labelElement}
        {checkbox}
        {labelPosition === 'end' && labelElement}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
