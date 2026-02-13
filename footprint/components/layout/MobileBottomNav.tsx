'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Heart, Package, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface UserInfo {
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

const tabs = [
  { href: '/', label: 'בית', icon: Home },
  { href: '/favorites', label: 'מועדפים', icon: Heart },
  { href: '/account/orders', label: 'הזמנות', icon: Package },
  { href: '/account', label: 'פרופיל', icon: User },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname() ?? '';
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Try to get profile data for avatar and name
        try {
          const res = await fetch('/api/profile', { credentials: 'include' });
          if (res.ok) {
            const profile = await res.json();
            setUserInfo({
              name: profile.name || null,
              email: session.user.email || '',
              avatarUrl: profile.avatarUrl || null,
            });
            return;
          }
        } catch {
          // Fall back to session data
        }
        setUserInfo({
          name: null,
          email: session.user.email || '',
          avatarUrl: null,
        });
      } else {
        setUserInfo(null);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUserInfo(null);
      } else {
        fetchUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hide during order creation/edit flow
  if (pathname.startsWith('/create')) return null;

  const getInitial = (info: UserInfo): string => {
    if (info.name) return info.name.charAt(0).toUpperCase();
    if (info.email) return info.email.charAt(0).toUpperCase();
    return '?';
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-zinc-200 lg:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4 h-16">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href);

          const isProfileTab = href === '/account';

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-brand-purple' : 'text-zinc-400'
              }`}
            >
              {isProfileTab && userInfo ? (
                userInfo.avatarUrl ? (
                  <div className={`w-7 h-7 rounded-full overflow-hidden ${isActive ? 'ring-2 ring-brand-purple' : ''}`}>
                    <Image
                      src={userInfo.avatarUrl}
                      alt=""
                      width={28}
                      height={28}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`w-7 h-7 rounded-full bg-brand-purple/10 flex items-center justify-center text-xs font-semibold text-brand-purple ${isActive ? 'ring-2 ring-brand-purple' : ''}`}>
                    {getInitial(userInfo)}
                  </div>
                )
              ) : (
                <Icon className="w-6 h-6" aria-hidden="true" />
              )}
              <span className="text-[11px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
