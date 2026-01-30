import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
          style: 'avatar_cartoon',
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
  };

  const mockUseOrderHistory = vi.fn(() => ({
    data: mockOrderHistoryData,
    isLoading: false,
    isError: false,
    error: null,
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
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    it('navigates back when back button is clicked', () => {
      renderWithQueryClient(<OrderHistoryList />);

      const backButton = screen.getByTestId('back-button');
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('Statistics Display', () => {
    it('displays order statistics correctly', () => {
      renderWithQueryClient(<OrderHistoryList />);

      expect(screen.getByText('2')).toBeInTheDocument(); // Total orders
      expect(screen.getByText('₪546')).toBeInTheDocument(); // Total spent
      expect(screen.getByText('1')).toBeInTheDocument(); // In transit

      expect(screen.getByText('הזמנות')).toBeInTheDocument();
      expect(screen.getByText('סה״כ')).toBeInTheDocument();
      expect(screen.getByText('בדרך')).toBeInTheDocument();
    });
  });

  describe('Filter Tabs', () => {
    it('renders all filter tabs', () => {
      renderWithQueryClient(<OrderHistoryList />);

      expect(screen.getByText('הכל')).toBeInTheDocument();
      expect(screen.getByText('בהכנה')).toBeInTheDocument();
      expect(screen.getByText('נשלח')).toBeInTheDocument();
      expect(screen.getByText('הגיע')).toBeInTheDocument();
    });

    it('sets "הכל" as active by default', () => {
      renderWithQueryClient(<OrderHistoryList />);

      const allTab = screen.getByText('הכל').closest('button');
      expect(allTab).toHaveClass('bg-purple-600', 'text-white');
    });

    it('changes filter when tab is clicked', async () => {
      renderWithQueryClient(<OrderHistoryList />);

      const deliveredTab = screen.getByText('הגיע').closest('button');
      fireEvent.click(deliveredTab!);

      await waitFor(() => {
        expect(mockUseOrderHistory).toHaveBeenCalledWith({
          statusFilter: 'delivered',
        });
      });
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
        data: { orders: [], totalOrders: 0, totalSpent: 0, inTransitCount: 0 },
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
        data: { orders: [], totalOrders: 0, totalSpent: 0, inTransitCount: 0 },
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
        data: { orders: [], totalOrders: 0, totalSpent: 0, inTransitCount: 0 },
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

  describe('Empty State', () => {
    it('shows empty state when no orders exist', () => {
      mockUseOrderHistory.mockReturnValue({
        data: { orders: [], totalOrders: 0, totalSpent: 0, inTransitCount: 0 },
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
        data: { orders: [], totalOrders: 0, totalSpent: 0, inTransitCount: 0 },
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

  describe('Responsive Design', () => {
    it('applies proper responsive classes', () => {
      renderWithQueryClient(<OrderHistoryList />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('max-w-[600px]', 'sm:max-w-[800px]', 'lg:max-w-[1000px]');
    });
  });
});