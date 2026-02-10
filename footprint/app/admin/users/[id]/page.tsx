'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowRight,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  MapPin,
  Shield,
  ShieldOff,
  UserX,
  UserCheck,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useAdminUser, useUpdateUserRole, useUpdateUserStatus } from '@/hooks/useAdminUser';
import type { AdminUserDetail, OrderSummary, Address } from '@/hooks/useAdminUser';

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

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'ממתין', color: 'bg-amber-100 text-amber-700' },
  paid: { label: 'שולם', color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'בהכנה', color: 'bg-blue-100 text-blue-700' },
  printing: { label: 'בהדפסה', color: 'bg-violet-100 text-violet-700' },
  shipped: { label: 'נשלח', color: 'bg-violet-100 text-violet-700' },
  delivered: { label: 'הגיע', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'בוטל', color: 'bg-red-100 text-red-700' },
};

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string ?? '';

  const { user, isLoading, isError, error } = useAdminUser({ userId, enabled: !!userId });
  const updateRole = useUpdateUserRole();
  const updateStatus = useUpdateUserStatus();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'role' | 'status' | null>(null);
  const [confirmValue, setConfirmValue] = useState<boolean | string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleBack = () => {
    router.push('/admin/users');
  };

  const handleOrderClick = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRoleAction = () => {
    if (!user) return;
    setConfirmAction('role');
    setConfirmValue(!user.isAdmin);
    setShowConfirmModal(true);
  };

  const handleStatusAction = () => {
    if (!user) return;
    setConfirmAction('status');
    setConfirmValue(user.status === 'active' ? 'inactive' : 'active');
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction || confirmValue === null) return;

    setShowConfirmModal(false);

    try {
      if (confirmAction === 'role') {
        await updateRole.mutateAsync({ userId, isAdmin: confirmValue as boolean });
        showToast('success', confirmValue ? 'המשתמש הפך למנהל' : 'הרשאות המנהל הוסרו');
      } else if (confirmAction === 'status') {
        await updateStatus.mutateAsync({ userId, status: confirmValue as string });
        showToast('success', confirmValue === 'active' ? 'החשבון הופעל' : 'החשבון הושבת');
      }
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'שגיאה בביצוע הפעולה');
    }

    setConfirmAction(null);
    setConfirmValue(null);
  };

  const handleCancelAction = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmValue(null);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-100" dir="rtl">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-zinc-500">טוען פרטי משתמש...</p>
          </div>
        </div>
      </main>
    );
  }

  if (isError || !user) {
    return (
      <main className="min-h-screen bg-zinc-100" dir="rtl">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center">
            <p className="text-red-500 mb-4">{error?.message || 'משתמש לא נמצא'}</p>
            <button
              onClick={handleBack}
              data-testid="back-button"
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm"
            >
              חזרה לרשימת המשתמשים
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100" dir="rtl">
      {/* Toast */}
      {toast && (
        <div
          data-testid="toast"
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-10 pt-5 pb-4">
        <button
          onClick={handleBack}
          data-testid="back-button"
          className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-4"
        >
          <ArrowRight className="w-5 h-5" />
          <span>חזרה לרשימת המשתמשים</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-10 mb-6">
        <div
          data-testid="profile-card"
          className="bg-white border border-zinc-200 rounded-[16px] p-6"
        >
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            <div
              data-testid="user-avatar"
              className="relative w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-2xl flex-shrink-0"
            >
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

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1
                  data-testid="user-name"
                  className="text-2xl font-bold text-zinc-900"
                >
                  {user.name || 'ללא שם'}
                </h1>
                {user.isAdmin && (
                  <span
                    data-testid="admin-badge"
                    className="px-3 py-1 rounded-full text-sm font-semibold bg-violet-100 text-violet-700"
                  >
                    מנהל
                  </span>
                )}
                <span
                  data-testid="status-badge"
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    user.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {user.status === 'active' ? 'פעיל' : 'לא פעיל'}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-zinc-600 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span data-testid="user-email">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span data-testid="user-phone">{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span data-testid="registration-date">
                    הצטרף בתאריך: {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
              <button
                onClick={handleRoleAction}
                data-testid="role-action-button"
                disabled={updateRole.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-100 disabled:opacity-50"
              >
                {user.isAdmin ? (
                  <>
                    <ShieldOff className="w-4 h-4" />
                    הסר הרשאות מנהל
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    הפוך למנהל
                  </>
                )}
              </button>
              <button
                onClick={handleStatusAction}
                data-testid="status-action-button"
                disabled={updateStatus.isPending}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${
                  user.status === 'active'
                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {user.status === 'active' ? (
                  <>
                    <UserX className="w-4 h-4" />
                    השבת חשבון
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    הפעל חשבון
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-10 mb-6">
        <div
          data-testid="stats-section"
          className="grid grid-cols-3 gap-4"
        >
          <div className="bg-white border border-zinc-200 rounded-[14px] p-5 text-center">
            <div className="text-3xl font-bold text-zinc-900" data-testid="order-count">
              {user.orderCount}
            </div>
            <div className="text-sm text-zinc-500 mt-1">הזמנות</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-[14px] p-5 text-center">
            <div className="text-3xl font-bold text-zinc-900" data-testid="total-spent">
              {formatPrice(user.totalSpent)}
            </div>
            <div className="text-sm text-zinc-500 mt-1">סה״כ הוצאות</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-[14px] p-5 text-center">
            <div className="text-3xl font-bold text-zinc-900" data-testid="last-order-date">
              {user.lastOrderDate ? formatDate(user.lastOrderDate) : '-'}
            </div>
            <div className="text-sm text-zinc-500 mt-1">הזמנה אחרונה</div>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-10 mb-6">
        <div className="bg-white border border-zinc-200 rounded-[16px] p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            היסטוריית הזמנות
          </h2>
          {user.orders.length === 0 ? (
            <p className="text-zinc-500 text-center py-4">אין הזמנות</p>
          ) : (
            <div data-testid="orders-table" className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 text-sm text-zinc-500">
                    <th className="text-right py-3 font-medium">מספר הזמנה</th>
                    <th className="text-right py-3 font-medium">סטטוס</th>
                    <th className="text-right py-3 font-medium">תאריך</th>
                    <th className="text-right py-3 font-medium">סכום</th>
                  </tr>
                </thead>
                <tbody>
                  {user.orders.map((order: OrderSummary) => (
                    <tr
                      key={order.id}
                      data-testid={`order-row-${order.id}`}
                      onClick={() => handleOrderClick(order.id)}
                      className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer"
                    >
                      <td className="py-3 font-medium text-zinc-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            STATUS_CONFIG[order.status]?.color || 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {STATUS_CONFIG[order.status]?.label || order.status}
                        </span>
                      </td>
                      <td className="py-3 text-zinc-600">{formatDate(order.createdAt)}</td>
                      <td className="py-3 font-medium text-zinc-900">{formatPrice(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Addresses */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-10 pb-10">
        <div className="bg-white border border-zinc-200 rounded-[16px] p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            כתובות שמורות
          </h2>
          {user.addresses.length === 0 ? (
            <p className="text-zinc-500 text-center py-4">אין כתובות שמורות</p>
          ) : (
            <div data-testid="addresses-section" className="grid gap-3">
              {user.addresses.map((address: Address) => (
                <div
                  key={address.id}
                  data-testid={`address-card-${address.id}`}
                  className="border border-zinc-200 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-zinc-900">{address.name}</span>
                    {address.isDefault && (
                      <span
                        data-testid="default-badge"
                        className="px-2 py-0.5 rounded text-xs bg-violet-100 text-violet-700"
                      >
                        ברירת מחדל
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-600">
                    {address.street}, {address.city} {address.postalCode}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          data-testid="confirm-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-zinc-900 mb-3">
              אישור פעולה
            </h3>
            <p className="text-zinc-600 mb-6">
              {confirmAction === 'role' && confirmValue === true && 'האם להפוך את המשתמש למנהל?'}
              {confirmAction === 'role' && confirmValue === false && 'האם להסיר את הרשאות המנהל?'}
              {confirmAction === 'status' && confirmValue === 'inactive' && 'האם להשבית את החשבון? המשתמש יתנתק מכל המכשירים.'}
              {confirmAction === 'status' && confirmValue === 'active' && 'האם להפעיל מחדש את החשבון?'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelAction}
                className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-200"
              >
                ביטול
              </button>
              <button
                onClick={handleConfirmAction}
                data-testid="confirm-button"
                className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700"
              >
                אישור
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
