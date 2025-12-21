'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, ArrowLeft, Sparkles } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import toast from 'react-hot-toast';

export default function CreatePage() {
  const router = useRouter();
  const { setOriginalImage, setStep } = useOrderStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('הקובץ גדול מדי. גודל מקסימלי: 20MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setOriginalImage(previewUrl, file);
    setStep('style');
    router.push('/create/style');
    
    toast.success('התמונה הועלתה בהצלחה!');
  }, [setOriginalImage, setStep, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/heic': ['.heic'],
    },
    maxFiles: 1,
  });

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
        <div
          {...getRootProps()}
          className={`
            card p-12 cursor-pointer transition-all duration-200
            flex flex-col items-center justify-center text-center
            ${isDragActive
              ? 'border-brand-purple bg-brand-purple/5'
              : 'hover:border-zinc-400'
            }
          `}
        >
          <input {...getInputProps()} />

          <div className={`
            w-20 h-20 rounded-2xl mb-6 flex items-center justify-center
            ${isDragActive
              ? 'bg-brand-purple/20 text-brand-purple'
              : 'bg-zinc-100 text-zinc-500'
            }
          `}>
            {isDragActive ? (
              <Image className="w-10 h-10" />
            ) : (
              <Upload className="w-10 h-10" />
            )}
          </div>

          <h3 className="text-xl font-semibold mb-2 text-zinc-900">
            {isDragActive ? 'שחררו כאן' : 'גררו תמונה לכאן'}
          </h3>

          <p className="text-zinc-500 mb-6">
            או לחצו לבחירה מהמכשיר
          </p>

          <button className="btn btn-secondary">
            בחירת תמונה
          </button>

          <p className="text-xs text-zinc-500 mt-6">
            JPG, PNG, HEIC עד 20MB
          </p>
        </div>

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
