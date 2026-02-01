'use client';

/**
 * FulfillmentColumn Component - UI-07A
 *
 * Displays a column of orders for a specific fulfillment status.
 * Supports selection, collapsing, and loading states.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Package } from 'lucide-react';
import { type FulfillmentStatus } from '@/lib/fulfillment/status-transitions';
import { OrderCard, type OrderCardOrder } from './OrderCard';

export interface FulfillmentColumnProps {
  title: string;
  status: FulfillmentStatus;
  orders: OrderCardOrder[];
  isLoading?: boolean;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (orderId: string, selected: boolean) => void;
  onSelectAll?: (status: FulfillmentStatus, orderIds: string[]) => void;
  onOrderClick?: (order: OrderCardOrder) => void;
  onPrint?: (orderId: string) => void;
  collapsible?: boolean;
}

const STATUS_COLORS: Record<FulfillmentStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  printing: 'bg-blue-100 text-blue-700 border-blue-200',
  ready_to_ship: 'bg-violet-100 text-violet-700 border-violet-200',
  shipped: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  delivered: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

function OrderSkeleton() {
  return (
    <div
      data-testid="order-skeleton"
      className="bg-white border border-zinc-200 rounded-xl p-3 animate-pulse"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-zinc-200" />
        <div className="flex-1">
          <div className="h-4 bg-zinc-200 rounded w-24 mb-2" />
          <div className="h-3 bg-zinc-200 rounded w-32 mb-2" />
          <div className="flex gap-2">
            <div className="h-3 bg-zinc-200 rounded w-16" />
            <div className="h-3 bg-zinc-200 rounded w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FulfillmentColumn({
  title,
  status,
  orders,
  isLoading = false,
  selectable = false,
  selectedIds = new Set(),
  onSelect,
  onSelectAll,
  onOrderClick,
  onPrint,
  collapsible = false,
}: FulfillmentColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSelectAll = () => {
    if (onSelectAll) {
      const orderIds = orders.map((o) => o.id);
      onSelectAll(status, orderIds);
    }
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const colorClass = STATUS_COLORS[status];

  return (
    <div
      data-testid="fulfillment-column"
      dir="rtl"
      className="flex flex-col bg-zinc-50 rounded-xl border border-zinc-200 min-w-[300px] max-w-[360px] lg:max-w-none"
    >
      {/* Header */}
      <div
        data-testid="column-header"
        className={`flex items-center justify-between p-3 border-b border-zinc-200 ${colorClass.split(' ')[0]}`}
      >
        <div className="flex items-center gap-2">
          {collapsible && (
            <button
              data-testid="collapse-toggle"
              onClick={handleToggleCollapse}
              className="p-1 rounded hover:bg-black/5"
            >
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          )}
          <span className="font-semibold text-sm">{title}</span>
          <span
            data-testid="order-count"
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
          >
            {orders.length}
          </span>
        </div>

        {selectable && onSelectAll && orders.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="text-xs text-zinc-600 hover:text-violet-600"
          >
            בחר הכל
          </button>
        )}
      </div>

      {/* Orders list */}
      <div
        data-testid="orders-container"
        className={`flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)] ${
          isCollapsed ? 'hidden' : ''
        }`}
      >
        {isLoading ? (
          // Loading skeletons
          <>
            <OrderSkeleton />
            <OrderSkeleton />
            <OrderSkeleton />
          </>
        ) : orders.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
            <Package className="w-8 h-8 mb-2" />
            <span className="text-sm">אין הזמנות</span>
          </div>
        ) : (
          // Order cards
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              selectable={selectable}
              selected={selectedIds.has(order.id)}
              onSelect={onSelect}
              onClick={onOrderClick}
              onPrint={onPrint}
            />
          ))
        )}
      </div>
    </div>
  );
}
