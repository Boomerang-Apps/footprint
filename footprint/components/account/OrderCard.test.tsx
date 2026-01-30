import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OrderCard } from './OrderCard';
import type { Order } from '@/types';

// Mock the PriceDisplay component
vi.mock('@/components/ui/PriceDisplay', () => ({
  PriceDisplay: ({ amount }: { amount: number }) => <span data-testid="price-display">₪{amount}</span>,
}));

// Mock the OrderStatusBadge component
vi.mock('@/components/ui/OrderStatusBadge', () => ({
  OrderStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
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
};

describe('OrderCard', () => {
  describe('Order Information Display', () => {
    it('renders order number and formatted date', () => {
      render(<OrderCard order={mockOrder} />);

      expect(screen.getByText('FP-2024-001')).toBeInTheDocument();
      expect(screen.getByTestId('order-date')).toBeInTheDocument();
    });

    it('displays product thumbnail with proper alt text', () => {
      render(<OrderCard order={mockOrder} />);

      const thumbnail = screen.getByTestId('order-thumbnail');
      // Next.js Image component transforms src, so check it contains the original URL
      expect(thumbnail.getAttribute('src')).toContain('transformed.jpg');
      expect(thumbnail).toHaveAttribute('alt', 'Avatar Cartoon artwork');
    });

    it('shows Hebrew style name', () => {
      render(<OrderCard order={mockOrder} />);

      expect(screen.getByText('אווטר קריקטורה')).toBeInTheDocument();
    });

    it('displays product specifications in Hebrew', () => {
      render(<OrderCard order={mockOrder} />);

      expect(screen.getByText('A4 • מסגרת שחורה')).toBeInTheDocument();
    });

    it('shows order total price', () => {
      render(<OrderCard order={mockOrder} />);

      const priceDisplay = screen.getByTestId('price-display');
      expect(priceDisplay).toHaveTextContent('₪237');
    });
  });

  describe('Order Status and Actions', () => {
    it('renders status badge', () => {
      render(<OrderCard order={mockOrder} />);

      const statusBadge = screen.getByTestId('status-badge');
      expect(statusBadge).toHaveTextContent('shipped');
    });

    it('shows track shipment action for shipped orders', () => {
      render(<OrderCard order={mockOrder} />);

      expect(screen.getByText('מעקב משלוח')).toBeInTheDocument();
    });

    it('shows details action for processing orders', () => {
      const processingOrder = { ...mockOrder, status: 'processing' as const };
      render(<OrderCard order={processingOrder} />);

      expect(screen.getByText('פרטים')).toBeInTheDocument();
    });

    it('shows reorder action for delivered orders', () => {
      const deliveredOrder = { ...mockOrder, status: 'delivered' as const };
      render(<OrderCard order={deliveredOrder} />);

      expect(screen.getByText('הזמנה חוזרת')).toBeInTheDocument();
    });
  });

  describe('Gift Orders', () => {
    it('shows gift indicator for gift orders', () => {
      const giftOrder = { ...mockOrder, isGift: true, giftMessage: 'Happy Birthday!' };
      render(<OrderCard order={giftOrder} />);

      expect(screen.getByTestId('gift-indicator')).toBeInTheDocument();
      expect(screen.getByText('מתנה')).toBeInTheDocument();
    });
  });

  describe('Multiple Items', () => {
    it('displays first item and shows additional items count', () => {
      const multiItemOrder = {
        ...mockOrder,
        items: [
          ...mockOrder.items,
          {
            id: 'item_002',
            orderId: 'demo_order_001',
            originalImageUrl: 'https://example.com/image2.jpg',
            transformedImageUrl: 'https://example.com/transformed2.jpg',
            style: 'watercolor',
            size: 'A3',
            paperType: 'canvas',
            frameType: 'white',
            price: 309,
            createdAt: new Date('2024-12-24T10:00:00'),
          },
        ],
      };

      render(<OrderCard order={multiItemOrder} />);

      expect(screen.getByText('+1 עוד')).toBeInTheDocument();
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

  describe('Responsive Design', () => {
    it('applies responsive thumbnail sizes', () => {
      render(<OrderCard order={mockOrder} />);

      const thumbnail = screen.getByTestId('order-thumbnail');
      expect(thumbnail).toHaveClass('w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] lg:w-[90px] lg:h-[90px]');
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