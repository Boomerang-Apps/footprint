'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useOrderHistory } from '@/hooks/useOrderHistory';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { ProfileHero } from '@/components/account/ProfileHero';
import { ProfileStats } from '@/components/account/ProfileStats';
import { ProfileMenu } from '@/components/account/ProfileMenu';
import { Button } from '@/components/ui/Button';

/**
 * Profile Hub Page - Main navigation center for account features
 * Route: /account
 */
export default function AccountPage(): React.ReactElement {
  const router = useRouter();
  const { data: profile, isLoading, isError, error, refetch } = useProfile();
  const { data: orderData } = useOrderHistory({ enabled: !!profile });
  const favorites = useFavoritesStore((s) => s.favorites);

  // Redirect to login if unauthorized
  if (isError && (error?.message?.includes('Unauthorized') || error?.message?.includes('401'))) {
    router.push('/login');
  }

  // Loading state
  if (isLoading) {
    return (
      <div data-testid="profile-hub-loading" dir="rtl" className="min-h-screen bg-gray-50">
        {/* Hero skeleton */}
        <div className="bg-gradient-to-l from-brand-purple to-brand-pink">
          <div className="flex flex-col items-center px-4 pt-8 pb-12 animate-pulse">
            <div className="w-24 h-24 rounded-full bg-white/20 mb-3" />
            <div className="h-6 w-32 bg-white/20 rounded mb-2" />
            <div className="h-4 w-40 bg-white/20 rounded mb-1" />
            <div className="h-3 w-28 bg-white/20 rounded" />
          </div>
        </div>
        {/* Stats skeleton */}
        <div className="mx-4 -mt-6 relative z-10 bg-white rounded-xl border border-light-border shadow-soft-sm">
          <div className="grid grid-cols-3 py-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="h-6 w-8 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-12 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
        {/* Menu skeleton */}
        <div className="mx-4 mt-4 bg-white rounded-xl border border-light-border shadow-soft-sm animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-light-border last:border-0">
              <div className="w-9 h-9 rounded-lg bg-gray-200" />
              <div className="h-4 flex-1 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div
        data-testid="profile-hub-error"
        dir="rtl"
        className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4"
      >
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          שגיאה בטעינת הפרופיל
        </h2>
        <p className="text-gray-500 text-center mb-6">
          {error?.message || 'אירעה שגיאה בטעינת הפרופיל. אנא נסה שוב.'}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          <RotateCcw className="h-4 w-4 ml-2" />
          נסה שוב
        </Button>
      </div>
    );
  }

  if (!profile) return <div />;

  return (
    <div data-testid="profile-hub" dir="rtl" className="min-h-screen bg-gray-50 pb-24">
      {/* Hero */}
      <ProfileHero
        name={profile.name}
        email={profile.email}
        avatarUrl={profile.avatarUrl}
        memberSince={profile.createdAt}
      />

      {/* Stats */}
      <ProfileStats
        creationsCount={favorites.length}
        ordersCount={orderData.totalOrders}
        favoritesCount={favorites.length}
      />

      {/* Menu */}
      <ProfileMenu />
    </div>
  );
}
