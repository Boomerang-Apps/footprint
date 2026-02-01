/**
 * Tests for Order Tracking Page (UI-04B)
 *
 * Story: UI-04B - Order Tracking Page
 * Tests all 10 Acceptance Criteria with actual TDD tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { OrderTrackingContent } from './OrderTrackingContent';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn(), back: vi.fn() })),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock OrderTimeline component
vi.mock('@/components/ui/OrderTimeline', () => ({
  OrderTimeline: ({ currentStatus, locale }: any) => (
    <div data-testid="order-timeline" data-status={currentStatus} data-locale={locale}>
      Order Timeline Component
    </div>
  ),
}));

// Mock UI components
vi.mock('@/components/ui/Card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children, className }: any) => <h3 className={className}>{children}</h3>,
}));

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, asChild, onClick, variant, ...props }: any) => {
    if (asChild) {
      return <span data-testid="button" data-variant={variant}>{children}</span>;
    }
    return <button onClick={onClick} data-testid="button" data-variant={variant} {...props}>{children}</button>;
  },
}));

vi.mock('@/components/ui/Badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>{children}</span>
  ),
}));

import { useParams } from 'next/navigation';

// Mock order data
const mockOrder = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  orderNumber: 'FP-2024-001',
  status: 'shipped',
  statusLabel: 'נשלח',
  subtotal: 120.00,
  shippingCost: 30.00,
  discountAmount: 5.00,
  taxAmount: 20.40,
  total: 165.40,
  isGift: false,
  giftMessage: null,
  giftWrap: false,
  shippingAddress: {
    fullName: 'John Doe',
    phone: '050-1234567',
    email: 'john@example.com',
    street: '123 Main St',
    city: 'Tel Aviv',
    postalCode: '12345',
    country: 'Israel',
  },
  trackingNumber: 'RR123456789IL',
  trackingUrl: 'https://israelpost.co.il/itemtrace?itemcode=RR123456789IL',
  carrier: 'Israel Post',
  items: [
    {
      id: 'item-1',
      originalImageUrl: 'https://example.com/image1.jpg',
      transformedImageUrl: 'https://example.com/transformed1.jpg',
      style: 'classic',
      size: '20x30',
      paperType: 'matte',
      frameType: 'wood',
      price: 120.00,
    },
  ],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T12:00:00Z',
  paidAt: '2024-01-15T10:30:00Z',
  shippedAt: '2024-01-16T09:00:00Z',
  deliveredAt: null,
  estimatedDeliveryDate: '2024-01-20T00:00:00Z',
};

// Helper to setup fetch mock
const setupFetchMock = (response: any, status = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(response),
  });
};

describe('OrderTrackingContent - UI-04B', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({ id: mockOrder.id });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC-001: Page displays order status using OrderTimeline component', () => {
    it('should render OrderTimeline component with correct status', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        const timeline = screen.getByTestId('order-timeline');
        expect(timeline).toBeInTheDocument();
        expect(timeline).toHaveAttribute('data-status', 'shipped');
      });
    });

    it('should pass Hebrew locale to OrderTimeline', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        const timeline = screen.getByTestId('order-timeline');
        expect(timeline).toHaveAttribute('data-locale', 'he');
      });
    });
  });

  describe('AC-002: Page shows order details', () => {
    it('should display order number', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(screen.getByText(/FP-2024-001/)).toBeInTheDocument();
      });
    });

    it('should display order items', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(screen.getByText(/classic/)).toBeInTheDocument();
        expect(screen.getByText(/20x30/)).toBeInTheDocument();
        expect(screen.getByText(/matte/)).toBeInTheDocument();
      });
    });

    it('should display order total', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(screen.getByText(/₪165.40/)).toBeInTheDocument();
      });
    });

    it('should display shipping address', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('123 Main St')).toBeInTheDocument();
        expect(screen.getByText(/Tel Aviv/)).toBeInTheDocument();
      });
    });
  });

  describe('AC-003: Page displays external tracking link when tracking exists', () => {
    it('should show tracking link when tracking number exists', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        const trackingLink = screen.getByRole('link', { name: /מעקב משלוח באתר/ });
        expect(trackingLink).toBeInTheDocument();
        expect(trackingLink).toHaveAttribute('href', mockOrder.trackingUrl);
      });
    });

    it('should not show tracking section when no tracking number', async () => {
      const orderWithoutTracking = { ...mockOrder, trackingNumber: null, trackingUrl: null, carrier: null };
      setupFetchMock(orderWithoutTracking);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(screen.queryByText(/מספר מעקב/)).not.toBeInTheDocument();
      });
    });

    it('should display tracking number', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(screen.getByText('RR123456789IL')).toBeInTheDocument();
      });
    });

    it('should display carrier name', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(screen.getByText('Israel Post')).toBeInTheDocument();
      });
    });
  });

  describe('AC-004: Tracking link opens in new tab', () => {
    it('should have target="_blank" on tracking link', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        const trackingLink = screen.getByRole('link', { name: /מעקב משלוח באתר/ });
        expect(trackingLink).toHaveAttribute('target', '_blank');
      });
    });

    it('should have rel="noopener noreferrer" on tracking link', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        const trackingLink = screen.getByRole('link', { name: /מעקב משלוח באתר/ });
        expect(trackingLink).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  describe('AC-005: Page shows loading state while fetching order', () => {
    it('should show loading spinner initially', async () => {
      // Delay the fetch response
      global.fetch = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockOrder),
        }), 100))
      );

      render(<OrderTrackingContent />);

      // Should show loading state immediately
      expect(screen.getByText(/טוען פרטי הזמנה/)).toBeInTheDocument();
    });

    it('should hide loading state after fetch completes', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(screen.queryByText(/טוען פרטי הזמנה/)).not.toBeInTheDocument();
      });
    });
  });

  describe('AC-006: Page shows error state for non-existent or unauthorized orders', () => {
    it('should show error message for 404 response', async () => {
      setupFetchMock({ error: 'Not found' }, 404);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(screen.getByText(/הזמנה לא נמצאה או שאין לך הרשאה/)).toBeInTheDocument();
      });
    });

    it('should show error message for 401 response', async () => {
      setupFetchMock({ error: 'Unauthorized' }, 401);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(screen.getByText(/נדרש להתחבר/)).toBeInTheDocument();
      });
    });

    it('should show generic error for other failures', async () => {
      setupFetchMock({ error: 'Server error' }, 500);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(screen.getByText(/שגיאה בטעינת פרטי ההזמנה/)).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      setupFetchMock({ error: 'Not found' }, 404);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(screen.getByText('נסה שנית')).toBeInTheDocument();
      });
    });

    it('should refetch when retry button is clicked', async () => {
      setupFetchMock({ error: 'Not found' }, 404);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        const retryButton = screen.getByText('נסה שנית');
        fireEvent.click(retryButton);
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('AC-007: Page is fully RTL with Hebrew labels', () => {
    it('should have dir="rtl" on main container', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        const mainContainer = document.querySelector('[dir="rtl"]');
        expect(mainContainer).toBeInTheDocument();
      });
    });

    it('should display Hebrew labels', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(screen.getByText(/מעקב הזמנה/)).toBeInTheDocument();
        expect(screen.getByText(/סטטוס ההזמנה/)).toBeInTheDocument();
        expect(screen.getByText(/פריטי ההזמנה/)).toBeInTheDocument();
        expect(screen.getByText(/סיכום ההזמנה/)).toBeInTheDocument();
        expect(screen.getByText(/כתובת משלוח/)).toBeInTheDocument();
      });
    });
  });

  describe('AC-008: Page is mobile-first responsive (max-width 550px)', () => {
    it('should have max-width 550px on container', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        const container = document.querySelector('.max-w-\\[550px\\]');
        expect(container).toBeInTheDocument();
      });
    });

    it('should have proper padding for mobile', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        const container = document.querySelector('.px-4');
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('AC-009: Page has Back to Orders navigation link', () => {
    it('should have link to /account/orders', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: /חזרה להזמנות/ });
        expect(backLink).toBeInTheDocument();
        expect(backLink).toHaveAttribute('href', '/account/orders');
      });
    });
  });

  describe('AC-010: Page shows estimated delivery date when available', () => {
    it('should display estimated delivery date', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(screen.getByText(/משלוח צפוי/)).toBeInTheDocument();
      });
    });

    it('should not show estimated delivery section when not available', async () => {
      const orderWithoutEstimate = { ...mockOrder, estimatedDeliveryDate: undefined };
      setupFetchMock(orderWithoutEstimate);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(screen.queryByText(/משלוח צפוי/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Additional Tests', () => {
    it('should fetch order details on mount', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/orders/${mockOrder.id}`);
      });
    });

    it('should handle network errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(screen.getByText(/שגיאת רשת/)).toBeInTheDocument();
      });
    });

    it('should display gift information when order is a gift', async () => {
      const giftOrder = {
        ...mockOrder,
        isGift: true,
        giftWrap: true,
        giftMessage: 'Happy Birthday!',
      };
      setupFetchMock(giftOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(screen.getByText(/אריזת מתנה/)).toBeInTheDocument();
        expect(screen.getByText('Happy Birthday!')).toBeInTheDocument();
      });
    });

    it('should display discount when applicable', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        expect(screen.getByText(/₪5.00/)).toBeInTheDocument();
        expect(screen.getByText(/הנחה/)).toBeInTheDocument();
      });
    });

    it('should display correct status badge variant', async () => {
      setupFetchMock(mockOrder);

      render(<OrderTrackingContent />);

      await waitFor(() => {
        const badge = screen.getByTestId('badge');
        expect(badge).toHaveAttribute('data-variant', 'info'); // shipped = info
      });
    });
  });
});
