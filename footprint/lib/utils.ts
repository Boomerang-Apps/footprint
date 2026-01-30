import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with clsx and merges Tailwind classes intelligently
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format date for Hebrew order display
 * Returns Hebrew formatted date with appropriate labels
 */
export function formatOrderDate(date: Date): string {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  // Today
  if (diffInDays === 0) {
    const timeString = date.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `היום, ${timeString}`;
  }

  // Yesterday
  if (diffInDays === 1) {
    const timeString = date.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `אתמול, ${timeString}`;
  }

  // Older dates - full date format
  return date.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format price for display in Hebrew locale
 */
export function formatPrice(amount: number): string {
  return `₪${amount.toLocaleString('he-IL')}`;
}

/**
 * Calculate order statistics from array of orders
 */
export function calculateOrderStats(orders: Array<{ total: number; status: string }>) {
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const inTransitCount = orders.filter(order =>
    ['processing', 'printing', 'shipped'].includes(order.status)
  ).length;

  return {
    totalOrders,
    totalSpent,
    inTransitCount,
  };
}