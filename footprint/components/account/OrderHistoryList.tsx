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
} from 'lucide-react';
import { OrderCard } from './OrderCard';
import { Button } from '@/components/ui/Button';
import { useOrderHistory } from '@/hooks/useOrderHistory';
import { cn } from '@/lib/utils';

/**
 * OrderHistoryList - Order history page component
 * Displays user's orders with pagination. No stats, no filters, no bottom nav.
 */
export function OrderHistoryList(): React.ReactElement {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useOrderHistory({
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
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
    </div>
  );
}

OrderHistoryList.displayName = 'OrderHistoryList';
