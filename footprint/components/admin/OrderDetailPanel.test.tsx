/**
 * OrderDetailPanel Component Tests - UI-07A
 *
 * Tests for the slide-out order detail panel component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrderDetailPanel, type OrderDetailPanelProps } from './OrderDetailPanel';
import { type OrderCardOrder } from './OrderCard';

const mockOrder: OrderCardOrder = {
  id: 'order-1',
  orderNumber: 'FP-2026-001',
  status: 'pending',
  total: 237,
  itemCount: 2,
  customerEmail: 'customer@example.com',
  customerName: 'ישראל ישראלי',
  createdAt: '2026-01-15T10:30:00Z',
  updatedAt: '2026-01-15T10:30:00Z',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  items: [
    {
      id: 'item-1',
      productName: 'טביעת כף רגל תינוק',
      size: 'A3',
      paperType: 'matte',
      frameType: null,
      quantity: 1,
      price: 149,
      printFileUrl: 'https://example.com/print1.pdf',
      thumbnailUrl: 'https://example.com/item1.jpg',
    },
    {
      id: 'item-2',
      productName: 'טביעת כף יד תינוק',
      size: 'A4',
      paperType: 'glossy',
      frameType: 'black',
      quantity: 1,
      price: 88,
      printFileUrl: 'https://example.com/print2.pdf',
      thumbnailUrl: null,
    },
  ],
};

const defaultProps: OrderDetailPanelProps = {
  order: mockOrder,
  isOpen: true,
  onClose: vi.fn(),
  onStatusUpdate: vi.fn().mockResolvedValue(undefined),
  onPrint: vi.fn(),
  onDownloadPrintFiles: vi.fn(),
};

describe('OrderDetailPanel', () => {
  describe('Display', () => {
    it('should not render when closed', () => {
      render(<OrderDetailPanel {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('order-detail-panel')).not.toBeInTheDocument();
    });

    it('should render when open', () => {
      render(<OrderDetailPanel {...defaultProps} />);

      expect(screen.getByTestId('order-detail-panel')).toBeInTheDocument();
    });

    it('should display order number in header', () => {
      render(<OrderDetailPanel {...defaultProps} />);

      expect(screen.getByText('FP-2026-001')).toBeInTheDocument();
    });

    it('should display customer name', () => {
      render(<OrderDetailPanel {...defaultProps} />);

      expect(screen.getByText('ישראל ישראלי')).toBeInTheDocument();
    });

    it('should display customer email', () => {
      render(<OrderDetailPanel {...defaultProps} />);

      expect(screen.getByText('customer@example.com')).toBeInTheDocument();
    });

    it('should display order total', () => {
      render(<OrderDetailPanel {...defaultProps} />);

      expect(screen.getByText(/237/)).toBeInTheDocument();
    });

    it('should display current status', () => {
      render(<OrderDetailPanel {...defaultProps} />);

      expect(screen.getByTestId('current-status')).toBeInTheDocument();
      expect(screen.getByText('ממתין')).toBeInTheDocument();
    });

    it('should have RTL direction', () => {
      render(<OrderDetailPanel {...defaultProps} />);

      const panel = screen.getByTestId('order-detail-panel');
      expect(panel).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Order Items', () => {
    it('should display all order items', () => {
      render(<OrderDetailPanel {...defaultProps} />);

      expect(screen.getByText('טביעת כף רגל תינוק')).toBeInTheDocument();
      expect(screen.getByText('טביעת כף יד תינוק')).toBeInTheDocument();
    });

    it('should display item prices', () => {
      render(<OrderDetailPanel {...defaultProps} />);

      expect(screen.getByText(/149/)).toBeInTheDocument();
      expect(screen.getByText(/88/)).toBeInTheDocument();
    });

    it('should show item thumbnails when available', () => {
      render(<OrderDetailPanel {...defaultProps} />);

      const thumbnails = screen.getAllByTestId('item-thumbnail');
      expect(thumbnails.length).toBeGreaterThanOrEqual(1);
    });

    it('should show placeholder for items without thumbnail', () => {
      render(<OrderDetailPanel {...defaultProps} />);

      expect(screen.getAllByTestId('item-placeholder').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Close Behavior', () => {
    it('should render close button', () => {
      render(<OrderDetailPanel {...defaultProps} />);

      expect(screen.getByTestId('close-button')).toBeInTheDocument();
    });

    it('should call onClose when close button clicked', () => {
      const onClose = vi.fn();
      render(<OrderDetailPanel {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByTestId('close-button'));

      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking overlay', () => {
      const onClose = vi.fn();
      render(<OrderDetailPanel {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByTestId('panel-overlay'));

      expect(onClose).toHaveBeenCalled();
    });

    it('should not close when clicking panel content', () => {
      const onClose = vi.fn();
      render(<OrderDetailPanel {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByTestId('panel-content'));

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Status Update', () => {
    it('should show status options', () => {
      render(<OrderDetailPanel {...defaultProps} />);

      expect(screen.getByTestId('status-actions')).toBeInTheDocument();
    });

    it('should call onStatusUpdate when status button clicked', async () => {
      const onStatusUpdate = vi.fn().mockResolvedValue(undefined);
      render(<OrderDetailPanel {...defaultProps} onStatusUpdate={onStatusUpdate} />);

      // Click the "בהדפסה" (printing) button
      fireEvent.click(screen.getByTestId('status-printing'));

      await waitFor(() => {
        expect(onStatusUpdate).toHaveBeenCalledWith('order-1', 'printing');
      });
    });

    it('should disable status buttons during update', async () => {
      const onStatusUpdate = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      render(<OrderDetailPanel {...defaultProps} onStatusUpdate={onStatusUpdate} />);

      fireEvent.click(screen.getByTestId('status-printing'));

      expect(screen.getByTestId('status-printing')).toBeDisabled();
    });
  });

  describe('Print Actions', () => {
    it('should render print button', () => {
      render(<OrderDetailPanel {...defaultProps} />);

      expect(screen.getByTestId('print-all-button')).toBeInTheDocument();
    });

    it('should call onPrint when print button clicked', () => {
      const onPrint = vi.fn();
      render(<OrderDetailPanel {...defaultProps} onPrint={onPrint} />);

      fireEvent.click(screen.getByTestId('print-all-button'));

      expect(onPrint).toHaveBeenCalledWith('order-1');
    });

    it('should render download button', () => {
      render(<OrderDetailPanel {...defaultProps} />);

      expect(screen.getByTestId('download-files-button')).toBeInTheDocument();
    });

    it('should call onDownloadPrintFiles when download clicked', () => {
      const onDownloadPrintFiles = vi.fn();
      render(<OrderDetailPanel {...defaultProps} onDownloadPrintFiles={onDownloadPrintFiles} />);

      fireEvent.click(screen.getByTestId('download-files-button'));

      expect(onDownloadPrintFiles).toHaveBeenCalledWith('order-1');
    });
  });

  describe('Timeline', () => {
    it('should display order creation time', () => {
      render(<OrderDetailPanel {...defaultProps} />);

      // Should show formatted date
      expect(screen.getByTestId('timeline')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should handle order with no items gracefully', () => {
      const orderNoItems = { ...mockOrder, items: [] };
      render(<OrderDetailPanel {...defaultProps} order={orderNoItems} />);

      expect(screen.getByText(/אין פריטים/)).toBeInTheDocument();
    });
  });
});
