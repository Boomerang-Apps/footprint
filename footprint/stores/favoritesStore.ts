/**
 * Favorites Store
 *
 * Manages persistent favorites collection using Zustand.
 * Persists to localStorage so favorites survive across sessions.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StyleType } from '@/types';

export interface FavoriteItem {
  id: string;
  imageUrl: string;
  originalImageUrl: string;
  style: StyleType;
  styleName: string;
  createdAt: number;
}

interface FavoritesState {
  favorites: FavoriteItem[];
}

interface FavoritesActions {
  addFavorite: (item: Omit<FavoriteItem, 'id' | 'createdAt'>) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (imageUrl: string) => boolean;
  clearAll: () => void;
}

export const useFavoritesStore = create<FavoritesState & FavoritesActions>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (item) => {
        const state = get();

        // Prevent duplicates by imageUrl
        if (state.favorites.some((f) => f.imageUrl === item.imageUrl)) {
          return;
        }

        const newItem: FavoriteItem = {
          ...item,
          id: `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
        };

        set({ favorites: [...state.favorites, newItem] });
      },

      removeFavorite: (id) => {
        set({ favorites: get().favorites.filter((f) => f.id !== id) });
      },

      isFavorite: (imageUrl) => {
        return get().favorites.some((f) => f.imageUrl === imageUrl);
      },

      clearAll: () => set({ favorites: [] }),
    }),
    {
      name: 'footprint-favorites',
      partialize: (state) => ({
        favorites: state.favorites,
      }),
    }
  )
);
