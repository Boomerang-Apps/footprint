'use client';

/**
 * OrderDetailPanel Component - UI-07A
 *
 * Slide-out panel for viewing and managing order details.
 * Shows order info, items, status actions, and print/download options.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { X, Printer, Download, Package, Clock, User, Mail, MapPin } from 'lucide-react';
import { type FulfillmentStatus } from '@/lib/fulfillment/status-transitions';
import { type OrderCardOrder } from './OrderCard';

export interface OrderDetailPanelProps {
  order: OrderCardOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: FulfillmentStatus) => Promise<void>;
  onPrint: (orderId: string) => void;
  onDownloadPrintFiles: (orderId: string) => void;
}

const STATUS_LABELS: Record<FulfillmentStatus, string> = {
  pending: 'ממתין',
  printing: 'בהדפסה',
  ready_to_ship: 'מוכן למשלוח',
  shipped: 'נשלח',
  delivered: 'נמסר',
  cancelled: 'בוטל',
};

const STATUS_BUTTONS: Array<{ status: FulfillmentStatus; label: string }> = [
  { status: 'printing', label: 'העבר להדפסה' },
  { status: 'ready_to_ship', label: 'מוכן למשלוח' },
  { status: 'shipped', label: 'נשלח' },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderDetailPanel({
  order,
  isOpen,
  onClose,
  onStatusUpdate,
  onPrint,
  onDownloadPrintFiles,
}: OrderDetailPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isMountedRef = useRef(true);

  // Cleanup: track mounted state to prevent setState after unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleStatusUpdate = useCallback(
    async (newStatus: FulfillmentStatus) => {
      if (!order || isUpdating) return;

      setIsUpdating(true);
      try {
        await onStatusUpdate(order.id, newStatus);
      } finally {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setIsUpdating(false);
        }
      }
    },
    [order, isUpdating, onStatusUpdate]
  );

  const handleOverlayClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!isOpen || !order) {
    return null;
  }

  return (
    <div
      data-testid="panel-overlay"
      className="fixed inset-0 bg-black/50 z-50 flex justify-end"
      onClick={handleOverlayClick}
    >
      <div
        data-testid="order-detail-panel"
        dir="rtl"
        className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl"
        onClick={handleContentClick}
      >
        <div data-testid="panel-content" className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-zinc-50">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">{order.orderNumber}</h2>
              <div
                data-testid="current-status"
                className="text-sm text-zinc-500"
              >
                {STATUS_LABELS[order.status]}
              </div>
            </div>
            <button
              data-testid="close-button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-200 transition-colors"
              aria-label="סגור"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Customer Info */}
          <div className="p-4 border-b border-zinc-200">
            <h3 className="text-sm font-semibold text-zinc-700 mb-3">פרטי לקוח</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-zinc-400" />
                <span>{order.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-zinc-400" />
                <span>{order.customerEmail}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-4 border-b border-zinc-200 flex-1">
            <h3 className="text-sm font-semibold text-zinc-700 mb-3">
              פריטים ({order.items.length})
            </h3>
            {order.items.length === 0 ? (
              <div className="text-sm text-zinc-500 text-center py-4">
                אין פריטים בהזמנה
              </div>
            ) : (
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-100">
                      {item.thumbnailUrl ? (
                        <Image
                          data-testid="item-thumbnail"
                          src={item.thumbnailUrl}
                          alt={item.productName}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          data-testid="item-placeholder"
                          className="w-full h-full flex items-center justify-center text-zinc-400"
                        >
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-zinc-900">
                        {item.productName}
                      </div>
                      <div className="text-xs text-zinc-500">
                        כמות: {item.quantity}
                      </div>
                      <div className="text-sm font-semibold text-zinc-700">
                        ₪{item.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Total */}
          <div className="p-4 border-b border-zinc-200 bg-zinc-50">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-700">סה״כ</span>
              <span className="text-xl font-bold text-zinc-900">₪{order.total}</span>
            </div>
          </div>

          {/* Timeline */}
          <div data-testid="timeline" className="p-4 border-b border-zinc-200">
            <h3 className="text-sm font-semibold text-zinc-700 mb-3">היסטוריה</h3>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Clock className="w-4 h-4" />
              <span>נוצר: {formatDate(order.createdAt)}</span>
            </div>
          </div>

          {/* Status Actions */}
          <div data-testid="status-actions" className="p-4 border-b border-zinc-200">
            <h3 className="text-sm font-semibold text-zinc-700 mb-3">עדכון סטטוס</h3>
            <div className="flex flex-wrap gap-2">
              {STATUS_BUTTONS.map(({ status, label }) => (
                <button
                  key={status}
                  data-testid={`status-${status}`}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={isUpdating || order.status === status}
                  className="px-3 py-2 text-sm rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Print/Download Actions */}
          <div className="p-4 bg-zinc-50">
            <div className="flex gap-2">
              <button
                data-testid="print-all-button"
                onClick={() => onPrint(order.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
              >
                <Printer className="w-4 h-4" />
                הדפס הכל
              </button>
              <button
                data-testid="download-files-button"
                onClick={() => onDownloadPrintFiles(order.id)}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-zinc-300 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
