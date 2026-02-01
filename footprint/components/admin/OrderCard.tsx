'use client';

/**
 * OrderCard Component - UI-07A
 *
 * Displays a single order card for the fulfillment board.
 * Supports selection, click actions, and print functionality.
 */

import Image from 'next/image';
import { Printer, Package } from 'lucide-react';
import { type FulfillmentStatus } from '@/lib/fulfillment/status-transitions';

export interface OrderCardOrder {
  id: string;
  orderNumber: string;
  status: FulfillmentStatus;
  total: number;
  itemCount: number;
  customerEmail: string | null;
  customerName: string | null;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl: string | null;
  items: Array<{
    id: string;
    productName: string;
    size: string;
    paperType: string;
    frameType: string | null;
    quantity: number;
    price: number;
    printFileUrl: string | null;
    thumbnailUrl: string | null;
  }>;
}

export interface OrderCardProps {
  order: OrderCardOrder;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (orderId: string, selected: boolean) => void;
  onClick?: (order: OrderCardOrder) => void;
  onPrint?: (orderId: string) => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'עכשיו';
  if (diffMins < 60) return `לפני ${diffMins} דק׳`;
  if (diffHours < 24) return `לפני ${diffHours === 1 ? 'שעה' : `${diffHours} שעות`}`;
  if (diffDays === 1) return 'אתמול';
  return `לפני ${diffDays} ימים`;
}

export function OrderCard({
  order,
  selectable = false,
  selected = false,
  onSelect,
  onClick,
  onPrint,
}: OrderCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(order);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(order.id, e.target.checked);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handlePrintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPrint) {
      onPrint(order.id);
    }
  };

  return (
    <div
      data-testid="order-card"
      dir="rtl"
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={handleCardClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={`
        bg-white border rounded-xl p-3 transition-all
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
        ${selected ? 'ring-2 ring-violet-500 border-violet-500' : 'border-zinc-200'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox for selection */}
        {selectable && (
          <div className="pt-1" onClick={handleCheckboxClick}>
            <input
              type="checkbox"
              checked={selected}
              onChange={handleCheckboxChange}
              aria-label={`בחר הזמנה ${order.orderNumber}`}
              className="w-4 h-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
            />
          </div>
        )}

        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-100">
          {order.thumbnailUrl ? (
            <Image
              data-testid="order-thumbnail"
              src={order.thumbnailUrl}
              alt=""
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              data-testid="thumbnail-placeholder"
              className="w-full h-full flex items-center justify-center text-zinc-400"
            >
              <Package className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Order Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold text-sm text-zinc-900">{order.orderNumber}</div>
              <div className="text-xs text-zinc-500 truncate">
                {order.customerName || order.customerEmail || 'לקוח'}
              </div>
            </div>

            {/* Print button */}
            {onPrint && (
              <button
                data-testid="print-button"
                onClick={handlePrintClick}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                aria-label={`הדפס הזמנה ${order.orderNumber}`}
              >
                <Printer className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-500">
            <span className="bg-zinc-100 px-1.5 py-0.5 rounded">{order.itemCount} פריטים</span>
            <span>•</span>
            <span>{formatTimeAgo(order.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
