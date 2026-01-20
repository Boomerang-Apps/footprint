/**
 * Room Background Configuration
 *
 * Front-facing wall images for realistic artwork mockup preview.
 * Images should show walls straight-on (not perspective) for clean overlay.
 * Uses Unsplash images (free to use).
 */

export interface RoomBackground {
  id: string;
  name: string;
  nameHe: string;
  url: string;
  /** Position of artwork on wall (percentage from top) */
  artworkTop: number;
  /** Position of artwork on wall (percentage from left) */
  artworkLeft: number;
  /** Scale factor for artwork size */
  artworkScale: number;
  /** Whether to show shadow under artwork */
  showShadow: boolean;
  /** Credit for the photo */
  credit: string;
}

/**
 * Available room backgrounds - Front-facing wall images
 *
 * These are straight-on wall views ideal for placing artwork mockups.
 * The photo with frame will be overlaid on top of these backgrounds.
 */
export const ROOM_BACKGROUNDS: RoomBackground[] = [
  {
    id: 'living-sofa-white',
    name: 'White Wall with Sofa',
    nameHe: 'קיר לבן עם ספה',
    url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80',
    artworkTop: 15,
    artworkLeft: 50,
    artworkScale: 1.2,
    showShadow: true,
    credit: 'Unsplash',
  },
  {
    id: 'living-gray-modern',
    name: 'Modern Gray Living Room',
    nameHe: 'סלון אפור מודרני',
    url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80',
    artworkTop: 12,
    artworkLeft: 50,
    artworkScale: 1.1,
    showShadow: true,
    credit: 'Unsplash',
  },
  {
    id: 'bedroom-minimal',
    name: 'Minimal Bedroom',
    nameHe: 'חדר שינה מינימליסטי',
    url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80',
    artworkTop: 18,
    artworkLeft: 50,
    artworkScale: 1.0,
    showShadow: true,
    credit: 'Unsplash',
  },
  {
    id: 'living-plant-cozy',
    name: 'Cozy Living with Plants',
    nameHe: 'סלון חמים עם צמחים',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
    artworkTop: 10,
    artworkLeft: 50,
    artworkScale: 1.0,
    showShadow: true,
    credit: 'Unsplash',
  },
  {
    id: 'office-desk',
    name: 'Home Office',
    nameHe: 'משרד ביתי',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80',
    artworkTop: 15,
    artworkLeft: 45,
    artworkScale: 0.9,
    showShadow: true,
    credit: 'Unsplash',
  },
];

/**
 * Get a room background by ID
 */
export function getRoomBackground(id: string): RoomBackground | undefined {
  return ROOM_BACKGROUNDS.find((bg) => bg.id === id);
}

/**
 * Get the default room background
 */
export function getDefaultRoomBackground(): RoomBackground {
  return ROOM_BACKGROUNDS[0];
}
