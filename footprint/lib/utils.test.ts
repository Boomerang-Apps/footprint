/**
 * Utility Function Tests
 *
 * Tests for cn, formatOrderDate, formatPrice, and calculateOrderStats.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { cn, formatOrderDate, formatPrice, calculateOrderStats } from './utils';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('should merge conflicting Tailwind classes', () => {
    // twMerge should resolve conflicts - last wins
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });

  it('should handle undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });

  it('should handle empty input', () => {
    expect(cn()).toBe('');
  });

  it('should handle arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('should handle objects', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });
});

describe('formatOrderDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should format today with Hebrew "היום"', () => {
    const now = new Date();
    const result = formatOrderDate(now);
    expect(result).toContain('היום');
    expect(result).toContain(',');
  });

  it('should format yesterday with Hebrew "אתמול"', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = formatOrderDate(yesterday);
    expect(result).toContain('אתמול');
  });

  it('should format older dates as dd/mm/yyyy', () => {
    const oldDate = new Date('2024-06-15T12:00:00');
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-20T12:00:00'));

    const result = formatOrderDate(oldDate);
    // Should be a date format, not "היום" or "אתמול"
    expect(result).not.toContain('היום');
    expect(result).not.toContain('אתמול');
    expect(result).toMatch(/\d/);
  });

  it('should accept string dates', () => {
    const result = formatOrderDate('2023-01-15T10:00:00');
    // Older date - should be formatted as date
    expect(result).not.toContain('היום');
    expect(result).toMatch(/\d/);
  });

  it('should include time for today', () => {
    const now = new Date();
    const result = formatOrderDate(now);
    // Should contain time like "12:30"
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it('should include time for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = formatOrderDate(yesterday);
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe('formatPrice', () => {
  it('should format with shekel symbol', () => {
    expect(formatPrice(100)).toContain('₪');
  });

  it('should format integer price', () => {
    const result = formatPrice(100);
    expect(result).toBe('₪100');
  });

  it('should format zero', () => {
    expect(formatPrice(0)).toBe('₪0');
  });

  it('should format large numbers with locale separators', () => {
    const result = formatPrice(1000);
    // Hebrew locale uses comma as thousands separator
    expect(result).toContain('1');
    expect(result).toContain('000');
  });
});

describe('calculateOrderStats', () => {
  it('should calculate total orders', () => {
    const orders = [
      { total: 100, status: 'delivered' },
      { total: 200, status: 'paid' },
    ];
    const stats = calculateOrderStats(orders);
    expect(stats.totalOrders).toBe(2);
  });

  it('should sum total spent', () => {
    const orders = [
      { total: 100, status: 'delivered' },
      { total: 200, status: 'paid' },
      { total: 50, status: 'pending' },
    ];
    const stats = calculateOrderStats(orders);
    expect(stats.totalSpent).toBe(350);
  });

  it('should count in-transit orders', () => {
    const orders = [
      { total: 100, status: 'processing' },
      { total: 200, status: 'printing' },
      { total: 150, status: 'shipped' },
      { total: 50, status: 'delivered' },
      { total: 75, status: 'pending' },
    ];
    const stats = calculateOrderStats(orders);
    expect(stats.inTransitCount).toBe(3);
  });

  it('should handle empty array', () => {
    const stats = calculateOrderStats([]);
    expect(stats.totalOrders).toBe(0);
    expect(stats.totalSpent).toBe(0);
    expect(stats.inTransitCount).toBe(0);
  });

  it('should not count delivered or pending as in-transit', () => {
    const orders = [
      { total: 100, status: 'delivered' },
      { total: 200, status: 'pending' },
      { total: 300, status: 'paid' },
      { total: 400, status: 'cancelled' },
    ];
    const stats = calculateOrderStats(orders);
    expect(stats.inTransitCount).toBe(0);
  });
});
