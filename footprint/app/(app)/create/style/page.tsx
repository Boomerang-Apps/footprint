'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, X, Sparkles, Check, Zap, Droplet, Pen, Brush, Heart, Film, Sun, AlertCircle, RefreshCw, RotateCcw, Maximize2 } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import type { StyleType } from '@/types';

interface StyleOption {
  id: StyleType;
  name: string;
  nameHe: string;
  icon: React.ElementType;
  gradient: string;
  badge?: 'popular' | 'new';
}

const STYLES: StyleOption[] = [
  {
    id: 'pop_art',
    name: 'Pop Art',
    nameHe: 'פופ ארט',
    icon: Zap,
    gradient: 'from-violet-500 to-pink-500',
    badge: 'popular',
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    nameHe: 'צבעי מים',
    icon: Droplet,
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'line_art',
    name: 'Line Art',
    nameHe: 'ציור קווי',
    icon: Pen,
    gradient: 'from-gray-500 to-gray-400',
  },
  {
    id: 'oil_painting',
    name: 'Oil Painting',
    nameHe: 'ציור שמן',
    icon: Brush,
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    id: 'romantic',
    name: 'Romantic',
    nameHe: 'רומנטי',
    icon: Heart,
    gradient: 'from-pink-500 to-pink-400',
    badge: 'new',
  },
  {
    id: 'comic_book',
    name: 'Comic Book',
    nameHe: 'קומיקס',
    icon: Zap,
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    nameHe: 'וינטג׳',
    icon: Film,
    gradient: 'from-amber-800 to-amber-700',
  },
  {
    id: 'original',
    name: 'Original Enhanced',
    nameHe: 'מקורי משופר',
    icon: Sun,
    gradient: 'from-emerald-500 to-emerald-400',
  },
];

const STEPS = [
  { id: 'upload', label: 'העלאה' },
  { id: 'style', label: 'סגנון' },
  { id: 'tweak', label: 'עריכה' },
  { id: 'customize', label: 'התאמה' },
  { id: 'payment', label: 'תשלום' },
];

export default function StylePage() {
  const router = useRouter();
  const {
    originalImage,
    selectedStyle,
    setSelectedStyle,
    setStep,
    transformedImage,
    setTransformedImage,
    isTransforming,
    setIsTransforming,
  } = useOrderStore();

  // Local state for transform error and pending style for retry
  const [transformError, setTransformError] = useState<string | null>(null);
  const [pendingStyle, setPendingStyle] = useState<{ id: StyleType; nameHe: string } | null>(null);

  // Legacy state for backward compatibility with existing tests
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStyle, setProcessingStyle] = useState<string | null>(null);

  // Fullscreen modal state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Redirect to upload if no image
  useEffect(() => {
    if (!originalImage) {
      router.push('/create');
    }
  }, [originalImage, router]);

  // Set current step on mount
  useEffect(() => {
    setStep('style');
  }, [setStep]);

  // Transform image using AI API
  const transformImage = useCallback(async (styleId: StyleType, styleNameHe: string) => {
    setSelectedStyle(styleId);
    setIsTransforming(true);
    setTransformError(null);
    setPendingStyle({ id: styleId, nameHe: styleNameHe });

    // Also set legacy state for existing tests
    setIsProcessing(true);
    setProcessingStyle(styleNameHe);

    try {
      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: originalImage,
          style: styleId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transform failed');
      }

      // Store transformed image URL
      setTransformedImage(data.transformedUrl);
      setTransformError(null);
      setPendingStyle(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'שגיאה בעיבוד התמונה';
      setTransformError(message);
    } finally {
      setIsTransforming(false);
      setIsProcessing(false);
      setProcessingStyle(null);
    }
  }, [originalImage, setSelectedStyle, setTransformedImage, setIsTransforming]);

  // Retry transform with pending style
  const handleRetry = useCallback(() => {
    if (pendingStyle) {
      transformImage(pendingStyle.id, pendingStyle.nameHe);
    }
  }, [pendingStyle, transformImage]);

  const handleStyleSelect = useCallback((styleId: StyleType, styleNameHe: string) => {
    transformImage(styleId, styleNameHe);
  }, [transformImage]);

  const handleContinue = useCallback(() => {
    if (!isTransforming) {
      setStep('tweak');
      router.push('/create/tweak');
    }
  }, [isTransforming, setStep, router]);

  const handleBack = useCallback(() => {
    setStep('upload');
    router.push('/create');
  }, [setStep, router]);

  // Reset to original image (clear transformation)
  const handleResetToOriginal = useCallback(() => {
    setTransformedImage(null);
    setSelectedStyle('original');
    setTransformError(null);
  }, [setTransformedImage, setSelectedStyle]);

  // Toggle fullscreen modal
  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  if (!originalImage) {
    return null;
  }

  const currentStyle = STYLES.find(s => s.id === selectedStyle) || STYLES[0];

  return (
    <main className="min-h-screen bg-zinc-50" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center text-zinc-600 rounded-xl"
            aria-label="חזרה"
          >
            <ArrowRight className="w-6 h-6" />
          </button>

          <h1 className="text-lg font-semibold text-zinc-900">בחירת סגנון</h1>

          <div className="w-10" />
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-zinc-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Track */}
          <div className="h-1 bg-zinc-200 rounded-full mb-3">
            <div
              data-testid="progress-fill"
              className="h-full bg-gradient-to-l from-purple-600 to-pink-500 rounded-full transition-all"
              style={{ width: '40%' }}
            />
          </div>

          {/* Steps */}
          <div className="flex justify-between">
            {STEPS.map((step, i) => {
              const isCompleted = i < 1; // Only upload is completed
              const isActive = i === 1; // Style is active
              return (
                <div
                  key={step.id}
                  data-step={step.id}
                  data-completed={isCompleted ? 'true' : 'false'}
                  data-active={isActive ? 'true' : 'false'}
                  className="flex items-center gap-1.5"
                >
                  <div className={`
                    w-2 h-2 rounded-full
                    ${isCompleted ? 'bg-emerald-500' : isActive ? 'bg-purple-600' : 'bg-zinc-300'}
                  `} />
                  <span className={`
                    text-xs font-medium
                    ${isCompleted ? 'text-emerald-600' : isActive ? 'text-purple-600' : 'text-zinc-400'}
                  `}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-28">
        {/* Preview Section */}
        <div className="py-5 flex justify-center">
          <div className="relative w-full max-w-sm aspect-[4/5] bg-zinc-100 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={transformedImage || originalImage}
              alt="התמונה שלך"
              fill
              className="object-cover"
            />

            {/* AI Processing Overlay */}
            {(isProcessing || isTransforming) && (
              <div
                data-testid="ai-overlay"
                className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 border-3 border-zinc-200 border-t-purple-600 rounded-full animate-spin" />
                <span className="text-sm text-zinc-600 font-medium">
                  מעבד בסגנון {processingStyle || pendingStyle?.nameHe}...
                </span>
              </div>
            )}

            {/* Transform Error Overlay */}
            {transformError && !isTransforming && (
              <div
                data-testid="transform-error"
                className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center gap-4 p-6"
              >
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-red-600" />
                </div>
                <div className="text-center">
                  <p className="text-zinc-900 font-medium mb-1">שגיאה בעיבוד</p>
                  <p className="text-sm text-zinc-500">{transformError}</p>
                </div>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition"
                  aria-label="נסה שוב"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>נסה שוב</span>
                </button>
              </div>
            )}

            {/* Top Left Buttons */}
            <div className="absolute top-3 left-3 flex gap-2">
              {/* Close Button */}
              <button
                onClick={handleBack}
                className="w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-md text-zinc-600 hover:bg-zinc-50 transition"
                aria-label="סגירה"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Right Buttons */}
            <div className="absolute top-3 right-3 flex gap-2">
              {/* Reset to Original Button */}
              {transformedImage && (
                <button
                  onClick={handleResetToOriginal}
                  className="w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-md text-zinc-600 hover:bg-zinc-50 transition"
                  aria-label="חזרה למקור"
                  title="חזרה לתמונה המקורית"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
              {/* Fullscreen Button */}
              <button
                onClick={handleToggleFullscreen}
                className="w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-md text-zinc-600 hover:bg-zinc-50 transition"
                aria-label="מסך מלא"
                title="תצוגת מסך מלא"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>

            {/* Style Badge */}
            <div
              data-testid="style-badge"
              className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-full shadow-md"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-zinc-900">{currentStyle.nameHe}</span>
            </div>
          </div>
        </div>

        {/* Styles Section */}
        <div className="py-5">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-zinc-900 mb-1">בחרו סגנון אמנות</h2>
            <p className="text-sm text-zinc-500">הקישו על סגנון לתצוגה מקדימה בזמן אמת</p>
          </div>

          {/* Horizontal Style Strip */}
          <div
            data-testid="style-strip"
            className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {STYLES.map((style) => {
              const isSelected = selectedStyle === style.id;
              const Icon = style.icon;

              return (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style.id, style.nameHe)}
                  data-selected={isSelected ? 'true' : 'false'}
                  aria-label={style.nameHe}
                  className="flex-shrink-0 flex flex-col items-center gap-2"
                >
                  <div className={`
                    relative w-16 h-16 rounded-2xl flex items-center justify-center
                    bg-gradient-to-br ${style.gradient}
                    ${isSelected ? 'ring-2 ring-purple-600 ring-offset-2' : ''}
                    transition-all active:scale-95
                  `}>
                    <Icon className="w-7 h-7 text-white" />

                    {/* Badge */}
                    {style.badge === 'popular' && (
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-pink-500 text-white text-[8px] font-bold rounded whitespace-nowrap">
                        פופולרי
                      </span>
                    )}
                    {style.badge === 'new' && (
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-pink-500 text-white text-[8px] font-bold rounded whitespace-nowrap">
                        חדש
                      </span>
                    )}

                    {/* Selection Check */}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  <span className={`
                    text-xs font-medium text-center max-w-[65px]
                    ${isSelected ? 'text-purple-600' : 'text-zinc-600'}
                  `}>
                    {style.nameHe}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Free Preview Notice */}
          <div className="mt-4 p-3 bg-purple-50 rounded-xl text-center flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-700 font-medium">תצוגה מקדימה חינם ללא הגבלה</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-3 pb-safe">
        <div className="max-w-4xl mx-auto flex gap-3">
          <button
            onClick={handleBack}
            className="flex-1 py-3.5 px-5 rounded-xl border-2 border-zinc-200 font-semibold text-zinc-700 hover:bg-zinc-50 transition"
          >
            חזרה
          </button>

          <button
            onClick={handleContinue}
            disabled={isTransforming}
            className={`
              flex-[2] py-3.5 px-5 rounded-xl font-semibold shadow-md transition flex items-center justify-center gap-2
              ${isTransforming
                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90'}
            `}
          >
            <span>אהבתי! המשך</span>
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
        </div>
      </div>

      {/* Fullscreen Modal with Watermark */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={handleToggleFullscreen}
        >
          {/* Close Button */}
          <button
            onClick={handleToggleFullscreen}
            className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center bg-white/10 rounded-full text-white hover:bg-white/20 transition z-10"
            aria-label="סגירה"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Container */}
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] m-4">
            <Image
              src={transformedImage || originalImage}
              alt="התמונה שלך"
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Watermark Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-20 opacity-20 rotate-[-25deg] scale-150">
                {[...Array(20)].map((_, i) => (
                  <span
                    key={i}
                    className="text-white text-2xl font-bold whitespace-nowrap select-none"
                  >
                    פוטפרינט
                  </span>
                ))}
              </div>
            </div>

            {/* Style Badge in Fullscreen */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-4 py-2.5 bg-white/90 rounded-full shadow-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-base font-semibold text-zinc-900">{currentStyle.nameHe}</span>
            </div>

            {/* Preview Notice */}
            <div className="absolute bottom-4 left-4 px-4 py-2.5 bg-amber-500/90 rounded-full text-white text-sm font-medium">
              תצוגה מקדימה בלבד
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
