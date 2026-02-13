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
  describe('Vertical Layout', () => {
    it('renders all timeline steps in a vertical layout', () => {
      const order = createMockOrder();
      render(<OrderTimeline order={order} />);

      expect(screen.getByText('בעיבוד')).toBeInTheDocument();
      expect(screen.getByText('בהדפסה')).toBeInTheDocument();
      expect(screen.getByText('נשלח')).toBeInTheDocument();
      expect(screen.getByText('הגיע')).toBeInTheDocument();
    });

    it('uses vertical flex-col layout', () => {
      const order = createMockOrder();
      render(<OrderTimeline order={order} />);

      const timelineContainer = document.querySelector('.flex.flex-col');
      expect(timelineContainer).toBeInTheDocument();
    });

    it('renders connecting lines between steps', () => {
      const order = createMockOrder();
      render(<OrderTimeline order={order} />);

      // Connecting lines should exist (one less than the number of steps)
      const connectingLines = document.querySelectorAll('.w-0\\.5.h-8');
      expect(connectingLines.length).toBeGreaterThan(0);
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

  describe('Date Rendering', () => {
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
      // Upcoming steps (printing, shipped, delivered) should not have dates
      // Only completed (pending) + current (processing) should have dates
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

  describe('Status Progression', () => {
    it('marks shipped steps as completed', () => {
      const order = createMockOrder({
        status: 'shipped',
        createdAt: new Date('2024-12-20T10:00:00'),
        shippedAt: new Date('2024-12-22T14:00:00'),
      });
      render(<OrderTimeline order={order} />);

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

      const completedSteps = document.querySelectorAll('.bg-purple-600');
      expect(completedSteps.length).toBeGreaterThanOrEqual(3);

      expect(screen.getByText('הגיע')).toBeInTheDocument();
    });
  });
});
