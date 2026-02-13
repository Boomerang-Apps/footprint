'use client';

import { ChevronLeft } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';

export interface SettingsRowProps {
  icon: React.ElementType;
  label: string;
  /** For drill-down rows: current value displayed on the right */
  value?: string;
  /** For toggle rows */
  checked?: boolean;
  /** Callback for toggle rows */
  onToggle?: (checked: boolean) => void;
  /** Callback for drill-down rows */
  onPress?: () => void;
}

/**
 * SettingsRow - Row item with icon, label, and either toggle or drill-down chevron
 */
export function SettingsRow({
  icon: Icon,
  label,
  value,
  checked,
  onToggle,
  onPress,
}: SettingsRowProps): React.ReactElement {
  const isToggle = checked !== undefined && onToggle !== undefined;

  const content = (
    <>
      <div className="w-9 h-9 rounded-lg bg-brand-purple/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-brand-purple" aria-hidden="true" />
      </div>
      <span className="flex-1 text-sm font-medium text-text-primary">
        {label}
      </span>
      {isToggle ? (
        <Switch
          checked={checked}
          onCheckedChange={onToggle}
          label={label}
        />
      ) : (
        <div className="flex items-center gap-1">
          {value && (
            <span className="text-sm text-text-muted">{value}</span>
          )}
          <ChevronLeft className="w-4 h-4 text-text-muted" aria-hidden="true" />
        </div>
      )}
    </>
  );

  if (isToggle) {
    return (
      <div
        data-testid={`settings-row-${label}`}
        className="flex items-center gap-3 px-4 py-3.5"
      >
        {content}
      </div>
    );
  }

  return (
    <button
      data-testid={`settings-row-${label}`}
      onClick={onPress}
      className="flex items-center gap-3 px-4 py-3.5 w-full text-start hover:bg-light-soft transition-colors"
    >
      {content}
    </button>
  );
}

SettingsRow.displayName = 'SettingsRow';
