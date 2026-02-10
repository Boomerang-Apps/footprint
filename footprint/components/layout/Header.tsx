'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Zap, Truck, User, Package, LogOut } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { createClient } from '@/lib/supabase/client';

// Default avatar image - real photo placeholder
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';

export function Header() {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: profile, isLoading } = useProfile();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-zinc-900 text-white py-2.5 px-4 text-center text-sm font-medium">
        <span className="inline-flex items-center gap-2">
          <Zap className="w-4 h-4" />
          פריט שני ב-50% הנחה
        </span>
        <span className="mx-4 text-zinc-500 hidden sm:inline">|</span>
        <span className="inline-flex items-center gap-2 hidden sm:inline-flex">
          <Truck className="w-4 h-4" />
          משלוח חינם מעל ₪299
        </span>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-5 h-16 lg:h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/footprint-logo-black-v2.svg"
              alt="פוטפרינט"
              className="h-[52px] w-auto"
            />
            <span className="text-[26px] font-bold text-zinc-900">פוטפרינט</span>
          </Link>

          <div className="hidden lg:flex items-center gap-9">
            <Link href="/#products" className="text-[15px] font-medium text-zinc-600 hover:text-zinc-900 transition">מוצרים</Link>
            <Link href="/#gallery" className="text-[15px] font-medium text-zinc-600 hover:text-zinc-900 transition">גלריה</Link>
            <Link href="/#how" className="text-[15px] font-medium text-zinc-600 hover:text-zinc-900 transition">איך זה עובד</Link>
            <Link href="/#contact" className="text-[15px] font-medium text-zinc-600 hover:text-zinc-900 transition">צור קשר</Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop: Search */}
            <button className="hidden lg:flex w-11 h-11 rounded-xl items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition">
              <Search className="w-5 h-5" />
            </button>

            {/* Cart - always visible */}
            <button className="w-11 h-11 rounded-xl flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] bg-brand-purple rounded-full text-[10px] font-semibold text-white flex items-center justify-center">0</span>
            </button>

            {/* Desktop: Auth State */}
            {!isLoading && (
              <>
                {profile ? (
                  /* Logged in - Show user avatar only */
                  <div className="hidden lg:block relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="w-11 h-11 rounded-full overflow-hidden hover:ring-2 hover:ring-brand-purple/50 transition"
                    >
                      <img
                        src={profile.avatarUrl || DEFAULT_AVATAR}
                        alt={profile.name || profile.email}
                        className="w-full h-full object-cover"
                      />
                    </button>

                    {/* User Dropdown Menu */}
                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 py-2">
                          <div className="px-4 py-3 border-b border-zinc-100">
                            <p className="text-sm font-medium text-zinc-900 truncate">{profile.name || 'משתמש'}</p>
                            <p className="text-xs text-zinc-500 truncate">{profile.email}</p>
                          </div>
                          <Link
                            href="/account/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 transition"
                          >
                            <Package className="w-4 h-4" />
                            ההזמנות שלי
                          </Link>
                          <Link
                            href="/account/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 transition"
                          >
                            <User className="w-4 h-4" />
                            הפרופיל שלי
                          </Link>
                          <div className="border-t border-zinc-100 mt-2 pt-2">
                            <button
                              onClick={handleSignOut}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition w-full"
                            >
                              <LogOut className="w-4 h-4" />
                              התנתקות
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  /* Not logged in - Show login link */
                  <Link
                    href="/login"
                    className="hidden lg:flex text-[15px] font-medium text-zinc-600 hover:text-zinc-900 transition px-3"
                  >
                    התחברות
                  </Link>
                )}
              </>
            )}

            {/* Desktop only: CTA - hide when logged in */}
            {!profile && (
              <Link
                href="/create"
                className="!hidden lg:!inline-flex btn btn-primary"
              >
                התחילו
              </Link>
            )}

          </div>
        </div>
      </nav>

    </>
  );
}
