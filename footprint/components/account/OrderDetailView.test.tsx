import { render, screen, fireEvent } from '@testing-library/react';
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

// Mock favoritesStore
const mockIsFavorite = vi.fn(() => false);
const mockAddFavorite = vi.fn();
const mockRemoveFavorite = vi.fn();

vi.mock('@/stores/favoritesStore', () => ({
  useFavoritesStore: () => ({
    isFavorite: mockIsFavorite,
    addFavorite: mockAddFavorite,
    removeFavorite: mockRemoveFavorite,
    favorites: [],
  }),
}));

// Mock styles-ui
vi.mock('@/lib/ai/styles-ui', () => ({
  getStyleById: (id: string) => {
    const styles: Record<string, { nameHe: string; gradient: string }> = {
      watercolor: { nameHe: 'צבעי מים', gradient: 'from-blue-500 to-cyan-400' },
      avatar_cartoon: { nameHe: 'אווטאר קרטון', gradient: 'from-violet-500 to-pink-500' },
    };
    return styles[id] || undefined;
  },
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
    mockIsFavorite.mockReturnValue(false);
  });

  describe('Hero Section', () => {
    it('renders hero section with gradient background', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const hero = screen.getByTestId('order-hero');
      expect(hero).toBeInTheDocument();
      expect(hero).toHaveClass('bg-gradient-to-br');
    });

    it('displays order image in hero', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const image = screen.getByAltText('צבעי מים');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/transformed.jpg');
    });

    it('displays status badge on hero', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByTestId('order-status-badge')).toBeInTheDocument();
    });
  });

  describe('Favorite Toggle', () => {
    it('renders favorite toggle button', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const favButton = screen.getByTestId('favorite-toggle');
      expect(favButton).toBeInTheDocument();
    });

    it('calls addFavorite when item is not favorited', () => {
      mockIsFavorite.mockReturnValue(false);
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const favButton = screen.getByTestId('favorite-toggle');
      fireEvent.click(favButton);

      expect(mockAddFavorite).toHaveBeenCalledWith({
        imageUrl: 'https://example.com/transformed.jpg',
        originalImageUrl: 'https://example.com/original.jpg',
        style: 'watercolor',
        styleName: 'צבעי מים',
      });
    });
  });

  describe('Progress Bar', () => {
    it('renders progress bar', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      expect(screen.getByText('התקדמות ההזמנה')).toBeInTheDocument();
    });

    it('shows correct percentage for shipped status', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('shows estimated delivery date', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText(/משלוח משוער/)).toBeInTheDocument();
    });
  });

  describe('Order Header', () => {
    it('displays order number', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const orderNumbers = screen.getAllByText(/FP-/);
      expect(orderNumbers.length).toBeGreaterThan(0);
    });

    it('navigates back when back button is clicked', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const backButton = screen.getByTestId('back-button');
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/account/orders');
    });
  });

  describe('No Breadcrumb or Lightbox', () => {
    it('does not render breadcrumb navigation', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const breadcrumb = document.querySelector('nav[aria-label="Breadcrumb"]');
      expect(breadcrumb).not.toBeInTheDocument();
    });

    it('does not render bottom navigation', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const fixedNav = document.querySelector('nav.fixed');
      expect(fixedNav).not.toBeInTheDocument();
    });
  });

  describe('Product Details', () => {
    it('displays product details card', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('פרטי המוצר')).toBeInTheDocument();
      expect(screen.getByText('סגנון אמנות')).toBeInTheDocument();
      expect(screen.getByText('צבעי מים')).toBeInTheDocument();
    });

    it('displays item details', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('A4')).toBeInTheDocument();
      expect(screen.getByText('נייר מט')).toBeInTheDocument();
      expect(screen.getByText('מסגרת שחורה')).toBeInTheDocument();
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
    it('displays price breakdown', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('פירוט מחיר')).toBeInTheDocument();
      expect(screen.getByText('סכום ביניים')).toBeInTheDocument();
      expect(screen.getByText('משלוח')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders reorder and contact buttons side by side', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('הזמן שוב')).toBeInTheDocument();
      expect(screen.getByText('צור קשר')).toBeInTheDocument();
    });

    it('does not render download invoice button', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.queryByText('הורד חשבונית')).not.toBeInTheDocument();
    });

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

  describe('RTL Layout', () => {
    it('renders with RTL direction', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const rtlContainer = document.querySelector('[dir="rtl"]');
      expect(rtlContainer).toBeInTheDocument();
    });
  });
});
