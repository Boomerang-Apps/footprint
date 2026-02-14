'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { ChevronRight, Shield, Lock, Eye, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';

/**
 * Privacy & Security Page
 * Route: /account/privacy
 */
export default function PrivacyPage(): React.ReactElement {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.push('/account');
  }, [router]);

  return (
    <div data-testid="privacy-page" dir="rtl" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-[600px] mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="חזור"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">פרטיות ואבטחה</h1>
          <div className="w-10 h-10" />
        </div>
      </header>

      {/* Content */}
      <main role="main" className="max-w-[600px] mx-auto px-4 py-6 pb-24">
        <Card className="overflow-hidden divide-y divide-light-border">
          {[
            { icon: Lock, label: 'שינוי סיסמה', description: 'עדכן את הסיסמה שלך' },
            { icon: Eye, label: 'נראות פרופיל', description: 'מי יכול לראות את הפרופיל שלך' },
            { icon: Shield, label: 'אימות דו-שלבי', description: 'הגנה נוספת על החשבון' },
            { icon: Trash2, label: 'מחיקת חשבון', description: 'מחק לצמיתות את החשבון שלך' },
          ].map(({ icon: Icon, label, description }) => (
            <button
              key={label}
              className="flex items-center gap-3 px-4 py-4 w-full text-start hover:bg-light-soft transition-colors"
              onClick={() => {}}
            >
              <div className="w-9 h-9 rounded-lg bg-brand-purple/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-brand-purple" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{label}</p>
                <p className="text-xs text-text-muted">{description}</p>
              </div>
            </button>
          ))}
        </Card>

        <p className="text-center text-xs text-text-muted mt-6">
          הנתונים שלך מוגנים בהצפנה מקצה לקצה
        </p>
      </main>
    </div>
  );
}
