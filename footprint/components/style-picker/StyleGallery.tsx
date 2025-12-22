/**
 * StyleGallery Component
 *
 * AI-01: Display AI style gallery
 * AI-03: Keep original photo option
 *
 * Displays a gallery of AI style options for users to choose from.
 * Original photo is always the first option.
 */

'use client';

import { useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import type { StyleType, Style } from '@/types';

export interface StyleGalleryProps {
  onStyleSelect?: (style: StyleType) => void;
  className?: string;
}

// Style definitions with Hebrew translations
const STYLES: Style[] = [
  {
    id: 'original',
    name: 'Original',
    nameHe: 'מקורי',
    description: 'Your photo with enhanced colors and clarity',
    descriptionHe: 'התמונה שלכם עם צבעים ובהירות משופרים',
    thumbnailUrl: '/styles/original.jpg',
    processingTime: 2,
  },
  {
    id: 'pop_art',
    name: 'Pop Art',
    nameHe: 'פופ ארט',
    description: 'Bold colors and halftone patterns inspired by Warhol',
    descriptionHe: 'צבעים נועזים ודפוסי הלפטון בהשראת וורהול',
    thumbnailUrl: '/styles/pop-art.jpg',
    processingTime: 8,
    popular: true,
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    nameHe: 'צבעי מים',
    description: 'Soft edges and flowing colors like a painting',
    descriptionHe: 'קצוות רכים וצבעים זורמים כמו ציור',
    thumbnailUrl: '/styles/watercolor.jpg',
    processingTime: 10,
  },
  {
    id: 'line_art',
    name: 'Line Art',
    nameHe: 'קווים',
    description: 'Clean lines and minimalist style',
    descriptionHe: 'קווים נקיים וסגנון מינימליסטי',
    thumbnailUrl: '/styles/line-art.jpg',
    processingTime: 6,
  },
  {
    id: 'oil_painting',
    name: 'Oil Painting',
    nameHe: 'ציור שמן',
    description: 'Thick brushstrokes and classic art style',
    descriptionHe: 'משיכות מכחול עבות וסגנון אמנות קלאסי',
    thumbnailUrl: '/styles/oil-painting.jpg',
    processingTime: 12,
    popular: true,
  },
  {
    id: 'romantic',
    name: 'Romantic',
    nameHe: 'רומנטי',
    description: 'Soft focus and warm dreamy tones',
    descriptionHe: 'פוקוס רך וגוונים חמים וחלומיים',
    thumbnailUrl: '/styles/romantic.jpg',
    processingTime: 8,
  },
  {
    id: 'comic_book',
    name: 'Comic Book',
    nameHe: 'קומיקס',
    description: 'Bold outlines and bright comic style',
    descriptionHe: 'קווי מתאר נועזים וסגנון קומיקס בהיר',
    thumbnailUrl: '/styles/comic-book.jpg',
    processingTime: 7,
  },
  {
    id: 'vintage',
    name: 'Vintage',
    nameHe: 'וינטג׳',
    description: 'Sepia tones and nostalgic film grain',
    descriptionHe: 'גוונים חומים ורגש נוסטלגי של פילם',
    thumbnailUrl: '/styles/vintage.jpg',
    processingTime: 5,
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    nameHe: 'מינימליסטי',
    description: 'Simple shapes and reduced color palette',
    descriptionHe: 'צורות פשוטות ופלטת צבעים מצומצמת',
    thumbnailUrl: '/styles/minimalist.jpg',
    processingTime: 6,
  },
];

export default function StyleGallery({
  onStyleSelect,
  className = '',
}: StyleGalleryProps): JSX.Element {
  const { selectedStyle, setSelectedStyle } = useOrderStore();

  const handleStyleClick = useCallback(
    (styleId: StyleType) => {
      setSelectedStyle(styleId);
      onStyleSelect?.(styleId);
    },
    [setSelectedStyle, onStyleSelect]
  );

  return (
    <div
      role="group"
      aria-label="Style Gallery - בחירת סגנון"
      className={`grid grid-cols-2 sm:grid-cols-3 gap-4 ${className}`}
    >
      {STYLES.map((style) => (
        <button
          key={style.id}
          type="button"
          onClick={() => handleStyleClick(style.id)}
          aria-label={style.nameHe}
          className={`
            relative rounded-xl overflow-hidden border-2 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2
            ${
              selectedStyle === style.id
                ? 'border-brand-purple ring-2 ring-brand-purple shadow-lg scale-[1.02]'
                : 'border-zinc-200 hover:border-zinc-400 hover:shadow-md'
            }
          `}
        >
          {/* Thumbnail */}
          <div className="aspect-square bg-zinc-100 relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- Placeholder thumbnails */}
            <img
              src={style.thumbnailUrl}
              alt={`${style.nameHe} סגנון`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback for missing thumbnails
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />

            {/* Fallback gradient for missing images */}
            <div
              className={`
                absolute inset-0 flex items-center justify-center
                ${style.id === 'original' ? 'bg-gradient-to-br from-zinc-100 to-zinc-200' : ''}
                ${style.id === 'pop_art' ? 'bg-gradient-to-br from-pink-400 to-yellow-400' : ''}
                ${style.id === 'watercolor' ? 'bg-gradient-to-br from-blue-200 to-purple-200' : ''}
                ${style.id === 'line_art' ? 'bg-gradient-to-br from-zinc-50 to-zinc-300' : ''}
                ${style.id === 'oil_painting' ? 'bg-gradient-to-br from-amber-300 to-orange-400' : ''}
                ${style.id === 'romantic' ? 'bg-gradient-to-br from-pink-200 to-rose-300' : ''}
                ${style.id === 'comic_book' ? 'bg-gradient-to-br from-red-400 to-blue-500' : ''}
                ${style.id === 'vintage' ? 'bg-gradient-to-br from-amber-200 to-yellow-100' : ''}
                ${style.id === 'minimalist' ? 'bg-gradient-to-br from-zinc-100 to-zinc-50' : ''}
              `}
            >
              <Sparkles className="w-8 h-8 text-white/80" />
            </div>

            {/* Popular Badge */}
            {style.popular && (
              <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium bg-brand-purple text-white rounded-full">
                פופולרי
              </span>
            )}

            {/* Selected Checkmark */}
            {selectedStyle === style.id && (
              <div className="absolute top-2 left-2 w-6 h-6 bg-brand-purple rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Style Name */}
          <div className="p-3 bg-white">
            <h3 className="font-medium text-zinc-900 text-sm">{style.nameHe}</h3>
            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
              {style.descriptionHe}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

// Export styles for use in other components
export { STYLES };
