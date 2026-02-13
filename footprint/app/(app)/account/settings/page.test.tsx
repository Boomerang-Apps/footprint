import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsPage from './page';

const mocks = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockSetSetting: vi.fn(),
  mockToggleSetting: vi.fn(),
  mockSettings: {
    language: 'he' as const,
    currency: 'ILS' as const,
    sizeUnits: 'cm' as const,
    pushNotifications: true,
    emailNotifications: true,
    promotionsOffers: false,
    defaultSize: 'A4',
    defaultPaper: 'matte',
    defaultFrame: 'none',
    darkMode: false,
    autoSaveCreations: true,
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.mockPush }),
}));

vi.mock('@/stores/settingsStore', () => ({
  useSettingsStore: () => ({
    ...mocks.mockSettings,
    setSetting: mocks.mockSetSetting,
    toggleSetting: mocks.mockToggleSetting,
  }),
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Layout', () => {
    it('renders settings page with data-testid', () => {
      render(<SettingsPage />);
      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    });

    it('has RTL direction', () => {
      render(<SettingsPage />);
      expect(screen.getByTestId('settings-page')).toHaveAttribute('dir', 'rtl');
    });

    it('renders header with "הגדרות" title', () => {
      render(<SettingsPage />);
      expect(screen.getByText('הגדרות')).toBeInTheDocument();
    });

    it('renders app version footer', () => {
      render(<SettingsPage />);
      expect(screen.getByTestId('app-version')).toHaveTextContent('Footprint v2.1.0');
    });
  });

  describe('Sections', () => {
    it('renders General section', () => {
      render(<SettingsPage />);
      expect(screen.getByText('כללי')).toBeInTheDocument();
    });

    it('renders Notifications section', () => {
      render(<SettingsPage />);
      expect(screen.getByText('התראות', { selector: 'h2' })).toBeInTheDocument();
    });

    it('renders Print Defaults section', () => {
      render(<SettingsPage />);
      expect(screen.getByText('ברירות מחדל להדפסה')).toBeInTheDocument();
    });

    it('renders Account section', () => {
      render(<SettingsPage />);
      expect(screen.getByText('חשבון')).toBeInTheDocument();
    });
  });

  describe('General Settings', () => {
    it('displays language setting with current value', () => {
      render(<SettingsPage />);
      expect(screen.getByText('שפה')).toBeInTheDocument();
      expect(screen.getByText('עברית')).toBeInTheDocument();
    });

    it('displays currency setting with current value', () => {
      render(<SettingsPage />);
      expect(screen.getByText('מטבע')).toBeInTheDocument();
      expect(screen.getByText('₪ שקל')).toBeInTheDocument();
    });

    it('displays size units setting', () => {
      render(<SettingsPage />);
      expect(screen.getByText('יחידות מידה')).toBeInTheDocument();
      expect(screen.getByText('סנטימטרים')).toBeInTheDocument();
    });
  });

  describe('Notification Toggles', () => {
    it('renders push notifications toggle', () => {
      render(<SettingsPage />);
      expect(screen.getByText('התראות פוש')).toBeInTheDocument();
    });

    it('renders email notifications toggle', () => {
      render(<SettingsPage />);
      expect(screen.getByText('התראות אימייל')).toBeInTheDocument();
    });

    it('renders promotions toggle', () => {
      render(<SettingsPage />);
      expect(screen.getByText('מבצעים והצעות')).toBeInTheDocument();
    });

    it('renders switch components for notification settings', () => {
      render(<SettingsPage />);
      const switches = screen.getAllByRole('switch');
      // 3 notification + 2 account toggles = 5 total
      expect(switches.length).toBeGreaterThanOrEqual(3);
    });

    it('calls setSetting when a notification toggle is clicked', () => {
      render(<SettingsPage />);
      const switches = screen.getAllByRole('switch');
      // Push notifications is the first switch
      fireEvent.click(switches[0]);
      expect(mocks.mockSetSetting).toHaveBeenCalledWith('pushNotifications', false);
    });
  });

  describe('Print Defaults', () => {
    it('displays default size', () => {
      render(<SettingsPage />);
      expect(screen.getByText('גודל ברירת מחדל')).toBeInTheDocument();
      expect(screen.getByText('A4')).toBeInTheDocument();
    });

    it('displays default paper', () => {
      render(<SettingsPage />);
      expect(screen.getByText('נייר ברירת מחדל')).toBeInTheDocument();
      expect(screen.getByText('מט')).toBeInTheDocument();
    });

    it('displays default frame', () => {
      render(<SettingsPage />);
      expect(screen.getByText('מסגרת ברירת מחדל')).toBeInTheDocument();
      expect(screen.getByText('ללא')).toBeInTheDocument();
    });
  });

  describe('Account Settings', () => {
    it('renders dark mode toggle', () => {
      render(<SettingsPage />);
      expect(screen.getByText('מצב כהה')).toBeInTheDocument();
    });

    it('renders auto-save toggle', () => {
      render(<SettingsPage />);
      expect(screen.getByText('שמירה אוטומטית של יצירות')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates back to /account on back button click', () => {
      render(<SettingsPage />);
      fireEvent.click(screen.getByTestId('settings-back-button'));
      expect(mocks.mockPush).toHaveBeenCalledWith('/account');
    });

    it('back button has accessible label', () => {
      render(<SettingsPage />);
      expect(screen.getByLabelText('חזור')).toBeInTheDocument();
    });
  });
});
