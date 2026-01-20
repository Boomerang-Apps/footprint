'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import RoomPreview from '@/components/mockup/RoomPreview';
import type { SizeType, PaperType, FrameType } from '@/types';

// Prices matching mockup 03-customize.html
const sizes: { id: SizeType; name: string; dimensions: string; price: number; popular?: boolean }[] = [
  { id: 'A5', name: 'A5', dimensions: '14.8×21 ס״מ', price: 89 },
  { id: 'A4', name: 'A4', dimensions: '21×29.7 ס״מ', price: 149, popular: true },
  { id: 'A3', name: 'A3', dimensions: '29.7×42 ס״מ', price: 249 },
  { id: 'A2', name: 'A2', dimensions: '42×59.4 ס״מ', price: 379 },
];

const papers: { id: PaperType; name: string; englishName: string; description: string; extraPrice: number }[] = [
  { id: 'matte', name: 'נייר פיין ארט מט', englishName: 'Fine Art Matte', description: 'איכות מוזיאון', extraPrice: 0 },
  { id: 'glossy', name: 'נייר צילום מבריק', englishName: 'Glossy Photo', description: 'צבעים עזים', extraPrice: 20 },
  { id: 'canvas', name: 'קנבס', englishName: 'Canvas Texture', description: 'מראה ציורי', extraPrice: 40 },
];

const frames: { id: FrameType; name: string; color: string; extraPrice: number }[] = [
  { id: 'none', name: 'ללא', color: 'transparent', extraPrice: 0 },
  { id: 'black', name: 'שחור', color: '#1a1a1a', extraPrice: 60 },
  { id: 'white', name: 'לבן', color: '#ffffff', extraPrice: 60 },
  { id: 'oak', name: 'אלון', color: '#daa520', extraPrice: 80 },
];

const progressSteps = [
  { key: 'upload', label: 'העלאה' },
  { key: 'style', label: 'סגנון' },
  { key: 'tweak', label: 'עריכה' },
  { key: 'customize', label: 'התאמה' },
  { key: 'checkout', label: 'תשלום' },
];

export default function CustomizePage() {
  const router = useRouter();
  const {
    originalImage,
    size,
    paperType,
    frameType,
    setSize,
    setPaperType,
    setFrameType,
    setStep,
  } = useOrderStore();

  // Redirect if no image
  useEffect(() => {
    if (!originalImage) {
      router.push('/create');
    }
  }, [originalImage, router]);

  const handleContinue = () => {
    setStep('checkout');
    router.push('/create/checkout');
  };

  const handleBack = () => {
    setStep('tweak');
    router.push('/create/tweak');
  };

  if (!originalImage) {
    return null;
  }

  // Calculate price
  const sizePrice = sizes.find(s => s.id === size)?.price || 0;
  const paperPrice = papers.find(p => p.id === paperType)?.extraPrice || 0;
  const framePrice = frames.find(f => f.id === frameType)?.extraPrice || 0;
  const total = sizePrice + paperPrice + framePrice;

  const currentSize = sizes.find(s => s.id === size);
  const currentFrame = frames.find(f => f.id === frameType);

  return (
    <main className="min-h-screen bg-zinc-50 pb-40">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center text-zinc-600 rounded-xl"
            aria-label="חזרה"
          >
            <ArrowRight className="w-6 h-6" />
          </button>

          <h1 className="text-[17px] font-semibold text-zinc-900">התאמה אישית</h1>

          <div className="w-10" />
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-zinc-200 py-4 px-4">
        <div className="max-w-xl mx-auto">
          {/* Progress fill bar */}
          <div className="h-1 bg-zinc-200 rounded-full overflow-hidden mb-3">
            <div
              data-testid="progress-fill"
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
              style={{ width: '80%' }}
            />
          </div>

          {/* Step labels */}
          <div className="flex justify-between">
            {progressSteps.map((step, i) => {
              const isCompleted = i < 3; // Steps 0, 1, 2 are completed (upload, style, tweak)
              const isActive = i === 3; // Step 3 (customize) is active

              return (
                <div
                  key={step.key}
                  data-step={step.key}
                  data-completed={isCompleted ? 'true' : undefined}
                  data-active={isActive ? 'true' : undefined}
                  className="flex items-center gap-1"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-500'
                        : isActive
                        ? 'bg-violet-500'
                        : 'bg-zinc-300'
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      isCompleted
                        ? 'text-emerald-500'
                        : isActive
                        ? 'text-violet-500 font-semibold'
                        : 'text-zinc-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-[400px_1fr]">
        {/* Preview Section */}
        <div className="bg-white border-b lg:border-b-0 lg:border-l border-zinc-200 p-5 lg:sticky lg:top-[70px] lg:h-fit">
          <div data-testid="mockup-container">
            <RoomPreview
              imageUrl={originalImage}
              size={size}
              frameType={frameType}
            />
          </div>
          <div data-testid="size-label" className="text-center mt-3 text-sm text-zinc-500">
            {currentSize?.name} • {currentSize?.dimensions}
          </div>
        </div>

        {/* Options Section */}
        <div className="p-5 space-y-6">
          {/* Size Selection */}
          <section>
            <h2 className="text-base font-semibold text-zinc-900 mb-3">גודל הדפסה</h2>
            <div data-testid="size-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {sizes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSize(s.id)}
                  data-selected={size === s.id ? 'true' : undefined}
                  aria-label={s.name}
                  className={`
                    relative p-3.5 rounded-xl border-2 text-center transition-all
                    ${size === s.id
                      ? 'border-violet-500 bg-violet-500/5'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }
                  `}
                >
                  {s.popular && (
                    <span className="absolute -top-2 right-3 px-2 py-0.5 bg-violet-500 text-white text-[9px] font-bold rounded-md">
                      פופולרי
                    </span>
                  )}
                  <div className="text-base font-bold text-zinc-900">{s.name}</div>
                  <div className="text-xs text-zinc-500 mb-1">{s.dimensions}</div>
                  <div className="text-sm font-semibold text-violet-500">₪{s.price}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Paper Selection */}
          <section>
            <h2 className="text-base font-semibold text-zinc-900 mb-3">סוג נייר</h2>
            <div className="space-y-2.5">
              {papers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPaperType(p.id)}
                  data-selected={paperType === p.id ? 'true' : undefined}
                  aria-label={p.englishName}
                  className={`
                    w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-right transition-all
                    ${paperType === p.id
                      ? 'border-violet-500 bg-violet-500/5'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }
                  `}
                >
                  {/* Radio circle */}
                  <div
                    className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${paperType === p.id ? 'border-violet-500' : 'border-zinc-300'}
                    `}
                  >
                    {paperType === p.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-zinc-900">{p.englishName}</div>
                    <div className="text-xs text-zinc-500">{p.description}</div>
                  </div>

                  {/* Price */}
                  <span
                    className={`text-sm font-medium ${
                      p.extraPrice === 0 ? 'text-emerald-500' : 'text-zinc-600'
                    }`}
                  >
                    {p.extraPrice === 0 ? 'כלול' : `+₪${p.extraPrice}`}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Frame Selection */}
          <section>
            <h2 className="text-base font-semibold text-zinc-900 mb-3">מסגרת</h2>
            <div data-testid="frame-grid" className="grid grid-cols-4 gap-2.5">
              {frames.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFrameType(f.id)}
                  data-selected={frameType === f.id ? 'true' : undefined}
                  aria-label={f.name}
                  className={`
                    p-3 rounded-xl border-2 text-center transition-all
                    ${frameType === f.id
                      ? 'border-violet-500 bg-violet-500/5'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }
                  `}
                >
                  {/* Frame preview */}
                  <div
                    data-testid={f.id !== 'none' ? `frame-preview-${f.id}` : undefined}
                    className={`
                      w-10 h-10 mx-auto mb-2 rounded flex items-center justify-center
                      ${f.id === 'none'
                        ? 'bg-zinc-100 border-2 border-dashed border-zinc-300'
                        : ''
                      }
                      ${f.id === 'white' ? 'border border-zinc-300' : ''}
                    `}
                    style={{
                      backgroundColor: f.id !== 'none' ? f.color : undefined,
                      background: f.id === 'oak' ? 'linear-gradient(135deg, #b8860b, #daa520)' : undefined,
                    }}
                  >
                    {f.id === 'none' && (
                      <span className="text-zinc-400 text-xs">✕</span>
                    )}
                  </div>
                  <div className="text-[11px] font-semibold text-zinc-700">{f.name}</div>
                  <div
                    className={`text-[11px] ${
                      f.extraPrice === 0 ? 'text-emerald-500' : 'text-zinc-500'
                    }`}
                  >
                    {f.extraPrice === 0 ? 'חינם' : `+₪${f.extraPrice}`}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        <div className="max-w-6xl mx-auto">
          {/* Price summary */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-600">סה״כ</span>
            <span data-testid="total-price" className="text-2xl font-bold text-zinc-900">
              ₪{total} <span className="text-sm font-normal text-zinc-500">+ משלוח</span>
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              data-testid="bottom-back-button"
              onClick={handleBack}
              className="w-12 h-12 flex items-center justify-center bg-zinc-100 text-zinc-600 rounded-2xl"
              aria-label="חזרה"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-violet-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg"
            >
              <span>המשך לתשלום</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
