'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Sparkles, Check, Palette, Heart, Brush, Camera, Pen, Zap, Flower2, Film } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import type { StyleType } from '@/types';

interface StyleOption {
  id: StyleType;
  name: string;
  nameHe: string;
  description: string;
  icon: React.ElementType;
  color: string;
  colorBg: string;
  popular?: boolean;
}

const styles: StyleOption[] = [
  {
    id: 'original',
    name: 'Original Enhanced',
    nameHe: 'משופר מקורי',
    description: 'שיפור צבעים ואיכות',
    icon: Camera,
    color: '#3b82f6',
    colorBg: 'rgba(59,130,246,0.1)',
  },
  {
    id: 'pop_art',
    name: 'Pop Art',
    nameHe: 'פופ ארט',
    description: 'צבעים נועזים בסגנון וורהול',
    icon: Zap,
    color: '#ec4899',
    colorBg: 'rgba(236,72,153,0.1)',
    popular: true,
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    nameHe: 'צבעי מים',
    description: 'רך וזורם כציור מים',
    icon: Flower2,
    color: '#14b8a6',
    colorBg: 'rgba(20,184,166,0.1)',
  },
  {
    id: 'oil_painting',
    name: 'Oil Painting',
    nameHe: 'ציור שמן',
    description: 'מכחולים עשירים קלאסיים',
    icon: Brush,
    color: '#f59e0b',
    colorBg: 'rgba(245,158,11,0.1)',
    popular: true,
  },
  {
    id: 'line_art',
    name: 'Line Art',
    nameHe: 'קווי מתאר',
    description: 'מינימליסטי ואלגנטי',
    icon: Pen,
    color: '#6366f1',
    colorBg: 'rgba(99,102,241,0.1)',
  },
  {
    id: 'romantic',
    name: 'Romantic',
    nameHe: 'רומנטי',
    description: 'רך וחלומי עם גוונים חמים',
    icon: Heart,
    color: '#f43f5e',
    colorBg: 'rgba(244,63,94,0.1)',
  },
  {
    id: 'comic_book',
    name: 'Comic Book',
    nameHe: 'קומיקס',
    description: 'קווים נועזים וצבעים חיים',
    icon: Sparkles,
    color: '#8b5cf6',
    colorBg: 'rgba(139,92,246,0.1)',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    nameHe: 'וינטג׳',
    description: 'נוסטלגי עם גוון ספיה',
    icon: Film,
    color: '#78716c',
    colorBg: 'rgba(120,113,108,0.1)',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    nameHe: 'מינימליסטי',
    description: 'פשוט ונקי',
    icon: Palette,
    color: '#0ea5e9',
    colorBg: 'rgba(14,165,233,0.1)',
  },
];

export default function StylePage() {
  const router = useRouter();
  const { originalImage, selectedStyle, setSelectedStyle, setStep } = useOrderStore();

  // Redirect to upload if no image
  useEffect(() => {
    if (!originalImage) {
      router.push('/create');
    }
  }, [originalImage, router]);

  const handleStyleSelect = (styleId: StyleType) => {
    setSelectedStyle(styleId);
  };

  const handleContinue = () => {
    setStep('customize');
    router.push('/create/customize');
  };

  const handleBack = () => {
    setStep('upload');
    router.push('/create');
  };

  if (!originalImage) {
    return null;
  }

  const selectedStyleData = styles.find(s => s.id === selectedStyle);

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
            <span className="font-semibold">בחירת סגנון</span>
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
                  ${i <= 1 ? 'bg-brand-purple text-white' : 'bg-zinc-100 text-zinc-500'}
                `}>
                  {i < 1 ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm ${i <= 1 ? 'text-zinc-900' : 'text-zinc-500'}`}>
                  {step}
                </span>
                {i < 3 && <div className={`w-8 h-px ${i < 1 ? 'bg-brand-purple' : 'bg-zinc-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview Side */}
          <div className="order-2 lg:order-1">
            <div className="sticky top-32">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">תצוגה מקדימה</h2>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50">
                <Image
                  src={originalImage}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
                {selectedStyleData && (
                  <div
                    className="absolute bottom-4 right-4 px-4 py-2 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: selectedStyleData.color }}
                  >
                    {selectedStyleData.nameHe}
                  </div>
                )}
              </div>
              <p className="text-sm text-zinc-500 mt-3 text-center">
                * התמונה המעובדת תיווצר לאחר הרכישה
              </p>
            </div>
          </div>

          {/* Style Selection */}
          <div className="order-1 lg:order-2">
            <div className="text-center lg:text-right mb-6">
              <h1 className="text-2xl font-bold text-zinc-900 mb-2">בחרו סגנון אמנותי</h1>
              <p className="text-zinc-500">
                הבינה המלאכותית שלנו תהפוך את התמונה לאמנות בסגנון שתבחרו
              </p>
            </div>

            {/* Style Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {styles.map((style) => {
                const isSelected = selectedStyle === style.id;
                const Icon = style.icon;

                return (
                  <button
                    key={style.id}
                    onClick={() => handleStyleSelect(style.id)}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all text-right
                      ${isSelected
                        ? 'border-brand-purple bg-brand-purple/5 shadow-md'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }
                    `}
                  >
                    {style.popular && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-brand-purple text-white text-[10px] font-semibold rounded-full">
                        פופולרי
                      </span>
                    )}

                    {isSelected && (
                      <div className="absolute top-2 left-2 w-5 h-5 bg-brand-purple rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}

                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                      style={{ backgroundColor: style.colorBg, color: style.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <h3 className="font-semibold text-zinc-900 text-sm mb-1">
                      {style.nameHe}
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      {style.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Continue Button */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleContinue}
                className="btn btn-primary flex-1 py-4 text-base"
              >
                <span>המשך להתאמה אישית</span>
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-brand-purple/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-brand-purple" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-zinc-900 mb-1">תצוגה מקדימה חינם</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    לאחר הרכישה תקבלו את התמונה המעובדת באיכות גבוהה. אם לא תהיו מרוצים - נתקן או נחזיר כסף.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
