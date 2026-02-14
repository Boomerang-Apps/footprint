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
import Image from 'next/image';
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
    name: 'No Filter',
    nameHe: 'ללא פילטר',
    description: 'Your original photo without any transformation',
    descriptionHe: 'התמונה המקורית שלכם ללא שינוי',
    thumbnailUrl: '/styles/original.jpg',
    processingTime: 0,
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    nameHe: 'צבעי מים',
    description: 'Soft edges and flowing colors like a painting',
    descriptionHe: 'קצוות רכים וצבעים זורמים כמו ציור',
    thumbnailUrl: '/styles/watercolor.jpg',
    processingTime: 10,
    popular: true,
  },
  {
    id: 'line_art',
    name: 'Line Art',
    nameHe: 'ציור קווי',
    description: 'Clean lines and minimalist style',
    descriptionHe: 'קווים נקיים וסגנון מינימליסטי',
    thumbnailUrl: '/styles/line-art.jpg',
    processingTime: 6,
  },
  {
    id: 'line_art_watercolor',
    name: 'Line + Watercolor',
    nameHe: 'קווי + צבעי מים',
    description: 'Combination of clean lines with watercolor fills',
    descriptionHe: 'שילוב של קווים נקיים עם מילוי צבעי מים',
    thumbnailUrl: '/styles/line-watercolor.jpg',
    processingTime: 12,
  },
];

export default function StyleGallery({
  onStyleSelect,
  className = '',
}: StyleGalleryProps): React.ReactElement {
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
            <Image
              src={style.thumbnailUrl}
              alt={`${style.nameHe} סגנון`}
              fill
              className="object-cover"
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
                ${style.id === 'watercolor' ? 'bg-gradient-to-br from-blue-200 to-purple-200' : ''}
                ${style.id === 'line_art' ? 'bg-gradient-to-br from-zinc-50 to-zinc-300' : ''}
                ${style.id === 'line_art_watercolor' ? 'bg-gradient-to-br from-purple-300 to-blue-300' : ''}
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
