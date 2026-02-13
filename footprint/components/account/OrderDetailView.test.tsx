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

// Use vi.hoisted to define mocks
const { mockUseOrder, mockIsFavorite, mockAddFavorite, mockRemoveFavorite, mockFavorites } = vi.hoisted(() => ({
  mockUseOrder: vi.fn((): { data: Order | null; isLoading: boolean; isError: boolean; error: Error | null; refetch: ReturnType<typeof vi.fn> } => ({
    data: mockOrder,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })),
  mockIsFavorite: vi.fn(() => false),
  mockAddFavorite: vi.fn(),
  mockRemoveFavorite: vi.fn(),
  mockFavorites: [] as Array<{ id: string; imageUrl: string }>,
}));

vi.mock('@/hooks/useOrderHistory', () => ({
  useOrder: mockUseOrder,
}));

// Mock OrderTimeline
vi.mock('./OrderTimeline', () => ({
  OrderTimeline: () => <div data-testid="order-timeline">Timeline Component</div>,
}));

// Mock favoritesStore
vi.mock('@/stores/favoritesStore', () => ({
  useFavoritesStore: () => ({
    isFavorite: mockIsFavorite,
    addFavorite: mockAddFavorite,
    removeFavorite: mockRemoveFavorite,
    favorites: mockFavorites,
  }),
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

// Mock PriceDisplay
vi.mock('@/components/ui/PriceDisplay', () => ({
  PriceDisplay: ({ amount, color }: { amount: number; color?: string }) => (
    <span data-testid="price-display" data-color={color}>₪{amount}</span>
  ),
}));

// Mock OrderStatusBadge
vi.mock('@/components/ui/OrderStatusBadge', () => ({
  OrderStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
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

  describe('Order Header', () => {
    it('displays back button', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    it('navigates back when back button is clicked', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);
      const backButton = screen.getByTestId('back-button');
      fireEvent.click(backButton);
      expect(mockPush).toHaveBeenCalledWith('/account/orders');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AC-011: WHEN user views OrderDetailView
  //         THEN hero section shows gradient background, order image, and status badge
  // ═══════════════════════════════════════════════════════════════
  describe('AC-011: Hero Section', () => {
    it('renders hero section with gradient background', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const hero = screen.getByTestId('order-hero');
      expect(hero).toBeInTheDocument();
      expect(hero).toHaveClass('bg-gradient-to-br');
      // Should use watercolor gradient from styles-ui
      expect(hero).toHaveClass('from-blue-500');
      expect(hero).toHaveClass('to-cyan-400');
    });

    it('shows order image in hero section', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const hero = screen.getByTestId('order-hero');
      const image = hero.querySelector('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/transformed.jpg');
    });

    it('displays OrderStatusBadge in hero section', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const hero = screen.getByTestId('order-hero');
      const badge = hero.querySelector('[data-testid="status-badge"]');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('shipped');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AC-012: WHEN user views OrderDetailView
  //         THEN a favorite heart toggle button is shown in hero
  //         AND it calls useFavoritesStore for toggle
  // ═══════════════════════════════════════════════════════════════
  describe('AC-012: Favorite Heart Toggle', () => {
    it('renders favorite toggle button in hero', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const favButton = screen.getByTestId('favorite-toggle');
      expect(favButton).toBeInTheDocument();
    });

    it('calls addFavorite when item is not yet favorited', () => {
      mockIsFavorite.mockReturnValue(false);
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const favButton = screen.getByTestId('favorite-toggle');
      fireEvent.click(favButton);

      expect(mockAddFavorite).toHaveBeenCalledWith(
        expect.objectContaining({
          imageUrl: 'https://example.com/transformed.jpg',
          style: 'watercolor',
        })
      );
    });

    it('calls removeFavorite when item is already favorited', () => {
      mockIsFavorite.mockReturnValue(true);
      const favId = 'fav-123';
      (mockFavorites as Array<{ id: string; imageUrl: string }>).length = 0;
      (mockFavorites as Array<{ id: string; imageUrl: string }>).push({
        id: favId,
        imageUrl: 'https://example.com/transformed.jpg',
      });

      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const favButton = screen.getByTestId('favorite-toggle');
      fireEvent.click(favButton);

      expect(mockRemoveFavorite).toHaveBeenCalledWith(favId);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AC-013: WHEN user views OrderDetailView
  //         THEN a progress bar shows percentage based on status
  //         AND estimated delivery date (7 Israel business days, skip Fri/Sat)
  // ═══════════════════════════════════════════════════════════════
  describe('AC-013: Progress Bar', () => {
    it('renders progress bar element', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toBeInTheDocument();
    });

    it('shows percentage for shipped status (75%)', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('shows estimated delivery text', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText(/משלוח משוער/)).toBeInTheDocument();
    });

    it('shows 100% for delivered status', () => {
      mockUseOrder.mockReturnValue({
        data: {
          ...mockOrder,
          status: 'delivered',
          deliveredAt: new Date('2024-12-25T10:00:00'),
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('shows 0% for cancelled status', () => {
      mockUseOrder.mockReturnValue({
        data: {
          ...mockOrder,
          status: 'cancelled',
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AC-014: WHEN user views OrderDetailView
  //         THEN vertical OrderTimeline is integrated
  // ═══════════════════════════════════════════════════════════════
  describe('AC-014: Vertical Timeline Integration', () => {
    it('renders OrderTimeline component', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByTestId('order-timeline')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AC-015: WHEN user views OrderDetailView
  //         THEN product details card shows labeled rows:
  //         style name, size, paper type, frame type
  // ═══════════════════════════════════════════════════════════════
  describe('AC-015: Product Details Card', () => {
    it('shows product details section title', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('פרטי המוצר')).toBeInTheDocument();
    });

    it('shows style label and value from styles-ui', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('סגנון אמנות')).toBeInTheDocument();
      expect(screen.getByText('צבעי מים')).toBeInTheDocument();
    });

    it('shows size label and value', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('גודל הדפס')).toBeInTheDocument();
      expect(screen.getByText('A4')).toBeInTheDocument();
    });

    it('shows paper type label and translated value', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('סוג נייר')).toBeInTheDocument();
      expect(screen.getByText('נייר מט')).toBeInTheDocument();
    });

    it('shows frame type label and translated value', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('מסגרת')).toBeInTheDocument();
      expect(screen.getByText('מסגרת שחורה')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AC-016: WHEN user views payment section
  //         THEN title is "פירוט מחיר" (NOT "סיכום תשלום")
  // ═══════════════════════════════════════════════════════════════
  describe('AC-016: Payment Section Title', () => {
    it('shows "פירוט מחיר" as payment section title', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('פירוט מחיר')).toBeInTheDocument();
    });

    it('does NOT show old "סיכום תשלום" title', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.queryByText('סיכום תשלום')).not.toBeInTheDocument();
    });

    it('shows subtotal, shipping, and total', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('סכום ביניים')).toBeInTheDocument();
      expect(screen.getByText('משלוח')).toBeInTheDocument();
      expect(screen.getByText('סה״כ')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AC-017: WHEN user views OrderDetailView actions
  //         THEN exactly 2 buttons shown: "הזמן שוב" + "צור קשר"
  //         AND buttons are side by side (grid-cols-2)
  // ═══════════════════════════════════════════════════════════════
  describe('AC-017: Two Action Buttons', () => {
    it('shows "הזמן שוב" and "צור קשר" buttons', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.getByText('הזמן שוב')).toBeInTheDocument();
      expect(screen.getByText('צור קשר')).toBeInTheDocument();
    });

    it('buttons are in a grid-cols-2 layout (side by side)', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const reorderButton = screen.getByText('הזמן שוב').closest('button');
      const container = reorderButton?.parentElement;
      expect(container).toHaveClass('grid', 'grid-cols-2');
    });

    it('calls reorder handler when "הזמן שוב" clicked', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      fireEvent.click(screen.getByText('הזמן שוב'));

      expect(mockReset).toHaveBeenCalled();
      expect(mockSetSelectedStyle).toHaveBeenCalledWith('watercolor');
      expect(mockSetStep).toHaveBeenCalledWith('customize');
      expect(mockPush).toHaveBeenCalledWith('/create/customize');
    });

    it('navigates to support when "צור קשר" clicked', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      fireEvent.click(screen.getByText('צור קשר'));

      expect(mockPush).toHaveBeenCalledWith('/support?order=demo_order_001');
    });

    it('sets gift options when reordering a gift order', () => {
      mockUseOrder.mockReturnValue({
        data: {
          ...mockOrder,
          isGift: true,
          giftMessage: 'Happy Birthday!',
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      fireEvent.click(screen.getByText('הזמן שוב'));

      expect(mockSetIsGift).toHaveBeenCalledWith(true);
      expect(mockSetGiftMessage).toHaveBeenCalledWith('Happy Birthday!');
    });

    it('sets gift flag without message when gift has no message', () => {
      mockUseOrder.mockReturnValue({
        data: {
          ...mockOrder,
          isGift: true,
          giftMessage: null,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      fireEvent.click(screen.getByText('הזמן שוב'));

      expect(mockSetIsGift).toHaveBeenCalledWith(true);
      expect(mockSetGiftMessage).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AC-018: WHEN user views OrderDetailView
  //         THEN NO breadcrumb, NO lightbox, NO custom bottom nav,
  //         NO download invoice button
  // ═══════════════════════════════════════════════════════════════
  describe('AC-018: Removed Elements', () => {
    it('does NOT render breadcrumb navigation', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.queryByLabelText('Breadcrumb')).not.toBeInTheDocument();
    });

    it('does NOT render lightbox overlay', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const lightbox = document.querySelector('.fixed.inset-0.z-\\[100\\]');
      expect(lightbox).not.toBeInTheDocument();
    });

    it('does NOT render custom bottom navigation', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      const fixedNav = document.querySelector('nav.fixed');
      expect(fixedNav).not.toBeInTheDocument();
    });

    it('does NOT render download invoice button', () => {
      renderWithQueryClient(<OrderDetailView orderId="demo_order_001" />);

      expect(screen.queryByText('הורד חשבונית')).not.toBeInTheDocument();
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
