'use client';

import { Card } from '@/components/ui/Card';

export interface ProfileStatsProps {
  creationsCount: number;
  ordersCount: number;
  favoritesCount: number;
  className?: string;
}

interface StatItemProps {
  value: number;
  label: string;
}

function StatItem({ value, label }: StatItemProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-bold text-text-primary">{value}</span>
      <span className="text-xs text-text-muted mt-0.5">{label}</span>
    </div>
  );
}

/**
 * ProfileStats - 3-column stat bar showing Creations, Orders, Favorites
 * Designed to overlap the hero bottom edge with negative margin
 */
export function ProfileStats({
  creationsCount,
  ordersCount,
  favoritesCount,
  className = '',
}: ProfileStatsProps): React.ReactElement {
  return (
    <Card
      data-testid="profile-stats"
      className={`mx-4 -mt-6 relative z-10 ${className}`}
    >
      <div className="grid grid-cols-3 py-4">
        <StatItem value={creationsCount} label="יצירות" />
        <div className="border-x border-light-border">
          <StatItem value={ordersCount} label="הזמנות" />
        </div>
        <StatItem value={favoritesCount} label="מועדפים" />
      </div>
    </Card>
  );
}

ProfileStats.displayName = 'ProfileStats';
