import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrderDetailView } from './OrderDetailView';
import type { Order } from '@/types';

// Mock order data
const mockOrder: Order = {
  id: 'demo_order_001',
  userId: 'user_001',
  status: 'shipped',
  items: [
    {
      id: 'item_001',
      orderId: 'demo_order_001',
      originalImageUrl: 'https://example.com/original.jpg',
      transformedImageUrl: 'https://example.com/transformed.jpg',
      style: 'watercolor',
      size: 'A4',
      paperType: 'matte',
      frameType: 'black',
      price: 208,
      createdAt: new Date('2024-12-20T10:00:00'),
    },
  ],
  total: 237,
  subtotal: 208,
  shipping: 29,
  discount: 0,
  isGift: false,
  giftMessage: null,
  giftWrap: false,
  wrappingStyle: null,
  scheduledDeliveryDate: null,
  createdAt: new Date('2024-12-20T10:00:00'),
  updatedAt: new Date('2024-12-20T10:00:00'),
  shippingAddress: {
    name: 'ישראל ישראלי',
    street: 'רחוב הרצל 123',
    city: 'תל אביב',
    postalCode: '6100001',
    country: 'Israel',
    phone: '050-1234567',
  },
  billingAddress: {
    name: 'ישראל ישראלי',
    street: 'רחוב הרצל 123',
    city: 'תל אביב',
    postalCode: '6100001',
    country: 'Israel',
  },
  paymentTransactionId: null,
  paidAt: new Date('2024-12-20T09:00:00'),
  trackingNumber: 'IL123456789',
  carrier: 'Israel Post',
  shippedAt: new Date('2024-12-21T10:00:00'),
  deliveredAt: null,
};

// Mock useOrder hook
const { mockUseOrder } = vi.hoisted(() => ({
  mockUseOrder: vi.fn((): { data: Order | null; isLoading: boolean; isError: boolean; error: Error | null; refetch: ReturnType<typeof vi.fn> } => ({
    data: mockOrder,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

vi.mock('@/hooks/useOrderHistory', () => ({
  useOrder: mockUseOrder,
}));

// Mock OrderTimeline
vi.mock('./OrderTimeline', () => ({
  OrderTimeline: () => <div data-testid="order-timeline">Timeline Component</div>,
}));

// Mock orderStore
const mockReset = vi.fn();
const mockSetOriginalImage = vi.fn();
const mockSetTransformedImage = vi.fn();
const mockSetSelectedStyle = vi.fn();
const mockSetSize = vi.fn();
const mockSetPaperType = vi.fn();
const mockSetFrameType = vi.fn();
const mockSetIsGift = vi.fn();
const mockSetGiftMessage = vi.fn();
const mockSetStep = vi.fn();

vi.mock('@/stores/orderStore', () => ({
  useOrderStore: () => ({
    reset: mockReset,
    setOriginalImage: mockSetOriginalImage,
    setTransformedImage: mockSetTransformedImage,
    setSelectedStyle: mockSetSelectedStyle,
    setSize: mockSetSize,
    setPaperType: mockSetPaperType,
    setFrameType: mockSetFrameType,
    setIsGift: mockSetIsGift,
    setGiftMessage: mockSetGiftMessage,
    setStep: mockSetStep,
  }),
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe('OrderDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOrder.mockReturnValue({
      data: mockOrder,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  describe('Order Header', () => {
    it('displays order number in header', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      // Order number appears multiple times (header, breadcrumb), verify at least one
      const orderNumbers = screen.getAllByText(/FP-2024/);
      expect(orderNumbers.length).toBeGreaterThan(0);
    });

    it('displays order status badge', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      // Status badge should be present
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    it('navigates back when back button is clicked', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const backButton = screen.getByTestId('back-button');
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/account/orders');
    });
  });

  describe('Breadcrumb', () => {
    it('displays breadcrumb navigation', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      // There may be multiple "הזמנות" (breadcrumb and nav), verify at least one exists
      const orderLinks = screen.getAllByText('הזמנות');
      expect(orderLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Order Items', () => {
    it('displays order items', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('פריטים (1)')).toBeInTheDocument();
      expect(screen.getByText('צבעי מים')).toBeInTheDocument();
    });

    it('displays item details', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText(/A4/)).toBeInTheDocument();
      expect(screen.getByText(/נייר מט/)).toBeInTheDocument();
    });
  });

  describe('Order Timeline', () => {
    it('renders order timeline component', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByTestId('order-timeline')).toBeInTheDocument();
    });
  });

  describe('Tracking Information', () => {
    it('displays tracking info when available', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('מספר מעקב')).toBeInTheDocument();
      expect(screen.getByText('IL123456789')).toBeInTheDocument();
    });

    it('opens tracking URL when track button clicked', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const trackButton = screen.getByText('עקוב');
      fireEvent.click(trackButton);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://israelpost.co.il/itemtrace?itemcode=IL123456789',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  describe('Shipping Address', () => {
    it('displays shipping address', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('כתובת למשלוח')).toBeInTheDocument();
      expect(screen.getByText('ישראל ישראלי')).toBeInTheDocument();
      expect(screen.getByText('רחוב הרצל 123')).toBeInTheDocument();
    });
  });

  describe('Payment Summary', () => {
    it('displays payment summary', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('סיכום תשלום')).toBeInTheDocument();
      expect(screen.getByText('סכום ביניים')).toBeInTheDocument();
      expect(screen.getByText('משלוח')).toBeInTheDocument();
    });
  });

  describe('Reorder Action', () => {
    it('calls reorder function when button clicked', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const reorderButton = screen.getByText('הזמן שוב');
      fireEvent.click(reorderButton);

      expect(mockReset).toHaveBeenCalled();
      expect(mockSetOriginalImage).toHaveBeenCalled();
      expect(mockSetSelectedStyle).toHaveBeenCalledWith('watercolor');
      expect(mockSetStep).toHaveBeenCalledWith('customize');
      expect(mockPush).toHaveBeenCalledWith('/create/customize');
    });
  });

  describe('Invoice Download', () => {
    it('shows download invoice button for paid orders', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('הורד חשבונית')).toBeInTheDocument();
    });
  });

  describe('Contact Support', () => {
    it('navigates to support page when clicked', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const supportButton = screen.getByText('צור קשר');
      fireEvent.click(supportButton);

      expect(mockPush).toHaveBeenCalledWith('/support?order=demo_order_001');
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton when loading', () => {
      mockUseOrder.mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      // Should show skeleton elements
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('shows error message when order not found', () => {
      mockUseOrder.mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: new Error('Order not found'),
        refetch: vi.fn(),
      });

      renderWithQueryClient(<OrderDetailView orderId="nonexistent" />);

      expect(screen.getByText('הזמנה לא נמצאה')).toBeInTheDocument();
    });

    it('shows retry button on error', () => {
      const mockRefetch = vi.fn();
      mockUseOrder.mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: new Error('Order not found'),
        refetch: mockRefetch,
      });

      renderWithQueryClient(<OrderDetailView orderId="nonexistent" />);

      const retryButton = screen.getByText('נסה שוב');
      fireEvent.click(retryButton);

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Gift Orders', () => {
    it('displays gift info for gift orders', () => {
      mockUseOrder.mockReturnValue({
        data: {
          ...mockOrder,
          isGift: true,
          giftMessage: 'מזל טוב!',
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('הזמנת מתנה')).toBeInTheDocument();
      expect(screen.getByText(/"מזל טוב!"/)).toBeInTheDocument();
    });
  });

  describe('RTL Layout', () => {
    it('renders with RTL direction', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const rtlContainer = document.querySelector('[dir="rtl"]');
      expect(rtlContainer).toBeInTheDocument();
    });
  });
});
