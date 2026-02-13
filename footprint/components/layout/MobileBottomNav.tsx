'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, Package, User } from 'lucide-react';

const tabs = [
  { href: '/', label: 'בית', icon: Home },
  { href: '/favorites', label: 'מועדפים', icon: Heart },
  { href: '/account/orders', label: 'הזמנות', icon: Package },
  { href: '/account', label: 'פרופיל', icon: User },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname() ?? '';

  // Hide during order creation/edit flow
  if (pathname.startsWith('/create')) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-zinc-200 lg:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4 h-16">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-brand-purple' : 'text-zinc-400'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[11px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
