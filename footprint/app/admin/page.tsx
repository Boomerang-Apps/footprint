'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  RefreshCw,
  SlidersHorizontal,
  Package,
  Clock,
  Truck,
  BarChart3,
  ChevronLeft,
  CheckCircle,
} from 'lucide-react';
import { demoOrders } from '@/data/demo/orders';

type StatusFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered';

const STATUS_CONFIG = {
  pending: { label: 'ממתין', icon: Clock, color: 'bg-amber-100 text-amber-700' },
  paid: { label: 'ממתין', icon: Clock, color: 'bg-amber-100 text-amber-700' },
  processing: { label: 'בהכנה', icon: Package, color: 'bg-blue-100 text-blue-700' },
  printing: { label: 'בהכנה', icon: Package, color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'נשלח', icon: Truck, color: 'bg-violet-100 text-violet-700' },
  delivered: { label: 'הגיע', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'בוטל', icon: Clock, color: 'bg-red-100 text-red-700' },
};

const FILTER_TABS = [
  { key: 'all', label: 'הכל' },
  { key: 'pending', label: 'ממתינות' },
  { key: 'processing', label: 'בהכנה' },
  { key: 'shipped', label: 'נשלחו' },
  { key: 'delivered', label: 'הגיעו' },
] as const;

function formatOrderId(id: string): string {
  const numericPart = id.replace(/\D/g, '').slice(-4).padStart(4, '0');
  const year = new Date().getFullYear();
  return `FP-${year}-${numericPart}`;
}

function formatTimeAgo(date: Date): string {
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

function formatPrice(amount: number): string {
  return `₪${amount.toLocaleString('he-IL')}`;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');

  // Map statuses for filtering
  const normalizeStatus = (status: string): StatusFilter => {
    if (status === 'paid' || status === 'pending') return 'pending';
    if (status === 'printing' || status === 'processing') return 'processing';
    return status as StatusFilter;
  };

  // Filter orders based on search and status filter
  const filteredOrders = useMemo(() => {
    let orders = [...demoOrders];

    // Filter by status
    if (activeFilter !== 'all') {
      orders = orders.filter((order) => normalizeStatus(order.status) === activeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      orders = orders.filter((order) => {
        const orderId = formatOrderId(order.id).toLowerCase();
        const customerName = order.shippingAddress?.name?.toLowerCase() || '';
        const phone = order.shippingAddress?.phone || '';
        return orderId.includes(query) || customerName.includes(query) || phone.includes(query);
      });
    }

    // Sort by createdAt descending
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [searchQuery, activeFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = demoOrders.filter((o) => new Date(o.createdAt) >= today);
    const pendingCount = demoOrders.filter(
      (o) => o.status === 'pending' || o.status === 'paid'
    ).length;
    const shippedCount = demoOrders.filter((o) => o.status === 'shipped').length;
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

    return {
      today: todayOrders.length,
      pending: pendingCount,
      shipped: shippedCount,
      revenue: todayRevenue,
    };
  }, []);

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: demoOrders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
    };

    demoOrders.forEach((order) => {
      const normalized = normalizeStatus(order.status);
      if (normalized in counts) {
        counts[normalized]++;
      }
    });

    return counts;
  }, []);

  const handleOrderClick = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const handleRefresh = () => {
    // In production, this would refetch data
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-zinc-100" dir="rtl">
      {/* Page Header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-[28px] lg:text-[32px] font-bold text-zinc-900">הזמנות</h1>
          <div className="flex gap-2.5">
            <button
              data-testid="refresh-button"
              onClick={handleRefresh}
              className="w-10 h-10 bg-white border border-zinc-200 rounded-[10px] flex items-center justify-center text-zinc-600 hover:bg-zinc-50"
            >
              <RefreshCw className="w-[18px] h-[18px]" />
            </button>
            <button
              data-testid="filter-button"
              className="w-10 h-10 bg-white border border-zinc-200 rounded-[10px] flex items-center justify-center text-zinc-600 hover:bg-zinc-50"
            >
              <SlidersHorizontal className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 mb-5">
        <div
          data-testid="stats-grid"
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-5"
        >
          <div
            data-testid="stat-card-today"
            className="bg-white border border-zinc-200 rounded-[14px] sm:rounded-[16px] p-4 sm:p-5 lg:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] sm:text-[14px] text-zinc-500">היום</span>
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Package className="w-[18px] h-[18px] text-violet-600" />
              </div>
            </div>
            <div className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold text-zinc-900">
              {stats.today}
            </div>
            <div className="text-[12px] sm:text-[13px] text-emerald-500 mt-1">+3 מאתמול</div>
          </div>

          <div
            data-testid="stat-card-pending"
            className="bg-white border border-zinc-200 rounded-[14px] sm:rounded-[16px] p-4 sm:p-5 lg:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] sm:text-[14px] text-zinc-500">ממתינות</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-[18px] h-[18px] text-amber-600" />
              </div>
            </div>
            <div className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold text-zinc-900">
              {stats.pending}
            </div>
          </div>

          <div
            data-testid="stat-card-shipped"
            className="bg-white border border-zinc-200 rounded-[14px] sm:rounded-[16px] p-4 sm:p-5 lg:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] sm:text-[14px] text-zinc-500">בדרך</span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Truck className="w-[18px] h-[18px] text-blue-600" />
              </div>
            </div>
            <div className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold text-zinc-900">
              {stats.shipped}
            </div>
          </div>

          <div
            data-testid="stat-card-revenue"
            className="bg-white border border-zinc-200 rounded-[14px] sm:rounded-[16px] p-4 sm:p-5 lg:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] sm:text-[14px] text-zinc-500">הכנסות היום</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <BarChart3 className="w-[18px] h-[18px] text-emerald-600" />
              </div>
            </div>
            <div className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold text-zinc-900">
              {formatPrice(stats.revenue)}
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
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש הזמנה, לקוח או טלפון..."
            className="w-full py-3 sm:py-3.5 px-4 pr-11 bg-white border border-zinc-200 rounded-xl text-[15px] outline-none focus:border-violet-600 placeholder:text-zinc-400"
          />
          <Search
            data-testid="search-icon"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-400"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 mb-4 lg:mb-5">
        <div
          data-testid="filters-bar"
          className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide"
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key as StatusFilter)}
              data-active={activeFilter === tab.key}
              className={`
                flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] font-medium whitespace-nowrap border transition-colors
                ${
                  activeFilter === tab.key
                    ? 'bg-violet-600 border-violet-600 text-white'
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
                {filterCounts[tab.key as StatusFilter]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pb-28">
        <div data-testid="orders-list" className="flex flex-col gap-2.5 sm:gap-3 lg:gap-3">
          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center">
              <Package className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500">לא נמצאו הזמנות</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;
              const thumbnail = order.items[0]?.originalImageUrl || '';

              return (
                <div
                  key={order.id}
                  data-testid={`order-row-${order.id}`}
                  onClick={() => handleOrderClick(order.id)}
                  className="bg-white border border-zinc-200 rounded-[14px] sm:rounded-[16px] lg:rounded-[18px] p-3.5 sm:p-4 lg:p-[18px] flex items-center gap-3 sm:gap-4 lg:gap-5 cursor-pointer hover:shadow-md transition-shadow lg:grid lg:grid-cols-[60px_1fr_auto_auto_120px_40px] xl:grid-cols-[70px_1fr_auto_auto_140px_44px]"
                >
                  {/* Thumbnail */}
                  <div
                    data-testid={`order-thumb-${order.id}`}
                    className="w-[50px] h-[50px] sm:w-[56px] sm:h-[56px] lg:w-[60px] lg:h-[60px] xl:w-[70px] xl:h-[70px] rounded-[10px] lg:rounded-[12px] overflow-hidden flex-shrink-0 bg-zinc-100"
                  >
                    {thumbnail && (
                      <Image
                        src={thumbnail}
                        alt=""
                        width={70}
                        height={70}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Order Info */}
                  <div className="flex-1 min-w-0 lg:min-w-[200px]">
                    <div
                      data-testid={`order-id-${order.id}`}
                      className="text-[14px] sm:text-[15px] lg:text-[16px] font-semibold text-zinc-900 mb-0.5"
                    >
                      {formatOrderId(order.id)}
                    </div>
                    <div className="text-[12px] sm:text-[13px] lg:text-[14px] text-zinc-500 flex gap-2 flex-wrap">
                      <span>{order.shippingAddress?.name || 'לקוח'}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(new Date(order.createdAt))}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div
                    data-testid={`status-badge-${order.id}`}
                    data-status={normalizeStatus(order.status)}
                    className={`hidden sm:flex items-center gap-1 px-2.5 lg:px-3.5 py-1 lg:py-1.5 rounded-full text-[11px] lg:text-[13px] font-semibold ${statusConfig.color}`}
                  >
                    <StatusIcon className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                    {statusConfig.label}
                  </div>

                  {/* Price */}
                  <div
                    data-testid={`order-price-${order.id}`}
                    className="text-[15px] sm:text-[16px] lg:text-[18px] font-semibold text-zinc-900 whitespace-nowrap lg:text-center lg:min-w-[80px]"
                  >
                    {formatPrice(order.total)}
                  </div>

                  {/* Action Button */}
                  <div
                    data-testid={`order-action-${order.id}`}
                    className="w-9 h-9 lg:w-10 lg:h-10 bg-zinc-50 rounded-[10px] lg:rounded-[12px] flex items-center justify-center text-zinc-500 flex-shrink-0"
                  >
                    <ChevronLeft className="w-[18px] h-[18px]" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
