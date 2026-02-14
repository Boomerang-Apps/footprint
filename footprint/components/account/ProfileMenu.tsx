'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Heart,
  MapPin,
  Settings,
  Shield,
  HelpCircle,
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const menuItems: MenuItem[] = [
  { href: '/account/orders', label: 'ההזמנות שלי', icon: Package },
  { href: '/favorites', label: 'המועדפים שלי', icon: Heart },
  { href: '/account/addresses', label: 'כתובות שמורות', icon: MapPin },
  { href: '/account/settings', label: 'הגדרות', icon: Settings },
  { href: '/account/privacy', label: 'פרטיות ואבטחה', icon: Shield },
  { href: '/account/support', label: 'יצירת קשר', icon: HelpCircle },
];

export interface ProfileMenuProps {
  className?: string;
}

/**
 * ProfileMenu - Navigation menu list for account sub-pages
 * Each row has purple icon background, label, and chevron
 */
export function ProfileMenu({ className = '' }: ProfileMenuProps): React.ReactElement {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }, [router]);

  return (
    <div className={`mx-4 mt-4 ${className}`}>
      <Card data-testid="profile-menu" className="overflow-hidden">
        <nav aria-label="תפריט חשבון">
          <ul className="divide-y divide-light-border">
            {menuItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-light-soft transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-purple/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-brand-purple" aria-hidden="true" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-text-primary">
                    {label}
                  </span>
                  <ChevronLeft className="w-4 h-4 text-text-muted" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Card>

      <button
        data-testid="logout-button"
        onClick={handleLogout}
        className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors"
      >
        <LogOut className="w-4 h-4" aria-hidden="true" />
        התנתקות
      </button>
    </div>
  );
}

ProfileMenu.displayName = 'ProfileMenu';
