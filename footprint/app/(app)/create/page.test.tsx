/**
 * Upload Page Tests
 *
 * TDD Test Suite for UI-01: Upload Page UI
 * Tests the upload page matching 01-upload.html mockup
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CreatePage from './page';
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

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('CreatePage (Upload)', () => {
  const mockSetStep = vi.fn();
  const mockSetOriginalImage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      setStep: mockSetStep,
      setOriginalImage: mockSetOriginalImage,
      originalImage: null,
      currentStep: 'upload',
    });
  });

  describe('Page Structure', () => {
    it('renders the page header with title', () => {
      render(<CreatePage />);
      expect(screen.getByText('יצירת תמונה')).toBeInTheDocument();
    });

    it('renders back button', () => {
      render(<CreatePage />);
      const backButton = screen.getByRole('button', { name: /חזרה|back/i });
      expect(backButton).toBeInTheDocument();
    });

    it('renders page title "בחרו תמונה"', () => {
      render(<CreatePage />);
      expect(screen.getByText('בחרו תמונה')).toBeInTheDocument();
    });

    it('renders page subtitle', () => {
      render(<CreatePage />);
      expect(screen.getByText(/העלו תמונה מהגלריה/i)).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('renders all 4 progress steps', () => {
      render(<CreatePage />);
      expect(screen.getByText('העלאה')).toBeInTheDocument();
      expect(screen.getByText('סגנון')).toBeInTheDocument();
      expect(screen.getByText('התאמה')).toBeInTheDocument();
      expect(screen.getByText('תשלום')).toBeInTheDocument();
    });

    it('shows first step as active', () => {
      render(<CreatePage />);
      const uploadStep = screen.getByText('העלאה');
      expect(uploadStep.closest('[data-step]')).toHaveAttribute('data-active', 'true');
    });

    it('shows progress fill at 20%', () => {
      render(<CreatePage />);
      const progressFill = screen.getByTestId('progress-fill');
      expect(progressFill).toHaveStyle({ width: '20%' });
    });
  });

  describe('Upload Zone', () => {
    it('renders upload zone with instructions', () => {
      render(<CreatePage />);
      expect(screen.getByText('הקישו לבחירת תמונה')).toBeInTheDocument();
    });

    it('shows drag-drop hint', () => {
      render(<CreatePage />);
      expect(screen.getByText(/גררו תמונה לכאן/i)).toBeInTheDocument();
    });

    it('renders gallery button', () => {
      render(<CreatePage />);
      expect(screen.getByText('בחירה מהגלריה')).toBeInTheDocument();
    });

    it('renders camera button', () => {
      render(<CreatePage />);
      expect(screen.getByText('צילום')).toBeInTheDocument();
    });

    it('shows accepted file formats', () => {
      render(<CreatePage />);
      expect(screen.getByText(/JPG.*PNG.*HEIC/i)).toBeInTheDocument();
    });

    it('shows max file size (20MB)', () => {
      render(<CreatePage />);
      expect(screen.getByText(/20MB/i)).toBeInTheDocument();
    });
  });

  describe('Tips Section', () => {
    it('renders tips section', () => {
      render(<CreatePage />);
      expect(screen.getByText(/טיפים לתוצאה מושלמת/i)).toBeInTheDocument();
    });

    it('renders all 3 tips', () => {
      render(<CreatePage />);
      expect(screen.getByText(/תמונות באיכות גבוהה/i)).toBeInTheDocument();
      expect(screen.getByText(/פנים ברורות/i)).toBeInTheDocument();
      expect(screen.getByText(/תאורה טבעית/i)).toBeInTheDocument();
    });
  });

  describe('Bottom CTA', () => {
    it('renders next button', () => {
      render(<CreatePage />);
      expect(screen.getByText('המשך לבחירת סגנון')).toBeInTheDocument();
    });

    it('next button is disabled when no image', () => {
      render(<CreatePage />);
      const nextButton = screen.getByRole('button', { name: /המשך לבחירת סגנון/i });
      expect(nextButton).toBeDisabled();
    });

    it('next button is enabled when image is uploaded', () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setStep: mockSetStep,
        setOriginalImage: mockSetOriginalImage,
        originalImage: 'blob:test-image-url',
        currentStep: 'upload',
      });

      render(<CreatePage />);
      const nextButton = screen.getByRole('button', { name: /המשך לבחירת סגנון/i });
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('Navigation', () => {
    it('navigates back when back button clicked', () => {
      render(<CreatePage />);

      const backButton = screen.getByRole('button', { name: /חזרה|back/i });
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('navigates to style page when next clicked with image', () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setStep: mockSetStep,
        setOriginalImage: mockSetOriginalImage,
        originalImage: 'blob:test-image-url',
        currentStep: 'upload',
      });

      render(<CreatePage />);

      const nextButton = screen.getByRole('button', { name: /המשך לבחירת סגנון/i });
      fireEvent.click(nextButton);

      expect(mockSetStep).toHaveBeenCalledWith('style');
      expect(mockPush).toHaveBeenCalledWith('/create/style');
    });
  });

  describe('Image Preview State', () => {
    it('shows preview when image is uploaded', () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setStep: mockSetStep,
        setOriginalImage: mockSetOriginalImage,
        originalImage: 'blob:test-image-url',
        currentStep: 'upload',
      });

      render(<CreatePage />);
      expect(screen.getByAltText(/התמונה שלך|preview/i)).toBeInTheDocument();
    });

    it('shows "מוכן" badge in preview state', () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setStep: mockSetStep,
        setOriginalImage: mockSetOriginalImage,
        originalImage: 'blob:test-image-url',
        currentStep: 'upload',
      });

      render(<CreatePage />);
      expect(screen.getByText('מוכן')).toBeInTheDocument();
    });

    it('shows replace button in preview state', () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setStep: mockSetStep,
        setOriginalImage: mockSetOriginalImage,
        originalImage: 'blob:test-image-url',
        currentStep: 'upload',
      });

      render(<CreatePage />);
      expect(screen.getByText('החלפת תמונה')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('renders correctly with main content wrapper', () => {
      render(<CreatePage />);
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });
});
