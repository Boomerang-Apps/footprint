'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Loader2, ShieldCheck } from 'lucide-react';

interface PaymentModalProps {
  paymentUrl: string;
  onSuccess: (pageRequestUid: string, orderId?: string, orderNumber?: string) => void;
  onFailure: (error: string) => void;
  onClose: () => void;
}

export function PaymentModal({
  paymentUrl,
  onSuccess,
  onFailure,
  onClose,
}: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Validate origin matches our domain
      if (event.origin !== window.location.origin) {
        return;
      }

      const data = event.data;
      if (data?.type !== 'PAYPLUS_PAYMENT_RESULT') {
        return;
      }

      if (data.success) {
        onSuccess(data.pageRequestUid || '', data.orderId || '', data.orderNumber || '');
      } else {
        onFailure('התשלום נכשל. אנא נסו שוב.');
      }
    },
    [onSuccess, onFailure]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    const confirmed = window.confirm(
      'האם אתם בטוחים שברצונכם לבטל את התשלום?'
    );
    if (confirmed) {
      onClose();
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="חלון תשלום"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full h-full sm:w-[500px] sm:h-[650px] sm:max-h-[90vh] sm:rounded-2xl overflow-hidden bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-white">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>תשלום מאובטח באמצעות PayPlus</span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors"
            aria-label="סגור"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 top-[49px] flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-violet-600" />
              <p className="text-sm text-zinc-500">טוען טופס תשלום...</p>
            </div>
          </div>
        )}

        {/* PayPlus iframe */}
        <iframe
          ref={iframeRef}
          src={paymentUrl}
          onLoad={handleIframeLoad}
          className="flex-1 w-full border-0"
          title="PayPlus תשלום מאובטח"
          allow="payment"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
        />
      </div>
    </div>
  );
}
