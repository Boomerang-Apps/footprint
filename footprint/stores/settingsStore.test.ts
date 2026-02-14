import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from './settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetSettings();
  });

  describe('Default Values', () => {
    it('should initialize with Hebrew language', () => {
      expect(useSettingsStore.getState().language).toBe('he');
    });

    it('should initialize with ILS currency', () => {
      expect(useSettingsStore.getState().currency).toBe('ILS');
    });

    it('should initialize with cm size units', () => {
      expect(useSettingsStore.getState().sizeUnits).toBe('cm');
    });

    it('should initialize with push notifications enabled', () => {
      expect(useSettingsStore.getState().pushNotifications).toBe(true);
    });

    it('should initialize with email notifications enabled', () => {
      expect(useSettingsStore.getState().emailNotifications).toBe(true);
    });

    it('should initialize with promotions disabled', () => {
      expect(useSettingsStore.getState().promotionsOffers).toBe(false);
    });

    it('should initialize with A4 default size', () => {
      expect(useSettingsStore.getState().defaultSize).toBe('A4');
    });

    it('should initialize with matte default paper', () => {
      expect(useSettingsStore.getState().defaultPaper).toBe('matte');
    });

    it('should initialize with none default frame', () => {
      expect(useSettingsStore.getState().defaultFrame).toBe('none');
    });

    it('should initialize with dark mode disabled', () => {
      expect(useSettingsStore.getState().darkMode).toBe(false);
    });

    it('should initialize with auto-save creations enabled', () => {
      expect(useSettingsStore.getState().autoSaveCreations).toBe(true);
    });
  });

  describe('setSetting', () => {
    it('should update language', () => {
      useSettingsStore.getState().setSetting('language', 'en');
      expect(useSettingsStore.getState().language).toBe('en');
    });

    it('should update currency', () => {
      useSettingsStore.getState().setSetting('currency', 'USD');
      expect(useSettingsStore.getState().currency).toBe('USD');
    });

    it('should update sizeUnits', () => {
      useSettingsStore.getState().setSetting('sizeUnits', 'inches');
      expect(useSettingsStore.getState().sizeUnits).toBe('inches');
    });

    it('should update defaultSize', () => {
      useSettingsStore.getState().setSetting('defaultSize', 'A3');
      expect(useSettingsStore.getState().defaultSize).toBe('A3');
    });

    it('should update defaultPaper', () => {
      useSettingsStore.getState().setSetting('defaultPaper', 'glossy');
      expect(useSettingsStore.getState().defaultPaper).toBe('glossy');
    });

    it('should update defaultFrame', () => {
      useSettingsStore.getState().setSetting('defaultFrame', 'black');
      expect(useSettingsStore.getState().defaultFrame).toBe('black');
    });
  });

  describe('toggleSetting', () => {
    it('should toggle pushNotifications from true to false', () => {
      expect(useSettingsStore.getState().pushNotifications).toBe(true);
      useSettingsStore.getState().toggleSetting('pushNotifications');
      expect(useSettingsStore.getState().pushNotifications).toBe(false);
    });

    it('should toggle pushNotifications from false to true', () => {
      useSettingsStore.getState().setSetting('pushNotifications', false);
      useSettingsStore.getState().toggleSetting('pushNotifications');
      expect(useSettingsStore.getState().pushNotifications).toBe(true);
    });

    it('should toggle emailNotifications', () => {
      useSettingsStore.getState().toggleSetting('emailNotifications');
      expect(useSettingsStore.getState().emailNotifications).toBe(false);
    });

    it('should toggle promotionsOffers', () => {
      useSettingsStore.getState().toggleSetting('promotionsOffers');
      expect(useSettingsStore.getState().promotionsOffers).toBe(true);
    });

    it('should toggle darkMode', () => {
      useSettingsStore.getState().toggleSetting('darkMode');
      expect(useSettingsStore.getState().darkMode).toBe(true);
    });

    it('should toggle autoSaveCreations', () => {
      useSettingsStore.getState().toggleSetting('autoSaveCreations');
      expect(useSettingsStore.getState().autoSaveCreations).toBe(false);
    });

    it('should not toggle non-boolean settings', () => {
      useSettingsStore.getState().toggleSetting('language');
      expect(useSettingsStore.getState().language).toBe('he');
    });
  });

  describe('resetSettings', () => {
    it('should reset all settings to defaults', () => {
      useSettingsStore.getState().setSetting('language', 'en');
      useSettingsStore.getState().setSetting('currency', 'USD');
      useSettingsStore.getState().toggleSetting('darkMode');

      useSettingsStore.getState().resetSettings();

      expect(useSettingsStore.getState().language).toBe('he');
      expect(useSettingsStore.getState().currency).toBe('ILS');
      expect(useSettingsStore.getState().darkMode).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('should use footprint-settings as localStorage key', () => {
      useSettingsStore.getState().setSetting('language', 'en');

      const stored = localStorage.getItem('footprint-settings');
      expect(stored).toBeDefined();
      expect(stored).not.toBeNull();
    });
  });
});
