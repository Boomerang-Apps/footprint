import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Globe } from 'lucide-react';
import { SettingsRow } from './SettingsRow';

describe('SettingsRow', () => {
  describe('Drill-down mode', () => {
    it('renders label and value', () => {
      render(
        <SettingsRow icon={Globe} label="שפה" value="עברית" onPress={() => {}} />
      );
      expect(screen.getByText('שפה')).toBeInTheDocument();
      expect(screen.getByText('עברית')).toBeInTheDocument();
    });

    it('renders as a button for drill-down rows', () => {
      render(
        <SettingsRow icon={Globe} label="שפה" value="עברית" onPress={() => {}} />
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('calls onPress when clicked', () => {
      const onPress = vi.fn();
      render(
        <SettingsRow icon={Globe} label="שפה" value="עברית" onPress={onPress} />
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onPress).toHaveBeenCalled();
    });

    it('has data-testid with label', () => {
      render(
        <SettingsRow icon={Globe} label="שפה" value="עברית" onPress={() => {}} />
      );
      expect(screen.getByTestId('settings-row-שפה')).toBeInTheDocument();
    });
  });

  describe('Toggle mode', () => {
    it('renders switch when checked and onToggle provided', () => {
      render(
        <SettingsRow icon={Globe} label="התראות" checked={true} onToggle={() => {}} />
      );
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('switch reflects checked state', () => {
      render(
        <SettingsRow icon={Globe} label="התראות" checked={true} onToggle={() => {}} />
      );
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

    it('calls onToggle when switch is clicked', () => {
      const onToggle = vi.fn();
      render(
        <SettingsRow icon={Globe} label="התראות" checked={false} onToggle={onToggle} />
      );
      fireEvent.click(screen.getByRole('switch'));
      expect(onToggle).toHaveBeenCalledWith(true);
    });

    it('renders as div (not button) for toggle rows', () => {
      render(
        <SettingsRow icon={Globe} label="התראות" checked={true} onToggle={() => {}} />
      );
      expect(screen.queryByRole('button')).toBeNull();
    });
  });

  describe('Icon', () => {
    it('renders the icon', () => {
      render(
        <SettingsRow icon={Globe} label="שפה" value="עברית" onPress={() => {}} />
      );
      const iconContainer = screen.getByTestId('settings-row-שפה').querySelector('.bg-brand-purple\\/10');
      expect(iconContainer).toBeInTheDocument();
    });
  });
});
