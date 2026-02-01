/**
 * FulfillmentBoard Component Tests - UI-07A
 *
 * Tests for the main fulfillment kanban board component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FulfillmentBoard, type FulfillmentBoardProps } from './FulfillmentBoard';
import { type OrderCardOrder } from './OrderCard';

const mockOrders: OrderCardOrder[] = [
  {
    id: 'order-1',
    orderNumber: 'FP-2026-001',
    status: 'pending',
    total: 237,
    itemCount: 2,
    customerEmail: 'customer@example.com',
    customerName: 'ישראל ישראלי',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    thumbnailUrl: null,
    items: [],
  },
  {
    id: 'order-2',
    orderNumber: 'FP-2026-002',
    status: 'printing',
    total: 159,
    itemCount: 1,
    customerEmail: 'jane@example.com',
    customerName: 'יעל כהן',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    thumbnailUrl: null,
    items: [],
  },
];

const mockGrouped = {
  pending: [mockOrders[0]],
  printing: [mockOrders[1]],
  ready_to_ship: [],
  shipped: [],
  delivered: [],
  cancelled: [],
};

const mockStats = {
  pendingCount: 1,
  printingCount: 1,
  readyCount: 0,
  shippedTodayCount: 0,
};

const defaultProps: FulfillmentBoardProps = {
  orders: mockOrders,
  grouped: mockGrouped,
  stats: mockStats,
  isLoading: false,
  isError: false,
  onRefresh: vi.fn(),
  onOrderClick: vi.fn(),
  onStatusUpdate: vi.fn().mockResolvedValue(undefined),
  onBulkDownload: vi.fn(),
  onPrint: vi.fn(),
};

describe('FulfillmentBoard', () => {
  describe('Display', () => {
    it('should render stats bar with counts', () => {
      render(<FulfillmentBoard {...defaultProps} />);

      const statsBar = screen.getByTestId('stats-bar');
      expect(statsBar).toBeInTheDocument();
      // Check stats bar contains the stat labels
      expect(statsBar).toHaveTextContent('ממתינות');
      expect(statsBar).toHaveTextContent('בהדפסה');
    });

    it('should render four fulfillment columns', () => {
      render(<FulfillmentBoard {...defaultProps} />);

      const columns = screen.getAllByTestId('fulfillment-column');
      expect(columns).toHaveLength(4);
      // Check column headers exist (they appear in both stats and columns)
      expect(screen.getAllByText('ממתינות').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('בהדפסה').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('מוכנות למשלוח')).toBeInTheDocument();
      expect(screen.getByText('נשלחו')).toBeInTheDocument();
    });

    it('should render orders in correct columns', () => {
      render(<FulfillmentBoard {...defaultProps} />);

      expect(screen.getByText('FP-2026-001')).toBeInTheDocument();
      expect(screen.getByText('FP-2026-002')).toBeInTheDocument();
    });

    it('should have RTL direction', () => {
      render(<FulfillmentBoard {...defaultProps} />);

      const board = screen.getByTestId('fulfillment-board');
      expect(board).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Loading State', () => {
    it('should show loading skeletons when loading', () => {
      render(<FulfillmentBoard {...defaultProps} isLoading />);

      expect(screen.getAllByTestId('order-skeleton').length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should show error message when error occurs', () => {
      render(<FulfillmentBoard {...defaultProps} isError />);

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText(/שגיאה/)).toBeInTheDocument();
    });

    it('should show retry button on error', () => {
      render(<FulfillmentBoard {...defaultProps} isError />);

      expect(screen.getByText('נסה שוב')).toBeInTheDocument();
    });

    it('should call onRefresh when retry clicked', () => {
      const onRefresh = vi.fn();
      render(<FulfillmentBoard {...defaultProps} isError onRefresh={onRefresh} />);

      fireEvent.click(screen.getByText('נסה שוב'));

      expect(onRefresh).toHaveBeenCalled();
    });
  });

  describe('Selection', () => {
    it('should show bulk toolbar when items selected', () => {
      render(<FulfillmentBoard {...defaultProps} />);

      // Select an order
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(screen.getByTestId('bulk-toolbar')).toBeInTheDocument();
    });

    it('should update selection count in toolbar', () => {
      render(<FulfillmentBoard {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(screen.getByText('נבחרה הזמנה אחת')).toBeInTheDocument();
    });

    it('should clear selection when clear button clicked', () => {
      render(<FulfillmentBoard {...defaultProps} />);

      // Select an order
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      // Clear selection
      fireEvent.click(screen.getByTestId('clear-selection'));

      expect(screen.queryByTestId('bulk-toolbar')).not.toBeInTheDocument();
    });
  });

  describe('Bulk Actions', () => {
    it('should open status modal when update status clicked', () => {
      render(<FulfillmentBoard {...defaultProps} />);

      // Select an order
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      // Click update status
      fireEvent.click(screen.getByText('עדכן סטטוס'));

      expect(screen.getByTestId('status-modal')).toBeInTheDocument();
    });

    it('should call onStatusUpdate with selected IDs', async () => {
      const onStatusUpdate = vi.fn().mockResolvedValue(undefined);
      render(<FulfillmentBoard {...defaultProps} onStatusUpdate={onStatusUpdate} />);

      // Select an order
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      // Open modal and select status
      fireEvent.click(screen.getByText('עדכן סטטוס'));

      // Get the modal and click the status button inside it
      const modal = screen.getByTestId('status-modal');
      const statusButtons = modal.querySelectorAll('button');
      // First button is "בהדפסה" (printing) in the modal
      fireEvent.click(statusButtons[1]); // Second button (first is "ממתינות")

      await waitFor(() => {
        expect(onStatusUpdate).toHaveBeenCalledWith(['order-1'], 'printing');
      });
    });

    it('should call onBulkDownload when download clicked', () => {
      const onBulkDownload = vi.fn();
      render(<FulfillmentBoard {...defaultProps} onBulkDownload={onBulkDownload} />);

      // Select an order
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      // Click download
      fireEvent.click(screen.getByText('הורד קבצי הדפסה'));

      expect(onBulkDownload).toHaveBeenCalledWith(['order-1']);
    });
  });

  describe('Order Actions', () => {
    it('should call onOrderClick when order card clicked', () => {
      const onOrderClick = vi.fn();
      render(<FulfillmentBoard {...defaultProps} onOrderClick={onOrderClick} />);

      fireEvent.click(screen.getByText('FP-2026-001'));

      expect(onOrderClick).toHaveBeenCalledWith(mockOrders[0]);
    });

    it('should call onPrint when print button clicked', () => {
      const onPrint = vi.fn();
      render(<FulfillmentBoard {...defaultProps} onPrint={onPrint} />);

      const printButtons = screen.getAllByTestId('print-button');
      fireEvent.click(printButtons[0]);

      expect(onPrint).toHaveBeenCalledWith('order-1');
    });
  });
});
