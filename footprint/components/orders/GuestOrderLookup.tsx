'use client';

/**
 * GuestOrderLookup
 *
 * Allows guest users to look up their order status by order number and email.
 * Enables order tracking without requiring account creation.
 *
 * @story AUTH-02
 * @acceptance-criteria AC-009
 */

import { useState, useCallback } from 'react';
import { Search, Package, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { isValidGuestEmail } from '@/lib/auth/guest';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderResult {
  orderNumber: string;
  status: string;
  items: OrderItem[];
  total: number;
  createdAt?: string;
  estimatedDelivery?: string;
}

interface GuestOrderLookupProps {
  /** Called when order is found successfully */
  onOrderFound: (order: OrderResult) => void;
  /** Pre-filled email from localStorage */
  initialEmail?: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'ממתין לאישור',
  processing: 'בהכנה',
  shipped: 'נשלח',
  delivered: 'הגיע',
  cancelled: 'בוטל',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-violet-100 text-violet-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function GuestOrderLookup({
  onOrderFound,
  initialEmail = '',
}: GuestOrderLookupProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  const handleOrderNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderNumber(e.target.value);
    if (error) setError(null);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    const trimmedOrderNumber = orderNumber.trim();
    const trimmedEmail = email.trim();

    if (!trimmedOrderNumber) {
      setError('נא להזין מספר הזמנה');
      return false;
    }

    if (!trimmedEmail) {
      setError('נא להזין כתובת אימייל');
      return false;
    }

    if (!isValidGuestEmail(trimmedEmail)) {
      setError('כתובת אימייל לא תקינה');
      return false;
    }

    return true;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/orders/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: orderNumber.trim(),
            email: email.trim(),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            setError('לא נמצאה הזמנה עם הפרטים הללו');
          } else {
            setError(data.error || 'שגיאה בחיפוש ההזמנה');
          }
          return;
        }

        setOrderResult(data);
        onOrderFound(data);
      } catch {
        setError('שגיאה בחיפוש ההזמנה. נסו שוב.');
      } finally {
        setIsLoading(false);
      }
    },
    [orderNumber, email, onOrderFound]
  );

  const handleNewSearch = () => {
    setOrderResult(null);
    setOrderNumber('');
    setEmail(initialEmail);
    setError(null);
  };

  // Order result view
  if (orderResult) {
    const statusLabel = STATUS_LABELS[orderResult.status] || orderResult.status;
    const statusColor = STATUS_COLORS[orderResult.status] || 'bg-zinc-100 text-zinc-700';

    return (
      <div dir="rtl" className="w-full max-w-md mx-auto">
        <div data-testid="order-result" className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-violet-600" />
              <span className="text-base font-semibold text-zinc-900">{orderResult.orderNumber}</span>
            </div>
            <span
              data-testid="order-status"
              className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>

          {/* Order Items */}
          <div className="p-4 border-b border-zinc-100">
            {orderResult.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-900">{item.name}</span>
                  {item.quantity > 1 && (
                    <span className="text-xs text-zinc-500">x{item.quantity}</span>
                  )}
                </div>
                <span className="text-sm font-medium text-zinc-900">₪{item.price}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="px-4 py-3 bg-zinc-50 flex justify-between items-center">
            <span className="text-sm font-medium text-zinc-700">סה״כ</span>
            <span className="text-lg font-bold text-zinc-900">₪{orderResult.total}</span>
          </div>

          {/* Estimated Delivery */}
          {orderResult.estimatedDelivery && (
            <div className="px-4 py-3 border-t border-zinc-100 text-sm text-zinc-600">
              הגעה משוערת: {orderResult.estimatedDelivery}
            </div>
          )}
        </div>

        {/* New Search Button */}
        <button
          onClick={handleNewSearch}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 text-violet-600 font-medium hover:bg-violet-50 rounded-xl transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>חפש הזמנה אחרת</span>
        </button>
      </div>
    );
  }

  // Search form view
  return (
    <div dir="rtl" className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto mb-3 bg-violet-100 rounded-full flex items-center justify-center">
          <Search className="w-7 h-7 text-violet-600" />
        </div>
        <h3 className="text-xl font-semibold text-zinc-900 mb-1">
          בדוק סטטוס הזמנה
        </h3>
        <p className="text-sm text-zinc-500">
          הזינו את מספר ההזמנה והאימייל כדי לצפות בפרטי ההזמנה
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Number Input */}
        <div>
          <label htmlFor="order-number" className="block text-sm font-medium text-zinc-700 mb-1.5">
            מספר הזמנה
          </label>
          <input
            type="text"
            id="order-number"
            value={orderNumber}
            onChange={handleOrderNumberChange}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-colors disabled:opacity-50"
            placeholder="FP-2026-XXXX"
            autoComplete="off"
          />
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="lookup-email" className="block text-sm font-medium text-zinc-700 mb-1.5">
            אימייל
          </label>
          <input
            type="email"
            id="lookup-email"
            value={email}
            onChange={handleEmailChange}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-colors disabled:opacity-50"
            placeholder="your@email.com"
            autoComplete="email"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>מחפש...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>חפש</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
