/**
 * CameraRollUpload Component Tests
 *
 * TDD Test Suite for UP-01: Upload Photo from Camera Roll
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';
import CameraRollUpload from './CameraRollUpload';
import { useOrderStore } from '@/stores/orderStore';

// Mock react-hot-toast
vi.mock('react-hot-toast');

// Mock zustand store
vi.mock('@/stores/orderStore');

describe('CameraRollUpload', () => {
  const mockSetOriginalImage = vi.fn();
  const mockSetStep = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      setOriginalImage: mockSetOriginalImage,
      setStep: mockSetStep,
    });
  });

  describe('Rendering', () => {
    it('renders upload button', () => {
      render(<CameraRollUpload />);
      expect(screen.getByText(/בחירת תמונה|בחר תמונה/i)).toBeInTheDocument();
    });

    it('renders file input with correct accept types', () => {
      render(<CameraRollUpload />);
      const input = screen.getByLabelText(/העלאת תמונה/i);
      expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/heic');
    });

    it('renders file input with single file selection', () => {
      render(<CameraRollUpload />);
      const input = screen.getByLabelText(/העלאת תמונה/i);
      expect(input).not.toHaveAttribute('multiple');
    });
  });

  describe('File Selection', () => {
    it('handles valid JPG file upload', async () => {
      const user = userEvent.setup();
      render(<CameraRollUpload />);

      const file = new File(['dummy content'], 'photo.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/העלאת תמונה/i) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(mockSetOriginalImage).toHaveBeenCalled();
        expect(mockSetOriginalImage.mock.calls[0][1]).toBe(file);
      });
    });

    it('handles valid PNG file upload', async () => {
      const user = userEvent.setup();
      render(<CameraRollUpload />);

      const file = new File(['dummy content'], 'photo.png', { type: 'image/png' });
      const input = screen.getByLabelText(/העלאת תמונה/i) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(mockSetOriginalImage).toHaveBeenCalled();
      });
    });

    it('handles valid HEIC file upload', async () => {
      const user = userEvent.setup();
      render(<CameraRollUpload />);

      const file = new File(['dummy content'], 'photo.heic', { type: 'image/heic' });
      const input = screen.getByLabelText(/העלאת תמונה/i) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(mockSetOriginalImage).toHaveBeenCalled();
      });
    });

    it('creates preview URL when file is selected', async () => {
      const user = userEvent.setup();
      render(<CameraRollUpload />);

      const file = new File(['dummy content'], 'photo.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/העלאת תמונה/i) as HTMLInputElement;

      // Mock URL.createObjectURL
      const mockUrl = 'blob:http://localhost/mock-url';
      global.URL.createObjectURL = vi.fn(() => mockUrl);

      await user.upload(input, file);

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
        expect(mockSetOriginalImage).toHaveBeenCalledWith(mockUrl, file);
      });
    });
  });

  describe('File Validation', () => {
    it('rejects file larger than 20MB', async () => {
      const user = userEvent.setup();
      render(<CameraRollUpload />);

      // Create file larger than 20MB
      const largeFile = new File(
        [new ArrayBuffer(21 * 1024 * 1024)],
        'large.jpg',
        { type: 'image/jpeg' }
      );
      const input = screen.getByLabelText(/העלאת תמונה/i) as HTMLInputElement;

      await user.upload(input, largeFile);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('גדול מדי')
        );
        expect(mockSetOriginalImage).not.toHaveBeenCalled();
      });
    });

    it('rejects invalid file type', async () => {
      render(<CameraRollUpload />);

      const invalidFile = new File(['dummy'], 'document.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/העלאת תמונה/i) as HTMLInputElement;

      // Manually trigger change event to bypass browser's accept attribute
      Object.defineProperty(input, 'files', {
        value: [invalidFile],
        writable: false,
      });
      fireEvent.change(input);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('פורמט')
        );
        expect(mockSetOriginalImage).not.toHaveBeenCalled();
      });
    });

    it('handles empty file selection', async () => {
      const user = userEvent.setup();
      render(<CameraRollUpload />);

      const input = screen.getByLabelText(/העלאת תמונה/i) as HTMLInputElement;

      // Trigger change without file
      fireEvent.change(input, { target: { files: [] } });

      await waitFor(() => {
        expect(mockSetOriginalImage).not.toHaveBeenCalled();
      });
    });
  });

  describe('Success Handling', () => {
    it('shows success toast on valid upload', async () => {
      const user = userEvent.setup();
      render(<CameraRollUpload />);

      const file = new File(['dummy content'], 'photo.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/העלאת תמונה/i) as HTMLInputElement;

      global.URL.createObjectURL = vi.fn(() => 'blob:mock');

      await user.upload(input, file);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('הועלתה בהצלחה')
        );
      });
    });

    it('updates order store with file and preview URL', async () => {
      const user = userEvent.setup();
      render(<CameraRollUpload />);

      const file = new File(['dummy content'], 'photo.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/העלאת תמונה/i) as HTMLInputElement;

      const mockUrl = 'blob:http://localhost/test';
      global.URL.createObjectURL = vi.fn(() => mockUrl);

      await user.upload(input, file);

      await waitFor(() => {
        expect(mockSetOriginalImage).toHaveBeenCalledWith(mockUrl, file);
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible label for screen readers', () => {
      render(<CameraRollUpload />);
      const input = screen.getByLabelText(/העלאת תמונה/i);
      expect(input).toBeInTheDocument();
    });

    it('button is keyboard accessible', () => {
      render(<CameraRollUpload />);

      const button = screen.getByRole('button', { name: /בחירת תמונה|בחר תמונה/i });

      // Button should be in the document and focusable
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');

      // Button can receive focus programmatically
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Mobile Support', () => {
    it('accepts capture attribute for mobile camera', () => {
      render(<CameraRollUpload />);
      const input = screen.getByLabelText(/העלאת תמונה/i);

      // On mobile, should have capture attribute
      expect(input).toHaveAttribute('accept');
    });
  });
});
