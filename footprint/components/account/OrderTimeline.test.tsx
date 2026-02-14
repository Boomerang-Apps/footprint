import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OrderTimeline } from './OrderTimeline';
import type { Order } from '@/types';

// Mock order data
const createMockOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'demo_order_001',
  userId: 'user_001',
  status: 'processing',
  items: [],
  subtotal: 221,
  shipping: 29,
  discount: 0,
  total: 250,
  isGift: false,
  giftMessage: null,
  giftWrap: false,
  wrappingStyle: null,
  scheduledDeliveryDate: null,
  shippingAddress: { name: 'Test', street: 'Test St', city: 'Tel Aviv', postalCode: '12345', country: 'Israel' },
  billingAddress: { name: 'Test', street: 'Test St', city: 'Tel Aviv', postalCode: '12345', country: 'Israel' },
  paymentTransactionId: null,
  paidAt: new Date('2024-12-20T10:00:00'),
  trackingNumber: null,
  carrier: null,
  shippedAt: null,
  deliveredAt: null,
  createdAt: new Date('2024-12-20T10:00:00'),
  updatedAt: new Date('2024-12-20T10:00:00'),
  ...overrides,
});

describe('OrderTimeline', () => {
  // ═══════════════════════════════════════════════════════════════
  // AC-001: WHEN user views OrderTimeline
  //         THEN layout is vertical (flex-col) with connecting lines
  // ═══════════════════════════════════════════════════════════════
  describe('AC-001: Vertical Layout', () => {
    it('renders all timeline steps in a vertical layout', () => {
      const order = createMockOrder();
      render(<OrderTimeline order={order} />);

      expect(screen.getByText('בעיבוד')).toBeInTheDocument();
      expect(screen.getByText('בהדפסה')).toBeInTheDocument();
      expect(screen.getByText('נשלח')).toBeInTheDocument();
      expect(screen.getByText('הגיע')).toBeInTheDocument();
    });

    it('uses vertical flex-col layout instead of horizontal', () => {
      const order = createMockOrder();
      render(<OrderTimeline order={order} />);

      // Must use flex-col for vertical stacking
      const verticalContainer = document.querySelector('.flex.flex-col.gap-0');
      expect(verticalContainer).toBeInTheDocument();
    });

    it('renders connecting lines between steps (not last step)', () => {
      // Use order without paidAt so all 5 steps render
      const order = createMockOrder({ paidAt: null });
      render(<OrderTimeline order={order} />);

      // Vertical connecting lines between step circles
      const connectingLines = document.querySelectorAll('.w-0\\.5.h-8');
      // 5 steps means 4 connecting lines
      expect(connectingLines.length).toBe(4);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AC-002: WHEN order step is completed THEN connecting line is purple
  //         WHEN upcoming THEN connecting line is gray
  // ═══════════════════════════════════════════════════════════════
  describe('AC-002: Connecting Line Colors', () => {
    it('shows purple connecting lines for completed steps', () => {
      const order = createMockOrder({ status: 'shipped' });
      render(<OrderTimeline order={order} />);

      // Completed steps should have purple connecting lines
      const purpleLines = document.querySelectorAll('.w-0\\.5.h-8.bg-purple-600');
      expect(purpleLines.length).toBeGreaterThan(0);
    });

    it('shows gray connecting lines for upcoming steps', () => {
      const order = createMockOrder({ status: 'processing' });
      render(<OrderTimeline order={order} />);

      // Upcoming steps should have gray connecting lines
      const grayLines = document.querySelectorAll('.w-0\\.5.h-8.bg-gray-200');
      expect(grayLines.length).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AC-003: WHEN order step is completed or current
  //         THEN date is displayed using formatOrderDate
  // ═══════════════════════════════════════════════════════════════
  describe('AC-003: Date Rendering', () => {
    it('shows dates for completed and current steps', () => {
      const order = createMockOrder({
        status: 'processing',
        createdAt: new Date('2024-12-20T10:00:00'),
      });
      render(<OrderTimeline order={order} />);

      const stepDates = screen.getAllByTestId('step-date');
      expect(stepDates.length).toBeGreaterThan(0);
    });

    it('does not show dates for upcoming steps', () => {
      const order = createMockOrder({ status: 'processing' });
      render(<OrderTimeline order={order} />);

      // Count date elements - should be fewer than total steps
      const stepDates = screen.queryAllByTestId('step-date');
      // Only completed + current steps have dates, not upcoming
      expect(stepDates.length).toBeLessThan(5);
    });

    it('shows shipped date for shipped orders', () => {
      const order = createMockOrder({
        status: 'shipped',
        shippedAt: new Date('2024-12-22T14:00:00'),
      });
      render(<OrderTimeline order={order} />);

      const stepDates = screen.getAllByTestId('step-date');
      expect(stepDates.length).toBeGreaterThan(0);
    });

    it('shows delivered date for delivered orders', () => {
      const order = createMockOrder({
        status: 'delivered',
        deliveredAt: new Date('2024-12-25T10:00:00'),
        shippedAt: new Date('2024-12-22T14:00:00'),
      });
      render(<OrderTimeline order={order} />);

      const stepDates = screen.getAllByTestId('step-date');
      // All steps should have dates (all completed/current)
      expect(stepDates.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Status Display', () => {
    it('shows current status with special styling', () => {
      const order = createMockOrder({ status: 'processing' });
      render(<OrderTimeline order={order} />);

      const currentStep = document.querySelector('.ring-purple-50');
      expect(currentStep).toBeInTheDocument();
    });

    it('marks completed steps correctly', () => {
      const order = createMockOrder({ status: 'shipped' });
      render(<OrderTimeline order={order} />);

      const checkIcons = document.querySelectorAll('.bg-purple-600');
      expect(checkIcons.length).toBeGreaterThan(0);
    });

    it('shows upcoming steps as inactive', () => {
      const order = createMockOrder({ status: 'processing' });
      render(<OrderTimeline order={order} />);

      const upcomingSteps = document.querySelectorAll('.text-gray-400');
      expect(upcomingSteps.length).toBeGreaterThan(0);
    });
  });

  describe('Status Progression', () => {
    it('marks shipped steps as completed', () => {
      const order = createMockOrder({
        status: 'shipped',
        createdAt: new Date('2024-12-20T10:00:00'),
        shippedAt: new Date('2024-12-22T14:00:00'),
      });
      render(<OrderTimeline order={order} />);

      // Shipped status should have multiple completed steps
      const completedSteps = document.querySelectorAll('.bg-purple-600');
      expect(completedSteps.length).toBeGreaterThan(0);
    });

    it('shows delivered step label', () => {
      const order = createMockOrder({
        status: 'delivered',
        deliveredAt: new Date('2024-12-24T10:00:00'),
        shippedAt: new Date('2024-12-22T10:00:00'),
      });
      render(<OrderTimeline order={order} />);

      expect(screen.getByText('הגיע')).toBeInTheDocument();
    });
  });

  describe('Cancelled/Refunded Orders', () => {
    it('shows cancelled message for cancelled orders', () => {
      const order = createMockOrder({ status: 'cancelled' });
      render(<OrderTimeline order={order} />);

      expect(screen.getByText('ההזמנה בוטלה')).toBeInTheDocument();
    });

    it('displays cancelled message correctly', () => {
      const order = createMockOrder({
        status: 'cancelled',
      });
      render(<OrderTimeline order={order} />);

      expect(screen.getByText('ההזמנה בוטלה')).toBeInTheDocument();
    });
  });

  describe('RTL Support', () => {
    it('renders with RTL direction', () => {
      const order = createMockOrder();
      render(<OrderTimeline order={order} />);

      const container = screen.getByText('בעיבוד').closest('div[dir="rtl"]');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Delivered Status', () => {
    it('shows all steps as completed for delivered orders', () => {
      const order = createMockOrder({
        status: 'delivered',
        deliveredAt: new Date('2024-12-25T10:00:00'),
      });
      render(<OrderTimeline order={order} />);

      // Completed step circles should have purple styling (3 completed + 1 current)
      const completedSteps = document.querySelectorAll('.bg-purple-600');
      expect(completedSteps.length).toBeGreaterThanOrEqual(3);

      // Verify "הגיע" (delivered) is displayed
      expect(screen.getByText('הגיע')).toBeInTheDocument();
    });
  });
});
