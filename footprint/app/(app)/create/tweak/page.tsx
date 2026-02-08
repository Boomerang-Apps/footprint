'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowRight,
  RefreshCw,
  Palette,
  Wand2,
  Sun,
  Contrast,
  Droplets,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useOrderStore, type TweakSettings } from '@/stores/orderStore';
import { logger } from '@/lib/logger';

const STEPS = [
  { id: 'upload', label: 'העלאה' },
  { id: 'style', label: 'סגנון' },
  { id: 'tweak', label: 'עריכה' },
  { id: 'customize', label: 'התאמה' },
  { id: 'payment', label: 'תשלום' },
];

type ToolTab = 'color' | 'ai';

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

// Fun facts and tips to show during loading
const LOADING_MESSAGES = [
  { text: 'הבינה המלאכותית מנתחת את התמונה שלך...', icon: '🔍' },
  { text: 'יוצרים קסם אמנותי...', icon: '✨' },
  { text: 'ידעת? הדפסה על קנבס שומרת על צבעים עד 100 שנה', icon: '🎨' },
  { text: 'טיפ: תאורה טבעית נותנת את התוצאות הטובות ביותר', icon: '💡' },
  { text: 'עובדים על הפרטים הקטנים...', icon: '🖌️' },
  { text: 'ידעת? צבעי מים הומצאו בסין לפני 2000 שנה', icon: '🎭' },
  { text: 'מוסיפים את הנגיעות האחרונות...', icon: '🖼️' },
  { text: 'טיפ: מסגרת לבנה מתאימה לכל סגנון עיצוב', icon: '🏠' },
  { text: 'האמנות שלך כמעט מוכנה...', icon: '🎉' },
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
    _hasHydrated,
  } = useOrderStore();

  const [activeTab, setActiveTab] = useState<ToolTab>('color');
  const [isApplyingPrompt, setIsApplyingPrompt] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Redirect to upload if no image (only after hydration)
  useEffect(() => {
    if (_hasHydrated && !originalImage) {
      router.push('/create');
    }
  }, [_hasHydrated, originalImage, router]);

  // Set current step on mount
  useEffect(() => {
    setStep('tweak');
  }, [setStep]);

  // Rotate loading messages and update progress during processing
  const isLoading = isTransforming || isApplyingPrompt || isRegenerating;
  useEffect(() => {
    if (!isLoading) {
      setLoadingProgress(0);
      setLoadingMessageIndex(0);
      return;
    }

    // Rotate messages every 3 seconds
    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);

    // Simulate progress (reaches ~90% over 15 seconds, then slows)
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev < 90) return prev + 6;
        if (prev < 95) return prev + 1;
        return prev;
      });
    }, 1000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading]);

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
      logger.error('Regeneration failed', error);
    } finally {
      setIsRegenerating(false);
      setIsTransforming(false);
    }
  }, [originalImage, selectedStyle, isRegenerating, setTransformedImage, setIsTransforming, resetTweakSettings]);

  // Apply custom prompt via nano-banana
  const handleApplyPrompt = useCallback(async () => {
    if (!transformedImage || isApplyingPrompt || !customPrompt.trim()) return;

    setIsApplyingPrompt(true);
    setPromptError(null);

    try {
      const response = await fetch('/api/tweak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: transformedImage,
          prompt: customPrompt.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply prompt');
      }

      setTransformedImage(data.imageUrl);
      setCustomPrompt(''); // Clear prompt after success
    } catch (error) {
      const message = error instanceof Error ? error.message : 'שגיאה בעריכת התמונה';
      setPromptError(message);
    } finally {
      setIsApplyingPrompt(false);
    }
  }, [transformedImage, isApplyingPrompt, customPrompt, setTransformedImage]);

  // Reset all tweaks
  const handleReset = useCallback(() => {
    resetTweakSettings();
  }, [resetTweakSettings]);

  const handleContinue = useCallback(() => {
    if (!isTransforming && !isApplyingPrompt) {
      setStep('customize');
      router.push('/create/customize');
    }
  }, [isTransforming, isApplyingPrompt, setStep, router]);

  const handleBack = useCallback(() => {
    setStep('style');
    router.push('/create/style');
  }, [setStep, router]);

  // Show loading state while hydrating
  if (!_hasHydrated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-50" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
          <p className="text-sm text-zinc-500">טוען...</p>
        </div>
      </main>
    );
  }

  // After hydration, if no image, the useEffect will redirect
  if (!originalImage) {
    return null;
  }

  const displayImage = transformedImage || originalImage;
  const isProcessing = isTransforming || isApplyingPrompt || isRegenerating;

  return (
    <main className="h-screen flex flex-col bg-zinc-50 overflow-hidden" dir="rtl">
      {/* Header */}
      <header className="flex-none bg-white border-b border-zinc-200">
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
      <div className="flex-none bg-white border-b border-zinc-200 px-4 py-4">
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

      {/* Main Content - Image Preview (fills 90% of available height) */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden min-h-0">
        <div className="relative h-[90%] aspect-[4/5] max-w-full bg-zinc-100 rounded-2xl overflow-hidden shadow-lg">
          {displayImage ? (
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
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-100">
              <div className="text-center text-zinc-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">טוען תמונה...</p>
              </div>
            </div>
          )}

          {/* Processing Overlay - Enhanced */}
          {isProcessing && (
            <div
              data-testid="processing-overlay"
              className="absolute inset-0 bg-gradient-to-b from-white/95 to-purple-50/95 backdrop-blur-sm flex flex-col items-center justify-center p-6"
            >
              {/* Animated spinner with glow */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-purple-400 rounded-full blur-xl opacity-30 animate-pulse" />
                <Loader2 className="w-16 h-16 text-purple-600 animate-spin relative z-10" />
              </div>

              {/* Rotating message with icon */}
              <div className="text-center mb-6 min-h-[60px] flex flex-col items-center justify-center">
                <span className="text-3xl mb-2">{LOADING_MESSAGES[loadingMessageIndex].icon}</span>
                <p className="text-base text-zinc-700 font-medium px-4 leading-relaxed">
                  {LOADING_MESSAGES[loadingMessageIndex].text}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-xs">
                <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500 text-center mt-2">
                  {loadingProgress < 30 && 'מנתחים את התמונה...'}
                  {loadingProgress >= 30 && loadingProgress < 60 && 'יוצרים את האמנות...'}
                  {loadingProgress >= 60 && loadingProgress < 90 && 'מוסיפים פרטים...'}
                  {loadingProgress >= 90 && 'כמעט שם...'}
                </p>
              </div>
            </div>
          )}

          {/* Prompt Error */}
          {promptError && !isApplyingPrompt && (
            <div className="absolute bottom-3 left-3 right-3 bg-red-100 text-red-700 text-sm p-2 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{promptError}</span>
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
        </div>
      </div>

      {/* Bottom Section - Tools + CTA */}
      <div className="flex-none bg-white border-t border-zinc-200">
        {/* Tool Tabs */}
        <div className="px-4 pt-3 pb-2">
          <div className="max-w-md mx-auto flex gap-2">
            {[
              { id: 'color' as ToolTab, icon: Palette, label: 'צבע' },
              { id: 'ai' as ToolTab, icon: Wand2, label: 'AI' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-medium transition
                  ${activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tool Panels - Compact */}
        <div className="px-4 pb-2">
          <div className="max-w-md mx-auto">
            {/* Color Panel */}
            {activeTab === 'color' && (
              <div className="space-y-3">
                {/* Sliders Row */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Brightness */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Sun className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-xs text-zinc-500">{tweakSettings.brightness}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={tweakSettings.brightness}
                      onChange={(e) => setTweakSettings({ brightness: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Contrast className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-xs text-zinc-500">{tweakSettings.contrast}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={tweakSettings.contrast}
                      onChange={(e) => setTweakSettings({ contrast: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Droplets className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-xs text-zinc-500">{tweakSettings.saturation}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={tweakSettings.saturation}
                      onChange={(e) => setTweakSettings({ saturation: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>
                </div>

                {/* Color Filter Presets - Full Width */}
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setTweakSettings({ colorFilter: filter.id })}
                      className={`
                        py-2 rounded-lg text-xs font-medium transition
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
            )}

            {/* AI Edit Panel */}
            {activeTab === 'ai' && (
              <div className="py-2 space-y-3">
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="תארו את השינוי הרצוי... לדוגמה: הסר את הרקע, שנה את הרקע לשקיעה, הוסף אפקט עשן"
                  className="w-full h-20 px-3 py-2 text-sm border border-zinc-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  dir="rtl"
                />
                <button
                  onClick={handleApplyPrompt}
                  disabled={isApplyingPrompt || !customPrompt.trim()}
                  className={`
                    w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition
                    ${isApplyingPrompt
                      ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                      : !customPrompt.trim()
                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90'}
                  `}
                >
                  {isApplyingPrompt ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>מעבד...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>החל שינוי</span>
                    </>
                  )}
                </button>
                {promptError && (
                  <p className="text-xs text-red-500 text-center">{promptError}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <div className="px-4 pb-4 pt-2">
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
      </div>
    </main>
  );
}
