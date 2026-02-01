'use client';

/**
 * FulfillmentBoard Component - UI-07A
 *
 * Main kanban-style board for fulfillment workflow.
 * Displays orders grouped by status with drag-and-drop support.
 */

import { useState, useCallback } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { type FulfillmentStatus } from '@/lib/fulfillment/status-transitions';
import { FulfillmentColumn } from './FulfillmentColumn';
import { BulkActionToolbar } from './BulkActionToolbar';
import { type OrderCardOrder } from './OrderCard';

export interface FulfillmentBoardProps {
  orders: OrderCardOrder[];
  grouped: Record<FulfillmentStatus, OrderCardOrder[]>;
  stats: {
    pendingCount: number;
    printingCount: number;
    readyCount: number;
    shippedTodayCount: number;
  };
  isLoading: boolean;
  isError: boolean;
  onRefresh: () => void;
  onOrderClick: (order: OrderCardOrder) => void;
  onStatusUpdate: (orderIds: string[], newStatus: FulfillmentStatus) => Promise<void>;
  onBulkDownload: (orderIds: string[]) => void;
  onPrint: (orderId: string) => void;
}

const COLUMN_CONFIG: Array<{
  status: FulfillmentStatus;
  title: string;
}> = [
  { status: 'pending', title: 'ממתינות' },
  { status: 'printing', title: 'בהדפסה' },
  { status: 'ready_to_ship', title: 'מוכנות למשלוח' },
  { status: 'shipped', title: 'נשלחו' },
];

export function FulfillmentBoard({
  orders,
  grouped,
  stats,
  isLoading,
  isError,
  onRefresh,
  onOrderClick,
  onStatusUpdate,
  onBulkDownload,
  onPrint,
}: FulfillmentBoardProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const handleSelect = useCallback((orderId: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(orderId);
      } else {
        next.delete(orderId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(
    (status: FulfillmentStatus, orderIds: string[]) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        orderIds.forEach((id) => next.add(id));
        return next;
      });
    },
    []
  );

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleUpdateStatus = useCallback(() => {
    setShowStatusModal(true);
  }, []);

  const handleStatusChange = useCallback(
    async (newStatus: FulfillmentStatus) => {
      if (selectedIds.size === 0) return;

      setIsUpdating(true);
      try {
        await onStatusUpdate(Array.from(selectedIds), newStatus);
        setSelectedIds(new Set());
        setShowStatusModal(false);
      } finally {
        setIsUpdating(false);
      }
    },
    [selectedIds, onStatusUpdate]
  );

  const handleBulkDownload = useCallback(() => {
    if (selectedIds.size === 0) return;
    onBulkDownload(Array.from(selectedIds));
  }, [selectedIds, onBulkDownload]);

  if (isError) {
    return (
      <div
        data-testid="error-state"
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-zinc-900 mb-2">שגיאה בטעינת הזמנות</h3>
        <p className="text-zinc-500 mb-4">לא הצלחנו לטעון את ההזמנות. נסה שוב.</p>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
        >
          <RefreshCw className="w-4 h-4" />
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <div data-testid="fulfillment-board" dir="rtl" className="flex flex-col h-full">
      {/* Stats bar */}
      <div
        data-testid="stats-bar"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4"
      >
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-700">{stats.pendingCount}</div>
          <div className="text-xs text-amber-600">ממתינות</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-blue-700">{stats.printingCount}</div>
          <div className="text-xs text-blue-600">בהדפסה</div>
        </div>
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-violet-700">{stats.readyCount}</div>
          <div className="text-xs text-violet-600">מוכנות</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-emerald-700">{stats.shippedTodayCount}</div>
          <div className="text-xs text-emerald-600">נשלחו היום</div>
        </div>
      </div>

      {/* Kanban columns */}
      <div
        data-testid="columns-container"
        className="flex-1 flex gap-4 overflow-x-auto pb-4"
      >
        {COLUMN_CONFIG.map(({ status, title }) => (
          <FulfillmentColumn
            key={status}
            title={title}
            status={status}
            orders={grouped[status] || []}
            isLoading={isLoading}
            selectable
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onOrderClick={onOrderClick}
            onPrint={onPrint}
          />
        ))}
      </div>

      {/* Bulk action toolbar */}
      <BulkActionToolbar
        selectedCount={selectedIds.size}
        onUpdateStatus={handleUpdateStatus}
        onDownload={handleBulkDownload}
        onClearSelection={handleClearSelection}
        isLoading={isUpdating}
      />

      {/* Status update modal */}
      {showStatusModal && (
        <div
          data-testid="status-modal"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowStatusModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <h3 className="text-lg font-semibold mb-4">עדכון סטטוס</h3>
            <p className="text-sm text-zinc-500 mb-4">
              בחר סטטוס חדש עבור {selectedIds.size} הזמנות
            </p>
            <div className="space-y-2">
              {COLUMN_CONFIG.map(({ status, title }) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isUpdating}
                  className="w-full px-4 py-3 text-right rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50"
                >
                  {title}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowStatusModal(false)}
              className="w-full mt-4 px-4 py-2 text-zinc-600 hover:text-zinc-900"
            >
              ביטול
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
