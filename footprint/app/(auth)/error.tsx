'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Auth error', error);
  }, [error]);

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-brand-purple/5 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-soft-lg p-8 text-center">
        <div className="h-1 bg-gradient-brand rounded-t-2xl -mt-8 -mx-8 mb-6" />
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">שגיאה בהתחברות</h2>
        <p className="text-zinc-500 mb-6">אירעה שגיאה בתהליך ההתחברות. נסו שוב.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-brand-purple text-white rounded-xl font-medium hover:bg-brand-purple/90 transition-colors"
          >
            נסו שוב
          </button>
          <a
            href="/login"
            className="px-6 py-2.5 border border-zinc-200 text-zinc-700 rounded-xl font-medium hover:bg-zinc-50 transition-colors"
          >
            חזרה להתחברות
          </a>
        </div>
      </div>
    </div>
  );
}
