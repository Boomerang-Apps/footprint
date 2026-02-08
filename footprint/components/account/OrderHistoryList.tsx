'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  AlertCircle,
  RotateCcw,
  Plus,
  Home,
  User,
} from 'lucide-react';
import { OrderCard } from './OrderCard';
import { Button } from '@/components/ui/Button';
import { useOrderHistory } from '@/hooks/useOrderHistory';
import { useOrderStore } from '@/stores/orderStore';
import { cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const filterTabs = [
  { id: 'all', label: 'הכל' },
  { id: 'processing', label: 'בהכנה' },
  { id: 'shipped', label: 'נשלח' },
  { id: 'delivered', label: 'הגיע' },
] as const;

type FilterStatus = 'all' | OrderStatus;

/**
 * OrderHistoryList - Complete order history page component
 * Displays user's orders with filtering, statistics, pagination, and navigation
 */
export function OrderHistoryList(): React.ReactElement {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const orderStore = useOrderStore();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useOrderHistory({
    statusFilter: activeFilter,
    page: currentPage,
    pageSize: 10,
  });

  const handleOrderClick = (order: { id: string }) => {
    router.push(`/account/orders/${order.id}`);
  };

  const handleBackClick = () => {
    router.push('/');
  };

  const handleCreateClick = () => {
    router.push('/create');
  };

  const handleReorder = (order: Order) => {
    // Get the first item to set up the order (single-item flow)
    const primaryItem = order.items?.[0];
    if (!primaryItem) return;

    // Reset store and set up new order with previous item details
    orderStore.reset();
    orderStore.setOriginalImage(primaryItem.originalImageUrl);
    if (primaryItem.transformedImageUrl) {
      orderStore.setTransformedImage(primaryItem.transformedImageUrl);
    }
    orderStore.setSelectedStyle(primaryItem.style);
    orderStore.setSize(primaryItem.size);
    orderStore.setPaperType(primaryItem.paperType);
    orderStore.setFrameType(primaryItem.frameType);

    // Copy gift settings if it was a gift order
    if (order.isGift) {
      orderStore.setIsGift(true);
      if (order.giftMessage) {
        orderStore.setGiftMessage(order.giftMessage);
      }
    }

    // Navigate to customize step to review before checkout
    orderStore.setStep('customize');
    router.push('/create/customize');
  };

  const handleTrackShipment = (order: Order) => {
    if (!order.trackingNumber) return;

    // Use carrier-specific tracking URL, or default to Israel Post
    const trackingUrl = order.carrier === 'fedex'
      ? `https://www.fedex.com/fedextrack/?trknbr=${order.trackingNumber}`
      : order.carrier === 'dhl'
        ? `https://www.dhl.com/il-en/home/tracking.html?tracking-id=${order.trackingNumber}`
        : `https://israelpost.co.il/itemtrace?itemcode=${order.trackingNumber}`;

    window.open(trackingUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFilterChange = (filter: FilterStatus) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top of list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between max-w-[600px] sm:max-w-[800px] lg:max-w-[1000px] mx-auto">
          <button
            data-testid="back-button"
            onClick={handleBackClick}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="חזור"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <h1 className="text-lg font-semibold text-gray-900">
            ההזמנות שלי
          </h1>

          <div className="w-10 h-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main
        role="main"
        className="max-w-[600px] sm:max-w-[800px] lg:max-w-[1000px] mx-auto p-4 sm:p-6 lg:p-8 pb-24 sm:pb-6"
      >
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-3.5 sm:p-5 lg:p-6 text-center">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-0.5">
              {data.totalOrders}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">הזמנות</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-3.5 sm:p-5 lg:p-6 text-center">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-0.5">
              ₪{data.totalSpent.toLocaleString('he-IL')}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">סה״כ</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-3.5 sm:p-5 lg:p-6 text-center">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-0.5">
              {data.inTransitCount}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">בדרך</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleFilterChange(tab.id as FilterStatus)}
              className={cn(
                'px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition-all whitespace-nowrap',
                activeFilter === tab.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div
              data-testid="loading-spinner"
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"
            />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              שגיאה בטעינת ההזמנות
            </h3>
            <p className="text-gray-500 mb-6">
              {error?.message || 'אירעה שגיאה בטעינת ההזמנות. אנא נסה שוב.'}
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              נסה שוב
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && data.orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-9 w-9 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              אין הזמנות עדיין
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm">
              צור את ההזמנה הראשונה שלך והפוך תמונות לאמנות מדהימה
            </p>
            <Button
              onClick={handleCreateClick}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4" />
              צור עכשיו
            </Button>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && !isError && data.orders.length > 0 && (
          <>
            <div className="space-y-3 sm:space-y-4">
              {data.orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={handleOrderClick}
                  onReorder={handleReorder}
                  onTrackShipment={handleTrackShipment}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!data.hasPrevPage}
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-xl border transition-colors',
                    data.hasPrevPage
                      ? 'border-gray-200 text-gray-600 hover:bg-gray-100'
                      : 'border-gray-100 text-gray-300 cursor-not-allowed'
                  )}
                  aria-label="עמוד קודם"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={cn(
                        'w-10 h-10 rounded-xl text-sm font-medium transition-colors',
                        pageNum === currentPage
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!data.hasNextPage}
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-xl border transition-colors',
                    data.hasNextPage
                      ? 'border-gray-200 text-gray-600 hover:bg-gray-100'
                      : 'border-gray-100 text-gray-300 cursor-not-allowed'
                  )}
                  aria-label="עמוד הבא"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation (Mobile/Tablet) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 lg:hidden">
        <div className="max-w-[500px] mx-auto flex justify-around">
          <button
            onClick={handleBackClick}
            className="flex flex-col items-center gap-1 py-2 px-4 text-gray-400 text-xs font-medium"
          >
            <Home className="h-5 w-5" />
            בית
          </button>

          <button
            onClick={handleCreateClick}
            className="flex flex-col items-center gap-1 py-2 px-4 text-gray-400 text-xs font-medium"
          >
            <Plus className="h-5 w-5" />
            יצירה
          </button>

          <button className="flex flex-col items-center gap-1 py-2 px-4 text-purple-600 text-xs font-medium">
            <ShoppingBag className="h-5 w-5" />
            הזמנות
          </button>

          <button className="flex flex-col items-center gap-1 py-2 px-4 text-gray-400 text-xs font-medium">
            <User className="h-5 w-5" />
            חשבון
          </button>
        </div>
      </nav>
    </div>
  );
}

OrderHistoryList.displayName = 'OrderHistoryList';