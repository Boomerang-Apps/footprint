/**
 * Admin Fulfillment Page Tests - UI-07A
 *
 * Integration tests for the admin fulfillment dashboard page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useFulfillmentOrders hook
const mockRefetch = vi.fn();
vi.mock('@/hooks/useFulfillmentOrders', () => ({
  useFulfillmentOrders: vi.fn(() => ({
    orders: [
      {
        id: 'order-1',
        orderNumber: 'FP-2026-001',
        status: 'pending',
        total: 237,
        itemCount: 2,
        customerEmail: 'customer@example.com',
        customerName: 'ישראל ישראלי',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        thumbnailUrl: null,
        items: [],
      },
    ],
    grouped: {
      pending: [
        {
          id: 'order-1',
          orderNumber: 'FP-2026-001',
          status: 'pending',
          total: 237,
          itemCount: 2,
          customerEmail: 'customer@example.com',
          customerName: 'ישראל ישראלי',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          thumbnailUrl: null,
          items: [],
        },
      ],
      printing: [],
      ready_to_ship: [],
      shipped: [],
      delivered: [],
      cancelled: [],
    },
    stats: {
      pendingCount: 1,
      printingCount: 0,
      readyCount: 0,
      shippedTodayCount: 0,
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: mockRefetch,
  })),
}));

// Mock the bulk operations API
vi.mock('@/lib/fulfillment/bulk-operations', () => ({
  bulkUpdateStatus: vi.fn().mockResolvedValue({ success: true }),
}));

import FulfillmentPage from './page';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('Admin Fulfillment Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Structure', () => {
    it('should render the page title', () => {
      renderWithProviders(<FulfillmentPage />);

      expect(screen.getByText('ניהול הזמנות')).toBeInTheDocument();
    });

    it('should render the fulfillment board', () => {
      renderWithProviders(<FulfillmentPage />);

      expect(screen.getByTestId('fulfillment-board')).toBeInTheDocument();
    });

    it('should have RTL layout', () => {
      renderWithProviders(<FulfillmentPage />);

      const page = screen.getByTestId('fulfillment-page');
      expect(page).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Header Actions', () => {
    it('should render refresh button', () => {
      renderWithProviders(<FulfillmentPage />);

      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    });

    it('should call refetch when refresh clicked', () => {
      renderWithProviders(<FulfillmentPage />);

      fireEvent.click(screen.getByTestId('refresh-button'));

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Order Detail Panel', () => {
    it('should open panel when order clicked', async () => {
      renderWithProviders(<FulfillmentPage />);

      // Click on the order card
      fireEvent.click(screen.getByText('FP-2026-001'));

      await waitFor(() => {
        expect(screen.getByTestId('order-detail-panel')).toBeInTheDocument();
      });
    });

    it('should close panel when close button clicked', async () => {
      renderWithProviders(<FulfillmentPage />);

      // Open panel
      fireEvent.click(screen.getByText('FP-2026-001'));

      await waitFor(() => {
        expect(screen.getByTestId('order-detail-panel')).toBeInTheDocument();
      });

      // Close panel
      fireEvent.click(screen.getByTestId('close-button'));

      await waitFor(() => {
        expect(screen.queryByTestId('order-detail-panel')).not.toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should render search input', () => {
      renderWithProviders(<FulfillmentPage />);

      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('should have placeholder text for search', () => {
      renderWithProviders(<FulfillmentPage />);

      expect(screen.getByPlaceholderText(/חיפוש/)).toBeInTheDocument();
    });
  });
});
