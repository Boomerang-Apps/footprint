/**
 * Upload Page Tests
 *
 * TDD Test Suite for UI-01: Upload Page UI
 * Tests the upload page matching 01-upload.html mockup
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

// Mock fetch for upload API
const mockFetch = vi.fn();

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

  describe('R2 Upload Integration', () => {
    beforeEach(() => {
      // Setup fetch mock
      global.fetch = mockFetch;
      mockFetch.mockReset();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('shows upload progress indicator during upload', async () => {
      // Mock a slow upload response
      mockFetch.mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ publicUrl: 'https://r2.example.com/image.jpg' })
          }), 100)
        )
      );

      render(<CreatePage />);

      // Trigger file upload
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      // Should show uploading indicator
      expect(screen.getByTestId('upload-progress')).toBeInTheDocument();
    });

    it('shows error message on upload failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Upload failed' })
      });

      render(<CreatePage />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(screen.getByTestId('upload-error')).toBeInTheDocument();
      });
    });

    it('disables next button during upload', async () => {
      mockFetch.mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ publicUrl: 'https://r2.example.com/image.jpg' })
          }), 500)
        )
      );

      render(<CreatePage />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      const nextButton = screen.getByRole('button', { name: /המשך לבחירת סגנון/i });
      expect(nextButton).toBeDisabled();
    });

    it('calls upload API with direct mode when file is selected', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          publicUrl: 'https://r2.example.com/image.jpg',
          key: 'uploads/user123/image.jpg',
          size: 12345
        })
      });

      render(<CreatePage />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
          method: 'POST',
        }));
      });

      // Verify FormData was sent
      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1].body).toBeInstanceOf(FormData);
    });

    it('stores R2 URL in orderStore on successful upload', async () => {
      const r2Url = 'https://r2.example.com/uploads/user123/image.jpg';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          publicUrl: r2Url,
          key: 'uploads/user123/image.jpg',
          size: 12345
        })
      });

      render(<CreatePage />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(mockSetOriginalImage).toHaveBeenCalledWith(r2Url, file);
      });
    });

    it('shows retry button on upload error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Network error' })
      });

      render(<CreatePage />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /נסה שוב|retry/i })).toBeInTheDocument();
      });
    });

    it('clears error and retries upload when retry button clicked', async () => {
      // First call fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Network error' })
      });

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          publicUrl: 'https://r2.example.com/image.jpg',
          key: 'uploads/user123/image.jpg',
          size: 12345
        })
      });

      render(<CreatePage />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(screen.getByTestId('upload-error')).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByRole('button', { name: /נסה שוב|retry/i });
      await act(async () => {
        fireEvent.click(retryButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });

    it('shows upload percentage during progress', async () => {
      // We'll need XMLHttpRequest for progress events
      // For now, test that progress indicator exists
      mockFetch.mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ publicUrl: 'https://r2.example.com/image.jpg' })
          }), 100)
        )
      );

      render(<CreatePage />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      // Progress indicator should be visible
      expect(screen.getByTestId('upload-progress')).toBeInTheDocument();
    });

    it('hides upload progress after successful upload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          publicUrl: 'https://r2.example.com/image.jpg',
          key: 'uploads/user123/image.jpg',
          size: 12345
        })
      });

      // Mock store to return the uploaded image
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setStep: mockSetStep,
        setOriginalImage: mockSetOriginalImage,
        originalImage: 'https://r2.example.com/image.jpg',
        currentStep: 'upload',
      });

      render(<CreatePage />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(screen.queryByTestId('upload-progress')).not.toBeInTheDocument();
      });
    });

    it('validates file type before uploading', async () => {
      render(<CreatePage />);

      // Try to upload a PDF (invalid)
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      // Should not call API for invalid file type
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('validates file size before uploading', async () => {
      render(<CreatePage />);

      // Create a mock file > 20MB - use small content but mock the size property
      const largeFile = new File(['test'], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: 21 * 1024 * 1024, writable: false });

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [largeFile] } });
      });

      // Should not call API for oversized file
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
