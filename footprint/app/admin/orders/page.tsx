'use client';

/**
 * Admin Orders Page
 *
 * List all orders with search, filter, and pagination.
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  RefreshCw,
  Package,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Truck,
} from 'lucide-react';
import { useFulfillmentOrders, type FulfillmentOrder } from '@/hooks/useFulfillmentOrders';
import { type FulfillmentStatus } from '@/lib/fulfillment/status-transitions';

const STATUS_LABELS: Record<FulfillmentStatus, string> = {
  pending: 'ממתין',
  printing: 'בהדפסה',
  ready_to_ship: 'מוכן למשלוח',
  shipped: 'נשלח',
  delivered: 'נמסר',
  cancelled: 'בוטל',
};

const STATUS_COLORS: Record<FulfillmentStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  printing: 'bg-blue-100 text-blue-700',
  ready_to_ship: 'bg-violet-100 text-violet-700',
  shipped: 'bg-emerald-100 text-emerald-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const FILTER_TABS: Array<{ key: FulfillmentStatus | 'all'; label: string }> = [
  { key: 'all', label: 'הכל' },
  { key: 'pending', label: 'ממתינות' },
  { key: 'printing', label: 'בהדפסה' },
  { key: 'ready_to_ship', label: 'מוכנות' },
  { key: 'shipped', label: 'נשלחו' },
  { key: 'delivered', label: 'נמסרו' },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(amount: number): string {
  return `₪${amount.toLocaleString('he-IL')}`;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FulfillmentStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  const {
    orders,
    stats,
    total,
    totalPages,
    isLoading,
    isError,
    refetch,
  } = useFulfillmentOrders({
    status: activeFilter === 'all' ? undefined : activeFilter,
    search: debouncedSearch,
    page: currentPage,
    limit: 20,
  });

  const handleOrderClick = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleFilterChange = (filter: FulfillmentStatus | 'all') => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const getFilterCount = (filter: FulfillmentStatus | 'all'): number => {
    if (filter === 'all') {
      return stats.pendingCount + stats.printingCount + stats.readyCount + stats.shippedTodayCount;
    }
    switch (filter) {
      case 'pending':
        return stats.pendingCount;
      case 'printing':
        return stats.printingCount;
      case 'ready_to_ship':
        return stats.readyCount;
      case 'shipped':
        return stats.shippedTodayCount;
      default:
        return 0;
    }
  };

  return (
    <main className="min-h-screen bg-zinc-100" dir="rtl">
      {/* Page Header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-[28px] lg:text-[32px] font-bold text-zinc-900">
            הזמנות
          </h1>
          <div className="flex gap-2.5">
            <button
              onClick={handleRefresh}
              className="w-10 h-10 bg-white border border-zinc-200 rounded-[10px] flex items-center justify-center text-zinc-600 hover:bg-zinc-50"
            >
              <RefreshCw className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          <div className="bg-white border border-zinc-200 rounded-[14px] sm:rounded-[16px] p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] sm:text-[14px] text-zinc-500">ממתינות</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Package className="w-[18px] h-[18px] text-amber-600" />
              </div>
            </div>
            <div className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold text-zinc-900">
              {stats.pendingCount}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-[14px] sm:rounded-[16px] p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] sm:text-[14px] text-zinc-500">בהדפסה</span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-[18px] h-[18px] text-blue-600" />
              </div>
            </div>
            <div className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold text-zinc-900">
              {stats.printingCount}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-[14px] sm:rounded-[16px] p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] sm:text-[14px] text-zinc-500">מוכנות למשלוח</span>
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Package className="w-[18px] h-[18px] text-violet-600" />
              </div>
            </div>
            <div className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold text-zinc-900">
              {stats.readyCount}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-[14px] sm:rounded-[16px] p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] sm:text-[14px] text-zinc-500">נשלחו היום</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Truck className="w-[18px] h-[18px] text-emerald-600" />
              </div>
            </div>
            <div className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold text-zinc-900">
              {stats.shippedTodayCount}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 mb-4">
        <div className="relative lg:max-w-[400px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="חיפוש לפי מספר הזמנה, שם או אימייל..."
            className="w-full py-3 sm:py-3.5 px-4 pr-11 bg-white border border-zinc-200 rounded-xl text-[15px] outline-none focus:border-violet-600 placeholder:text-zinc-400"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-400" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 mb-4 lg:mb-5">
        <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleFilterChange(tab.key)}
              className={`
                flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] font-medium whitespace-nowrap border transition-colors
                ${
                  activeFilter === tab.key
                    ? 'bg-zinc-900 border-zinc-900 text-white'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }
              `}
            >
              {tab.label}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] ${
                  activeFilter === tab.key ? 'bg-white/20' : 'bg-zinc-100'
                }`}
              >
                {getFilterCount(tab.key)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pb-28">
        {/* Desktop Table Header */}
        <div className="hidden lg:grid lg:grid-cols-[80px_1fr_150px_120px_100px_100px_80px] gap-4 px-5 py-3 text-[13px] font-medium text-zinc-500 mb-2">
          <span>תמונה</span>
          <span>פרטי הזמנה</span>
          <span>לקוח</span>
          <span>תאריך</span>
          <span>סטטוס</span>
          <span>סכום</span>
          <span></span>
        </div>

        <div className="flex flex-col gap-2.5 sm:gap-3 lg:gap-2">
          {isLoading ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-zinc-500">טוען הזמנות...</p>
            </div>
          ) : isError ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center">
              <p className="text-red-500">שגיאה בטעינת הזמנות</p>
              <button
                onClick={handleRefresh}
                className="mt-3 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm"
              >
                נסה שוב
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center">
              <Package className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500">לא נמצאו הזמנות</p>
            </div>
          ) : (
            orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onClick={() => handleOrderClick(order.id)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 bg-white border border-zinc-200 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <span className="px-4 py-2 text-sm text-zinc-600">
              עמוד {currentPage} מתוך {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 bg-white border border-zinc-200 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

interface OrderRowProps {
  order: FulfillmentOrder;
  onClick: () => void;
}

function OrderRow({ order, onClick }: OrderRowProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-zinc-200 rounded-[14px] sm:rounded-[16px] lg:rounded-[12px] p-3.5 sm:p-4 lg:py-3 lg:px-5 flex items-center gap-3 sm:gap-4 lg:gap-5 cursor-pointer hover:shadow-md transition-shadow lg:grid lg:grid-cols-[80px_1fr_150px_120px_100px_100px_80px]"
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-lg bg-zinc-100 flex-shrink-0 overflow-hidden">
        {order.thumbnailUrl ? (
          <Image
            src={order.thumbnailUrl}
            alt=""
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-6 h-6 text-zinc-400" />
          </div>
        )}
      </div>

      {/* Order Info */}
      <div className="flex-1 min-w-0">
        <div className="text-[14px] sm:text-[15px] lg:text-[14px] font-semibold text-zinc-900">
          {order.orderNumber}
        </div>
        <div className="text-[12px] sm:text-[13px] text-zinc-500">
          {order.itemCount} פריטים
        </div>
      </div>

      {/* Customer */}
      <div className="hidden lg:block">
        <div className="text-[13px] text-zinc-900 truncate">
          {order.customerName || 'אורח'}
        </div>
        <div className="text-[12px] text-zinc-500 truncate">
          {order.customerEmail}
        </div>
      </div>

      {/* Date */}
      <div className="hidden lg:block text-[13px] text-zinc-600">
        <div>{formatDate(order.createdAt)}</div>
        <div className="text-zinc-400">{formatTime(order.createdAt)}</div>
      </div>

      {/* Status */}
      <div>
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
            STATUS_COLORS[order.status]
          }`}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Total */}
      <div className="text-[14px] sm:text-[15px] lg:text-[14px] font-semibold text-zinc-900">
        {formatPrice(order.total)}
      </div>

      {/* Action */}
      <div className="hidden lg:flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-100"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
