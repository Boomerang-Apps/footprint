'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function IframeCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const status = searchParams?.get('status');
    const pageRequestUid = searchParams?.get('page_request_uid') || '';
    const orderId = searchParams?.get('orderId') || '';
    const orderNumber = searchParams?.get('orderNumber') || '';

    const success = status === 'success';

    if (window.parent && window.parent !== window) {
      // Inside iframe — post message to parent (checkout page)
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
    } else {
      // Top-level navigation (PayPlus broke out of iframe via allow-top-navigation)
      if (success) {
        handleTopLevelSuccess(orderId, orderNumber);
      } else {
        // Payment failed — redirect back to checkout
        router.replace('/create/checkout?error=payment_failed');
      }
    }

    async function handleTopLevelSuccess(oid: string, onum: string) {
      if (oid) {
        try {
          // Finalize the pending order (mark paid + trigger emails)
          const res = await fetch(`/api/orders/${oid}/finalize`, {
            method: 'POST',
          });

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            console.error('Finalize failed:', data.error || res.statusText);
          }
        } catch (err) {
          // Non-blocking — order can still be finalized by webhook
          console.error('Finalize request failed:', err);
        }
      }

      // Redirect to complete page with available params
      const params = new URLSearchParams();
      if (oid) params.set('orderId', oid);
      if (onum) params.set('orderNumber', onum);

      const query = params.toString();
      router.replace(`/create/complete${query ? `?${query}` : ''}`);
    }
  }, [searchParams, router]);

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
