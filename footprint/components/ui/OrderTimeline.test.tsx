/**
 * OrderTimeline Component Tests
 * TDD Test Suite for UI-09: Price Display & Timeline Components
 * Updated to match 5-step horizontal/vertical stepper implementation
 */

import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { OrderTimeline, type OrderStatus } from './OrderTimeline';

describe('OrderTimeline', () => {
  describe('Rendering', () => {
    it('renders all 5 order status steps', () => {
      render(<OrderTimeline currentStatus="pending" />);

      expect(screen.getByText('התקבלה')).toBeInTheDocument();
      expect(screen.getByText('שולם')).toBeInTheDocument();
      expect(screen.getByText('בהכנה')).toBeInTheDocument();
      expect(screen.getByText('נשלח')).toBeInTheDocument();
      expect(screen.getByText('הגיע')).toBeInTheDocument();
    });

    it('renders English labels when locale is en', () => {
      render(<OrderTimeline currentStatus="pending" locale="en" />);

      expect(screen.getByText('Received')).toBeInTheDocument();
      expect(screen.getByText('Paid')).toBeInTheDocument();
      expect(screen.getByText('In Production')).toBeInTheDocument();
      expect(screen.getByText('Shipped')).toBeInTheDocument();
      expect(screen.getByText('Delivered')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      const { container } = render(
        <OrderTimeline currentStatus="pending" className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Current Status Highlighting', () => {
    it('highlights first step as current when status is pending', () => {
      render(<OrderTimeline currentStatus="pending" />);

      const step = screen.getByTestId('status-step-0');
      expect(step).toHaveAttribute('aria-current', 'step');
    });

    it('highlights second step as current when status is paid', () => {
      render(<OrderTimeline currentStatus="paid" />);

      const step = screen.getByTestId('status-step-1');
      expect(step).toHaveAttribute('aria-current', 'step');
    });

    it('highlights third step as current when status is processing', () => {
      render(<OrderTimeline currentStatus="processing" />);

      const step = screen.getByTestId('status-step-2');
      expect(step).toHaveAttribute('aria-current', 'step');
    });

    it('highlights fourth step as current when status is shipped', () => {
      render(<OrderTimeline currentStatus="shipped" />);

      const step = screen.getByTestId('status-step-3');
      expect(step).toHaveAttribute('aria-current', 'step');
    });

    it('highlights fifth step as current when status is delivered', () => {
      render(<OrderTimeline currentStatus="delivered" />);

      const step = screen.getByTestId('status-step-4');
      expect(step).toHaveAttribute('aria-current', 'step');
    });

    it('applies active styling to current status indicator', () => {
      render(<OrderTimeline currentStatus="processing" layout="horizontal" />);

      const indicator = screen.getByTestId('status-indicator-2');
      expect(indicator).toHaveClass('bg-zinc-900');
    });
  });

  describe('Completed Steps', () => {
    it('shows checkmark for completed steps', () => {
      render(<OrderTimeline currentStatus="shipped" layout="horizontal" />);

      // First 3 steps (0, 1, 2) should show checkmarks
      const indicator0 = screen.getByTestId('status-indicator-0');
      const indicator1 = screen.getByTestId('status-indicator-1');
      const indicator2 = screen.getByTestId('status-indicator-2');

      expect(indicator0.querySelector('svg')).toBeInTheDocument();
      expect(indicator1.querySelector('svg')).toBeInTheDocument();
      expect(indicator2.querySelector('svg')).toBeInTheDocument();
    });

    it('does not show checkmark for current step', () => {
      render(<OrderTimeline currentStatus="processing" layout="horizontal" />);

      // Step 2 (processing) is current, should show number not checkmark
      const indicator = screen.getByTestId('status-indicator-2');
      expect(indicator).toHaveTextContent('3');
    });

    it('does not show checkmark for future steps', () => {
      render(<OrderTimeline currentStatus="processing" layout="horizontal" />);

      // Steps 3 and 4 are future, should show numbers
      const indicator3 = screen.getByTestId('status-indicator-3');
      const indicator4 = screen.getByTestId('status-indicator-4');

      expect(indicator3).toHaveTextContent('4');
      expect(indicator4).toHaveTextContent('5');
    });

    it('applies active styling to completed indicators', () => {
      render(<OrderTimeline currentStatus="shipped" layout="horizontal" />);

      const indicator = screen.getByTestId('status-indicator-0');
      expect(indicator).toHaveClass('bg-zinc-900');
    });
  });

  describe('Future Steps', () => {
    it('applies muted styling to future step indicators', () => {
      render(<OrderTimeline currentStatus="pending" layout="horizontal" />);

      const indicator = screen.getByTestId('status-indicator-3');
      expect(indicator).toHaveClass('bg-white');
      expect(indicator).toHaveClass('text-zinc-400');
    });
  });

  describe('RTL Support', () => {
    it('applies RTL direction when locale is he', () => {
      const { container } = render(
        <OrderTimeline currentStatus="pending" locale="he" />
      );

      expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    });

    it('applies LTR direction when locale is en', () => {
      const { container } = render(
        <OrderTimeline currentStatus="pending" locale="en" />
      );

      expect(container.firstChild).toHaveAttribute('dir', 'ltr');
    });

    it('defaults to Hebrew (RTL)', () => {
      const { container } = render(<OrderTimeline currentStatus="pending" />);

      expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Accessibility', () => {
    it('has proper nav role', () => {
      render(<OrderTimeline currentStatus="pending" />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('has aria-label for navigation', () => {
      render(<OrderTimeline currentStatus="pending" />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'סטטוס הזמנה');
    });

    it('has English aria-label when locale is en', () => {
      render(<OrderTimeline currentStatus="pending" locale="en" />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Order status');
    });

    it('uses ordered list for steps', () => {
      render(<OrderTimeline currentStatus="pending" />);

      expect(screen.getByRole('list')).toBeInTheDocument();
    });
  });

  describe('Layout Variants', () => {
    it('renders vertical layout by default', () => {
      const { container } = render(<OrderTimeline currentStatus="pending" />);

      const list = container.querySelector('ol');
      expect(list).toHaveClass('flex-col');
    });

    it('renders horizontal layout when specified', () => {
      const { container } = render(
        <OrderTimeline currentStatus="pending" layout="horizontal" />
      );

      const list = container.querySelector('ol');
      expect(list).not.toHaveClass('flex-col');
    });
  });

  describe('Edge Cases', () => {
    it('handles first status correctly', () => {
      render(<OrderTimeline currentStatus="pending" />);

      expect(screen.getByTestId('status-step-0')).toHaveAttribute('aria-current', 'step');
    });

    it('handles last status correctly (all previous completed)', () => {
      render(<OrderTimeline currentStatus="delivered" layout="horizontal" />);

      // All previous steps should have checkmarks
      const indicator0 = screen.getByTestId('status-indicator-0');
      const indicator1 = screen.getByTestId('status-indicator-1');
      const indicator2 = screen.getByTestId('status-indicator-2');
      const indicator3 = screen.getByTestId('status-indicator-3');

      expect(indicator0.querySelector('svg')).toBeInTheDocument();
      expect(indicator1.querySelector('svg')).toBeInTheDocument();
      expect(indicator2.querySelector('svg')).toBeInTheDocument();
      expect(indicator3.querySelector('svg')).toBeInTheDocument();

      // Current step shows number
      const indicator4 = screen.getByTestId('status-indicator-4');
      expect(indicator4).toHaveTextContent('5');
    });

    it('handles cancelled status', () => {
      render(<OrderTimeline currentStatus="cancelled" />);

      // Cancelled maps to step -1, so no step should be current
      expect(screen.queryByTestId('status-step-0')).not.toHaveAttribute('aria-current');
    });

    it('handles printing status (maps to processing step)', () => {
      render(<OrderTimeline currentStatus="printing" />);

      // printing maps to step 2 (same as processing)
      const step = screen.getByTestId('status-step-2');
      expect(step).toHaveAttribute('aria-current', 'step');
    });
  });
});
