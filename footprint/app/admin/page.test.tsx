/**
 * Admin Order Dashboard Tests
 *
 * TDD Test Suite for OM-01: Admin Order Dashboard
 * Tests the admin dashboard matching 09-admin-orders.html mockup
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminOrdersPage from './page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock demo data
vi.mock('@/data/demo/orders', () => ({
  demoOrders: [
    {
      id: 'order_001',
      userId: 'user_001',
      status: 'pending',
      items: [{ originalImageUrl: 'https://example.com/img1.jpg', style: 'pop_art' }],
      total: 209,
      shippingAddress: { name: 'ישראל ישראלי', phone: '050-1234567' },
      createdAt: new Date('2024-12-24T10:00:00'),
    },
    {
      id: 'order_002',
      userId: 'user_002',
      status: 'pending',
      items: [{ originalImageUrl: 'https://example.com/img2.jpg', style: 'watercolor' }],
      total: 309,
      shippingAddress: { name: 'דנה כהן', phone: '052-9876543' },
      createdAt: new Date('2024-12-24T09:40:00'),
    },
    {
      id: 'order_003',
      userId: 'user_003',
      status: 'processing',
      items: [{ originalImageUrl: 'https://example.com/img3.jpg', style: 'oil_painting' }],
      total: 149,
      shippingAddress: { name: 'יעל לוי', phone: '054-1111111' },
      createdAt: new Date('2024-12-24T09:00:00'),
    },
    {
      id: 'order_004',
      userId: 'user_004',
      status: 'shipped',
      items: [{ originalImageUrl: 'https://example.com/img4.jpg', style: 'comic' }],
      total: 180,
      shippingAddress: { name: 'רון אברהם', phone: '053-2222222' },
      createdAt: new Date('2024-12-24T08:00:00'),
    },
    {
      id: 'order_005',
      userId: 'user_005',
      status: 'delivered',
      items: [{ originalImageUrl: 'https://example.com/img5.jpg', style: 'vintage' }],
      total: 249,
      shippingAddress: { name: 'שירה גולן', phone: '055-3333333' },
      createdAt: new Date('2024-12-23T12:00:00'),
    },
  ],
}));

describe('AdminOrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Structure', () => {
    it('renders the page title "הזמנות"', () => {
      render(<AdminOrdersPage />);
      expect(screen.getByRole('heading', { name: 'הזמנות' })).toBeInTheDocument();
    });

    it('renders refresh button in header actions', () => {
      render(<AdminOrdersPage />);
      const refreshButton = screen.getByTestId('refresh-button');
      expect(refreshButton).toBeInTheDocument();
    });

    it('renders filter button in header actions', () => {
      render(<AdminOrdersPage />);
      const filterButton = screen.getByTestId('filter-button');
      expect(filterButton).toBeInTheDocument();
    });

    it('renders main content area', () => {
      render(<AdminOrdersPage />);
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Stats Grid', () => {
    it('renders 4 stat cards', () => {
      render(<AdminOrdersPage />);
      const statCards = screen.getAllByTestId(/^stat-card-/);
      expect(statCards).toHaveLength(4);
    });

    it('renders "היום" (today) stat card', () => {
      render(<AdminOrdersPage />);
      expect(screen.getByText('היום')).toBeInTheDocument();
    });

    it('renders "ממתינות" (pending) stat card', () => {
      render(<AdminOrdersPage />);
      const pendingStat = screen.getByTestId('stat-card-pending');
      expect(pendingStat).toHaveTextContent('ממתינות');
    });

    it('renders "בדרך" (in transit) stat card', () => {
      render(<AdminOrdersPage />);
      expect(screen.getByText('בדרך')).toBeInTheDocument();
    });

    it('renders "הכנסות היום" (today revenue) stat card', () => {
      render(<AdminOrdersPage />);
      expect(screen.getByText('הכנסות היום')).toBeInTheDocument();
    });

    it('displays order count in today stat', () => {
      render(<AdminOrdersPage />);
      const todayStat = screen.getByTestId('stat-card-today');
      expect(todayStat).toHaveTextContent(/\d+/);
    });

    it('displays revenue with ₪ symbol', () => {
      render(<AdminOrdersPage />);
      const revenueStat = screen.getByTestId('stat-card-revenue');
      expect(revenueStat).toHaveTextContent('₪');
    });
  });

  describe('Search Bar', () => {
    it('renders search input', () => {
      render(<AdminOrdersPage />);
      const searchInput = screen.getByPlaceholderText(/חיפוש/);
      expect(searchInput).toBeInTheDocument();
    });

    it('renders search icon', () => {
      render(<AdminOrdersPage />);
      const searchIcon = screen.getByTestId('search-icon');
      expect(searchIcon).toBeInTheDocument();
    });

    it('filters orders when typing in search', async () => {
      render(<AdminOrdersPage />);
      const searchInput = screen.getByPlaceholderText(/חיפוש/);
      await userEvent.type(searchInput, 'ישראל');
      // Should filter to show only matching orders
      await waitFor(() => {
        expect(screen.getByText('ישראל ישראלי')).toBeInTheDocument();
      });
    });

    it('searches by order ID', async () => {
      render(<AdminOrdersPage />);
      const searchInput = screen.getByPlaceholderText(/חיפוש/);
      await userEvent.type(searchInput, '001');
      await waitFor(() => {
        const orderRows = screen.getAllByTestId(/^order-row-/);
        expect(orderRows.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Status Filter Tabs', () => {
    it('renders all status filter buttons', () => {
      render(<AdminOrdersPage />);
      expect(screen.getByRole('button', { name: /הכל/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ממתינות/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /בהכנה/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /נשלחו/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /הגיעו/ })).toBeInTheDocument();
    });

    it('shows "הכל" as active by default', () => {
      render(<AdminOrdersPage />);
      const allButton = screen.getByRole('button', { name: /הכל/ });
      expect(allButton).toHaveAttribute('data-active', 'true');
    });

    it('shows count badges on filter buttons', () => {
      render(<AdminOrdersPage />);
      const allButton = screen.getByRole('button', { name: /הכל/ });
      expect(allButton).toHaveTextContent(/\d+/);
    });

    it('changes active filter when clicked', async () => {
      render(<AdminOrdersPage />);
      const pendingButton = screen.getByRole('button', { name: /ממתינות/ });
      fireEvent.click(pendingButton);
      expect(pendingButton).toHaveAttribute('data-active', 'true');
    });

    it('filters orders when status tab clicked', async () => {
      render(<AdminOrdersPage />);
      const pendingButton = screen.getByRole('button', { name: /ממתינות/ });
      fireEvent.click(pendingButton);
      // Should show only pending orders
      await waitFor(() => {
        const statusBadges = screen.getAllByTestId(/^status-badge-/);
        statusBadges.forEach((badge) => {
          expect(badge).toHaveTextContent(/ממתין/);
        });
      });
    });
  });

  describe('Orders List', () => {
    it('renders order cards', () => {
      render(<AdminOrdersPage />);
      const orderRows = screen.getAllByTestId(/^order-row-/);
      expect(orderRows.length).toBeGreaterThan(0);
    });

    it('displays order thumbnail', () => {
      render(<AdminOrdersPage />);
      const thumbnails = screen.getAllByTestId(/^order-thumb-/);
      expect(thumbnails.length).toBeGreaterThan(0);
    });

    it('displays order ID in FP-YYYY-XXXX format', () => {
      render(<AdminOrdersPage />);
      const orderIds = screen.getAllByTestId(/^order-id-/);
      expect(orderIds.length).toBeGreaterThan(0);
      orderIds.forEach((id) => {
        expect(id.textContent).toMatch(/FP-\d{4}-\d+/);
      });
    });

    it('displays customer name', () => {
      render(<AdminOrdersPage />);
      expect(screen.getByText('ישראל ישראלי')).toBeInTheDocument();
    });

    it('displays time ago', () => {
      render(<AdminOrdersPage />);
      // Should show relative time like "לפני 5 דק׳" or "לפני שעה" or "לפני X ימים"
      const timeElements = screen.getAllByText(/לפני/);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    it('displays order price with ₪', () => {
      render(<AdminOrdersPage />);
      const prices = screen.getAllByTestId(/^order-price-/);
      expect(prices.length).toBeGreaterThan(0);
      prices.forEach((price) => {
        expect(price.textContent).toMatch(/₪\d+/);
      });
    });

    it('displays action arrow button', () => {
      render(<AdminOrdersPage />);
      const actionButtons = screen.getAllByTestId(/^order-action-/);
      expect(actionButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Status Badges', () => {
    it('renders pending status badge with correct styling', () => {
      render(<AdminOrdersPage />);
      const pendingBadge = screen.getAllByText('ממתין')[0];
      expect(pendingBadge.closest('[data-testid^="status-badge-"]')).toHaveAttribute('data-status', 'pending');
    });

    it('renders processing status badge', () => {
      render(<AdminOrdersPage />);
      const processingBadges = screen.getAllByText('בהכנה');
      expect(processingBadges.length).toBeGreaterThan(0);
    });

    it('renders shipped status badge', () => {
      render(<AdminOrdersPage />);
      expect(screen.getByText('נשלח')).toBeInTheDocument();
    });

    it('renders delivered status badge', () => {
      render(<AdminOrdersPage />);
      expect(screen.getByText('הגיע')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates to order detail when row clicked', async () => {
      render(<AdminOrdersPage />);
      const orderRow = screen.getAllByTestId(/^order-row-/)[0];
      fireEvent.click(orderRow);
      expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/\/admin\/orders\//));
    });
  });

  describe('Responsive Design', () => {
    it('renders stats grid container', () => {
      render(<AdminOrdersPage />);
      const statsGrid = screen.getByTestId('stats-grid');
      expect(statsGrid).toBeInTheDocument();
    });

    it('renders filters container with horizontal scroll', () => {
      render(<AdminOrdersPage />);
      const filtersBar = screen.getByTestId('filters-bar');
      expect(filtersBar).toBeInTheDocument();
    });

    it('renders orders list container', () => {
      render(<AdminOrdersPage />);
      const ordersList = screen.getByTestId('orders-list');
      expect(ordersList).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no orders match filter', async () => {
      render(<AdminOrdersPage />);
      const searchInput = screen.getByPlaceholderText(/חיפוש/);
      await userEvent.type(searchInput, 'nonexistent12345');
      await waitFor(() => {
        expect(screen.getByText(/לא נמצאו הזמנות/)).toBeInTheDocument();
      });
    });
  });

  describe('Data Formatting', () => {
    it('formats order ID correctly', () => {
      render(<AdminOrdersPage />);
      // Order IDs should be in FP-2024-XXXX format
      const orderIds = screen.getAllByTestId(/^order-id-/);
      expect(orderIds[0].textContent).toMatch(/FP-\d{4}-/);
    });

    it('formats price with comma separator for thousands', () => {
      render(<AdminOrdersPage />);
      const revenueStat = screen.getByTestId('stat-card-revenue');
      // Revenue should be formatted like ₪2,450
      expect(revenueStat.textContent).toMatch(/₪[\d,]+/);
    });
  });
});
