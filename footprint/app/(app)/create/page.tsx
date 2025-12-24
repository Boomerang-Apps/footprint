'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import DropZone from '@/components/upload/DropZone';

export default function CreatePage() {
  const router = useRouter();
  const { setStep } = useOrderStore();

  const handleUploadComplete = useCallback(() => {
    setStep('style');
    router.push('/create/style');
  }, [setStep, router]);

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>חזרה</span>
          </button>

          <div className="flex items-center gap-2 text-zinc-900">
            <Sparkles className="w-5 h-5 text-brand-purple" />
            <span className="font-semibold">יצירת הזמנה</span>
          </div>

          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            {['העלאה', 'סגנון', 'התאמה', 'תשלום'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${i === 0 ? 'bg-brand-purple text-white' : 'bg-zinc-100 text-zinc-500'}
                `}>
                  {i + 1}
                </div>
                <span className={`text-sm ${i === 0 ? 'text-zinc-900' : 'text-zinc-500'}`}>
                  {step}
                </span>
                {i < 3 && <div className="w-8 h-px bg-zinc-200" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3 text-zinc-900">העלו תמונה</h1>
          <p className="text-zinc-500">
            בחרו תמונה מהגלריה שלכם להפיכה לאמנות
          </p>
        </div>

        {/* Upload Zone */}
        <DropZone onUploadComplete={handleUploadComplete} />

        {/* Tips */}
        <div className="mt-8 p-6 bg-zinc-50 rounded-xl border border-zinc-200">
          <h4 className="font-semibold mb-3 text-sm text-zinc-900">טיפים לתמונה מושלמת:</h4>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li className="flex items-start gap-2">
              <span className="text-brand-purple">•</span>
              <span>בחרו תמונה באיכות גבוהה ותאורה טובה</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-purple">•</span>
              <span>פנים ברורות עובדות הכי טוב לפורטרטים</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-purple">•</span>
              <span>רקע פשוט מדגיש את הנושא המרכזי</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
