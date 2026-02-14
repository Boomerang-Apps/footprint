'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import {
  ChevronRight,
  Globe,
  DollarSign,
  Ruler,
  Bell,
  Mail,
  Tag,
  Maximize,
  FileText,
  Frame,
  Moon,
  Save,
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { SettingsSection } from '@/components/account/SettingsSection';
import { SettingsRow } from '@/components/account/SettingsRow';

const LANGUAGE_LABELS: Record<string, string> = {
  he: 'עברית',
  en: 'English',
};

const CURRENCY_LABELS: Record<string, string> = {
  ILS: '₪ שקל',
  USD: '$ דולר',
};

const SIZE_UNIT_LABELS: Record<string, string> = {
  cm: 'סנטימטרים',
  inches: 'אינצ׳ים',
};

const SIZE_LABELS: Record<string, string> = {
  A5: 'A5',
  A4: 'A4',
  A3: 'A3',
  A2: 'A2',
};

const PAPER_LABELS: Record<string, string> = {
  matte: 'מט',
  glossy: 'מבריק',
  canvas: 'קנבס',
};

const FRAME_LABELS: Record<string, string> = {
  none: 'ללא',
  black: 'שחור',
  white: 'לבן',
  oak: 'אלון',
};

/**
 * Settings Page - User preferences organized by section
 * Route: /account/settings
 */
export default function SettingsPage(): React.ReactElement {
  const router = useRouter();
  const settings = useSettingsStore();

  const handleBack = useCallback(() => {
    router.push('/account');
  }, [router]);

  const cycleSetting = useCallback(
    (key: 'language' | 'currency' | 'sizeUnits' | 'defaultSize' | 'defaultPaper' | 'defaultFrame', options: string[]) => {
      const current = settings[key];
      const currentIndex = options.indexOf(current);
      const nextIndex = (currentIndex + 1) % options.length;
      settings.setSetting(key, options[nextIndex] as never);
    },
    [settings]
  );

  return (
    <div data-testid="settings-page" dir="rtl" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-[600px] mx-auto">
          <button
            data-testid="settings-back-button"
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="חזור"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <h1 className="text-lg font-semibold text-gray-900">הגדרות</h1>

          <div className="w-10 h-10" />
        </div>
      </header>

      {/* Content */}
      <main role="main" className="max-w-[600px] mx-auto px-4 py-6 pb-24">
        {/* General */}
        <SettingsSection label="כללי">
          <SettingsRow
            icon={Globe}
            label="שפה"
            value={LANGUAGE_LABELS[settings.language]}
            onPress={() => cycleSetting('language', ['he', 'en'])}
          />
          <SettingsRow
            icon={DollarSign}
            label="מטבע"
            value={CURRENCY_LABELS[settings.currency]}
            onPress={() => cycleSetting('currency', ['ILS', 'USD'])}
          />
          <SettingsRow
            icon={Ruler}
            label="יחידות מידה"
            value={SIZE_UNIT_LABELS[settings.sizeUnits]}
            onPress={() => cycleSetting('sizeUnits', ['cm', 'inches'])}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection label="התראות">
          <SettingsRow
            icon={Bell}
            label="התראות פוש"
            checked={settings.pushNotifications}
            onToggle={(v) => settings.setSetting('pushNotifications', v)}
          />
          <SettingsRow
            icon={Mail}
            label="התראות אימייל"
            checked={settings.emailNotifications}
            onToggle={(v) => settings.setSetting('emailNotifications', v)}
          />
          <SettingsRow
            icon={Tag}
            label="מבצעים והצעות"
            checked={settings.promotionsOffers}
            onToggle={(v) => settings.setSetting('promotionsOffers', v)}
          />
        </SettingsSection>

        {/* Print Defaults */}
        <SettingsSection label="ברירות מחדל להדפסה">
          <SettingsRow
            icon={Maximize}
            label="גודל ברירת מחדל"
            value={SIZE_LABELS[settings.defaultSize] || settings.defaultSize}
            onPress={() => cycleSetting('defaultSize', ['A5', 'A4', 'A3', 'A2'])}
          />
          <SettingsRow
            icon={FileText}
            label="נייר ברירת מחדל"
            value={PAPER_LABELS[settings.defaultPaper] || settings.defaultPaper}
            onPress={() => cycleSetting('defaultPaper', ['matte', 'glossy', 'canvas'])}
          />
          <SettingsRow
            icon={Frame}
            label="מסגרת ברירת מחדל"
            value={FRAME_LABELS[settings.defaultFrame] || settings.defaultFrame}
            onPress={() => cycleSetting('defaultFrame', ['none', 'black', 'white', 'oak'])}
          />
        </SettingsSection>

        {/* Account */}
        <SettingsSection label="חשבון">
          <SettingsRow
            icon={Moon}
            label="מצב כהה"
            checked={settings.darkMode}
            onToggle={(v) => settings.setSetting('darkMode', v)}
          />
          <SettingsRow
            icon={Save}
            label="שמירה אוטומטית של יצירות"
            checked={settings.autoSaveCreations}
            onToggle={(v) => settings.setSetting('autoSaveCreations', v)}
          />
        </SettingsSection>

        {/* App Version */}
        <p data-testid="app-version" className="text-center text-xs text-text-muted mt-8">
          Footprint v2.1.0
        </p>
      </main>
    </div>
  );
}
