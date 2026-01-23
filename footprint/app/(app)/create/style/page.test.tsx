/**
 * Style Selection Page Tests
 *
 * TDD Test Suite for UI-02: Style Selection UI
 * Tests the style page matching 02-style-selection.html mockup
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

// Mock fetch for transform API
const mockFetch = vi.fn();

describe('StylePage', () => {
  const mockSetStep = vi.fn();
  const mockSetSelectedStyle = vi.fn();
  const mockSetTransformedImage = vi.fn();
  const mockSetIsTransforming = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup fetch mock to prevent actual API calls in all tests
    global.fetch = mockFetch;
    mockFetch.mockReset();
    // Default mock: successful transform
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        transformedUrl: 'https://r2.example.com/transformed/test.jpg',
        style: 'pop_art',
        processingTime: 3000,
      }),
    });

    (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      setStep: mockSetStep,
      setSelectedStyle: mockSetSelectedStyle,
      setTransformedImage: mockSetTransformedImage,
      setIsTransforming: mockSetIsTransforming,
      originalImage: 'blob:test-image-url',
      transformedImage: null,
      selectedStyle: 'original',
      isTransforming: false,
      currentStep: 'style',
      savedVersions: [],
      addSavedVersion: vi.fn(),
      removeSavedVersion: vi.fn(),
      selectSavedVersion: vi.fn(),
      _hasHydrated: true,
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

    it('shows style step as active', () => {
      render(<StylePage />);
      const styleStep = screen.getByText('סגנון').closest('[data-step]');
      expect(styleStep).toHaveAttribute('data-active', 'true');
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

    it('renders style badge with current style name when transformed', () => {
      // Style badge only shows when transformedImage exists and style is not 'original'
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setStep: mockSetStep,
        setSelectedStyle: mockSetSelectedStyle,
        setTransformedImage: mockSetTransformedImage,
        setIsTransforming: mockSetIsTransforming,
        originalImage: 'blob:test-image-url',
        transformedImage: 'blob:transformed-image-url',
        selectedStyle: 'watercolor',
        isTransforming: false,
        currentStep: 'style',
        savedVersions: [],
        addSavedVersion: vi.fn(),
        removeSavedVersion: vi.fn(),
        selectSavedVersion: vi.fn(),
        _hasHydrated: true,
      });

      render(<StylePage />);
      const styleBadge = screen.getByTestId('style-badge');
      expect(styleBadge).toHaveTextContent('צבעי מים');
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

    it('renders all 6 style options', () => {
      render(<StylePage />);
      // Check for style buttons using aria-label - current 6 styles
      expect(screen.getByRole('button', { name: 'ללא פילטר' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'צבעי מים' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ציור קווי' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'קו+מים' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ציור שמן' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'אווטאר קרטון' })).toBeInTheDocument();
    });

    it('highlights selected style', () => {
      render(<StylePage />);
      const originalButton = screen.getByRole('button', { name: /ללא פילטר/i });
      expect(originalButton).toHaveAttribute('data-selected', 'true');
    });
  });

  describe('Section Headers', () => {
    it('renders style selection title', () => {
      render(<StylePage />);
      expect(screen.getByText('בחרו סגנון אמנות')).toBeInTheDocument();
    });
  });

  describe('Bottom CTA', () => {
    it('renders back button with aria-label', () => {
      render(<StylePage />);
      const backButtons = screen.getAllByRole('button', { name: /חזרה|back/i });
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

    it('navigates to tweak page when continue clicked', () => {
      render(<StylePage />);
      const continueButton = screen.getByText('אהבתי! המשך');
      fireEvent.click(continueButton);
      expect(mockSetStep).toHaveBeenCalledWith('tweak');
      expect(mockPush).toHaveBeenCalledWith('/create/tweak');
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
        setTransformedImage: mockSetTransformedImage,
        setIsTransforming: mockSetIsTransforming,
        originalImage: 'blob:test-image-url',
        transformedImage: 'blob:transformed-image-url',
        selectedStyle: 'watercolor',
        isTransforming: false,
        currentStep: 'style',
        savedVersions: [],
        addSavedVersion: vi.fn(),
        removeSavedVersion: vi.fn(),
        selectSavedVersion: vi.fn(),
        _hasHydrated: true,
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
        setTransformedImage: mockSetTransformedImage,
        setIsTransforming: mockSetIsTransforming,
        originalImage: null,
        transformedImage: null,
        selectedStyle: null,
        isTransforming: false,
        currentStep: 'style',
        savedVersions: [],
        addSavedVersion: vi.fn(),
        removeSavedVersion: vi.fn(),
        selectSavedVersion: vi.fn(),
        _hasHydrated: true,
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

  describe('AI Transform Integration', () => {
    const mockSetTransformedImage = vi.fn();
    const mockSetIsTransforming = vi.fn();

    beforeEach(() => {
      global.fetch = mockFetch;
      mockFetch.mockReset();

      // Setup mock store with transform-related fields
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setStep: mockSetStep,
        setSelectedStyle: mockSetSelectedStyle,
        setTransformedImage: mockSetTransformedImage,
        setIsTransforming: mockSetIsTransforming,
        isTransforming: false,
        originalImage: 'https://r2.example.com/uploads/user123/image.jpg',
        transformedImage: null,
        selectedStyle: 'original',
        currentStep: 'style',
        savedVersions: [],
        addSavedVersion: vi.fn(),
        removeSavedVersion: vi.fn(),
        selectSavedVersion: vi.fn(),
        _hasHydrated: true,
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('calls transform API when style is selected', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          transformedUrl: 'https://r2.example.com/transformed/pop_art.jpg',
          style: 'watercolor',
          processingTime: 3000,
        }),
      });

      render(<StylePage />);

      const watercolorButton = screen.getByRole('button', { name: /צבעי מים/i });

      await act(async () => {
        fireEvent.click(watercolorButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/transform', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }));
      });
    });

    it('sends correct parameters to transform API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          transformedUrl: 'https://r2.example.com/transformed/watercolor.jpg',
          style: 'watercolor',
          processingTime: 3000,
        }),
      });

      render(<StylePage />);

      const watercolorButton = screen.getByRole('button', { name: /צבעי מים/i });

      await act(async () => {
        fireEvent.click(watercolorButton);
      });

      await waitFor(() => {
        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody.imageUrl).toBe('https://r2.example.com/uploads/user123/image.jpg');
        expect(callBody.style).toBe('watercolor');
      });
    });

    it('stores transformed URL in orderStore on success', async () => {
      const transformedUrl = 'https://r2.example.com/transformed/watercolor.jpg';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          transformedUrl,
          style: 'watercolor',
          processingTime: 3000,
        }),
      });

      render(<StylePage />);

      const watercolorButton = screen.getByRole('button', { name: /צבעי מים/i });

      await act(async () => {
        fireEvent.click(watercolorButton);
      });

      await waitFor(() => {
        expect(mockSetTransformedImage).toHaveBeenCalledWith(transformedUrl);
      });
    });

    it('shows error message on transform failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Transform failed' }),
      });

      render(<StylePage />);

      const watercolorButton = screen.getByRole('button', { name: /צבעי מים/i });

      await act(async () => {
        fireEvent.click(watercolorButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('transform-error')).toBeInTheDocument();
      });
    });

    it('shows retry button on transform error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Transform failed' }),
      });

      render(<StylePage />);

      const watercolorButton = screen.getByRole('button', { name: /צבעי מים/i });

      await act(async () => {
        fireEvent.click(watercolorButton);
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /נסה שוב|retry/i })).toBeInTheDocument();
      });
    });

    it('retries transform when retry button is clicked', async () => {
      // First call fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Transform failed' }),
      });

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          transformedUrl: 'https://r2.example.com/transformed/watercolor.jpg',
          style: 'watercolor',
          processingTime: 3000,
        }),
      });

      render(<StylePage />);

      const watercolorButton = screen.getByRole('button', { name: /צבעי מים/i });

      await act(async () => {
        fireEvent.click(watercolorButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('transform-error')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /נסה שוב|retry/i });

      await act(async () => {
        fireEvent.click(retryButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });

    it('disables continue button during transform', async () => {
      // Mock store with isTransforming true
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setStep: mockSetStep,
        setSelectedStyle: mockSetSelectedStyle,
        setTransformedImage: mockSetTransformedImage,
        setIsTransforming: mockSetIsTransforming,
        isTransforming: true,
        originalImage: 'https://r2.example.com/uploads/user123/image.jpg',
        transformedImage: null,
        selectedStyle: 'original',
        currentStep: 'style',
        savedVersions: [],
        addSavedVersion: vi.fn(),
        removeSavedVersion: vi.fn(),
        selectSavedVersion: vi.fn(),
        _hasHydrated: true,
      });

      render(<StylePage />);

      const continueButton = screen.getByText('אהבתי! המשך').closest('button');
      expect(continueButton).toBeDisabled();
    });

    it('displays transformed image in preview after successful transform', async () => {
      const transformedUrl = 'https://r2.example.com/transformed/watercolor.jpg';

      // Mock store with transformed image
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setStep: mockSetStep,
        setSelectedStyle: mockSetSelectedStyle,
        setTransformedImage: mockSetTransformedImage,
        setIsTransforming: mockSetIsTransforming,
        isTransforming: false,
        originalImage: 'https://r2.example.com/uploads/user123/image.jpg',
        transformedImage: transformedUrl,
        selectedStyle: 'watercolor',
        currentStep: 'style',
        savedVersions: [],
        addSavedVersion: vi.fn(),
        removeSavedVersion: vi.fn(),
        selectSavedVersion: vi.fn(),
        _hasHydrated: true,
      });

      render(<StylePage />);

      const previewImage = screen.getByAltText(/התמונה שלך|preview/i);
      expect(previewImage).toHaveAttribute('src', transformedUrl);
    });

    it('shows processing overlay during transform', async () => {
      // Mock store with isTransforming true
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setStep: mockSetStep,
        setSelectedStyle: mockSetSelectedStyle,
        setTransformedImage: mockSetTransformedImage,
        setIsTransforming: mockSetIsTransforming,
        isTransforming: true,
        originalImage: 'https://r2.example.com/uploads/user123/image.jpg',
        transformedImage: null,
        selectedStyle: 'original',
        currentStep: 'style',
        savedVersions: [],
        addSavedVersion: vi.fn(),
        removeSavedVersion: vi.fn(),
        selectSavedVersion: vi.fn(),
        _hasHydrated: true,
      });

      render(<StylePage />);

      expect(screen.getByTestId('ai-overlay')).toBeInTheDocument();
    });

    it('handles network error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<StylePage />);

      const watercolorButton = screen.getByRole('button', { name: /צבעי מים/i });

      await act(async () => {
        fireEvent.click(watercolorButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('transform-error')).toBeInTheDocument();
      });
    });

    it('clears previous error when retrying', async () => {
      // First call fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Transform failed' }),
      });

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          transformedUrl: 'https://r2.example.com/transformed/watercolor.jpg',
          style: 'watercolor',
          processingTime: 3000,
        }),
      });

      render(<StylePage />);

      const watercolorButton = screen.getByRole('button', { name: /צבעי מים/i });

      await act(async () => {
        fireEvent.click(watercolorButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('transform-error')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /נסה שוב|retry/i });

      await act(async () => {
        fireEvent.click(retryButton);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('transform-error')).not.toBeInTheDocument();
      });
    });
  });
});
