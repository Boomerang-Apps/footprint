/**
 * Confirmation Page Tests
 *
 * TDD Test Suite for UI-05: Confirmation Page UI
 * Tests the confirmation page matching 05-confirmation.html mockup
 * INT-05: Added API integration tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CompletePage from './page';
import { useOrderStore } from '@/stores/orderStore';

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock fetch for API calls
const mockFetch = vi.fn();

// Mock zustand store
vi.mock('@/stores/orderStore');

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Mock PostPurchaseSignup component
vi.mock('@/components/auth/PostPurchaseSignup', () => ({
  PostPurchaseSignup: ({ email, orderId, onSignupComplete, onDismiss }: {
    email: string;
    orderId: string;
    onSignupComplete: () => void;
    onDismiss: () => void;
  }) => (
    <div data-testid="post-purchase-signup">
      <p>{email}</p>
      <p>{orderId}</p>
      <button onClick={onSignupComplete}>Complete</button>
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  ),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

const mockOrderData = {
  originalImage: 'https://example.com/photo.jpg',
  transformedImage: 'https://example.com/transformed.jpg',
  selectedStyle: 'pop_art',
  size: 'A4',
  paperType: 'matte',
  frameType: 'black',
  shippingAddress: {
    name: 'שלי כהן',
    email: 'shelly@example.com',
    phone: '050-1234567',
    street: 'רחוב הרצל 123',
    city: 'תל אביב',
    postalCode: '6120101',
  },
  total: 209,
  reset: vi.fn(),
};

describe('CompletePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    mockFetch.mockReset();
    mockSearchParams.delete('orderId');
    (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockOrderData);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Header', () => {
    it('renders header with logo', () => {
      render(<CompletePage />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('renders Footprint logo image', () => {
      render(<CompletePage />);
      expect(screen.getByAltText('Footprint')).toBeInTheDocument();
    });
  });

  describe('Success Hero', () => {
    it('renders success checkmark icon', () => {
      render(<CompletePage />);
      const successIcon = screen.getByTestId('success-icon');
      expect(successIcon).toBeInTheDocument();
    });

    it('renders success title', () => {
      render(<CompletePage />);
      expect(screen.getByRole('heading', { name: /ההזמנה בוצעה בהצלחה/i })).toBeInTheDocument();
    });

    it('renders email confirmation subtitle', () => {
      render(<CompletePage />);
      expect(screen.getByText(/אישור נשלח למייל/)).toBeInTheDocument();
    });

    it('displays default email in subtitle when no email param', () => {
      render(<CompletePage />);
      expect(screen.getByText(/your@email.com/)).toBeInTheDocument();
    });

    it('renders order number in FP-YYYY-XXXX format', () => {
      render(<CompletePage />);
      const orderNumber = screen.getByTestId('order-number');
      expect(orderNumber.textContent).toMatch(/FP-\d{4}-\d+/);
    });

    it('shows order number label', () => {
      render(<CompletePage />);
      expect(screen.getByText('מספר הזמנה:')).toBeInTheDocument();
    });
  });

  describe('Order Summary Card', () => {
    it('renders order card with header', () => {
      render(<CompletePage />);
      expect(screen.getByText('פרטי ההזמנה')).toBeInTheDocument();
    });

    it('renders package icon in card header', () => {
      render(<CompletePage />);
      const cardHeader = screen.getByTestId('order-card-header');
      expect(cardHeader).toBeInTheDocument();
    });

    it('renders order thumbnail', () => {
      render(<CompletePage />);
      const thumbnail = screen.getByTestId('order-thumb');
      expect(thumbnail).toBeInTheDocument();
    });

    it('displays order style name in Hebrew', () => {
      render(<CompletePage />);
      expect(screen.getByText(/פופ ארט/)).toBeInTheDocument();
    });

    it('displays order specs (size, paper, frame)', () => {
      render(<CompletePage />);
      const specs = screen.getByTestId('order-specs');
      expect(specs.textContent).toContain('A4');
    });

    it('displays order price with ₪ symbol', () => {
      render(<CompletePage />);
      const price = screen.getByTestId('order-price');
      expect(price.textContent).toMatch(/₪\d+/);
    });
  });

  describe('Delivery Section', () => {
    it('renders delivery info section', () => {
      render(<CompletePage />);
      const deliverySection = screen.getByTestId('delivery-section');
      expect(deliverySection).toBeInTheDocument();
    });

    it('displays delivery title', () => {
      render(<CompletePage />);
      expect(screen.getByText('משלוח עד הבית')).toBeInTheDocument();
    });

    it('displays estimated delivery date', () => {
      render(<CompletePage />);
      expect(screen.getByText(/הגעה משוערת:/)).toBeInTheDocument();
    });

    it('renders truck icon', () => {
      render(<CompletePage />);
      const deliveryIcon = screen.getByTestId('delivery-icon');
      expect(deliveryIcon).toBeInTheDocument();
    });
  });

  describe('Timeline', () => {
    it('renders timeline card', () => {
      render(<CompletePage />);
      const timelineCard = screen.getByTestId('timeline-card');
      expect(timelineCard).toBeInTheDocument();
    });

    it('renders timeline header with status text', () => {
      render(<CompletePage />);
      expect(screen.getByText('סטטוס ההזמנה')).toBeInTheDocument();
    });

    it('renders 4 timeline steps', () => {
      render(<CompletePage />);
      const steps = screen.getAllByTestId(/^timeline-step-/);
      expect(steps).toHaveLength(4);
    });

    it('renders step labels in Hebrew', () => {
      render(<CompletePage />);
      expect(screen.getByText('התקבלה')).toBeInTheDocument();
      expect(screen.getByText('בהכנה')).toBeInTheDocument();
      expect(screen.getByText('נשלחה')).toBeInTheDocument();
      expect(screen.getByText('הגיעה')).toBeInTheDocument();
    });

    it('marks first step as completed', () => {
      render(<CompletePage />);
      const step1 = screen.getByTestId('timeline-step-0');
      expect(step1).toHaveAttribute('data-status', 'completed');
    });

    it('marks second step as active', () => {
      render(<CompletePage />);
      const step2 = screen.getByTestId('timeline-step-1');
      expect(step2).toHaveAttribute('data-status', 'active');
    });

    it('marks remaining steps as pending', () => {
      render(<CompletePage />);
      const step3 = screen.getByTestId('timeline-step-2');
      const step4 = screen.getByTestId('timeline-step-3');
      expect(step3).toHaveAttribute('data-status', 'pending');
      expect(step4).toHaveAttribute('data-status', 'pending');
    });
  });

  describe('Share Card', () => {
    it('renders share card', () => {
      render(<CompletePage />);
      const shareCard = screen.getByTestId('share-card');
      expect(shareCard).toBeInTheDocument();
    });

    it('displays share title', () => {
      render(<CompletePage />);
      expect(screen.getByText('שתפו את הרגע!')).toBeInTheDocument();
    });

    it('displays share subtitle', () => {
      render(<CompletePage />);
      expect(screen.getByText(/ספרו לחברים/)).toBeInTheDocument();
    });

    it('renders WhatsApp share button', () => {
      render(<CompletePage />);
      const whatsappBtn = screen.getByTestId('share-whatsapp');
      expect(whatsappBtn).toBeInTheDocument();
    });

    it('renders Facebook share button', () => {
      render(<CompletePage />);
      const facebookBtn = screen.getByTestId('share-facebook');
      expect(facebookBtn).toBeInTheDocument();
    });

    it('renders Copy link button', () => {
      render(<CompletePage />);
      const copyBtn = screen.getByTestId('share-copy');
      expect(copyBtn).toBeInTheDocument();
    });

    it('copies order link when copy button clicked', async () => {
      render(<CompletePage />);
      const copyBtn = screen.getByTestId('share-copy');
      fireEvent.click(copyBtn);
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });
    });
  });

  describe('Bottom CTA', () => {
    it('renders bottom CTA container', () => {
      render(<CompletePage />);
      const bottomCta = screen.getByTestId('bottom-cta');
      expect(bottomCta).toBeInTheDocument();
    });

    it('renders home button', () => {
      render(<CompletePage />);
      const homeBtn = screen.getByRole('button', { name: /לדף הבית/ });
      expect(homeBtn).toBeInTheDocument();
    });

    it('renders new order button', () => {
      render(<CompletePage />);
      const newOrderBtn = screen.getByRole('button', { name: /הזמנה נוספת/ });
      expect(newOrderBtn).toBeInTheDocument();
    });

    it('navigates home when home button clicked', () => {
      render(<CompletePage />);
      const homeBtn = screen.getByRole('button', { name: /לדף הבית/ });
      fireEvent.click(homeBtn);
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('resets store and navigates to create when new order clicked', () => {
      render(<CompletePage />);
      const newOrderBtn = screen.getByRole('button', { name: /הזמנה נוספת/ });
      fireEvent.click(newOrderBtn);
      expect(mockOrderData.reset).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/create');
    });
  });

  describe('Responsive Design', () => {
    it('renders main content area', () => {
      render(<CompletePage />);
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('has RTL direction', () => {
      render(<CompletePage />);
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Style Names', () => {
    it.each([
      ['pop_art', 'פופ ארט'],
      ['watercolor', 'צבעי מים'],
    ])('displays %s as %s', (styleKey, styleName) => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockOrderData,
        selectedStyle: styleKey,
      });
      render(<CompletePage />);
      expect(screen.getByText(new RegExp(styleName))).toBeInTheDocument();
    });
  });

  describe('Paper and Frame Names', () => {
    it('displays paper type in specs', () => {
      render(<CompletePage />);
      const specs = screen.getByTestId('order-specs');
      expect(specs.textContent).toMatch(/Fine Art Matte|Matte/i);
    });

    it('displays frame type in specs', () => {
      render(<CompletePage />);
      const specs = screen.getByTestId('order-specs');
      expect(specs.textContent).toMatch(/מסגרת שחורה|שחורה/);
    });
  });

  describe('Order API Integration', () => {
    const mockApiResponse = {
      orderNumber: 'FP-2025-1234',
      status: 'pending',
      items: [{ name: 'Pop Art Print', quantity: 1, price: 209 }],
      subtotal: 209,
      shipping: 29,
      total: 238,
      shippingAddress: {
        street: 'רחוב הרצל 123',
        city: 'תל אביב',
        postalCode: '6120101',
        country: 'ישראל',
      },
      whatsappUrl: 'https://wa.me/?text=Order%20FP-2025-1234',
    };

    it('fetches order data when orderId is in URL', async () => {
      mockSearchParams.set('orderId', 'test-order-123');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      await act(async () => {
        render(<CompletePage />);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/orders/test-order-123/confirm');
      });
    });

    it('displays order number from API response', async () => {
      mockSearchParams.set('orderId', 'test-order-123');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      await act(async () => {
        render(<CompletePage />);
      });

      await waitFor(() => {
        const orderNumber = screen.getByTestId('order-number');
        expect(orderNumber.textContent).toContain('FP-2025-1234');
      });
    });

    it('displays total from API response', async () => {
      mockSearchParams.set('orderId', 'test-order-123');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      await act(async () => {
        render(<CompletePage />);
      });

      await waitFor(() => {
        const price = screen.getByTestId('order-price');
        expect(price.textContent).toContain('238');
      });
    });

    it('shows loading state while fetching order', async () => {
      mockSearchParams.set('orderId', 'test-order-123');
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponse),
        }), 100))
      );

      await act(async () => {
        render(<CompletePage />);
      });

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    it('shows error message when API fails', async () => {
      mockSearchParams.set('orderId', 'invalid-order');
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Order not found' }),
      });

      await act(async () => {
        render(<CompletePage />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });

    it('shows home button in error state', async () => {
      mockSearchParams.set('orderId', 'invalid-order');
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Order not found' }),
      });

      await act(async () => {
        render(<CompletePage />);
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /לדף הבית/i })).toBeInTheDocument();
      });
    });

    it('falls back to store data when no orderId', async () => {
      // No orderId set in search params
      render(<CompletePage />);

      // Should not call API
      expect(mockFetch).not.toHaveBeenCalled();

      // Should use store data
      const orderNumber = screen.getByTestId('order-number');
      expect(orderNumber.textContent).toMatch(/FP-\d{4}-\d+/);
    });

    it('uses WhatsApp URL from API response', async () => {
      mockSearchParams.set('orderId', 'test-order-123');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      // Mock window.open
      const mockOpen = vi.fn();
      window.open = mockOpen;

      await act(async () => {
        render(<CompletePage />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('order-number')).toHaveTextContent('FP-2025-1234');
      });

      const whatsappBtn = screen.getByTestId('share-whatsapp');
      fireEvent.click(whatsappBtn);

      expect(mockOpen).toHaveBeenCalledWith(mockApiResponse.whatsappUrl, '_blank');
    });

    it('handles network error gracefully', async () => {
      mockSearchParams.set('orderId', 'test-order-123');
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        render(<CompletePage />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });
  });

  describe('Post-Purchase Signup (AUTH-02)', () => {
    const guestOrderData = {
      ...mockOrderData,
      isGuest: true,
      guestInfo: {
        email: 'guest@example.com',
        firstName: 'גל',
        lastName: 'כהן',
      },
    };

    it('shows signup prompt for guest users', () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(guestOrderData);
      render(<CompletePage />);

      expect(screen.getByTestId('signup-prompt-container')).toBeInTheDocument();
    });

    it('does not show signup prompt for logged-in users', () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockOrderData,
        isGuest: false,
        guestInfo: null,
      });
      render(<CompletePage />);

      expect(screen.queryByTestId('signup-prompt-container')).not.toBeInTheDocument();
    });

    it('displays guest email in signup form', () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(guestOrderData);
      render(<CompletePage />);

      expect(screen.getByText('guest@example.com')).toBeInTheDocument();
    });

    it('uses guest email in confirmation message', () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(guestOrderData);
      render(<CompletePage />);

      expect(screen.getByText(/אישור נשלח למייל guest@example.com/)).toBeInTheDocument();
    });
  });
});
