/**
 * Confirmation Page Tests
 *
 * TDD Test Suite for UI-05: Confirmation Page UI
 * Tests the confirmation page matching 05-confirmation.html mockup
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CompletePage from './page';
import { useOrderStore } from '@/stores/orderStore';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
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

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
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
    (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockOrderData);
  });

  describe('Header', () => {
    it('renders header with logo', () => {
      render(<CompletePage />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('renders Footprint logo text', () => {
      render(<CompletePage />);
      expect(screen.getByText('Footprint')).toBeInTheDocument();
    });

    it('renders logo icon', () => {
      render(<CompletePage />);
      const logoIcon = screen.getByTestId('logo-icon');
      expect(logoIcon).toBeInTheDocument();
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

    it('displays customer email in subtitle', () => {
      render(<CompletePage />);
      expect(screen.getByText(/shelly@example.com/)).toBeInTheDocument();
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
      ['oil_painting', 'ציור שמן'],
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
});
