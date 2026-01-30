import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { OrderStatus } from '@/types';

describe('OrderStatusBadge', () => {
  describe('Status Icons and Labels', () => {
    it('renders pending status with clock icon and yellow background', () => {
      render(<OrderStatusBadge status="pending" />);

      const badge = screen.getByTestId('order-status-badge');
      const icon = screen.getByTestId('status-icon');

      expect(badge).toHaveTextContent('ממתין לתשלום');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
      expect(icon).toHaveClass('h-3.5', 'w-3.5');
    });

    it('renders paid status with check icon and green background', () => {
      render(<OrderStatusBadge status="paid" />);

      const badge = screen.getByTestId('order-status-badge');
      expect(badge).toHaveTextContent('שולם');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('renders processing status with clock icon and blue background', () => {
      render(<OrderStatusBadge status="processing" />);

      const badge = screen.getByTestId('order-status-badge');
      expect(badge).toHaveTextContent('בהכנה');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('renders printing status with printer icon and blue background', () => {
      render(<OrderStatusBadge status="printing" />);

      const badge = screen.getByTestId('order-status-badge');
      expect(badge).toHaveTextContent('בהדפסה');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('renders shipped status with truck icon and purple background', () => {
      render(<OrderStatusBadge status="shipped" />);

      const badge = screen.getByTestId('order-status-badge');
      expect(badge).toHaveTextContent('נשלח');
      expect(badge).toHaveClass('bg-purple-100', 'text-purple-800');
    });

    it('renders delivered status with check circle icon and green background', () => {
      render(<OrderStatusBadge status="delivered" />);

      const badge = screen.getByTestId('order-status-badge');
      expect(badge).toHaveTextContent('הגיע');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('renders cancelled status with X icon and red background', () => {
      render(<OrderStatusBadge status="cancelled" />);

      const badge = screen.getByTestId('order-status-badge');
      expect(badge).toHaveTextContent('בוטל');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });
  });

  describe('Size Variants', () => {
    it('renders small size with appropriate classes', () => {
      render(<OrderStatusBadge status="shipped" size="sm" />);

      const badge = screen.getByTestId('order-status-badge');
      expect(badge).toHaveClass('px-2', 'py-1', 'text-xs');
    });

    it('renders medium size with appropriate classes', () => {
      render(<OrderStatusBadge status="shipped" size="md" />);

      const badge = screen.getByTestId('order-status-badge');
      expect(badge).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });
  });

  describe('Accessibility', () => {
    it('provides proper aria-label for screen readers', () => {
      render(<OrderStatusBadge status="shipped" />);

      const badge = screen.getByTestId('order-status-badge');
      expect(badge).toHaveAttribute('aria-label', 'Order Status: Shipped');
    });

    it('supports custom className', () => {
      render(<OrderStatusBadge status="delivered" className="custom-class" />);

      const badge = screen.getByTestId('order-status-badge');
      expect(badge).toHaveClass('custom-class');
    });
  });
});