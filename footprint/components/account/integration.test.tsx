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
      stripePaymentIntentId: 'pi_test_123',
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

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
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

    // Should display statistics (multiple "1" values: total orders and in-transit)
    const statValues = screen.getAllByText('1');
    expect(statValues.length).toBeGreaterThanOrEqual(1);
    // Total spent displays "237" which may appear multiple times (stats + order card)
    const priceElements = screen.getAllByText(/237/);
    expect(priceElements.length).toBeGreaterThanOrEqual(1);

    // Should display order card
    expect(screen.getByText('FP-2024-001')).toBeInTheDocument();
    expect(screen.getByText('אווטר קריקטורה')).toBeInTheDocument();
    expect(screen.getByText('A4 • מסגרת שחורה')).toBeInTheDocument();
  });

  it('handles filter changes correctly', async () => {
    renderWithQueryClient(<OrderHistoryList />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Click on shipped filter (use getByRole to target the button specifically)
    const shippedTab = screen.getByRole('button', { name: 'נשלח' });
    fireEvent.click(shippedTab);

    // Should still show the order (it's shipped)
    await waitFor(() => {
      expect(screen.getByText('FP-2024-001')).toBeInTheDocument();
    });
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

    // Check Hebrew UI text (use getAllByText for duplicates)
    expect(screen.getByText('ההזמנות שלי')).toBeInTheDocument();
    expect(screen.getAllByText('הזמנות').length).toBeGreaterThan(0);
    expect(screen.getByText('סה״כ')).toBeInTheDocument();
    expect(screen.getByText('בדרך')).toBeInTheDocument();
    expect(screen.getByText('הכל')).toBeInTheDocument();
    expect(screen.getByText('בהכנה')).toBeInTheDocument();
    expect(screen.getAllByText('נשלח').length).toBeGreaterThan(0);
    expect(screen.getByText('הגיע')).toBeInTheDocument();

    // Check translated product details
    expect(screen.getByText('אווטר קריקטורה')).toBeInTheDocument();
    expect(screen.getByText('A4 • מסגרת שחורה')).toBeInTheDocument();
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

    const orderCard = screen.getByTestId('order-card');
    const thumbnail = orderCard.querySelector('img');
    expect(thumbnail).toHaveClass(
      'w-[70px]',
      'h-[70px]',
      'sm:w-[80px]',
      'sm:h-[80px]',
      'lg:w-[90px]',
      'lg:h-[90px]'
    );
  });
});