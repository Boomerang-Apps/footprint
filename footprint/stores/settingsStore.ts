/**
 * Settings Store
 *
 * Manages user preferences using Zustand with localStorage persistence.
 * Covers General, Notifications, Print Defaults, and Account settings.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  // General
  language: 'he' | 'en';
  currency: 'ILS' | 'USD';
  sizeUnits: 'cm' | 'inches';
  // Notifications
  pushNotifications: boolean;
  emailNotifications: boolean;
  promotionsOffers: boolean;
  // Print Defaults
  defaultSize: string;
  defaultPaper: string;
  defaultFrame: string;
  // Account
  darkMode: boolean;
  autoSaveCreations: boolean;
}

export interface SettingsActions {
  setSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  toggleSetting: (key: keyof SettingsState) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: SettingsState = {
  language: 'he',
  currency: 'ILS',
  sizeUnits: 'cm',
  pushNotifications: true,
  emailNotifications: true,
  promotionsOffers: false,
  defaultSize: 'A4',
  defaultPaper: 'matte',
  defaultFrame: 'none',
  darkMode: false,
  autoSaveCreations: true,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      setSetting: (key, value) => {
        set({ [key]: value });
      },

      toggleSetting: (key) => {
        const current = get()[key];
        if (typeof current === 'boolean') {
          set({ [key]: !current });
        }
      },

      resetSettings: () => {
        set(DEFAULT_SETTINGS);
      },
    }),
    {
      name: 'footprint-settings',
      partialize: (state) => ({
        language: state.language,
        currency: state.currency,
        sizeUnits: state.sizeUnits,
        pushNotifications: state.pushNotifications,
        emailNotifications: state.emailNotifications,
        promotionsOffers: state.promotionsOffers,
        defaultSize: state.defaultSize,
        defaultPaper: state.defaultPaper,
        defaultFrame: state.defaultFrame,
        darkMode: state.darkMode,
        autoSaveCreations: state.autoSaveCreations,
      }),
    }
  )
);
