'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Check, Sparkles, Gift, MessageSquare, Frame, FileText, Maximize } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import type { SizeType, PaperType, FrameType } from '@/types';

const sizes: { id: SizeType; name: string; dimensions: string; price: number; popular?: boolean }[] = [
  { id: 'A5', name: 'A5', dimensions: '14.8 × 21 ס״מ', price: 89 },
  { id: 'A4', name: 'A4', dimensions: '21 × 29.7 ס״מ', price: 129, popular: true },
  { id: 'A3', name: 'A3', dimensions: '29.7 × 42 ס״מ', price: 179 },
  { id: 'A2', name: 'A2', dimensions: '42 × 59.4 ס״מ', price: 249 },
];

const papers: { id: PaperType; name: string; description: string; modifier: number }[] = [
  { id: 'matte', name: 'מט פיין ארט', description: 'נייר איכותי ללא ברק', modifier: 0 },
  { id: 'glossy', name: 'מבריק', description: 'צבעים חיים עם ברק', modifier: 20 },
  { id: 'canvas', name: 'קנבס', description: 'מרקם אמנותי אותנטי', modifier: 50 },
];

const frames: { id: FrameType; name: string; color: string; price: number; popular?: boolean }[] = [
  { id: 'none', name: 'ללא מסגרת', color: 'transparent', price: 0 },
  { id: 'black', name: 'שחור', color: '#1a1a1a', price: 79, popular: true },
  { id: 'white', name: 'לבן', color: '#ffffff', price: 79 },
  { id: 'oak', name: 'אלון טבעי', color: '#c4a574', price: 99 },
];

export default function CustomizePage() {
  const router = useRouter();
  const {
    originalImage,
    selectedStyle,
    size,
    paperType,
    frameType,
    isGift,
    giftMessage,
    setSize,
    setPaperType,
    setFrameType,
    setIsGift,
    setGiftMessage,
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
    setStep('style');
    router.push('/create/style');
  };

  if (!originalImage) {
    return null;
  }

  // Calculate price
  const basePrice = sizes.find(s => s.id === size)?.price || 0;
  const paperModifier = papers.find(p => p.id === paperType)?.modifier || 0;
  const framePrice = frames.find(f => f.id === frameType)?.price || 0;
  const total = basePrice + paperModifier + framePrice;

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>חזרה</span>
          </button>

          <div className="flex items-center gap-2 text-zinc-900">
            <Sparkles className="w-5 h-5 text-brand-purple" />
            <span className="font-semibold">התאמה אישית</span>
          </div>

          <div className="w-20" />
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            {['העלאה', 'סגנון', 'התאמה', 'תשלום'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${i <= 2 ? 'bg-brand-purple text-white' : 'bg-zinc-100 text-zinc-500'}
                `}>
                  {i < 2 ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm ${i <= 2 ? 'text-zinc-900' : 'text-zinc-500'}`}>
                  {step}
                </span>
                {i < 3 && <div className={`w-8 h-px ${i < 2 ? 'bg-brand-purple' : 'bg-zinc-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview */}
          <div className="order-2 lg:order-1">
            <div className="sticky top-32">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">תצוגה מקדימה</h2>
              <div className="relative">
                {/* Frame preview */}
                <div
                  className={`
                    relative aspect-[4/3] rounded-lg overflow-hidden
                    ${frameType !== 'none' ? 'p-3' : ''}
                  `}
                  style={{
                    backgroundColor: frameType !== 'none' ? frames.find(f => f.id === frameType)?.color : 'transparent',
                    boxShadow: frameType !== 'none' ? '0 8px 32px rgba(0,0,0,0.15)' : 'none',
                  }}
                >
                  <div className="relative w-full h-full rounded overflow-hidden bg-zinc-100">
                    <Image
                      src={originalImage}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="mt-6 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                <h3 className="font-semibold text-zinc-900 mb-3">סיכום מחיר</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">הדפסה {size}</span>
                    <span className="text-zinc-900">₪{basePrice}</span>
                  </div>
                  {paperModifier > 0 && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">נייר {papers.find(p => p.id === paperType)?.name}</span>
                      <span className="text-zinc-900">+₪{paperModifier}</span>
                    </div>
                  )}
                  {framePrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">מסגרת {frames.find(f => f.id === frameType)?.name}</span>
                      <span className="text-zinc-900">+₪{framePrice}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-zinc-200 flex justify-between font-semibold">
                    <span className="text-zinc-900">סה״כ</span>
                    <span className="text-brand-purple text-lg">₪{total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="order-1 lg:order-2 space-y-8">
            {/* Size Selection */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Maximize className="w-5 h-5 text-brand-purple" />
                <h2 className="text-lg font-semibold text-zinc-900">גודל הדפסה</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSize(s.id)}
                    className={`
                      relative p-4 rounded-xl border-2 text-right transition-all
                      ${size === s.id
                        ? 'border-brand-purple bg-brand-purple/5'
                        : 'border-zinc-200 hover:border-zinc-300'
                      }
                    `}
                  >
                    {s.popular && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-brand-purple text-white text-[10px] font-semibold rounded-full">
                        פופולרי
                      </span>
                    )}
                    {size === s.id && (
                      <div className="absolute top-2 left-2 w-5 h-5 bg-brand-purple rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="text-lg font-bold text-zinc-900">{s.name}</div>
                    <div className="text-sm text-zinc-500">{s.dimensions}</div>
                    <div className="text-sm font-semibold text-brand-purple mt-1">₪{s.price}</div>
                  </button>
                ))}
              </div>
            </section>

            {/* Paper Selection */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-brand-purple" />
                <h2 className="text-lg font-semibold text-zinc-900">סוג נייר</h2>
              </div>
              <div className="space-y-3">
                {papers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPaperType(p.id)}
                    className={`
                      w-full p-4 rounded-xl border-2 text-right transition-all flex items-center justify-between
                      ${paperType === p.id
                        ? 'border-brand-purple bg-brand-purple/5'
                        : 'border-zinc-200 hover:border-zinc-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {paperType === p.id && (
                        <div className="w-5 h-5 bg-brand-purple rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-zinc-900">{p.name}</div>
                        <div className="text-sm text-zinc-500">{p.description}</div>
                      </div>
                    </div>
                    {p.modifier > 0 && (
                      <span className="text-sm font-medium text-zinc-500">+₪{p.modifier}</span>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Frame Selection */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Frame className="w-5 h-5 text-brand-purple" />
                <h2 className="text-lg font-semibold text-zinc-900">מסגרת</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {frames.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFrameType(f.id)}
                    className={`
                      relative p-4 rounded-xl border-2 text-right transition-all
                      ${frameType === f.id
                        ? 'border-brand-purple bg-brand-purple/5'
                        : 'border-zinc-200 hover:border-zinc-300'
                      }
                    `}
                  >
                    {f.popular && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-brand-purple text-white text-[10px] font-semibold rounded-full">
                        פופולרי
                      </span>
                    )}
                    {frameType === f.id && (
                      <div className="absolute top-2 left-2 w-5 h-5 bg-brand-purple rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      {f.id !== 'none' && (
                        <div
                          className="w-6 h-6 rounded border border-zinc-300"
                          style={{ backgroundColor: f.color }}
                        />
                      )}
                      <span className="font-semibold text-zinc-900">{f.name}</span>
                    </div>
                    <div className="text-sm font-medium text-brand-purple">
                      {f.price > 0 ? `+₪${f.price}` : 'חינם'}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Gift Option */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-brand-purple" />
                <h2 className="text-lg font-semibold text-zinc-900">אפשרויות מתנה</h2>
              </div>
              <button
                onClick={() => setIsGift(!isGift)}
                className={`
                  w-full p-4 rounded-xl border-2 text-right transition-all flex items-center justify-between
                  ${isGift
                    ? 'border-brand-purple bg-brand-purple/5'
                    : 'border-zinc-200 hover:border-zinc-300'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                    ${isGift ? 'bg-brand-purple border-brand-purple' : 'border-zinc-300'}
                  `}>
                    {isGift && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900">זו מתנה</div>
                    <div className="text-sm text-zinc-500">הוסיפו הודעה אישית ואריזת מתנה</div>
                  </div>
                </div>
              </button>

              {isGift && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline ml-1" />
                    הודעה אישית (עד 150 תווים)
                  </label>
                  <textarea
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value.slice(0, 150))}
                    placeholder="כתבו הודעה אישית למקבל המתנה..."
                    className="input min-h-[100px] resize-none"
                    maxLength={150}
                  />
                  <div className="text-xs text-zinc-500 mt-1 text-left">
                    {giftMessage.length}/150
                  </div>
                </div>
              )}
            </section>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="btn btn-primary w-full py-4 text-base"
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
