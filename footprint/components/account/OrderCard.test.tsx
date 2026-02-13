import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OrderCard } from './OrderCard';
import type { Order } from '@/types';

// Mock the PriceDisplay component
vi.mock('@/components/ui/PriceDisplay', () => ({
  PriceDisplay: ({ amount, color }: { amount: number; color?: string }) => (
    <span data-testid="price-display" data-color={color}>₪{amount}</span>
  ),
}));

// Mock the OrderStatusBadge component
vi.mock('@/components/ui/OrderStatusBadge', () => ({
  OrderStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

// Mock styles-ui
vi.mock('@/lib/ai/styles-ui', () => ({
  getStyleById: (id: string) => {
    const styles: Record<string, { nameHe: string; gradient: string }> = {
      avatar_cartoon: { nameHe: 'אווטאר קרטון', gradient: 'from-violet-500 to-pink-500' },
      watercolor: { nameHe: 'צבעי מים', gradient: 'from-blue-500 to-cyan-400' },
    };
    return styles[id] || undefined;
  },
}));

const mockOrder: Order = {
  id: 'demo_order_001',
  userId: 'demo_user_001',
  status: 'shipped',
  items: [
    {
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
    },
  ],
  subtotal: 208,
  shipping: 29,
  discount: 0,
  total: 237,
  isGift: false,
  giftMessage: null,
  giftWrap: false,
  wrappingStyle: null,
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
};

describe('OrderCard', () => {
  describe('Order Information Display', () => {
    it('renders order number and formatted date', () => {
      render(<OrderCard order={mockOrder} />);

      expect(screen.getByText('FP-2024-001')).toBeInTheDocument();
      expect(screen.getByTestId('order-date')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AC-004: WHEN user views OrderCard
  //         THEN gradient thumbnail is shown (not an image element)
  // ═══════════════════════════════════════════════════════════════
  describe('AC-004: Gradient Thumbnail', () => {
    it('displays gradient thumbnail instead of image', () => {
      render(<OrderCard order={mockOrder} />);

      const gradient = screen.getByTestId('order-gradient');
      expect(gradient).toBeInTheDocument();
      expect(gradient).toHaveClass('bg-gradient-to-br');
      // Should use the style-specific gradient from styles-ui
      expect(gradient).toHaveClass('from-violet-500');
      expect(gradient).toHaveClass('to-pink-500');
    });

    it('does not render image thumbnail', () => {
      render(<OrderCard order={mockOrder} />);

      expect(screen.queryByTestId('order-thumbnail')).not.toBeInTheDocument();
    });

    it('shows fallback gradient when style not found', () => {
      const unknownStyleOrder: Order = {
        ...mockOrder,
        items: [{
          ...mockOrder.items[0],
          style: 'unknown_style' as never,
        }],
      };
      render(<OrderCard order={unknownStyleOrder} />);

      const gradient = screen.getByTestId('order-gradient');
      expect(gradient).toHaveClass('bg-gradient-to-br');
      expect(gradient).toHaveClass('from-purple-100');
      expect(gradient).toHaveClass('to-pink-100');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AC-005: WHEN user views OrderCard
  //         THEN text shows "Style · Size" format in Hebrew
  // ═══════════════════════════════════════════════════════════════
  describe('AC-005: Style · Size Format', () => {
    it('shows style name and size from styles-ui', () => {
      render(<OrderCard order={mockOrder} />);

      // Uses canonical style name from styles-ui.ts (not inline translations)
      expect(screen.getByText('אווטאר קרטון · A4')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AC-006: WHEN user views OrderCard
  //         THEN price is green via PriceDisplay color="success"
  // ═══════════════════════════════════════════════════════════════
  describe('AC-006: Green Price', () => {
    it('shows order total price with success color', () => {
      render(<OrderCard order={mockOrder} />);

      const priceDisplay = screen.getByTestId('price-display');
      expect(priceDisplay).toHaveTextContent('₪237');
      expect(priceDisplay).toHaveAttribute('data-color', 'success');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AC-007: WHEN user views OrderCard
  //         THEN no CardFooter exists (no action button, no gift, no multi-item)
  // ═══════════════════════════════════════════════════════════════
  describe('AC-007: Simplified Layout', () => {
    it('does not render a footer', () => {
      render(<OrderCard order={mockOrder} />);

      expect(screen.queryByTestId('order-action-button')).not.toBeInTheDocument();
    });

    it('does not render gift indicator', () => {
      const giftOrder = { ...mockOrder, isGift: true, giftMessage: 'Happy Birthday!' };
      render(<OrderCard order={giftOrder} />);

      expect(screen.queryByTestId('gift-indicator')).not.toBeInTheDocument();
    });

    it('renders status badge in card body', () => {
      render(<OrderCard order={mockOrder} />);

      const statusBadge = screen.getByTestId('status-badge');
      expect(statusBadge).toHaveTextContent('shipped');
    });

    it('shows correct status for different order states', () => {
      const processingOrder = { ...mockOrder, status: 'processing' as const };
      render(<OrderCard order={processingOrder} />);

      expect(screen.getByTestId('status-badge')).toHaveTextContent('processing');
    });
  });

  describe('Click Handler', () => {
    it('calls onClick when card is clicked', () => {
      const handleClick = vi.fn();
      render(<OrderCard order={mockOrder} onClick={handleClick} />);

      const card = screen.getByTestId('order-card');
      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledWith(mockOrder);
    });
  });

  describe('RTL Support', () => {
    it('applies RTL direction for Hebrew text', () => {
      render(<OrderCard order={mockOrder} />);

      const card = screen.getByTestId('order-card');
      expect(card).toHaveAttribute('dir', 'rtl');
    });
  });
});
