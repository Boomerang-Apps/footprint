'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function IframeCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams?.get('status');
    const pageRequestUid = searchParams?.get('page_request_uid') || '';
    const orderId = searchParams?.get('orderId') || '';
    const orderNumber = searchParams?.get('orderNumber') || '';

    const success = status === 'success';

    // Post message to parent window (checkout page)
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'PAYPLUS_PAYMENT_RESULT',
          success,
          pageRequestUid,
          orderId,
          orderNumber,
        },
        window.location.origin
      );
    }
  }, [searchParams]);

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-white"
    >
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-zinc-500">מעבד תשלום...</p>
      </div>
    </div>
  );
}

export default function IframeCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <IframeCallbackContent />
    </Suspense>
  );
}
