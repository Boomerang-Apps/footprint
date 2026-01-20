'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, X, Sparkles, Check, Zap, Droplet, Pen, Brush, CircleOff, Layers, AlertCircle, RefreshCw, RotateCcw, Maximize2, Heart, Grid3X3, Trash2 } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import type { StyleType } from '@/types';
import toast from 'react-hot-toast';

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
    id: 'original',
    name: 'No Filter',
    nameHe: 'ללא פילטר',
    icon: CircleOff,
    gradient: 'from-zinc-500 to-zinc-400',
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
    id: 'line_art_watercolor',
    name: 'Line + Watercolor',
    nameHe: 'קווי + צבעי מים',
    icon: Layers,
    gradient: 'from-purple-500 to-blue-400',
  },
  {
    id: 'oil_painting',
    name: 'Oil',
    nameHe: 'ציור שמן',
    icon: Brush,
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    id: 'avatar_cartoon',
    name: 'Avatar Cartoon',
    nameHe: 'אווטאר קרטון',
    icon: Zap,
    gradient: 'from-violet-500 to-pink-500',
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
    savedVersions,
    addSavedVersion,
    removeSavedVersion,
    selectSavedVersion,
  } = useOrderStore();

  // Local state for transform error and pending style for retry
  const [transformError, setTransformError] = useState<string | null>(null);
  const [pendingStyle, setPendingStyle] = useState<{ id: StyleType; nameHe: string } | null>(null);

  // Legacy state for backward compatibility with existing tests
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStyle, setProcessingStyle] = useState<string | null>(null);

  // Fullscreen modal state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Grid modal state for viewing saved versions
  const [showGridModal, setShowGridModal] = useState(false);

  // Max saved versions
  const MAX_VERSIONS = 10;

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

  // Save current version to collection
  const handleSaveVersion = useCallback(() => {
    if (!transformedImage) {
      toast.error('אין תמונה לשמירה');
      return;
    }

    if (savedVersions.length >= MAX_VERSIONS) {
      toast.error(`הגעת למקסימום ${MAX_VERSIONS} גרסאות`);
      return;
    }

    const success = addSavedVersion();
    if (success) {
      toast.success(`נשמר! (${savedVersions.length + 1}/${MAX_VERSIONS})`);
    }
  }, [transformedImage, savedVersions.length, addSavedVersion]);

  // Select a version from grid and continue
  const handleSelectVersion = useCallback((id: string) => {
    selectSavedVersion(id);
    setShowGridModal(false);
    toast.success('נבחרה הגרסה');
  }, [selectSavedVersion]);

  // Delete a saved version
  const handleDeleteVersion = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSavedVersion(id);
    toast.success('הגרסה נמחקה');
  }, [removeSavedVersion]);

  // Get style name for a saved version
  const getStyleName = useCallback((styleId: StyleType) => {
    return STYLES.find(s => s.id === styleId)?.nameHe || styleId;
  }, []);

  if (!originalImage) {
    return null;
  }

  const currentStyle = STYLES.find(s => s.id === selectedStyle) || STYLES[0];

  return (
    <main className="h-screen flex flex-col bg-zinc-50 overflow-hidden" dir="rtl">
      {/* Header */}
      <header className="flex-shrink-0 z-50 bg-white border-b border-zinc-200">
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

      {/* Progress Steps */}
      <div className="flex-shrink-0 bg-white border-b border-zinc-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-1">
            {STEPS.map((step, i) => {
              const isCompleted = i < 1; // Only upload is completed
              const isActive = i === 1; // Style is active
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

      {/* Main Content - Fill available height between header and bottom panel */}
      <div className="flex-1 flex flex-col min-h-0 px-4 pb-[220px]">
        {/* Preview Section - Responsive to viewport */}
        <div className="flex-1 flex items-center justify-center py-3 min-h-0">
          <div className="relative h-full w-auto aspect-[4/5] max-w-full bg-zinc-100 rounded-2xl overflow-hidden shadow-lg group">
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
              {/* Save Version Button */}
              {transformedImage && selectedStyle !== 'original' && (() => {
                const isAlreadySaved = savedVersions.some(v => v.imageUrl === transformedImage);
                return (
                  <button
                    onClick={handleSaveVersion}
                    disabled={savedVersions.length >= MAX_VERSIONS || isAlreadySaved}
                    className={`w-9 h-9 flex items-center justify-center rounded-full shadow-md transition ${
                      isAlreadySaved
                        ? 'bg-pink-100 text-pink-500 cursor-default'
                        : savedVersions.length >= MAX_VERSIONS
                        ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                        : 'bg-white text-pink-500 hover:bg-pink-50'
                    }`}
                    aria-label={isAlreadySaved ? 'כבר נשמר' : 'שמור גרסה'}
                    title={isAlreadySaved ? 'גרסה זו כבר נשמרה' : `שמור לאוסף (${savedVersions.length}/${MAX_VERSIONS})`}
                  >
                    <Heart className="w-5 h-5" fill={isAlreadySaved ? 'currentColor' : 'none'} />
                  </button>
                );
              })()}
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

            {/* Saved Count Badge */}
            {savedVersions.length > 0 && (
              <button
                onClick={() => setShowGridModal(true)}
                className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-600 to-pink-500 rounded-full shadow-md text-white hover:shadow-lg transition"
                aria-label="צפה באוסף"
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="text-sm font-semibold">{savedVersions.length}</span>
              </button>
            )}

            {/* Style Badge with Regenerate - Bottom Right */}
            {transformedImage && selectedStyle !== 'original' && !isTransforming && !transformError && (
              <button
                onClick={() => transformImage(selectedStyle, currentStyle.nameHe)}
                data-testid="style-badge"
                className="absolute bottom-3 right-3 flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg text-zinc-700 hover:bg-white hover:scale-105 active:scale-95 transition"
                aria-label={`נסה שוב ${currentStyle.nameHe}`}
              >
                <RefreshCw className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold">{currentStyle.nameHe}</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Sticky Bottom Panel - Style Selection + CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-xl border-t border-zinc-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        {/* Style Section Header */}
        <div className="text-center pt-4 pb-2">
          <h2 className="text-base font-bold text-zinc-900">בחרו סגנון אמנות</h2>
          <p className="text-xs text-zinc-500">הקישו על סגנון לתצוגה מקדימה</p>
        </div>

        {/* Horizontal Style Strip */}
        <div className="px-4 pb-3">
          <div
            data-testid="style-strip"
            className="flex gap-2 overflow-x-auto scrollbar-hide justify-start sm:justify-center pb-2"
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
                  className="flex-shrink-0 flex flex-col items-center gap-1.5"
                >
                  <div className={`
                    relative w-14 h-14 rounded-xl flex items-center justify-center
                    ${isSelected
                      ? 'bg-gradient-to-br from-violet-600 to-pink-500 shadow-lg shadow-violet-500/30'
                      : 'bg-zinc-800 hover:bg-zinc-700'}
                    transition-all duration-200 active:scale-95
                  `}>
                    <Icon className="w-6 h-6 text-white" />

                    {/* Selection Check */}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3 text-violet-600" strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  <span className={`
                    text-[10px] font-medium text-center max-w-[60px] leading-tight
                    ${isSelected ? 'text-violet-600' : 'text-zinc-500'}
                  `}>
                    {style.nameHe}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA Button */}
        <div className="px-4 pb-4 pb-safe">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleContinue}
              disabled={isTransforming}
              className={`
                w-full py-3.5 rounded-xl font-semibold shadow-lg transition flex items-center justify-center gap-2
                ${isTransforming
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-pink-500 text-white hover:shadow-xl hover:shadow-violet-500/25 active:scale-[0.98]'}
              `}
            >
              <Sparkles className="w-4 h-4" />
              <span>אהבתי! המשך</span>
            </button>
          </div>
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
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(false);
            }}
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

      {/* Grid Modal - Saved Versions */}
      {showGridModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowGridModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">האוסף שלך</h2>
                <p className="text-sm text-zinc-500">{savedVersions.length}/{MAX_VERSIONS} גרסאות שמורות</p>
              </div>
              <button
                onClick={() => setShowGridModal(false)}
                className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid */}
            <div className="p-4 overflow-y-auto max-h-[calc(85vh-140px)]">
              {savedVersions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="text-zinc-500">עדיין לא שמרת גרסאות</p>
                  <p className="text-sm text-zinc-400 mt-1">לחצו על ❤️ כדי לשמור גרסה</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {savedVersions.map((version) => (
                    <div
                      key={version.id}
                      onClick={() => handleSelectVersion(version.id)}
                      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 border-transparent hover:border-violet-500 transition"
                    >
                      <Image
                        src={version.imageUrl}
                        alt={`גרסה ${getStyleName(version.style)}`}
                        fill
                        className="object-cover"
                      />

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="px-4 py-2 bg-white rounded-full text-sm font-semibold text-zinc-900">
                          בחר גרסה
                        </span>
                      </div>

                      {/* Style badge */}
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded-full text-xs text-white font-medium">
                        {getStyleName(version.style)}
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDeleteVersion(version.id, e)}
                        className="absolute top-2 left-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                        aria-label="מחק גרסה"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {savedVersions.length > 0 && (
              <div className="p-4 border-t border-zinc-200">
                <button
                  onClick={() => setShowGridModal(false)}
                  className="w-full py-3 rounded-xl font-semibold bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition"
                >
                  המשך לנסות סגנונות
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
