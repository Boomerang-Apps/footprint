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
        style: 'avatar_cartoon',
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

// Mock styles-ui (used by OrderCard)
vi.mock('@/lib/ai/styles-ui', () => ({
  getStyleById: (id: string) => {
    const styles: Record<string, { nameHe: string; gradient: string }> = {
      avatar_cartoon: { nameHe: 'אווטאר קרטון', gradient: 'from-violet-500 to-pink-500' },
      watercolor: { nameHe: 'צבעי מים', gradient: 'from-blue-500 to-cyan-400' },
    };
    return styles[id] || undefined;
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

  it('renders complete order history with real data flow', async () => {
    renderWithQueryClient(<OrderHistoryList />);

    // Should show loading initially
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Should display order card with new format (style · size)
    expect(screen.getByText('FP-2024-001')).toBeInTheDocument();
    expect(screen.getByText('אווטאר קרטון · A4')).toBeInTheDocument();

    // Should show gradient thumbnail, not image
    const gradient = screen.getByTestId('order-gradient');
    expect(gradient).toBeInTheDocument();
    expect(gradient).toHaveClass('bg-gradient-to-br');
  });

  it('does not show stats or filter tabs (removed in redesign)', async () => {
    renderWithQueryClient(<OrderHistoryList />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Stats should not be present
    expect(screen.queryByText('סה״כ')).not.toBeInTheDocument();
    expect(screen.queryByText('בדרך')).not.toBeInTheDocument();

    // Filter tabs should not be present
    expect(screen.queryByText('הכל')).not.toBeInTheDocument();
    expect(screen.queryByText('בהכנה')).not.toBeInTheDocument();
    expect(screen.queryByText('הגיע')).not.toBeInTheDocument();
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

    // Check Hebrew UI text
    expect(screen.getByText('ההזמנות שלי')).toBeInTheDocument();

    // Check translated product details (new format: style · size)
    expect(screen.getByText('אווטאר קרטון · A4')).toBeInTheDocument();
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

    // Gradient thumbnail should have responsive classes
    const gradient = screen.getByTestId('order-gradient');
    expect(gradient).toHaveClass('w-[70px]', 'h-[70px]', 'sm:w-[80px]', 'sm:h-[80px]');
  });

  it('does not render duplicate bottom navigation', async () => {
    renderWithQueryClient(<OrderHistoryList />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const fixedNav = document.querySelector('nav.fixed');
    expect(fixedNav).not.toBeInTheDocument();
  });
});
