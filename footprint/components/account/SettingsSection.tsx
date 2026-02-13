import type { ReactNode } from 'react';

export interface SettingsSectionProps {
  label: string;
  children: ReactNode;
}

/**
 * SettingsSection - Section wrapper with uppercase purple label
 */
export function SettingsSection({ label, children }: SettingsSectionProps): React.ReactElement {
  return (
    <div data-testid={`settings-section-${label}`} className="mb-6">
      <h2 className="text-xs font-semibold text-brand-purple uppercase tracking-wider px-4 mb-2">
        {label}
      </h2>
      <div className="bg-white rounded-xl border border-light-border shadow-soft-sm overflow-hidden divide-y divide-light-border">
        {children}
      </div>
    </div>
  );
}

SettingsSection.displayName = 'SettingsSection';
