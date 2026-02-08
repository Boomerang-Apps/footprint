'use client';

/**
 * Admin Order Detail Page
 *
 * View and manage individual order details.
 */

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Package,
  Truck,
  Download,
  Printer,
  MapPin,
  User,
  Mail,
  Phone,
  Gift,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { useAdminOrder, useUpdateOrderStatus } from '@/hooks/useAdminOrder';
import { type FulfillmentStatus } from '@/lib/fulfillment/status-transitions';
import { logger } from '@/lib/logger';

const STATUS_LABELS: Record<FulfillmentStatus, string> = {
  pending: 'ממתין',
  printing: 'בהדפסה',
  ready_to_ship: 'מוכן למשלוח',
  shipped: 'נשלח',
  delivered: 'נמסר',
  cancelled: 'בוטל',
};

const STATUS_COLORS: Record<FulfillmentStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  printing: 'bg-blue-100 text-blue-700 border-blue-200',
  ready_to_ship: 'bg-violet-100 text-violet-700 border-violet-200',
  shipped: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'ממתין לתשלום',
  paid: 'שולם',
  refunded: 'הוחזר',
  failed: 'נכשל',
};

const STATUS_OPTIONS: FulfillmentStatus[] = [
  'pending',
  'printing',
  'ready_to_ship',
  'shipped',
  'delivered',
  'cancelled',
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(amount: number): string {
  return `₪${amount.toLocaleString('he-IL')}`;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.id as string) || '';
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { order, isLoading, isError, refetch } = useAdminOrder(orderId);
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (newStatus: FulfillmentStatus) => {
    setShowStatusMenu(false);
    try {
      await updateStatus.mutateAsync({ orderId, status: newStatus });
    } catch (error) {
      logger.error('Failed to update order status', error);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadPrintFiles = () => {
    // Trigger bulk download for this order
    window.open(`/api/admin/orders/bulk-download?orderIds=${orderId}`, '_blank');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-3 border-zinc-900 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-zinc-500">טוען פרטי הזמנה...</p>
        </div>
      </main>
    );
  }

  if (isError || !order) {
    return (
      <main className="min-h-screen bg-zinc-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-zinc-900 font-medium mb-2">שגיאה בטעינת ההזמנה</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm"
          >
            נסה שוב
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-600 hover:bg-zinc-200"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
                הזמנה {order.orderNumber}
              </h1>
              <p className="text-sm text-zinc-500">
                נוצרה ב-{formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadPrintFiles}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">הורד קבצי הדפסה</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border ${STATUS_COLORS[order.status]}`}
                >
                  {STATUS_LABELS[order.status]}
                </button>
                {showStatusMenu && (
                  <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg z-10 overflow-hidden">
                    {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={status === order.status}
                        className={`w-full px-4 py-2.5 text-right text-sm hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                          status === order.status ? 'bg-zinc-100' : ''
                        }`}
                      >
                        {STATUS_LABELS[status]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100">
                <h2 className="text-lg font-semibold text-zinc-900">
                  פריטים ({order.itemCount})
                </h2>
              </div>
              <div className="divide-y divide-zinc-100">
                {order.items.map((item) => (
                  <div key={item.id} className="p-5 flex gap-4">
                    <div className="w-20 h-20 rounded-lg bg-zinc-100 overflow-hidden flex-shrink-0">
                      {item.thumbnailUrl ? (
                        <Image
                          src={item.thumbnailUrl}
                          alt=""
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-zinc-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-zinc-900">
                            {item.productName}
                          </h3>
                          <p className="text-sm text-zinc-500 mt-0.5">
                            סגנון: {item.styleName}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-zinc-100 rounded text-xs text-zinc-600">
                              {item.size}
                            </span>
                            <span className="px-2 py-0.5 bg-zinc-100 rounded text-xs text-zinc-600">
                              {item.paperType}
                            </span>
                            {item.frameType && (
                              <span className="px-2 py-0.5 bg-zinc-100 rounded text-xs text-zinc-600">
                                מסגרת {item.frameType}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-zinc-900">
                            {formatPrice(item.price)}
                          </div>
                          <div className="text-sm text-zinc-500">
                            x{item.quantity}
                          </div>
                        </div>
                      </div>
                      {item.printFileUrl && (
                        <div className="mt-3 flex gap-2">
                          <a
                            href={item.printFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800"
                          >
                            <Download className="w-3.5 h-3.5" />
                            קובץ הדפסה
                          </a>
                          {item.originalImageUrl && (
                            <a
                              href={item.originalImageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-medium hover:bg-zinc-200"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              מקורי
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Info */}
            {order.shippingAddress && (
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-zinc-400" />
                    כתובת למשלוח
                  </h2>
                </div>
                <div className="p-5">
                  <div className="space-y-1 text-zinc-700">
                    <p className="font-medium">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.street}</p>
                    {order.shippingAddress.street2 && (
                      <p>{order.shippingAddress.street2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    <p className="flex items-center gap-1 mt-2">
                      <Phone className="w-4 h-4 text-zinc-400" />
                      {order.shippingAddress.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tracking */}
            {order.trackingNumber && (
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-100">
                  <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-zinc-400" />
                    מעקב משלוח
                  </h2>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-zinc-500">מספר מעקב</p>
                      <p className="font-mono font-medium text-zinc-900">
                        {order.trackingNumber}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(order.trackingNumber!, 'tracking')}
                      className="p-2 bg-zinc-100 rounded-lg text-zinc-600 hover:bg-zinc-200"
                    >
                      {copiedField === 'tracking' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Gift Info */}
            {order.isGift && (
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-100">
                  <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-pink-500" />
                    הזמנה כמתנה
                  </h2>
                </div>
                <div className="p-5">
                  {order.giftMessage ? (
                    <div className="bg-pink-50 border border-pink-100 rounded-xl p-4">
                      <p className="text-sm text-zinc-700 italic">
                        &ldquo;{order.giftMessage}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">ללא הודעה</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100">
                <h2 className="text-lg font-semibold text-zinc-900">סיכום</h2>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">סכום ביניים</span>
                  <span className="text-zinc-900">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">משלוח</span>
                  <span className="text-zinc-900">{formatPrice(order.shippingCost)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">
                      הנחה {order.discountCode && `(${order.discountCode})`}
                    </span>
                    <span className="text-green-600">-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-zinc-100 flex justify-between">
                  <span className="font-semibold text-zinc-900">סה״כ</span>
                  <span className="font-bold text-xl text-zinc-900">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100">
                <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-zinc-400" />
                  תשלום
                </h2>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  {order.paymentStatus === 'paid' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-600" />
                  )}
                  <span className="font-medium text-zinc-900">
                    {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                  </span>
                </div>
                {order.paidAt && (
                  <p className="text-sm text-zinc-500 mt-1">
                    {formatDate(order.paidAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100">
                <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-zinc-400" />
                  לקוח
                </h2>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <p className="font-medium text-zinc-900">
                    {order.customerName || 'אורח'}
                  </p>
                </div>
                {order.customerEmail && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-zinc-400" />
                    <a
                      href={`mailto:${order.customerEmail}`}
                      className="text-blue-600 hover:underline"
                    >
                      {order.customerEmail}
                    </a>
                  </div>
                )}
                {order.customerPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-zinc-400" />
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="text-zinc-700"
                    >
                      {order.customerPhone}
                    </a>
                  </div>
                )}
                {order.customerId && (
                  <Link
                    href={`/admin/users/${order.customerId}`}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
                  >
                    צפה בפרופיל
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100">
                <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-zinc-400" />
                  היסטוריה
                </h2>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-zinc-300 mt-2" />
                    <div>
                      <p className="text-sm font-medium text-zinc-900">נוצרה</p>
                      <p className="text-xs text-zinc-500">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  {order.paidAt && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                      <div>
                        <p className="text-sm font-medium text-zinc-900">שולמה</p>
                        <p className="text-xs text-zinc-500">{formatDate(order.paidAt)}</p>
                      </div>
                    </div>
                  )}
                  {order.shippedAt && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      <div>
                        <p className="text-sm font-medium text-zinc-900">נשלחה</p>
                        <p className="text-xs text-zinc-500">{formatDate(order.shippedAt)}</p>
                      </div>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                      <div>
                        <p className="text-sm font-medium text-zinc-900">נמסרה</p>
                        <p className="text-xs text-zinc-500">{formatDate(order.deliveredAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
