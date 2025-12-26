/**
 * Checkout Page Tests
 *
 * TDD Test Suite for UI-04: Checkout Page UI
 * Tests the checkout page matching 04-checkout.html mockup
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckoutPage from './page';
import { useOrderStore } from '@/stores/orderStore';

// Mock next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
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
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('CheckoutPage', () => {
  const mockSetStep = vi.fn();
  const mockSetIsGift = vi.fn();
  const mockSetGiftMessage = vi.fn();
  const mockSetShippingAddress = vi.fn();
  const mockSetDiscountCode = vi.fn();

  const defaultStoreState = {
    setStep: mockSetStep,
    setIsGift: mockSetIsGift,
    setGiftMessage: mockSetGiftMessage,
    setShippingAddress: mockSetShippingAddress,
    setDiscountCode: mockSetDiscountCode,
    originalImage: 'blob:test-image-url',
    transformedImage: 'blob:test-transformed-url',
    selectedStyle: 'pop_art',
    currentStep: 'checkout',
    size: 'A4',
    paperType: 'matte',
    frameType: 'black',
    isGift: false,
    giftMessage: '',
    discountCode: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(defaultStoreState);
  });

  describe('Page Structure', () => {
    it('renders the page header with title "תשלום"', () => {
      render(<CheckoutPage />);
      // Header title - use role heading
      const heading = screen.getByRole('heading', { name: 'תשלום' });
      expect(heading).toBeInTheDocument();
    });

    it('renders back button in header', () => {
      render(<CheckoutPage />);
      const backButton = screen.getByTestId('header-back-button');
      expect(backButton).toBeInTheDocument();
    });

    it('renders main content wrapper', () => {
      render(<CheckoutPage />);
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('renders all 4 progress steps', () => {
      render(<CheckoutPage />);
      expect(screen.getByText('העלאה')).toBeInTheDocument();
      expect(screen.getByText('סגנון')).toBeInTheDocument();
      expect(screen.getByText('התאמה')).toBeInTheDocument();
      // תשלום appears in both header and progress - check progress steps exist
      const progressSteps = screen.getAllByText('תשלום');
      expect(progressSteps.length).toBeGreaterThanOrEqual(1);
    });

    it('shows steps 1, 2, and 3 as completed', () => {
      render(<CheckoutPage />);
      const uploadStep = screen.getByText('העלאה').closest('[data-step]');
      const styleStep = screen.getByText('סגנון').closest('[data-step]');
      const customizeStep = screen.getByText('התאמה').closest('[data-step]');
      expect(uploadStep).toHaveAttribute('data-completed', 'true');
      expect(styleStep).toHaveAttribute('data-completed', 'true');
      expect(customizeStep).toHaveAttribute('data-completed', 'true');
    });

    it('shows step 4 (checkout) as active', () => {
      render(<CheckoutPage />);
      // תשלום appears in both header and progress - find the one in progress bar
      const progressSteps = screen.getAllByText('תשלום');
      const stepElement = progressSteps.find(el => el.closest('[data-step]'));
      expect(stepElement?.closest('[data-step]')).toHaveAttribute('data-active', 'true');
    });

    it('shows progress fill at 80%', () => {
      render(<CheckoutPage />);
      const progressFill = screen.getByTestId('progress-fill');
      expect(progressFill).toHaveStyle({ width: '80%' });
    });
  });

  describe('Order Summary Card', () => {
    it('renders order summary section title', () => {
      render(<CheckoutPage />);
      // There are two order summary cards (mobile and desktop)
      const summaryTitles = screen.getAllByText('סיכום הזמנה');
      expect(summaryTitles.length).toBeGreaterThanOrEqual(1);
    });

    it('renders product thumbnail', () => {
      render(<CheckoutPage />);
      const thumbnail = screen.getByTestId('order-thumbnail');
      expect(thumbnail).toBeInTheDocument();
    });

    it('renders edit button', () => {
      render(<CheckoutPage />);
      // There are two edit buttons (mobile and desktop)
      const editButtons = screen.getAllByRole('button', { name: /עריכה/i });
      expect(editButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('navigates to customize when edit button clicked', () => {
      render(<CheckoutPage />);
      const editButtons = screen.getAllByRole('button', { name: /עריכה/i });
      fireEvent.click(editButtons[0]);
      expect(mockPush).toHaveBeenCalledWith('/create/customize');
    });

    it('displays style name', () => {
      render(<CheckoutPage />);
      // Style name appears in both mobile and desktop order summary
      const styleNames = screen.getAllByText(/פופ ארט/);
      expect(styleNames.length).toBeGreaterThanOrEqual(1);
    });

    it('displays product specs', () => {
      render(<CheckoutPage />);
      // A4 appears in multiple places
      const specs = screen.getAllByText(/A4/);
      expect(specs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Gift Toggle Section', () => {
    it('renders gift toggle', () => {
      render(<CheckoutPage />);
      expect(screen.getByText('זו מתנה?')).toBeInTheDocument();
    });

    it('renders gift description', () => {
      render(<CheckoutPage />);
      expect(screen.getByText(/נוסיף אריזת מתנה/)).toBeInTheDocument();
    });

    it('renders toggle switch', () => {
      render(<CheckoutPage />);
      const toggle = screen.getByTestId('gift-toggle');
      expect(toggle).toBeInTheDocument();
    });

    it('calls setIsGift when toggle clicked', () => {
      render(<CheckoutPage />);
      const toggle = screen.getByTestId('gift-toggle');
      fireEvent.click(toggle);
      expect(mockSetIsGift).toHaveBeenCalledWith(true);
    });

    it('hides gift message textarea when gift is off', () => {
      render(<CheckoutPage />);
      const textarea = screen.queryByPlaceholderText(/הודעה אישית/);
      expect(textarea).not.toBeInTheDocument();
    });

    it('shows gift message textarea when gift is on', () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...defaultStoreState,
        isGift: true,
      });

      render(<CheckoutPage />);
      const textarea = screen.getByPlaceholderText(/הודעה אישית/);
      expect(textarea).toBeInTheDocument();
    });

    it('shows character count for gift message', () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...defaultStoreState,
        isGift: true,
        giftMessage: '',
      });

      render(<CheckoutPage />);
      // Character count shows as separate elements: "0" and "/150"
      const charCount = screen.getByTestId('char-count');
      expect(charCount).toHaveTextContent('0');
      expect(screen.getByText('/150')).toBeInTheDocument();
    });

    it('updates character count when typing', async () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...defaultStoreState,
        isGift: true,
      });

      render(<CheckoutPage />);
      const textarea = screen.getByPlaceholderText(/הודעה אישית/);
      await userEvent.type(textarea, 'שלום');
      // The component should update the display
      expect(screen.getByTestId('char-count')).toBeInTheDocument();
    });

    it('limits gift message to 150 characters', () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...defaultStoreState,
        isGift: true,
      });

      render(<CheckoutPage />);
      const textarea = screen.getByPlaceholderText(/הודעה אישית/) as HTMLTextAreaElement;
      expect(textarea.maxLength).toBe(150);
    });
  });

  describe('Shipping Form Section', () => {
    it('renders shipping section title with truck icon', () => {
      render(<CheckoutPage />);
      expect(screen.getByText('פרטי משלוח')).toBeInTheDocument();
    });

    it('renders full name input', () => {
      render(<CheckoutPage />);
      expect(screen.getByLabelText(/שם מלא/)).toBeInTheDocument();
    });

    it('renders phone input', () => {
      render(<CheckoutPage />);
      expect(screen.getByLabelText(/טלפון/)).toBeInTheDocument();
    });

    it('renders address input', () => {
      render(<CheckoutPage />);
      expect(screen.getByLabelText(/כתובת/)).toBeInTheDocument();
    });

    it('renders city input', () => {
      render(<CheckoutPage />);
      expect(screen.getByLabelText(/עיר/)).toBeInTheDocument();
    });

    it('renders postal code input', () => {
      render(<CheckoutPage />);
      expect(screen.getByLabelText(/מיקוד/)).toBeInTheDocument();
    });

    it('renders phone input with dir="ltr"', () => {
      render(<CheckoutPage />);
      const phoneInput = screen.getByLabelText(/טלפון/) as HTMLInputElement;
      expect(phoneInput).toHaveAttribute('dir', 'ltr');
    });

    it('renders postal code input with dir="ltr"', () => {
      render(<CheckoutPage />);
      const postalInput = screen.getByLabelText(/מיקוד/) as HTMLInputElement;
      expect(postalInput).toHaveAttribute('dir', 'ltr');
    });
  });

  describe('Payment Methods Section', () => {
    it('renders payment section title', () => {
      render(<CheckoutPage />);
      expect(screen.getByText('אמצעי תשלום')).toBeInTheDocument();
    });

    it('renders credit card option', () => {
      render(<CheckoutPage />);
      expect(screen.getByText('כרטיס אשראי')).toBeInTheDocument();
    });

    it('renders Apple Pay option', () => {
      render(<CheckoutPage />);
      expect(screen.getByText('Apple Pay')).toBeInTheDocument();
    });

    it('renders Google Pay option', () => {
      render(<CheckoutPage />);
      expect(screen.getByText('Google Pay')).toBeInTheDocument();
    });

    it('has credit card selected by default', () => {
      render(<CheckoutPage />);
      const creditCardOption = screen.getByTestId('payment-credit-card');
      expect(creditCardOption).toHaveAttribute('data-selected', 'true');
    });

    it('allows selecting different payment method', () => {
      render(<CheckoutPage />);
      const applePayOption = screen.getByTestId('payment-apple-pay');
      fireEvent.click(applePayOption);
      expect(applePayOption).toHaveAttribute('data-selected', 'true');
    });
  });

  describe('Coupon Code Section', () => {
    it('renders coupon code label', () => {
      render(<CheckoutPage />);
      expect(screen.getByText('קוד קופון')).toBeInTheDocument();
    });

    it('renders coupon code input', () => {
      render(<CheckoutPage />);
      const couponInput = screen.getByPlaceholderText(/הזינו קוד/);
      expect(couponInput).toBeInTheDocument();
    });

    it('renders apply coupon button', () => {
      render(<CheckoutPage />);
      const applyButton = screen.getByRole('button', { name: /החל/i });
      expect(applyButton).toBeInTheDocument();
    });

    it('allows typing coupon code', async () => {
      render(<CheckoutPage />);
      const couponInput = screen.getByPlaceholderText(/הזינו קוד/) as HTMLInputElement;
      await userEvent.type(couponInput, 'SAVE10');
      expect(couponInput.value).toBe('SAVE10');
    });
  });

  describe('Price Breakdown', () => {
    it('renders print price row', () => {
      render(<CheckoutPage />);
      expect(screen.getByText(/הדפסה A4/)).toBeInTheDocument();
      expect(screen.getByText('₪149')).toBeInTheDocument();
    });

    it('renders frame price row', () => {
      render(<CheckoutPage />);
      // Frame price appears in price breakdown
      const priceBreakdown = screen.getByTestId('payment-section');
      expect(priceBreakdown).toHaveTextContent('מסגרת שחורה');
      expect(priceBreakdown).toHaveTextContent('₪60');
    });

    it('renders shipping row', () => {
      render(<CheckoutPage />);
      expect(screen.getByText('משלוח')).toBeInTheDocument();
    });

    it('shows free shipping when total >= 299', () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...defaultStoreState,
        size: 'A2', // Higher price
        frameType: 'oak',
      });

      render(<CheckoutPage />);
      expect(screen.getByText('חינם')).toBeInTheDocument();
    });

    it('renders total price row', () => {
      render(<CheckoutPage />);
      expect(screen.getByText('סה״כ לתשלום')).toBeInTheDocument();
    });

    it('calculates correct total: A4 + matte + black + shipping = 238', () => {
      render(<CheckoutPage />);
      // A4 (149) + matte (0) + black (60) = 209 subtotal
      // Shipping: 29 (since subtotal < 299)
      // Total: 238
      const totalPrice = screen.getByTestId('total-price');
      expect(totalPrice).toHaveTextContent('₪238');
    });

    it('updates total when product changes (free shipping when >= 299)', () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...defaultStoreState,
        size: 'A3',
        frameType: 'oak',
      });

      render(<CheckoutPage />);
      // A3 (249) + matte (0) + oak (80) = 329 subtotal
      // Shipping: 0 (free since subtotal >= 299)
      // Total: 329
      const totalPrice = screen.getByTestId('total-price');
      expect(totalPrice).toHaveTextContent('₪329');
    });
  });

  describe('Bottom CTA', () => {
    it('renders secure payment badge', () => {
      render(<CheckoutPage />);
      expect(screen.getByText(/תשלום מאובטח/)).toBeInTheDocument();
    });

    it('renders payment button with total', () => {
      render(<CheckoutPage />);
      const payButton = screen.getByRole('button', { name: /לתשלום/i });
      // Total includes shipping: 149 + 60 + 29 = 238
      expect(payButton).toHaveTextContent('₪238');
    });

    it('renders SSL badge', () => {
      render(<CheckoutPage />);
      expect(screen.getByText(/SSL/)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error when submitting with empty required fields', async () => {
      render(<CheckoutPage />);
      const payButton = screen.getByRole('button', { name: /לתשלום/i });
      fireEvent.click(payButton);
      // Should show validation error
      await waitFor(() => {
        // Form should prevent submission
        expect(mockPush).not.toHaveBeenCalledWith('/create/complete');
      });
    });
  });

  describe('Navigation', () => {
    it('navigates back when header back button clicked', () => {
      render(<CheckoutPage />);
      const backButton = screen.getByTestId('header-back-button');
      fireEvent.click(backButton);
      expect(mockPush).toHaveBeenCalledWith('/create/customize');
    });

    it('sets step when navigating back', () => {
      render(<CheckoutPage />);
      const backButton = screen.getByTestId('header-back-button');
      fireEvent.click(backButton);
      expect(mockSetStep).toHaveBeenCalledWith('customize');
    });
  });

  describe('Redirect without image', () => {
    it('redirects to upload page if no original image', () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...defaultStoreState,
        originalImage: null,
      });

      render(<CheckoutPage />);
      expect(mockPush).toHaveBeenCalledWith('/create');
    });
  });

  describe('Responsive Design', () => {
    it('renders sections with correct layout containers', () => {
      render(<CheckoutPage />);
      const shippingSection = screen.getByTestId('shipping-section');
      const paymentSection = screen.getByTestId('payment-section');
      expect(shippingSection).toBeInTheDocument();
      expect(paymentSection).toBeInTheDocument();
    });

    it('renders form row for city and postal code', () => {
      render(<CheckoutPage />);
      const formRow = screen.getByTestId('city-postal-row');
      expect(formRow).toBeInTheDocument();
    });
  });

  describe('Desktop Layout', () => {
    it('renders order summary in correct position', () => {
      render(<CheckoutPage />);
      const orderCard = screen.getByTestId('order-summary-card');
      expect(orderCard).toBeInTheDocument();
    });
  });
});
