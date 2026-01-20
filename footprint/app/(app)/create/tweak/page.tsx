'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowRight,
  X,
  RefreshCw,
  Palette,
  Scissors,
  Eraser,
  Sun,
  Contrast,
  Droplets,
  RotateCw,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useOrderStore, type TweakSettings } from '@/stores/orderStore';

const STEPS = [
  { id: 'upload', label: 'העלאה' },
  { id: 'style', label: 'סגנון' },
  { id: 'tweak', label: 'עריכה' },
  { id: 'customize', label: 'התאמה' },
  { id: 'payment', label: 'תשלום' },
];

type ToolTab = 'color' | 'crop' | 'background';

interface ColorFilter {
  id: TweakSettings['colorFilter'];
  name: string;
  nameHe: string;
  style: string;
}

const COLOR_FILTERS: ColorFilter[] = [
  { id: 'none', name: 'None', nameHe: 'ללא', style: '' },
  { id: 'warm', name: 'Warm', nameHe: 'חם', style: 'sepia(0.3) saturate(1.2)' },
  { id: 'cool', name: 'Cool', nameHe: 'קר', style: 'hue-rotate(20deg) saturate(0.9)' },
  { id: 'vintage', name: 'Vintage', nameHe: 'וינטג׳', style: 'sepia(0.5) contrast(1.1) brightness(0.95)' },
  { id: 'bw', name: 'B&W', nameHe: 'שחור-לבן', style: 'grayscale(1)' },
];

export default function TweakPage() {
  const router = useRouter();
  const {
    originalImage,
    transformedImage,
    setTransformedImage,
    setIsTransforming,
    isTransforming,
    selectedStyle,
    tweakSettings,
    setTweakSettings,
    resetTweakSettings,
    setStep,
  } = useOrderStore();

  const [activeTab, setActiveTab] = useState<ToolTab>('color');
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgError, setBgError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Redirect to upload if no image
  useEffect(() => {
    if (!originalImage) {
      router.push('/create');
    }
  }, [originalImage, router]);

  // Set current step on mount
  useEffect(() => {
    setStep('tweak');
  }, [setStep]);

  // Calculate CSS filter string from tweak settings
  const getFilterStyle = useCallback(() => {
    const { brightness, contrast, saturation, colorFilter } = tweakSettings;
    const filters: string[] = [];

    if (brightness !== 0) {
      filters.push(`brightness(${1 + brightness / 100})`);
    }
    if (contrast !== 0) {
      filters.push(`contrast(${1 + contrast / 100})`);
    }
    if (saturation !== 0) {
      filters.push(`saturate(${1 + saturation / 100})`);
    }

    const filterPreset = COLOR_FILTERS.find(f => f.id === colorFilter);
    if (filterPreset?.style) {
      filters.push(filterPreset.style);
    }

    return filters.join(' ');
  }, [tweakSettings]);

  // Get rotation transform
  const getRotationStyle = useCallback(() => {
    return `rotate(${tweakSettings.rotation}deg)`;
  }, [tweakSettings.rotation]);

  // Regenerate AI transformation
  const handleRegenerate = useCallback(async () => {
    if (!originalImage || isRegenerating) return;

    setIsRegenerating(true);
    setIsTransforming(true);

    try {
      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: originalImage,
          style: selectedStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transform failed');
      }

      setTransformedImage(data.transformedUrl);
      // Reset tweak settings after regeneration
      resetTweakSettings();
    } catch (error) {
      console.error('Regeneration failed:', error);
    } finally {
      setIsRegenerating(false);
      setIsTransforming(false);
    }
  }, [originalImage, selectedStyle, isRegenerating, setTransformedImage, setIsTransforming, resetTweakSettings]);

  // Remove background
  const handleRemoveBackground = useCallback(async () => {
    if (!transformedImage || isRemovingBg) return;

    setIsRemovingBg(true);
    setBgError(null);

    try {
      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: transformedImage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Background removal failed');
      }

      setTransformedImage(data.imageUrl);
      setTweakSettings({ backgroundRemoved: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'שגיאה בהסרת הרקע';
      setBgError(message);
    } finally {
      setIsRemovingBg(false);
    }
  }, [transformedImage, isRemovingBg, setTransformedImage, setTweakSettings]);

  // Rotate image
  const handleRotate = useCallback(() => {
    const newRotation = ((tweakSettings.rotation + 90) % 360) as 0 | 90 | 180 | 270;
    setTweakSettings({ rotation: newRotation });
  }, [tweakSettings.rotation, setTweakSettings]);

  // Reset all tweaks
  const handleReset = useCallback(() => {
    resetTweakSettings();
  }, [resetTweakSettings]);

  const handleContinue = useCallback(() => {
    if (!isTransforming && !isRemovingBg) {
      setStep('customize');
      router.push('/create/customize');
    }
  }, [isTransforming, isRemovingBg, setStep, router]);

  const handleBack = useCallback(() => {
    setStep('style');
    router.push('/create/style');
  }, [setStep, router]);

  if (!originalImage) {
    return null;
  }

  const displayImage = transformedImage || originalImage;
  const isProcessing = isTransforming || isRemovingBg || isRegenerating;

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

          <h1 className="text-lg font-semibold text-zinc-900">עריכת התמונה</h1>

          <button
            onClick={handleReset}
            className="text-sm text-purple-600 font-medium"
            aria-label="איפוס"
          >
            איפוס
          </button>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-zinc-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-1">
            {STEPS.map((step, i) => {
              const isCompleted = i < 2; // Upload and Style completed
              const isActive = i === 2; // Tweak is active
              return (
                <div key={step.id} className="flex items-center gap-1" data-step={step.id} data-completed={isCompleted ? 'true' : undefined} data-active={isActive ? 'true' : undefined}>
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isCompleted ? 'bg-violet-600 text-white' : isActive ? 'bg-violet-600 text-white' : 'bg-zinc-100 text-zinc-500'}
                  `}>
                    {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-sm hidden sm:inline ${isCompleted || isActive ? 'text-zinc-900' : 'text-zinc-500'}`}>
                    {step.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`w-6 h-px mx-1 ${isCompleted ? 'bg-violet-600' : 'bg-zinc-300'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-32">
        {/* Preview Section */}
        <div className="py-5 flex justify-center">
          <div className="relative w-full max-w-sm aspect-[4/5] bg-zinc-100 rounded-2xl overflow-hidden shadow-lg">
            <div
              className="w-full h-full"
              style={{
                filter: getFilterStyle(),
                transform: getRotationStyle(),
              }}
            >
              <Image
                src={displayImage}
                alt="התמונה שלך"
                fill
                className="object-cover"
              />
            </div>

            {/* Processing Overlay */}
            {isProcessing && (
              <div
                data-testid="processing-overlay"
                className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-3"
              >
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                <span className="text-sm text-zinc-600 font-medium">
                  {isRegenerating ? 'יוצר מחדש...' : isRemovingBg ? 'מסיר רקע...' : 'מעבד...'}
                </span>
              </div>
            )}

            {/* Background Error */}
            {bgError && !isRemovingBg && (
              <div className="absolute bottom-3 left-3 right-3 bg-red-100 text-red-700 text-sm p-2 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{bgError}</span>
              </div>
            )}

            {/* Regenerate Button */}
            <button
              onClick={handleRegenerate}
              disabled={isProcessing}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-2 bg-white rounded-full shadow-md text-zinc-700 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="יצירה מחדש"
            >
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>יצירה מחדש</span>
            </button>

            {/* Close Button */}
            <button
              onClick={handleBack}
              className="absolute top-3 left-3 w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-md text-zinc-600"
              aria-label="סגירה"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tool Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'color' as ToolTab, icon: Palette, label: 'צבע' },
            { id: 'crop' as ToolTab, icon: Scissors, label: 'חיתוך' },
            { id: 'background' as ToolTab, icon: Eraser, label: 'רקע' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition
                ${activeTab === tab.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}
              `}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tool Panels */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          {/* Color Panel */}
          {activeTab === 'color' && (
            <div className="space-y-6">
              {/* Brightness Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <Sun className="w-4 h-4" />
                    בהירות
                  </label>
                  <span className="text-sm text-zinc-500">{tweakSettings.brightness}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={tweakSettings.brightness}
                  onChange={(e) => setTweakSettings({ brightness: parseInt(e.target.value) })}
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Contrast Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <Contrast className="w-4 h-4" />
                    ניגודיות
                  </label>
                  <span className="text-sm text-zinc-500">{tweakSettings.contrast}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={tweakSettings.contrast}
                  onChange={(e) => setTweakSettings({ contrast: parseInt(e.target.value) })}
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Saturation Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <Droplets className="w-4 h-4" />
                    רוויה
                  </label>
                  <span className="text-sm text-zinc-500">{tweakSettings.saturation}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={tweakSettings.saturation}
                  onChange={(e) => setTweakSettings({ saturation: parseInt(e.target.value) })}
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Color Filter Presets */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-3">פילטרים</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setTweakSettings({ colorFilter: filter.id })}
                      className={`
                        px-4 py-2 rounded-xl text-sm font-medium transition
                        ${tweakSettings.colorFilter === filter.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}
                      `}
                    >
                      {filter.nameHe}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Crop Panel */}
          {activeTab === 'crop' && (
            <div className="space-y-6">
              {/* Rotate Button */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-3">סיבוב</label>
                <div className="flex gap-3">
                  <button
                    onClick={handleRotate}
                    className="flex items-center gap-2 px-5 py-3 bg-zinc-100 rounded-xl text-zinc-700 font-medium hover:bg-zinc-200 transition"
                  >
                    <RotateCw className="w-5 h-5" />
                    <span>סובב 90°</span>
                  </button>
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-xl text-purple-700">
                    <span className="text-sm font-medium">{tweakSettings.rotation}°</span>
                  </div>
                </div>
              </div>

              {/* Crop Info */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-sm text-amber-700">
                  חיתוך מתקדם יהיה זמין בקרוב. כרגע ניתן לסובב את התמונה.
                </p>
              </div>
            </div>
          )}

          {/* Background Panel */}
          {activeTab === 'background' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-3">הסרת רקע</label>
                <button
                  onClick={handleRemoveBackground}
                  disabled={isRemovingBg || tweakSettings.backgroundRemoved}
                  className={`
                    w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium transition
                    ${tweakSettings.backgroundRemoved
                      ? 'bg-emerald-100 text-emerald-700'
                      : isRemovingBg
                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90'}
                  `}
                >
                  {tweakSettings.backgroundRemoved ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>הרקע הוסר בהצלחה</span>
                    </>
                  ) : isRemovingBg ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>מסיר רקע...</span>
                    </>
                  ) : (
                    <>
                      <Eraser className="w-5 h-5" />
                      <span>הסר רקע</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-700">
                  הסרת הרקע תיצור תמונה עם רקע שקוף, מושלם להדפסה על קנבס או נייר צבעוני.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 pb-safe">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleContinue}
            disabled={isProcessing}
            className={`
              w-full py-3.5 rounded-xl font-semibold shadow-lg transition flex items-center justify-center gap-2
              ${isProcessing
                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 to-pink-500 text-white hover:shadow-xl hover:shadow-violet-500/25 active:scale-[0.98]'}
            `}
          >
            <span>המשך להתאמה</span>
          </button>
        </div>
      </div>
    </main>
  );
}
