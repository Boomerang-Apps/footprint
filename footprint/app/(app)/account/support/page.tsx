'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { ChevronRight, Mail, Phone, MessageCircle, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';

/**
 * Contact Support Page
 * Route: /account/support
 */
export default function SupportPage(): React.ReactElement {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.push('/account');
  }, [router]);

  return (
    <div data-testid="support-page" dir="rtl" className="min-h-screen bg-gray-50">
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
          <h1 className="text-lg font-semibold text-gray-900">יצירת קשר</h1>
          <div className="w-10 h-10" />
        </div>
      </header>

      {/* Content */}
      <main role="main" className="max-w-[600px] mx-auto px-4 py-6 pb-24">
        {/* Contact Methods */}
        <Card className="overflow-hidden divide-y divide-light-border mb-6">
          <a
            href="mailto:support@footprint.co.il"
            className="flex items-center gap-3 px-4 py-4 hover:bg-light-soft transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-purple/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-brand-purple" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">אימייל</p>
              <p className="text-xs text-text-muted">support@footprint.co.il</p>
            </div>
          </a>

          <a
            href="tel:+972-3-000-0000"
            className="flex items-center gap-3 px-4 py-4 hover:bg-light-soft transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-purple/10 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-brand-purple" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">טלפון</p>
              <p className="text-xs text-text-muted">א׳-ה׳, 9:00-17:00</p>
            </div>
          </a>

          <a
            href="https://wa.me/972300000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-4 hover:bg-light-soft transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-purple/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-brand-purple" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">וואטסאפ</p>
              <p className="text-xs text-text-muted">מענה תוך שעתיים</p>
            </div>
          </a>
        </Card>

        {/* FAQ */}
        <h2 className="text-xs font-semibold text-brand-purple uppercase tracking-wider px-1 mb-2">
          שאלות נפוצות
        </h2>
        <Card className="overflow-hidden divide-y divide-light-border">
          {[
            'כמה זמן לוקח לקבל הזמנה?',
            'איך אני משנה את הכתובת למשלוח?',
            'מה מדיניות ההחזרות?',
            'איך עובד תהליך ההדפסה?',
          ].map((question) => (
            <button
              key={question}
              className="flex items-center gap-3 px-4 py-3.5 w-full text-start hover:bg-light-soft transition-colors"
              onClick={() => {}}
            >
              <HelpCircle className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
              <span className="text-sm text-text-primary">{question}</span>
            </button>
          ))}
        </Card>
      </main>
    </div>
  );
}
