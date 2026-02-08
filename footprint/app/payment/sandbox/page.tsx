'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

/**
 * Sandbox payment page — shown inside the PaymentModal iframe when
 * NEXT_PUBLIC_USE_MOCK=true. Simulates a PayPlus credit card form
 * so the full checkout UX can be tested locally without real credentials.
 */
function SandboxPaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId') || '';
  const amount = searchParams?.get('amount') || '0';
  const amountILS = (parseInt(amount, 10) / 100).toFixed(2);

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [shouldFail, setShouldFail] = useState(false);

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate processing delay
    setTimeout(() => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: 'PAYPLUS_PAYMENT_RESULT',
            success: !shouldFail,
            pageRequestUid: shouldFail ? '' : `sandbox-${Date.now()}`,
          },
          window.location.origin
        );
      }
    }, 1500);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full mb-3">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            סביבת בדיקה (Sandbox)
          </div>
          <h1 className="text-lg font-bold text-gray-900">תשלום מאובטח</h1>
          <p className="text-2xl font-bold text-violet-600 mt-1">₪{amountILS}</p>
          {orderId && (
            <p className="text-xs text-gray-400 mt-1">הזמנה: {orderId}</p>
          )}
        </div>

        {/* Card Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מספר כרטיס</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="4111 1111 1111 1111"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none tracking-wider"
              dir="ltr"
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תוקף</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="12/26"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                dir="ltr"
                maxLength={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                dir="ltr"
                maxLength={4}
              />
            </div>
          </div>

          {/* Sandbox toggle: simulate failure */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={shouldFail}
              onChange={(e) => setShouldFail(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-xs text-gray-500">סמלץ כשלון תשלום (לבדיקה)</span>
          </label>

          <button
            type="submit"
            disabled={processing}
            className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-pink-500 hover:shadow-lg transition disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>מעבד...</span>
              </>
            ) : (
              <span>שלם ₪{amountILS}</span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          זהו טופס בדיקה. אין חיוב אמיתי.
        </p>
      </div>
    </div>
  );
}

export default function SandboxPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SandboxPaymentContent />
    </Suspense>
  );
}
