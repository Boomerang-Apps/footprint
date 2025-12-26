/**
 * OrderTimeline Component Tests
 * TDD Test Suite for UI-09: Price Display & Timeline Components
 */

import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { OrderTimeline, type OrderStatus } from './OrderTimeline';

describe('OrderTimeline', () => {
  describe('Rendering', () => {
    it('renders all 4 order status steps', () => {
      render(<OrderTimeline currentStatus="received" />);

      expect(screen.getByText('הזמנה התקבלה')).toBeInTheDocument();
      expect(screen.getByText('בהכנה')).toBeInTheDocument();
      expect(screen.getByText('נשלח')).toBeInTheDocument();
      expect(screen.getByText('נמסר')).toBeInTheDocument();
    });

    it('renders English labels when locale is en', () => {
      render(<OrderTimeline currentStatus="received" locale="en" />);

      expect(screen.getByText('Order Received')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
      expect(screen.getByText('Shipped')).toBeInTheDocument();
      expect(screen.getByText('Delivered')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      const { container } = render(
        <OrderTimeline currentStatus="received" className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Current Status Highlighting', () => {
    it('highlights received as current when status is received', () => {
      render(<OrderTimeline currentStatus="received" />);

      const step = screen.getByTestId('status-received');
      expect(step).toHaveAttribute('aria-current', 'step');
    });

    it('highlights processing as current when status is processing', () => {
      render(<OrderTimeline currentStatus="processing" />);

      const step = screen.getByTestId('status-processing');
      expect(step).toHaveAttribute('aria-current', 'step');
    });

    it('highlights shipped as current when status is shipped', () => {
      render(<OrderTimeline currentStatus="shipped" />);

      const step = screen.getByTestId('status-shipped');
      expect(step).toHaveAttribute('aria-current', 'step');
    });

    it('highlights delivered as current when status is delivered', () => {
      render(<OrderTimeline currentStatus="delivered" />);

      const step = screen.getByTestId('status-delivered');
      expect(step).toHaveAttribute('aria-current', 'step');
    });

    it('applies active styling to current status indicator', () => {
      render(<OrderTimeline currentStatus="processing" />);

      const indicator = screen.getByTestId('status-indicator-processing');
      expect(indicator).toHaveClass('bg-brand-purple');
    });
  });

  describe('Completed Steps', () => {
    it('shows checkmark for completed steps', () => {
      render(<OrderTimeline currentStatus="shipped" />);

      // Received and Processing should be completed
      expect(screen.getByTestId('status-check-received')).toBeInTheDocument();
      expect(screen.getByTestId('status-check-processing')).toBeInTheDocument();
    });

    it('does not show checkmark for current step', () => {
      render(<OrderTimeline currentStatus="processing" />);

      expect(screen.queryByTestId('status-check-processing')).not.toBeInTheDocument();
    });

    it('does not show checkmark for future steps', () => {
      render(<OrderTimeline currentStatus="processing" />);

      expect(screen.queryByTestId('status-check-shipped')).not.toBeInTheDocument();
      expect(screen.queryByTestId('status-check-delivered')).not.toBeInTheDocument();
    });

    it('applies completed styling to completed indicators', () => {
      render(<OrderTimeline currentStatus="shipped" />);

      const indicator = screen.getByTestId('status-indicator-received');
      expect(indicator).toHaveClass('bg-brand-purple');
    });
  });

  describe('Future Steps', () => {
    it('applies muted styling to future step indicators', () => {
      render(<OrderTimeline currentStatus="received" />);

      const indicator = screen.getByTestId('status-indicator-shipped');
      expect(indicator).toHaveClass('bg-zinc-700');
    });

    it('applies muted styling to future step labels', () => {
      render(<OrderTimeline currentStatus="received" />);

      const step = screen.getByTestId('status-shipped');
      const label = within(step).getByText('נשלח');
      expect(label).toHaveClass('text-zinc-500');
    });
  });

  describe('Connector Lines', () => {
    it('renders connector lines between steps', () => {
      render(<OrderTimeline currentStatus="received" />);

      expect(screen.getByTestId('connector-received-processing')).toBeInTheDocument();
      expect(screen.getByTestId('connector-processing-shipped')).toBeInTheDocument();
      expect(screen.getByTestId('connector-shipped-delivered')).toBeInTheDocument();
    });

    it('applies active styling to completed connectors', () => {
      render(<OrderTimeline currentStatus="shipped" />);

      const connector = screen.getByTestId('connector-received-processing');
      expect(connector).toHaveClass('bg-brand-purple');
    });

    it('applies muted styling to future connectors', () => {
      render(<OrderTimeline currentStatus="received" />);

      const connector = screen.getByTestId('connector-processing-shipped');
      expect(connector).toHaveClass('bg-zinc-700');
    });
  });

  describe('Estimated Dates', () => {
    it('displays estimated dates when provided', () => {
      const dates: Record<OrderStatus, string> = {
        received: '2025-12-26',
        processing: '2025-12-27',
        shipped: '2025-12-28',
        delivered: '2025-12-30',
      };

      render(<OrderTimeline currentStatus="received" estimatedDates={dates} />);

      expect(screen.getByText('26/12')).toBeInTheDocument();
      expect(screen.getByText('27/12')).toBeInTheDocument();
    });

    it('does not show dates when not provided', () => {
      render(<OrderTimeline currentStatus="received" />);

      expect(screen.queryByTestId('date-received')).not.toBeInTheDocument();
    });
  });

  describe('RTL Support', () => {
    it('applies RTL direction when locale is he', () => {
      const { container } = render(
        <OrderTimeline currentStatus="received" locale="he" />
      );

      expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    });

    it('applies LTR direction when locale is en', () => {
      const { container } = render(
        <OrderTimeline currentStatus="received" locale="en" />
      );

      expect(container.firstChild).toHaveAttribute('dir', 'ltr');
    });

    it('defaults to Hebrew (RTL)', () => {
      const { container } = render(<OrderTimeline currentStatus="received" />);

      expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Accessibility', () => {
    it('has proper nav role', () => {
      render(<OrderTimeline currentStatus="received" />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('has aria-label for navigation', () => {
      render(<OrderTimeline currentStatus="received" />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'סטטוס הזמנה');
    });

    it('has English aria-label when locale is en', () => {
      render(<OrderTimeline currentStatus="received" locale="en" />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Order status');
    });

    it('uses ordered list for steps', () => {
      render(<OrderTimeline currentStatus="received" />);

      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('marks completed steps with aria-label', () => {
      render(<OrderTimeline currentStatus="shipped" />);

      const step = screen.getByTestId('status-received');
      expect(step).toHaveAttribute('aria-label', expect.stringContaining('completed'));
    });
  });

  describe('Layout Variants', () => {
    it('renders vertical layout by default', () => {
      const { container } = render(<OrderTimeline currentStatus="received" />);

      const list = container.querySelector('ol');
      expect(list).toHaveClass('flex-col');
    });

    it('renders horizontal layout when specified', () => {
      const { container } = render(
        <OrderTimeline currentStatus="received" layout="horizontal" />
      );

      const list = container.querySelector('ol');
      expect(list).toHaveClass('flex-row');
    });
  });

  describe('Edge Cases', () => {
    it('handles first status correctly', () => {
      render(<OrderTimeline currentStatus="received" />);

      expect(screen.queryByTestId('status-check-received')).not.toBeInTheDocument();
      expect(screen.getByTestId('status-received')).toHaveAttribute('aria-current', 'step');
    });

    it('handles last status correctly (all previous completed)', () => {
      render(<OrderTimeline currentStatus="delivered" />);

      expect(screen.getByTestId('status-check-received')).toBeInTheDocument();
      expect(screen.getByTestId('status-check-processing')).toBeInTheDocument();
      expect(screen.getByTestId('status-check-shipped')).toBeInTheDocument();
      expect(screen.queryByTestId('status-check-delivered')).not.toBeInTheDocument();
    });
  });
});
