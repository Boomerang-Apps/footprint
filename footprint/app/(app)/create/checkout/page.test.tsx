/**
 * Checkout Page Tests
 *
 * TDD Test Suite for INT-03: Checkout Payment Integration
 * Tests PayPlus and Stripe wallet payment flows
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CheckoutPage from './page';
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

// Mock zustand store
vi.mock('@/stores/orderStore');

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock react-hot-toast
const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();
vi.mock('react-hot-toast', () => ({
  default: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  },
}));

// Mock fetch for payment APIs
const mockFetch = vi.fn();

describe('CheckoutPage', () => {
  const mockSetStep = vi.fn();
  const mockSetShippingAddress = vi.fn();
  const mockSetIsGift = vi.fn();
  const mockSetGiftOccasion = vi.fn();
  const mockSetGiftMessage = vi.fn();
  const mockSetHideGiftPrice = vi.fn();

  const defaultMockStore = {
    setStep: mockSetStep,
    setShippingAddress: mockSetShippingAddress,
    setIsGift: mockSetIsGift,
    setGiftOccasion: mockSetGiftOccasion,
    setGiftMessage: mockSetGiftMessage,
    setHideGiftPrice: mockSetHideGiftPrice,
    originalImage: 'https://r2.example.com/image.jpg',
    transformedImage: 'https://r2.example.com/transformed.jpg',
    selectedStyle: 'pop_art',
    size: 'A4',
    paperType: 'matte',
    frameType: 'none',
    isGift: false,
    giftOccasion: null,
    giftMessage: '',
    hideGiftPrice: true,
    shippingAddress: null,
    _hasHydrated: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    mockFetch.mockReset();
    mockSearchParams.delete('error');

    (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(defaultMockStore);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Page Structure', () => {
    it('renders checkout page with form', () => {
      render(<CheckoutPage />);
      // Check that the main content is rendered
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('renders contact info section', () => {
      render(<CheckoutPage />);
      expect(screen.getByText('פרטי התקשרות')).toBeInTheDocument();
    });

    it('renders shipping address section', () => {
      render(<CheckoutPage />);
      expect(screen.getByText('כתובת למשלוח')).toBeInTheDocument();
    });

    it('renders order summary', () => {
      render(<CheckoutPage />);
      expect(screen.getByText('סיכום הזמנה')).toBeInTheDocument();
    });

    it('renders payment button', () => {
      render(<CheckoutPage />);
      expect(screen.getByRole('button', { name: /לתשלום/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('does not call API when form is empty', async () => {
      render(<CheckoutPage />);

      const submitButton = screen.getByRole('button', { name: /לתשלום/i });
      fireEvent.click(submitButton);

      // Browser native validation prevents form submission
      // API should not be called
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('validates required fields before API call', async () => {
      render(<CheckoutPage />);

      // Fill only some fields
      fireEvent.change(screen.getByPlaceholderText(/ישראל ישראלי/i), {
        target: { value: 'Test User' },
      });

      const submitButton = screen.getByRole('button', { name: /לתשלום/i });
      fireEvent.click(submitButton);

      // Should not call API without all required fields
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('PayPlus Payment Integration', () => {
    const fillValidForm = () => {
      fireEvent.change(screen.getByPlaceholderText(/ישראל ישראלי/i), {
        target: { value: 'Test User' },
      });
      fireEvent.change(screen.getByPlaceholderText(/email@example.com/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText(/050-1234567/i), {
        target: { value: '0501234567' },
      });
      fireEvent.change(screen.getByPlaceholderText(/רחוב הרצל 1/i), {
        target: { value: 'הרצל 1' },
      });
      fireEvent.change(screen.getByPlaceholderText(/תל אביב/i), {
        target: { value: 'תל אביב' },
      });
    };

    it('calls PayPlus API when form is submitted', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          pageRequestUid: 'test-uid-123',
          paymentUrl: 'https://payments.payplus.co.il/test',
        }),
      });

      render(<CheckoutPage />);
      fillValidForm();

      const submitButton = screen.getByRole('button', { name: /לתשלום/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/checkout', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }));
      });
    });

    it('sends correct payment data to API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          pageRequestUid: 'test-uid-123',
          paymentUrl: 'https://payments.payplus.co.il/test',
        }),
      });

      render(<CheckoutPage />);
      fillValidForm();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /לתשלום/i }));
      });

      await waitFor(() => {
        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody.customerName).toBe('Test User');
        expect(callBody.customerEmail).toBe('test@example.com');
        expect(callBody.customerPhone).toBe('0501234567');
        expect(callBody.amount).toBeGreaterThan(0);
        expect(callBody.orderId).toBeDefined();
      });
    });

    it('redirects to PayPlus payment URL on success', async () => {
      const paymentUrl = 'https://payments.payplus.co.il/test-checkout';

      // Mock window.location.href
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, href: '' },
        writable: true,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          pageRequestUid: 'test-uid-123',
          paymentUrl,
        }),
      });

      render(<CheckoutPage />);
      fillValidForm();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /לתשלום/i }));
      });

      await waitFor(() => {
        expect(window.location.href).toBe(paymentUrl);
      });

      // Restore
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });

    it('shows loading state during payment processing', async () => {
      mockFetch.mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({
              pageRequestUid: 'test-uid',
              paymentUrl: 'https://payments.payplus.co.il/test',
            }),
          }), 100)
        )
      );

      render(<CheckoutPage />);
      fillValidForm();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /לתשלום/i }));
      });

      expect(screen.getByText(/מעבד תשלום/i)).toBeInTheDocument();
    });

    it('disables submit button during processing', async () => {
      mockFetch.mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({
              pageRequestUid: 'test-uid',
              paymentUrl: 'https://payments.payplus.co.il/test',
            }),
          }), 100)
        )
      );

      render(<CheckoutPage />);
      fillValidForm();

      const submitButton = screen.getByRole('button', { name: /לתשלום/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      expect(submitButton).toBeDisabled();
    });

    it('shows error when PayPlus API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Payment service unavailable' }),
      });

      render(<CheckoutPage />);
      fillValidForm();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /לתשלום/i }));
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });
    });

    it('handles network error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<CheckoutPage />);
      fillValidForm();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /לתשלום/i }));
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });
    });
  });

  describe('Payment Error Handling', () => {
    it('shows error message when returning from failed payment', () => {
      mockSearchParams.set('error', 'payment_failed');

      render(<CheckoutPage />);

      expect(mockToastError).toHaveBeenCalledWith(expect.stringContaining('התשלום נכשל'));
    });

    it('allows retry after payment failure', async () => {
      mockSearchParams.set('error', 'payment_failed');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          pageRequestUid: 'test-uid',
          paymentUrl: 'https://payments.payplus.co.il/test',
        }),
      });

      render(<CheckoutPage />);

      // Fill form and retry
      fireEvent.change(screen.getByPlaceholderText(/ישראל ישראלי/i), {
        target: { value: 'Test User' },
      });
      fireEvent.change(screen.getByPlaceholderText(/email@example.com/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText(/050-1234567/i), {
        target: { value: '0501234567' },
      });
      fireEvent.change(screen.getByPlaceholderText(/רחוב הרצל 1/i), {
        target: { value: 'הרצל 1' },
      });
      fireEvent.change(screen.getByPlaceholderText(/תל אביב/i), {
        target: { value: 'תל אביב' },
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /לתשלום/i }));
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });

  describe('Order Amount Calculation', () => {
    it('calculates correct amount based on product options', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          pageRequestUid: 'test-uid',
          paymentUrl: 'https://payments.payplus.co.il/test',
        }),
      });

      render(<CheckoutPage />);

      // Fill form
      fireEvent.change(screen.getByPlaceholderText(/ישראל ישראלי/i), {
        target: { value: 'Test User' },
      });
      fireEvent.change(screen.getByPlaceholderText(/email@example.com/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText(/050-1234567/i), {
        target: { value: '0501234567' },
      });
      fireEvent.change(screen.getByPlaceholderText(/רחוב הרצל 1/i), {
        target: { value: 'הרצל 1' },
      });
      fireEvent.change(screen.getByPlaceholderText(/תל אביב/i), {
        target: { value: 'תל אביב' },
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /לתשלום/i }));
      });

      await waitFor(() => {
        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        // A4 = 129 ILS + 29 shipping = 158 ILS = 15800 agorot
        expect(callBody.amount).toBe(15800);
      });
    });
  });

  describe('Address Storage', () => {
    it('saves shipping address to store before payment', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          pageRequestUid: 'test-uid',
          paymentUrl: 'https://payments.payplus.co.il/test',
        }),
      });

      render(<CheckoutPage />);

      fireEvent.change(screen.getByPlaceholderText(/ישראל ישראלי/i), {
        target: { value: 'Test User' },
      });
      fireEvent.change(screen.getByPlaceholderText(/email@example.com/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText(/050-1234567/i), {
        target: { value: '0501234567' },
      });
      fireEvent.change(screen.getByPlaceholderText(/רחוב הרצל 1/i), {
        target: { value: 'הרצל 1' },
      });
      fireEvent.change(screen.getByPlaceholderText(/תל אביב/i), {
        target: { value: 'תל אביב' },
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /לתשלום/i }));
      });

      await waitFor(() => {
        expect(mockSetShippingAddress).toHaveBeenCalledWith(expect.objectContaining({
          name: 'Test User',
          phone: '0501234567',
          street: 'הרצל 1',
          city: 'תל אביב',
        }));
      });
    });
  });

  describe('Navigation', () => {
    it('navigates back to customize when back button clicked', () => {
      render(<CheckoutPage />);

      const backButton = screen.getByRole('button', { name: /חזרה/i });
      fireEvent.click(backButton);

      expect(mockSetStep).toHaveBeenCalledWith('customize');
      expect(mockPush).toHaveBeenCalledWith('/create/customize');
    });

    it('redirects to upload if no image', async () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...defaultMockStore,
        originalImage: null,
        transformedImage: null,
        selectedStyle: null,
        _hasHydrated: true,
      });

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/create');
      });
    });
  });
});
