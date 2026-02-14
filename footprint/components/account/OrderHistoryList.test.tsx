import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrderHistoryList } from './OrderHistoryList';
import type { Order } from '@/types';

// Use vi.hoisted to define mocks that can be used in vi.mock factories
const { mockUseOrderHistory, mockOrderHistoryData } = vi.hoisted(() => {
  const mockOrderHistoryData = {
    orders: [
      {
        id: 'demo_order_001',
        userId: 'demo_user_001',
        status: 'shipped' as const,
        items: [{
          id: 'item_001',
          orderId: 'demo_order_001',
          originalImageUrl: 'https://example.com/image.jpg',
          transformedImageUrl: 'https://example.com/transformed.jpg',
          style: 'watercolor',
          size: 'A4',
          paperType: 'matte',
          frameType: 'black',
          price: 208,
          createdAt: new Date('2024-12-24T10:00:00'),
        }],
        total: 237,
        createdAt: new Date('2024-12-24T10:00:00'),
      },
      {
        id: 'demo_order_002',
        userId: 'demo_user_001',
        status: 'delivered' as const,
        items: [{
          id: 'item_002',
          orderId: 'demo_order_002',
          originalImageUrl: 'https://example.com/image2.jpg',
          transformedImageUrl: 'https://example.com/transformed2.jpg',
          style: 'watercolor',
          size: 'A3',
          paperType: 'canvas',
          frameType: 'white',
          price: 309,
          createdAt: new Date('2024-12-20T10:00:00'),
        }],
        total: 309,
        createdAt: new Date('2024-12-20T10:00:00'),
      },
    ] as Order[],
    totalOrders: 2,
    totalSpent: 546,
    inTransitCount: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const mockUseOrderHistory = vi.fn(() => ({
    data: mockOrderHistoryData,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: vi.fn(),
  }));

  return { mockUseOrderHistory, mockOrderHistoryData };
});

vi.mock('@/hooks/useOrderHistory', () => ({
  useOrderHistory: mockUseOrderHistory,
}));

// Mock OrderCard component
vi.mock('./OrderCard', () => ({
  OrderCard: ({ order, onClick }: { order: Order; onClick?: (order: Order) => void }) => (
    <div data-testid="order-card" onClick={() => onClick?.(order)}>
      Order {order.id}
    </div>
  ),
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('OrderHistoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Header and Navigation', () => {
    it('renders header with title and back button', () => {
      renderWithQueryClient(<OrderHistoryList />);

      expect(screen.getByText('ההזמנות שלי')).toBeInTheDocument();
      expect(screen.getByText('כל ההזמנות שלך במקום אחד')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AC-008: WHEN user views OrderHistoryList
  //         THEN no stats cards are shown
  // ═══════════════════════════════════════════════════════════════
  describe('AC-008: No Stats Cards', () => {
    it('does not display statistics cards', () => {
      renderWithQueryClient(<OrderHistoryList />);

      // Stats labels from old design should not be present
      expect(screen.queryByText('בדרך')).not.toBeInTheDocument();
      expect(screen.queryByText('₪546')).not.toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AC-009: WHEN user views OrderHistoryList
  //         THEN no filter tabs are shown
  // ═══════════════════════════════════════════════════════════════
  describe('AC-009: No Filter Tabs', () => {
    it('does not display filter tabs', () => {
      renderWithQueryClient(<OrderHistoryList />);

      expect(screen.queryByText('הכל')).not.toBeInTheDocument();
      expect(screen.queryByText('בהכנה')).not.toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AC-010: WHEN user views OrderHistoryList
  //         THEN no custom bottom nav (global MobileBottomNav handles this)
  // ═══════════════════════════════════════════════════════════════
  describe('AC-010: No Duplicate Bottom Nav', () => {
    it('does not render a custom bottom navigation', () => {
      renderWithQueryClient(<OrderHistoryList />);

      const fixedNav = document.querySelector('nav.fixed');
      expect(fixedNav).not.toBeInTheDocument();
    });
  });

  describe('Orders List', () => {
    it('renders list of orders', () => {
      renderWithQueryClient(<OrderHistoryList />);

      const orderCards = screen.getAllByTestId('order-card');
      expect(orderCards).toHaveLength(2);
    });

    it('navigates to order detail when order is clicked', () => {
      renderWithQueryClient(<OrderHistoryList />);

      const firstOrderCard = screen.getAllByTestId('order-card')[0];
      fireEvent.click(firstOrderCard);

      expect(mockPush).toHaveBeenCalledWith('/account/orders/demo_order_001');
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when data is loading', () => {
      mockUseOrderHistory.mockReturnValue({
        data: { orders: [], totalOrders: 0, totalSpent: 0, inTransitCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithQueryClient(<OrderHistoryList />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when there is an error', () => {
      mockUseOrderHistory.mockReturnValue({
        data: { orders: [], totalOrders: 0, totalSpent: 0, inTransitCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
        isLoading: false,
        isError: true,
        error: new Error('Failed to fetch orders'),
        refetch: vi.fn(),
      });

      renderWithQueryClient(<OrderHistoryList />);

      expect(screen.getByText('שגיאה בטעינת ההזמנות')).toBeInTheDocument();
      expect(screen.getByText('נסה שוב')).toBeInTheDocument();
    });

    it('calls refetch when retry button is clicked', () => {
      const mockRefetch = vi.fn();
      mockUseOrderHistory.mockReturnValue({
        data: { orders: [], totalOrders: 0, totalSpent: 0, inTransitCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
        isLoading: false,
        isError: true,
        error: new Error('Failed to fetch orders'),
        refetch: mockRefetch,
      });

      renderWithQueryClient(<OrderHistoryList />);

      const retryButton = screen.getByText('נסה שוב');
      fireEvent.click(retryButton);

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Unauthorized State', () => {
    it('shows empty state instead of error when unauthorized', () => {
      mockUseOrderHistory.mockReturnValue({
        data: { orders: [], totalOrders: 0, totalSpent: 0, inTransitCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
        isLoading: false,
        isError: true,
        error: new Error('Unauthorized - Please sign in'),
        refetch: vi.fn(),
      });

      renderWithQueryClient(<OrderHistoryList />);

      // Should show empty state, NOT error state
      expect(screen.getByText('אין הזמנות עדיין')).toBeInTheDocument();
      expect(screen.getByText('צור עכשיו')).toBeInTheDocument();
      expect(screen.queryByText('שגיאה בטעינת ההזמנות')).not.toBeInTheDocument();
    });

    it('shows empty state for 401 API error', () => {
      mockUseOrderHistory.mockReturnValue({
        data: { orders: [], totalOrders: 0, totalSpent: 0, inTransitCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
        isLoading: false,
        isError: true,
        error: new Error('API error: 401'),
        refetch: vi.fn(),
      });

      renderWithQueryClient(<OrderHistoryList />);

      expect(screen.getByText('אין הזמנות עדיין')).toBeInTheDocument();
      expect(screen.queryByText('שגיאה בטעינת ההזמנות')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no orders exist', () => {
      mockUseOrderHistory.mockReturnValue({
        data: { orders: [], totalOrders: 0, totalSpent: 0, inTransitCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithQueryClient(<OrderHistoryList />);

      expect(screen.getByText('אין הזמנות עדיין')).toBeInTheDocument();
      expect(screen.getByText('צור עכשיו')).toBeInTheDocument();
    });

    it('navigates to create page when "צור עכשיו" is clicked', () => {
      mockUseOrderHistory.mockReturnValue({
        data: { orders: [], totalOrders: 0, totalSpent: 0, inTransitCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithQueryClient(<OrderHistoryList />);

      const createButton = screen.getByText('צור עכשיו');
      fireEvent.click(createButton);

      expect(mockPush).toHaveBeenCalledWith('/create');
    });
  });

  describe('Pagination', () => {
    it('renders pagination when totalPages > 1', () => {
      mockUseOrderHistory.mockReturnValue({
        data: {
          ...mockOrderHistoryData,
          totalPages: 3,
          hasPrevPage: false,
          hasNextPage: true,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithQueryClient(<OrderHistoryList />);

      expect(screen.getByLabelText('עמוד קודם')).toBeInTheDocument();
      expect(screen.getByLabelText('עמוד הבא')).toBeInTheDocument();
    });

    it('disables previous button on first page', () => {
      mockUseOrderHistory.mockReturnValue({
        data: {
          ...mockOrderHistoryData,
          totalPages: 3,
          hasPrevPage: false,
          hasNextPage: true,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithQueryClient(<OrderHistoryList />);

      const prevButton = screen.getByLabelText('עמוד קודם');
      expect(prevButton).toBeDisabled();
    });

    it('navigates to next page when next button clicked', () => {
      const scrollToMock = vi.fn();
      Object.defineProperty(window, 'scrollTo', { value: scrollToMock, writable: true });

      mockUseOrderHistory.mockReturnValue({
        data: {
          ...mockOrderHistoryData,
          totalPages: 3,
          hasPrevPage: false,
          hasNextPage: true,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithQueryClient(<OrderHistoryList />);

      const nextButton = screen.getByLabelText('עמוד הבא');
      fireEvent.click(nextButton);

      expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    it('renders page number buttons', () => {
      mockUseOrderHistory.mockReturnValue({
        data: {
          ...mockOrderHistoryData,
          totalPages: 3,
          hasPrevPage: false,
          hasNextPage: true,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithQueryClient(<OrderHistoryList />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies proper responsive classes', () => {
      renderWithQueryClient(<OrderHistoryList />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('max-w-[600px]', 'sm:max-w-[800px]', 'lg:max-w-[1000px]');
    });
  });
});
