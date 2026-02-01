/**
 * OrderCard Component Tests - UI-07A
 *
 * Tests for the fulfillment order card component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderCard, type OrderCardProps } from './OrderCard';

const mockOrder: OrderCardProps['order'] = {
  id: 'order-1',
  orderNumber: 'FP-2026-001',
  status: 'pending',
  total: 237,
  itemCount: 2,
  customerEmail: 'customer@example.com',
  customerName: 'ישראל ישראלי',
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  updatedAt: new Date().toISOString(),
  thumbnailUrl: 'https://example.com/thumb.jpg',
  items: [
    { id: 'item-1', productName: 'טביעת כף רגל', size: 'A3', paperType: 'matte', frameType: null, quantity: 1, price: 149, printFileUrl: null, thumbnailUrl: null },
    { id: 'item-2', productName: 'טביעת כף יד', size: 'A4', paperType: 'glossy', frameType: 'black', quantity: 1, price: 88, printFileUrl: null, thumbnailUrl: null },
  ],
};

describe('OrderCard', () => {
  describe('Display', () => {
    it('should display order number', () => {
      render(<OrderCard order={mockOrder} />);

      expect(screen.getByText('FP-2026-001')).toBeInTheDocument();
    });

    it('should display customer name', () => {
      render(<OrderCard order={mockOrder} />);

      expect(screen.getByText('ישראל ישראלי')).toBeInTheDocument();
    });

    it('should display item count', () => {
      render(<OrderCard order={mockOrder} />);

      expect(screen.getByText('2 פריטים')).toBeInTheDocument();
    });

    it('should display time since creation', () => {
      render(<OrderCard order={mockOrder} />);

      // Should show relative time (e.g., "לפני 2 שעות")
      expect(screen.getByText(/לפני/)).toBeInTheDocument();
    });

    it('should display thumbnail image when available', () => {
      render(<OrderCard order={mockOrder} />);

      // Next.js Image component renders with alt text
      const img = screen.getByTestId('order-thumbnail');
      expect(img).toBeInTheDocument();
    });

    it('should show placeholder when no thumbnail', () => {
      const orderWithoutThumb = { ...mockOrder, thumbnailUrl: null };
      render(<OrderCard order={orderWithoutThumb} />);

      expect(screen.getByTestId('thumbnail-placeholder')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should render checkbox when selectable', () => {
      render(<OrderCard order={mockOrder} selectable onSelect={vi.fn()} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should not render checkbox when not selectable', () => {
      render(<OrderCard order={mockOrder} />);

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('should call onSelect when checkbox clicked', () => {
      const onSelect = vi.fn();
      render(<OrderCard order={mockOrder} selectable selected={false} onSelect={onSelect} />);

      fireEvent.click(screen.getByRole('checkbox'));

      expect(onSelect).toHaveBeenCalledWith('order-1', true);
    });

    it('should show selected state', () => {
      render(<OrderCard order={mockOrder} selectable selected onSelect={vi.fn()} />);

      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  describe('Actions', () => {
    it('should call onClick when card clicked', () => {
      const onClick = vi.fn();
      render(<OrderCard order={mockOrder} onClick={onClick} />);

      fireEvent.click(screen.getByTestId('order-card'));

      expect(onClick).toHaveBeenCalledWith(mockOrder);
    });

    it('should not trigger onClick when checkbox clicked', () => {
      const onClick = vi.fn();
      const onSelect = vi.fn();
      render(
        <OrderCard order={mockOrder} selectable onClick={onClick} onSelect={onSelect} />
      );

      fireEvent.click(screen.getByRole('checkbox'));

      expect(onSelect).toHaveBeenCalled();
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should render print button when onPrint provided', () => {
      render(<OrderCard order={mockOrder} onPrint={vi.fn()} />);

      expect(screen.getByTestId('print-button')).toBeInTheDocument();
    });

    it('should call onPrint when print button clicked', () => {
      const onPrint = vi.fn();
      render(<OrderCard order={mockOrder} onPrint={onPrint} />);

      fireEvent.click(screen.getByTestId('print-button'));

      expect(onPrint).toHaveBeenCalledWith('order-1');
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA attributes', () => {
      render(<OrderCard order={mockOrder} onClick={vi.fn()} />);

      const card = screen.getByTestId('order-card');
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should be keyboard navigable', () => {
      const onClick = vi.fn();
      render(<OrderCard order={mockOrder} onClick={onClick} />);

      const card = screen.getByTestId('order-card');
      fireEvent.keyDown(card, { key: 'Enter' });

      expect(onClick).toHaveBeenCalled();
    });

    it('should have proper label for checkbox', () => {
      render(<OrderCard order={mockOrder} selectable onSelect={vi.fn()} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', expect.stringContaining('FP-2026-001'));
    });
  });

  describe('Styling', () => {
    it('should have RTL text direction', () => {
      render(<OrderCard order={mockOrder} />);

      const card = screen.getByTestId('order-card');
      expect(card).toHaveAttribute('dir', 'rtl');
    });

    it('should highlight when selected', () => {
      render(<OrderCard order={mockOrder} selectable selected onSelect={vi.fn()} />);

      const card = screen.getByTestId('order-card');
      expect(card.className).toContain('ring');
    });
  });
});
