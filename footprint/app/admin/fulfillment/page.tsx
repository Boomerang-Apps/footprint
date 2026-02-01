'use client';

/**
 * Admin Fulfillment Page - UI-07A
 *
 * Main dashboard for managing order fulfillment workflow.
 * Features kanban board, filtering, bulk operations.
 */

import { useState, useCallback } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { useFulfillmentOrders } from '@/hooks/useFulfillmentOrders';
import { FulfillmentBoard } from '@/components/admin/FulfillmentBoard';
import { OrderDetailPanel } from '@/components/admin/OrderDetailPanel';
import { type OrderCardOrder } from '@/components/admin/OrderCard';
import { type FulfillmentStatus } from '@/lib/fulfillment/status-transitions';
import { bulkUpdateStatus } from '@/lib/fulfillment/bulk-operations';

export default function FulfillmentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderCardOrder | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const {
    orders,
    grouped,
    stats,
    isLoading,
    isError,
    refetch,
  } = useFulfillmentOrders({
    search: searchQuery || undefined,
  });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleOrderClick = useCallback((order: OrderCardOrder) => {
    setSelectedOrder(order);
    setIsPanelOpen(true);
  }, []);

  const handlePanelClose = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedOrder(null);
  }, []);

  const handleStatusUpdate = useCallback(
    async (orderIds: string[], newStatus: FulfillmentStatus) => {
      await bulkUpdateStatus(orderIds, newStatus);
      refetch();
    },
    [refetch]
  );

  const handleSingleStatusUpdate = useCallback(
    async (orderId: string, newStatus: FulfillmentStatus) => {
      await bulkUpdateStatus([orderId], newStatus);
      refetch();
      // Update the selected order's status in local state
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    },
    [refetch, selectedOrder]
  );

  const handleBulkDownload = useCallback((orderIds: string[]) => {
    // TODO: Implement bulk download (BE-08)
    console.log('Download print files for orders:', orderIds);
  }, []);

  const handlePrint = useCallback((orderId: string) => {
    // TODO: Implement print functionality
    console.log('Print order:', orderId);
  }, []);

  const handleDownloadPrintFiles = useCallback((orderId: string) => {
    // TODO: Implement single order download
    console.log('Download print files for order:', orderId);
  }, []);

  return (
    <div
      data-testid="fulfillment-page"
      dir="rtl"
      className="min-h-screen bg-zinc-100"
    >
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-zinc-900">ניהול הזמנות</h1>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  data-testid="search-input"
                  type="text"
                  placeholder="חיפוש הזמנה..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-4 pr-10 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {/* Refresh button */}
              <button
                data-testid="refresh-button"
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                רענן
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <FulfillmentBoard
          orders={orders}
          grouped={grouped}
          stats={stats}
          isLoading={isLoading}
          isError={isError}
          onRefresh={handleRefresh}
          onOrderClick={handleOrderClick}
          onStatusUpdate={handleStatusUpdate}
          onBulkDownload={handleBulkDownload}
          onPrint={handlePrint}
        />
      </main>

      {/* Order detail panel */}
      <OrderDetailPanel
        order={selectedOrder}
        isOpen={isPanelOpen}
        onClose={handlePanelClose}
        onStatusUpdate={handleSingleStatusUpdate}
        onPrint={handlePrint}
        onDownloadPrintFiles={handleDownloadPrintFiles}
      />
    </div>
  );
}
