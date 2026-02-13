/**
 * Shared STYLES UI configuration
 *
 * Extracted from the style selection page so both the style page
 * and favorites page can reference the same style definitions.
 */

import {
  CircleOff,
  Droplet,
  Pen,
  Layers,
  Brush,
  Zap,
  Palette,
  Camera,
  Flower2,
} from 'lucide-react';
import type { StyleType } from '@/types';

export interface StyleOption {
  id: StyleType;
  name: string;
  nameHe: string;
  icon: React.ElementType;
  gradient: string;
  badge?: 'popular' | 'new';
}

export const STYLES: StyleOption[] = [
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
    badge: 'popular',
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
    nameHe: 'קו+מים',
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
  {
    id: 'pop_art',
    name: 'Pop Art',
    nameHe: 'פופ ארט',
    icon: Palette,
    gradient: 'from-red-500 to-yellow-400',
    badge: 'new',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    nameHe: 'וינטג׳',
    icon: Camera,
    gradient: 'from-amber-700 to-amber-500',
  },
  {
    id: 'romantic',
    name: 'Romantic',
    nameHe: 'רומנטי',
    icon: Flower2,
    gradient: 'from-pink-400 to-rose-300',
    badge: 'new',
  },
];

export function getStyleById(id: StyleType): StyleOption | undefined {
  return STYLES.find((s) => s.id === id);
}
