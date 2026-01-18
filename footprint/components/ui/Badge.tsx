import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from './utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual style variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand' | 'secondary' | 'destructive' | 'outline';
  /** Size of the badge */
  size?: 'sm' | 'md';
  /** Icon to display before text */
  icon?: ReactNode;
  /** Show a dot indicator */
  showDot?: boolean;
}

/**
 * Badge component - Status indicator
 * Used for labels, tags, and status
 */
export function Badge({
  className,
  variant = 'default',
  size = 'md',
  icon,
  showDot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        // Base styles
        'inline-flex items-center gap-1 rounded-full font-medium',

        // Size styles
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-0.5 text-xs': size === 'md',
        },

        // Variant styles
        {
          'bg-light-muted text-text-primary': variant === 'default',
          'bg-green-100 text-green-800': variant === 'success',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
          'bg-red-100 text-red-800': variant === 'error',
          'bg-blue-100 text-blue-800': variant === 'info',
          'bg-brand-purple text-white': variant === 'brand',
          'bg-zinc-100 text-zinc-700': variant === 'secondary',
          'bg-red-500 text-white': variant === 'destructive',
          'border border-zinc-200 bg-transparent text-zinc-700': variant === 'outline',
        },

        className
      )}
      {...props}
    >
      {icon}
      {showDot && (
        <span
          data-testid="badge-dot"
          className="h-1.5 w-1.5 rounded-full bg-current"
        />
      )}
      {children}
    </span>
  );
}
