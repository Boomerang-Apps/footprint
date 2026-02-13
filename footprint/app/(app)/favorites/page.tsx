'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Sparkles, Plus } from 'lucide-react';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useOrderStore } from '@/stores/orderStore';
import { getStyleById } from '@/lib/ai/styles-ui';
import type { FavoriteItem } from '@/stores/favoritesStore';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites, removeFavorite } = useFavoritesStore();
  const { setOriginalImage, setTransformedImage, setSelectedStyle } = useOrderStore();

  const handleUseThis = useCallback((item: FavoriteItem) => {
    setOriginalImage(item.originalImageUrl);
    setTransformedImage(item.imageUrl);
    setSelectedStyle(item.style);
    router.push('/create/style');
  }, [setOriginalImage, setTransformedImage, setSelectedStyle, router]);

  const handleRemove = useCallback((id: string) => {
    removeFavorite(id);
  }, [removeFavorite]);

  return (
    <main className="min-h-screen bg-zinc-50 pb-24" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <h1 className="text-2xl font-bold text-zinc-900">היצירות שלי</h1>
          </div>
          <p className="text-sm text-zinc-500">יצירות ה-AI השמורות שלך</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {favorites.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-zinc-300" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-700 mb-2">
              עדיין לא שמרת יצירות
            </h2>
            <p className="text-sm text-zinc-500 mb-6">
              צרו יצירות AI ושמרו אותן לאוסף שלכם
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition"
              aria-label="התחילו ליצור"
            >
              <Plus className="w-5 h-5" />
              <span>התחילו ליצור</span>
            </Link>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {favorites.map((item) => {
              const styleConfig = getStyleById(item.style);
              const gradient = styleConfig?.gradient || 'from-zinc-500 to-zinc-400';

              return (
                <div
                  key={item.id}
                  className="rounded-2xl overflow-hidden bg-white border border-zinc-200 shadow-sm"
                >
                  {/* Image with gradient accent */}
                  <div className="relative aspect-square">
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
                    <Image
                      src={item.imageUrl}
                      alt={`${item.styleName} יצירה`}
                      fill
                      className="object-cover"
                    />

                    {/* Heart remove button */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="absolute top-2 end-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition"
                      aria-label="הסר ממועדפים"
                    >
                      <Heart className="w-4 h-4 text-pink-500" fill="currentColor" />
                    </button>
                  </div>

                  {/* Card info */}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-zinc-900 mb-0.5">
                      {item.styleName}
                    </p>
                    <p className="text-xs text-zinc-400 mb-3">
                      {formatDate(item.createdAt)}
                    </p>
                    <button
                      onClick={() => handleUseThis(item)}
                      className="w-full py-2 text-sm font-semibold text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition"
                      aria-label="השתמש ביצירה"
                    >
                      השתמש ביצירה
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
