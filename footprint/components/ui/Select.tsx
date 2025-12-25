'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from './utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /** Options to display in the select */
  options: SelectOption[];
  /** Placeholder text shown when no option selected */
  placeholder?: string;
  /** Show error state styling */
  error?: boolean;
}

/**
 * Select component - Dropdown selection
 * Wraps native select with consistent styling
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, error, disabled, ...props }, ref) => {
    return (
      <select
        ref={ref}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        className={cn(
          // Base styles
          'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm',
          'transition-colors appearance-none',
          'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20viewBox%3D%270%200%2020%2020%27%3E%3Cpath%20stroke%3D%27%236b7280%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%271.5%27%20d%3D%27m6%208%204%204%204-4%27%2F%3E%3C%2Fsvg%3E")]',
          'bg-[length:1.5rem_1.5rem] bg-[right_0.5rem_center] bg-no-repeat pr-10',

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
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';
