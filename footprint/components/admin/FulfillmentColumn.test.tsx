/**
 * FulfillmentColumn Component Tests - UI-07A
 *
 * Tests for the fulfillment status column component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FulfillmentColumn, type FulfillmentColumnProps } from './FulfillmentColumn';
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
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    thumbnailUrl: 'https://example.com/thumb1.jpg',
    items: [{ id: 'item-1', productName: 'טביעת כף רגל', size: 'A3', paperType: 'matte', frameType: null, quantity: 1, price: 149, printFileUrl: null, thumbnailUrl: null }],
  },
  {
    id: 'order-2',
    orderNumber: 'FP-2026-002',
    status: 'pending',
    total: 159,
    itemCount: 1,
    customerEmail: 'jane@example.com',
    customerName: 'יעל כהן',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    thumbnailUrl: null,
    items: [{ id: 'item-2', productName: 'טביעת כף יד', size: 'A4', paperType: 'glossy', frameType: 'black', quantity: 1, price: 88, printFileUrl: null, thumbnailUrl: null }],
  },
];

describe('FulfillmentColumn', () => {
  describe('Display', () => {
    it('should render column title', () => {
      render(
        <FulfillmentColumn
          title="ממתינות"
          status="pending"
          orders={mockOrders}
        />
      );

      expect(screen.getByText('ממתינות')).toBeInTheDocument();
    });

    it('should render order count badge', () => {
      render(
        <FulfillmentColumn
          title="ממתינות"
          status="pending"
          orders={mockOrders}
        />
      );

      expect(screen.getByTestId('order-count')).toHaveTextContent('2');
    });

    it('should render order cards', () => {
      render(
        <FulfillmentColumn
          title="ממתינות"
          status="pending"
          orders={mockOrders}
        />
      );

      expect(screen.getByText('FP-2026-001')).toBeInTheDocument();
      expect(screen.getByText('FP-2026-002')).toBeInTheDocument();
    });

    it('should show empty state when no orders', () => {
      render(
        <FulfillmentColumn
          title="ממתינות"
          status="pending"
          orders={[]}
        />
      );

      expect(screen.getByText('אין הזמנות')).toBeInTheDocument();
    });

    it('should show loading skeletons when loading', () => {
      render(
        <FulfillmentColumn
          title="ממתינות"
          status="pending"
          orders={[]}
          isLoading
        />
      );

      expect(screen.getAllByTestId('order-skeleton')).toHaveLength(3);
    });
  });

  describe('Selection', () => {
    it('should render select all checkbox', () => {
      render(
        <FulfillmentColumn
          title="ממתינות"
          status="pending"
          orders={mockOrders}
          selectable
          onSelectAll={vi.fn()}
        />
      );

      expect(screen.getByText('בחר הכל')).toBeInTheDocument();
    });

    it('should call onSelectAll when select all clicked', () => {
      const onSelectAll = vi.fn();
      render(
        <FulfillmentColumn
          title="ממתינות"
          status="pending"
          orders={mockOrders}
          selectable
          onSelectAll={onSelectAll}
        />
      );

      fireEvent.click(screen.getByText('בחר הכל'));

      expect(onSelectAll).toHaveBeenCalledWith('pending', mockOrders.map((o) => o.id));
    });

    it('should pass selection state to order cards', () => {
      const selectedIds = new Set(['order-1']);
      render(
        <FulfillmentColumn
          title="ממתינות"
          status="pending"
          orders={mockOrders}
          selectable
          selectedIds={selectedIds}
          onSelect={vi.fn()}
          onSelectAll={vi.fn()}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      // First checkbox is order-1, second is order-2
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
    });

    it('should call onSelect when order checkbox clicked', () => {
      const onSelect = vi.fn();
      render(
        <FulfillmentColumn
          title="ממתינות"
          status="pending"
          orders={mockOrders}
          selectable
          selectedIds={new Set()}
          onSelect={onSelect}
          onSelectAll={vi.fn()}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      // First checkbox belongs to first order card
      fireEvent.click(checkboxes[0]);

      expect(onSelect).toHaveBeenCalledWith('order-1', true);
    });
  });

  describe('Actions', () => {
    it('should call onOrderClick when order card clicked', () => {
      const onOrderClick = vi.fn();
      render(
        <FulfillmentColumn
          title="ממתינות"
          status="pending"
          orders={mockOrders}
          onOrderClick={onOrderClick}
        />
      );

      fireEvent.click(screen.getByText('FP-2026-001'));

      expect(onOrderClick).toHaveBeenCalledWith(mockOrders[0]);
    });

    it('should call onPrint when print button clicked', () => {
      const onPrint = vi.fn();
      render(
        <FulfillmentColumn
          title="ממתינות"
          status="pending"
          orders={mockOrders}
          onPrint={onPrint}
        />
      );

      const printButtons = screen.getAllByTestId('print-button');
      fireEvent.click(printButtons[0]);

      expect(onPrint).toHaveBeenCalledWith('order-1');
    });
  });

  describe('Styling', () => {
    it('should have RTL direction', () => {
      render(
        <FulfillmentColumn
          title="ממתינות"
          status="pending"
          orders={mockOrders}
        />
      );

      const column = screen.getByTestId('fulfillment-column');
      expect(column).toHaveAttribute('dir', 'rtl');
    });

    it('should apply correct status color', () => {
      render(
        <FulfillmentColumn
          title="ממתינות"
          status="pending"
          orders={mockOrders}
        />
      );

      const header = screen.getByTestId('column-header');
      expect(header.className).toContain('amber');
    });
  });

  describe('Responsive', () => {
    it('should render collapsible on mobile', () => {
      render(
        <FulfillmentColumn
          title="ממתינות"
          status="pending"
          orders={mockOrders}
          collapsible
        />
      );

      expect(screen.getByTestId('collapse-toggle')).toBeInTheDocument();
    });

    it('should toggle collapsed state', () => {
      render(
        <FulfillmentColumn
          title="ממתינות"
          status="pending"
          orders={mockOrders}
          collapsible
        />
      );

      const toggle = screen.getByTestId('collapse-toggle');
      fireEvent.click(toggle);

      // Cards container should have hidden class when collapsed
      const ordersContainer = screen.getByTestId('orders-container');
      expect(ordersContainer.className).toContain('hidden');
    });
  });
});
