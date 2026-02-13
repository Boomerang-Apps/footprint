'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  RefreshCw,
  Users,
  UserPlus,
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  UserCog,
  Ban,
} from 'lucide-react';
import { useAdminUsers, useAdminUserStats } from '@/hooks/useAdminUsers';
import type { AdminUserSummary } from '@/hooks/useAdminUsers';

type RoleFilter = 'all' | 'admin' | 'user';

const FILTER_TABS = [
  { key: 'all', label: 'הכל' },
  { key: 'admin', label: 'מנהלים' },
  { key: 'user', label: 'משתמשים' },
] as const;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatPrice(amount: number): string {
  return `₪${amount.toLocaleString('he-IL')}`;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  return email.substring(0, 2).toUpperCase();
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<RoleFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'order_count'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Debounce search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    // Simple debounce using setTimeout
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  // Fetch users with current filters
  const {
    users,
    total,
    totalPages,
    isLoading,
    isError,
    refetch,
  } = useAdminUsers({
    page: currentPage,
    limit: 20,
    search: debouncedSearch,
    role: activeFilter,
    sortBy,
    sortOrder,
  });

  // Fetch stats
  const { stats, isLoading: statsLoading } = useAdminUserStats();

  // Calculate filter counts based on stats
  const filterCounts = useMemo(() => {
    if (!stats) {
      return { all: 0, admin: 0, user: 0 };
    }
    return {
      all: stats.totalUsers,
      admin: stats.adminCount,
      user: stats.totalUsers - stats.adminCount,
    };
  }, [stats]);

  const handleUserClick = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleFilterChange = (filter: RoleFilter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSortChange = (field: 'created_at' | 'name' | 'order_count') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDropdownToggle = (userId: string) => {
    setOpenDropdown(openDropdown === userId ? null : userId);
  };

  const handleQuickAction = async (action: string, userId: string) => {
    setOpenDropdown(null);
    const targetUser = users.find((u: AdminUserSummary) => u.id === userId);
    switch (action) {
      case 'view':
        router.push(`/admin/users/${userId}`);
        break;
      case 'makeAdmin':
        try {
          await fetch(`/api/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isAdmin: !targetUser?.isAdmin }),
          });
          refetch();
        } catch {
          // Silently fail — user will see unchanged state
        }
        break;
      case 'deactivate':
        try {
          await fetch(`/api/admin/users/${userId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'inactive' }),
          });
          refetch();
        } catch {
          // Silently fail — user will see unchanged state
        }
        break;
    }
  };

  return (
    <main className="min-h-screen bg-zinc-100" dir="rtl">
      {/* Page Header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-[28px] lg:text-[32px] font-bold text-zinc-900">
            משתמשים
          </h1>
          <div className="flex gap-2.5">
            <button
              data-testid="refresh-button"
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
        <div
          data-testid="stats-grid"
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-5"
        >
          <div
            data-testid="stat-card-total"
            className="bg-white border border-zinc-200 rounded-[14px] sm:rounded-[16px] p-4 sm:p-5 lg:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] sm:text-[14px] text-zinc-500">סה״כ משתמשים</span>
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Users className="w-[18px] h-[18px] text-violet-600" />
              </div>
            </div>
            <div className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold text-zinc-900">
              {statsLoading ? '...' : stats?.totalUsers || 0}
            </div>
          </div>

          <div
            data-testid="stat-card-new-week"
            className="bg-white border border-zinc-200 rounded-[14px] sm:rounded-[16px] p-4 sm:p-5 lg:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] sm:text-[14px] text-zinc-500">חדשים השבוע</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <UserPlus className="w-[18px] h-[18px] text-emerald-600" />
              </div>
            </div>
            <div className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold text-zinc-900">
              {statsLoading ? '...' : stats?.newThisWeek || 0}
            </div>
          </div>

          <div
            data-testid="stat-card-admins"
            className="bg-white border border-zinc-200 rounded-[14px] sm:rounded-[16px] p-4 sm:p-5 lg:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] sm:text-[14px] text-zinc-500">מנהלים</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Shield className="w-[18px] h-[18px] text-amber-600" />
              </div>
            </div>
            <div className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold text-zinc-900">
              {statsLoading ? '...' : stats?.adminCount || 0}
            </div>
          </div>

          <div
            data-testid="stat-card-active"
            className="bg-white border border-zinc-200 rounded-[14px] sm:rounded-[16px] p-4 sm:p-5 lg:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] sm:text-[14px] text-zinc-500">פעילים</span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Activity className="w-[18px] h-[18px] text-blue-600" />
              </div>
            </div>
            <div className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold text-zinc-900">
              {statsLoading ? '...' : stats?.activeUsers || 0}
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
            placeholder="חיפוש לפי שם או אימייל..."
            data-testid="search-input"
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
              onClick={() => handleFilterChange(tab.key as RoleFilter)}
              data-active={activeFilter === tab.key}
              data-testid={`filter-${tab.key}`}
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
                {filterCounts[tab.key as RoleFilter]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pb-28">
        {/* Desktop Table Header */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_150px_120px_120px_100px_50px] gap-4 px-5 py-3 text-[13px] font-medium text-zinc-500 mb-2">
          <button
            onClick={() => handleSortChange('name')}
            className="text-right flex items-center gap-1 hover:text-zinc-700"
          >
            משתמש
            {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('created_at')}
            className="text-right flex items-center gap-1 hover:text-zinc-700"
          >
            הצטרף
            {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('order_count')}
            className="text-right flex items-center gap-1 hover:text-zinc-700"
          >
            הזמנות
            {sortBy === 'order_count' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <span>סה״כ הוצאות</span>
          <span>תפקיד</span>
          <span></span>
        </div>

        <div data-testid="users-list" className="flex flex-col gap-2.5 sm:gap-3 lg:gap-2">
          {isLoading ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-zinc-500">טוען משתמשים...</p>
            </div>
          ) : isError ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center">
              <p className="text-red-500">שגיאה בטעינת משתמשים</p>
              <button
                onClick={handleRefresh}
                className="mt-3 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm"
              >
                נסה שוב
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center">
              <Users className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500">לא נמצאו משתמשים</p>
            </div>
          ) : (
            users.map((user: AdminUserSummary) => (
              <UserRow
                key={user.id}
                user={user}
                onClick={() => handleUserClick(user.id)}
                onDropdownToggle={() => handleDropdownToggle(user.id)}
                isDropdownOpen={openDropdown === user.id}
                onQuickAction={(action) => handleQuickAction(action, user.id)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            data-testid="pagination"
            className="flex items-center justify-center gap-2 mt-6"
          >
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 bg-white border border-zinc-200 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <span className="px-4 py-2 text-sm text-zinc-600">
              עמוד {currentPage} מתוך {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
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

interface UserRowProps {
  user: AdminUserSummary;
  onClick: () => void;
  onDropdownToggle: () => void;
  isDropdownOpen: boolean;
  onQuickAction: (action: string) => void;
}

function UserRow({
  user,
  onClick,
  onDropdownToggle,
  isDropdownOpen,
  onQuickAction,
}: UserRowProps) {
  return (
    <div
      data-testid={`user-row-${user.id}`}
      className="bg-white border border-zinc-200 rounded-[14px] sm:rounded-[16px] lg:rounded-[12px] p-3.5 sm:p-4 lg:py-3 lg:px-5 flex items-center gap-3 sm:gap-4 lg:gap-5 cursor-pointer hover:shadow-md transition-shadow lg:grid lg:grid-cols-[1fr_150px_120px_120px_100px_50px]"
    >
      {/* User Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0" onClick={onClick}>
        {/* Avatar */}
        <div className="relative w-10 h-10 sm:w-11 sm:h-11 lg:w-10 lg:h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold text-sm flex-shrink-0">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt=""
              fill
              className="rounded-full object-cover"
            />
          ) : (
            getInitials(user.name, user.email)
          )}
        </div>

        {/* Name and Email */}
        <div className="min-w-0" onClick={onClick}>
          <div className="flex items-center gap-2">
            <span className="text-[14px] sm:text-[15px] lg:text-[14px] font-semibold text-zinc-900 truncate">
              {user.name || 'ללא שם'}
            </span>
            {user.isAdmin && (
              <span
                data-testid={`admin-badge-${user.id}`}
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-700"
              >
                מנהל
              </span>
            )}
          </div>
          <div className="text-[12px] sm:text-[13px] lg:text-[13px] text-zinc-500 truncate">
            {user.email}
          </div>
        </div>
      </div>

      {/* Registration Date */}
      <div
        className="hidden lg:block text-[13px] text-zinc-600"
        onClick={onClick}
      >
        {formatDate(user.createdAt)}
      </div>

      {/* Order Count */}
      <div
        className="hidden lg:block text-[13px] text-zinc-600"
        onClick={onClick}
      >
        {user.orderCount}
      </div>

      {/* Total Spent */}
      <div
        className="text-[14px] sm:text-[15px] lg:text-[13px] font-semibold lg:font-normal text-zinc-900 lg:text-zinc-600"
        onClick={onClick}
      >
        {formatPrice(user.totalSpent)}
      </div>

      {/* Role Badge (mobile) */}
      <div className="lg:hidden" onClick={onClick}>
        {user.isAdmin && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-100 text-violet-700">
            מנהל
          </span>
        )}
      </div>

      {/* Role Badge (desktop) */}
      <div className="hidden lg:block" onClick={onClick}>
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
            user.isAdmin
              ? 'bg-violet-100 text-violet-700'
              : 'bg-zinc-100 text-zinc-600'
          }`}
        >
          {user.isAdmin ? 'מנהל' : 'משתמש'}
        </span>
      </div>

      {/* Action Button */}
      <div className="relative">
        <button
          data-testid={`action-button-${user.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onDropdownToggle();
          }}
          className="w-9 h-9 lg:w-8 lg:h-8 bg-zinc-50 rounded-[10px] lg:rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-100"
        >
          <MoreVertical className="w-[16px] h-[16px]" />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            data-testid={`dropdown-${user.id}`}
            className="absolute left-0 top-full mt-1 w-40 bg-white border border-zinc-200 rounded-lg shadow-lg z-10"
          >
            <button
              onClick={() => onQuickAction('view')}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              <Eye className="w-4 h-4" />
              צפייה
            </button>
            <button
              onClick={() => onQuickAction('makeAdmin')}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              <UserCog className="w-4 h-4" />
              {user.isAdmin ? 'הסר הרשאות מנהל' : 'הפוך למנהל'}
            </button>
            <button
              onClick={() => onQuickAction('deactivate')}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Ban className="w-4 h-4" />
              השבת חשבון
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
