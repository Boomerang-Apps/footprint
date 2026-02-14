import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrderHistoryList } from './OrderHistoryList';

// Use vi.hoisted to define mocks that can be used in vi.mock factories
const { mockOrders, mockListFn } = vi.hoisted(() => {
  const mockOrders = [
    {
      id: 'demo_order_001',
      userId: 'demo_user_001',
      status: 'shipped',
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
      subtotal: 208,
      shipping: 29,
      discount: 0,
      total: 237,
      isGift: false,
      giftMessage: null,
      giftWrap: false,
      scheduledDeliveryDate: null,
      shippingAddress: {
        name: 'John Doe',
        street: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        country: 'Israel',
      },
      billingAddress: {
        name: 'John Doe',
        street: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        country: 'Israel',
      },
      paymentTransactionId: 'pi_test_123',
      paidAt: new Date('2024-12-24T10:30:00'),
      trackingNumber: 'IL123456789',
      carrier: 'Israel Post',
      shippedAt: new Date('2024-12-24T14:00:00'),
      deliveredAt: null,
      createdAt: new Date('2024-12-24T10:00:00'),
      updatedAt: new Date('2024-12-24T14:00:00'),
    },
  ];
  const mockListFn = vi.fn().mockResolvedValue(mockOrders);
  return { mockOrders, mockListFn };
});

vi.mock('@/lib/api/client', () => ({
  api: {
    orders: {
      list: mockListFn,
    },
  },
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

describe('Order History Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders order history with data (no stats, no filters)', async () => {
    renderWithQueryClient(<OrderHistoryList />);

    // Should show loading initially
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Should display order card with gradient thumbnail (not image)
    const orderCard = screen.getByTestId('order-card');
    expect(orderCard).toBeInTheDocument();

    // Should show style name from styles-ui (canonical Hebrew name)
    expect(screen.getByText(/צבעי מים/)).toBeInTheDocument();

    // AC-008: No stats cards
    expect(screen.queryByText('בדרך')).not.toBeInTheDocument();

    // AC-009: No filter tabs
    expect(screen.queryByText('הכל')).not.toBeInTheDocument();
    expect(screen.queryByText('בהכנה')).not.toBeInTheDocument();
  });

  it('navigates correctly when order is clicked', async () => {
    renderWithQueryClient(<OrderHistoryList />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Find and click the order card
    const orderCard = screen.getByTestId('order-card');
    fireEvent.click(orderCard);

    expect(mockPush).toHaveBeenCalledWith('/account/orders/demo_order_001');
  });

  it('shows proper RTL layout', async () => {
    renderWithQueryClient(<OrderHistoryList />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Main container should have RTL direction
    const container = screen.getByRole('main').closest('div');
    expect(container).toHaveAttribute('dir', 'rtl');

    // Order card should have RTL direction
    const orderCard = screen.getByTestId('order-card');
    expect(orderCard).toHaveAttribute('dir', 'rtl');
  });

  it('displays Hebrew text correctly', async () => {
    renderWithQueryClient(<OrderHistoryList />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Header text still present
    expect(screen.getByText('ההזמנות שלי')).toBeInTheDocument();

    // Style name from styles-ui (canonical, not inline translations)
    expect(screen.getByText(/צבעי מים/)).toBeInTheDocument();
  });

  it('applies responsive design classes', async () => {
    renderWithQueryClient(<OrderHistoryList />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const main = screen.getByRole('main');
    expect(main).toHaveClass(
      'max-w-[600px]',
      'sm:max-w-[800px]',
      'lg:max-w-[1000px]'
    );

    // OrderCard uses gradient div instead of img thumbnail
    const orderCard = screen.getByTestId('order-card');
    const gradient = orderCard.querySelector('[data-testid="order-gradient"]');
    expect(gradient).toBeInTheDocument();
    expect(gradient).toHaveClass('w-[70px]', 'h-[70px]', 'sm:w-[80px]', 'sm:h-[80px]');
  });
});
