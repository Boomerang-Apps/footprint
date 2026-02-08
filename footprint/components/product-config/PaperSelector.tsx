/**
 * PaperSelector Component
 *
 * PC-02: Choose paper type
 *
 * Displays paper options (Matte, Glossy, Canvas) with descriptions and price modifiers.
 */

'use client';

import { useCallback } from 'react';
import { useOrderStore } from '@/stores/orderStore';
import type { PaperType, Paper } from '@/types';

export interface PaperSelectorProps {
  onPaperChange?: (paper: PaperType) => void;
  className?: string;
}

// Paper definitions
const PAPERS: Paper[] = [
  {
    id: 'matte',
    name: 'Matte',
    nameHe: 'מט',
    description: 'Smooth surface, no glare, ideal for art prints',
    descriptionHe: 'משטח חלק ללא ברק, אידיאלי להדפסי אמנות',
    priceModifier: 0,
  },
  {
    id: 'glossy',
    name: 'Glossy',
    nameHe: 'מבריק',
    description: 'High shine, vibrant colors, photo-like finish',
    descriptionHe: 'ברק גבוה, צבעים עזים, מראה צילומי',
    priceModifier: 20,
  },
  {
    id: 'canvas',
    name: 'Canvas',
    nameHe: 'קנבס',
    description: 'Artistic texture, gallery-quality feel',
    descriptionHe: 'טקסטורה אמנותית, תחושת גלריה',
    priceModifier: 50,
  },
];

export default function PaperSelector({
  onPaperChange,
  className = '',
}: PaperSelectorProps): React.ReactElement {
  const { paperType, setPaperType } = useOrderStore();

  const handlePaperClick = useCallback(
    (paperId: PaperType) => {
      setPaperType(paperId);
      onPaperChange?.(paperId);
    },
    [setPaperType, onPaperChange]
  );

  return (
    <div
      role="group"
      aria-label="Paper Selector - בחירת נייר"
      className={`space-y-3 ${className}`}
    >
      {PAPERS.map((paper) => (
        <button
          key={paper.id}
          type="button"
          onClick={() => handlePaperClick(paper.id)}
          aria-label={paper.nameHe}
          className={`
            w-full p-4 rounded-xl border-2 transition-all duration-200
            flex items-center justify-between
            focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2
            ${
              paperType === paper.id
                ? 'border-brand-purple bg-brand-purple/5'
                : 'border-zinc-200 hover:border-zinc-400'
            }
          `}
        >
          <div className="flex items-center gap-4">
            {/* Paper texture indicator */}
            <div
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${paper.id === 'matte' ? 'bg-zinc-100' : ''}
                ${paper.id === 'glossy' ? 'bg-gradient-to-br from-white to-zinc-200 shadow-inner' : ''}
                ${paper.id === 'canvas' ? 'bg-amber-50 border border-amber-200' : ''}
              `}
            >
              {paper.id === 'matte' && (
                <div className="w-6 h-6 bg-zinc-200 rounded" />
              )}
              {paper.id === 'glossy' && (
                <div className="w-6 h-6 bg-white rounded shadow-sm" />
              )}
              {paper.id === 'canvas' && (
                <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4h16v16H4z" />
                  <path strokeLinecap="round" strokeWidth={0.5} d="M4 8h16M4 12h16M4 16h16M8 4v16M12 4v16M16 4v16" />
                </svg>
              )}
            </div>

            <div className="text-right">
              <span className="font-semibold text-zinc-900">{paper.nameHe}</span>
              <p className="text-sm text-zinc-500">{paper.descriptionHe}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {paper.priceModifier > 0 ? (
              <span className="font-medium text-zinc-700">+₪{paper.priceModifier}</span>
            ) : (
              <span className="text-sm text-zinc-500">בסיס</span>
            )}
            {paperType === paper.id && (
              <div className="w-5 h-5 bg-brand-purple rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
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
        </button>
      ))}
    </div>
  );
}

// Export papers for use in other components
export { PAPERS };
