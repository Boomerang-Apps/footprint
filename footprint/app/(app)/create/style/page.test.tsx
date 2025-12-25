/**
 * Style Selection Page Tests
 *
 * TDD Test Suite for UI-02: Style Selection UI
 * Tests the style page matching 02-style-selection.html mockup
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StylePage from './page';
import { useOrderStore } from '@/stores/orderStore';

// Mock next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// Mock zustand store
vi.mock('@/stores/orderStore');

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('StylePage', () => {
  const mockSetStep = vi.fn();
  const mockSetSelectedStyle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      setStep: mockSetStep,
      setSelectedStyle: mockSetSelectedStyle,
      originalImage: 'blob:test-image-url',
      selectedStyle: 'pop_art',
      currentStep: 'style',
    });
  });

  describe('Page Structure', () => {
    it('renders the page header with title "בחירת סגנון"', () => {
      render(<StylePage />);
      expect(screen.getByText('בחירת סגנון')).toBeInTheDocument();
    });

    it('renders back button in header', () => {
      render(<StylePage />);
      // Header back button has aria-label="חזרה"
      const backButtons = screen.getAllByRole('button', { name: /חזרה|back/i });
      expect(backButtons.length).toBeGreaterThan(0);
    });

    it('renders main content wrapper', () => {
      render(<StylePage />);
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('renders all 4 progress steps', () => {
      render(<StylePage />);
      expect(screen.getByText('העלאה')).toBeInTheDocument();
      expect(screen.getByText('סגנון')).toBeInTheDocument();
      expect(screen.getByText('התאמה')).toBeInTheDocument();
      expect(screen.getByText('תשלום')).toBeInTheDocument();
    });

    it('shows step 1 as completed', () => {
      render(<StylePage />);
      const uploadStep = screen.getByText('העלאה').closest('[data-step]');
      expect(uploadStep).toHaveAttribute('data-completed', 'true');
    });

    it('shows step 2 as active', () => {
      render(<StylePage />);
      const styleStep = screen.getByText('סגנון').closest('[data-step]');
      expect(styleStep).toHaveAttribute('data-active', 'true');
    });

    it('shows progress fill at 40%', () => {
      render(<StylePage />);
      const progressFill = screen.getByTestId('progress-fill');
      expect(progressFill).toHaveStyle({ width: '40%' });
    });
  });

  describe('Preview Container', () => {
    it('renders preview image', () => {
      render(<StylePage />);
      const preview = screen.getByAltText(/התמונה שלך|preview/i);
      expect(preview).toBeInTheDocument();
    });

    it('renders close button', () => {
      render(<StylePage />);
      const closeButton = screen.getByRole('button', { name: /סגירה|close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('renders style badge with current style name', () => {
      render(<StylePage />);
      const styleBadge = screen.getByTestId('style-badge');
      expect(styleBadge).toHaveTextContent('פופ ארט');
    });
  });

  describe('Style Strip', () => {
    it('renders styles section title', () => {
      render(<StylePage />);
      expect(screen.getByText('בחרו סגנון אמנות')).toBeInTheDocument();
    });

    it('renders styles section subtitle', () => {
      render(<StylePage />);
      expect(screen.getByText(/הקישו על סגנון לתצוגה מקדימה/i)).toBeInTheDocument();
    });

    it('renders all 8 style options', () => {
      render(<StylePage />);
      // Check for style buttons using aria-label
      expect(screen.getByRole('button', { name: 'פופ ארט' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'צבעי מים' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ציור קווי' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ציור שמן' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'רומנטי' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'קומיקס' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'וינטג׳' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'מקורי משופר' })).toBeInTheDocument();
    });

    it('shows "פופולרי" badge on Pop Art', () => {
      render(<StylePage />);
      const popularBadges = screen.getAllByText('פופולרי');
      expect(popularBadges.length).toBeGreaterThan(0);
    });

    it('shows "חדש" badge on Romantic', () => {
      render(<StylePage />);
      expect(screen.getByText('חדש')).toBeInTheDocument();
    });

    it('highlights selected style', () => {
      render(<StylePage />);
      const popArtButton = screen.getByRole('button', { name: /פופ ארט/i });
      expect(popArtButton).toHaveAttribute('data-selected', 'true');
    });
  });

  describe('Free Preview Notice', () => {
    it('renders free preview notice', () => {
      render(<StylePage />);
      expect(screen.getByText(/תצוגה מקדימה חינם/i)).toBeInTheDocument();
    });
  });

  describe('Bottom CTA', () => {
    it('renders back button "חזרה"', () => {
      render(<StylePage />);
      const backButtons = screen.getAllByText('חזרה');
      expect(backButtons.length).toBeGreaterThan(0);
    });

    it('renders continue button "אהבתי! המשך"', () => {
      render(<StylePage />);
      expect(screen.getByText('אהבתי! המשך')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates back when close button clicked', () => {
      render(<StylePage />);
      const closeButton = screen.getByRole('button', { name: /סגירה|close/i });
      fireEvent.click(closeButton);
      expect(mockPush).toHaveBeenCalledWith('/create');
    });

    it('navigates back when header back button clicked', () => {
      render(<StylePage />);
      // Get all back buttons and click the first one (header)
      const backButtons = screen.getAllByRole('button', { name: /חזרה|back/i });
      fireEvent.click(backButtons[0]);
      expect(mockPush).toHaveBeenCalledWith('/create');
    });

    it('navigates to customize page when continue clicked', () => {
      render(<StylePage />);
      const continueButton = screen.getByText('אהבתי! המשך');
      fireEvent.click(continueButton);
      expect(mockSetStep).toHaveBeenCalledWith('customize');
      expect(mockPush).toHaveBeenCalledWith('/create/customize');
    });
  });

  describe('Style Selection', () => {
    it('calls setSelectedStyle when a style is clicked', () => {
      render(<StylePage />);
      const watercolorButton = screen.getByRole('button', { name: /צבעי מים/i });
      fireEvent.click(watercolorButton);
      expect(mockSetSelectedStyle).toHaveBeenCalledWith('watercolor');
    });

    it('updates style badge when style changes', () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setStep: mockSetStep,
        setSelectedStyle: mockSetSelectedStyle,
        originalImage: 'blob:test-image-url',
        selectedStyle: 'watercolor',
        currentStep: 'style',
      });

      render(<StylePage />);
      // Find the style badge (not the button)
      const styleBadge = screen.getByTestId('style-badge');
      expect(styleBadge).toHaveTextContent('צבעי מים');
    });
  });

  describe('AI Processing Overlay', () => {
    it('shows processing overlay when style is selected', async () => {
      render(<StylePage />);
      const oilButton = screen.getByRole('button', { name: /ציור שמן/i });
      fireEvent.click(oilButton);

      // Overlay should appear
      await waitFor(() => {
        expect(screen.getByTestId('ai-overlay')).toBeInTheDocument();
      });
    });

    it('hides processing overlay after timeout', async () => {
      vi.useFakeTimers();
      render(<StylePage />);
      const oilButton = screen.getByRole('button', { name: 'ציור שמן' });
      fireEvent.click(oilButton);

      // Overlay should be visible
      expect(screen.getByTestId('ai-overlay')).toBeInTheDocument();

      // Advance timers past the 1500ms timeout
      await vi.advanceTimersByTimeAsync(2000);

      // Overlay should be gone
      expect(screen.queryByTestId('ai-overlay')).not.toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe('Redirect without image', () => {
    it('redirects to upload page if no original image', () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setStep: mockSetStep,
        setSelectedStyle: mockSetSelectedStyle,
        originalImage: null,
        selectedStyle: null,
        currentStep: 'style',
      });

      render(<StylePage />);
      expect(mockPush).toHaveBeenCalledWith('/create');
    });
  });

  describe('Responsive Design', () => {
    it('renders style strip as horizontal scrollable', () => {
      render(<StylePage />);
      const styleStrip = screen.getByTestId('style-strip');
      expect(styleStrip).toHaveClass('overflow-x-auto');
    });
  });
});
