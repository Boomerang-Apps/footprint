/**
 * Tests for AvatarUpload component - UI-05A
 *
 * Tests for avatar image upload with preview
 * Following TDD: RED phase
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AvatarUpload } from './AvatarUpload';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe('AvatarUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateObjectURL.mockReturnValue('blob:mock-url');
  });

  describe('Rendering', () => {
    it('renders with current avatar', () => {
      render(
        <AvatarUpload
          currentAvatarUrl="https://example.com/avatar.jpg"
          onUploadSuccess={vi.fn()}
        />
      );

      const avatar = screen.getByRole('img', { name: /תמונת פרופיל/i });
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('renders placeholder when no avatar', () => {
      render(<AvatarUpload currentAvatarUrl={null} onUploadSuccess={vi.fn()} />);

      expect(screen.getByTestId('avatar-placeholder')).toBeInTheDocument();
    });

    it('renders upload button', () => {
      render(<AvatarUpload currentAvatarUrl={null} onUploadSuccess={vi.fn()} />);

      expect(screen.getByRole('button', { name: /העלה תמונה/i })).toBeInTheDocument();
    });

    it('renders hidden file input', () => {
      render(<AvatarUpload currentAvatarUrl={null} onUploadSuccess={vi.fn()} />);

      const input = screen.getByTestId('avatar-input');
      expect(input).toHaveAttribute('type', 'file');
      expect(input).toHaveAttribute('accept', 'image/jpeg,image/png');
    });
  });

  describe('File Selection', () => {
    it('shows preview when valid file selected', async () => {
      render(<AvatarUpload currentAvatarUrl={null} onUploadSuccess={vi.fn()} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('avatar-input');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        const preview = screen.getByRole('img', { name: /תצוגה מקדימה/i });
        expect(preview).toBeInTheDocument();
        expect(preview).toHaveAttribute('src', 'blob:mock-url');
      });
    });

    it('rejects files larger than 5MB', async () => {
      render(<AvatarUpload currentAvatarUrl={null} onUploadSuccess={vi.fn()} />);

      // Create a large file (6MB)
      const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });
      const input = screen.getByTestId('avatar-input');

      fireEvent.change(input, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(screen.getByText(/גודל הקובץ חייב להיות עד 5MB/i)).toBeInTheDocument();
      });
    });

    it('rejects invalid file types', async () => {
      render(<AvatarUpload currentAvatarUrl={null} onUploadSuccess={vi.fn()} />);

      const invalidFile = new File(['test'], 'test.gif', { type: 'image/gif' });
      const input = screen.getByTestId('avatar-input');

      fireEvent.change(input, { target: { files: [invalidFile] } });

      await waitFor(() => {
        expect(screen.getByText(/יש להעלות קובץ מסוג JPEG או PNG/i)).toBeInTheDocument();
      });
    });

    it('accepts JPEG files', async () => {
      render(<AvatarUpload currentAvatarUrl={null} onUploadSuccess={vi.fn()} />);

      const file = new File(['test'], 'test.jpeg', { type: 'image/jpeg' });
      const input = screen.getByTestId('avatar-input');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.queryByText(/יש להעלות קובץ/i)).not.toBeInTheDocument();
      });
    });

    it('accepts PNG files', async () => {
      render(<AvatarUpload currentAvatarUrl={null} onUploadSuccess={vi.fn()} />);

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const input = screen.getByTestId('avatar-input');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.queryByText(/יש להעלות קובץ/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Upload', () => {
    it('shows upload button after file selection', async () => {
      render(<AvatarUpload currentAvatarUrl={null} onUploadSuccess={vi.fn()} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('avatar-input');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /שמור/i })).toBeInTheDocument();
      });
    });

    it('uploads file on save click', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            avatarUrl: 'https://example.com/new-avatar.jpg',
          }),
      });

      const onUploadSuccess = vi.fn();
      render(
        <AvatarUpload currentAvatarUrl={null} onUploadSuccess={onUploadSuccess} />
      );

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('avatar-input');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /שמור/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /שמור/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/profile/avatar',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    it('calls onUploadSuccess with new URL after successful upload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            avatarUrl: 'https://example.com/new-avatar.jpg',
          }),
      });

      const onUploadSuccess = vi.fn();
      render(
        <AvatarUpload currentAvatarUrl={null} onUploadSuccess={onUploadSuccess} />
      );

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('avatar-input');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /שמור/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /שמור/i }));

      await waitFor(() => {
        expect(onUploadSuccess).toHaveBeenCalledWith(
          'https://example.com/new-avatar.jpg'
        );
      });
    });

    it('shows loading state during upload', async () => {
      let resolvePromise: (value: unknown) => void;
      mockFetch.mockReturnValueOnce(
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
      );

      render(<AvatarUpload currentAvatarUrl={null} onUploadSuccess={vi.fn()} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('avatar-input');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /שמור/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /שמור/i }));

      await waitFor(() => {
        expect(screen.getByTestId('upload-loading')).toBeInTheDocument();
      });

      // Resolve
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ success: true, avatarUrl: 'url' }),
      });
    });

    it('shows error message on upload failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Upload failed' }),
      });

      render(<AvatarUpload currentAvatarUrl={null} onUploadSuccess={vi.fn()} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('avatar-input');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /שמור/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /שמור/i }));

      await waitFor(() => {
        expect(screen.getByText(/שגיאה בהעלאת התמונה/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cancel', () => {
    it('shows cancel button after file selection', async () => {
      render(<AvatarUpload currentAvatarUrl={null} onUploadSuccess={vi.fn()} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('avatar-input');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /ביטול/i })).toBeInTheDocument();
      });
    });

    it('clears preview and selected file on cancel', async () => {
      render(<AvatarUpload currentAvatarUrl={null} onUploadSuccess={vi.fn()} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('avatar-input');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole('img', { name: /תצוגה מקדימה/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /ביטול/i }));

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: /תצוגה מקדימה/i })).not.toBeInTheDocument();
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible upload button', () => {
      render(<AvatarUpload currentAvatarUrl={null} onUploadSuccess={vi.fn()} />);

      const button = screen.getByRole('button', { name: /העלה תמונה/i });
      expect(button).toBeInTheDocument();
    });

    it('file input has aria-label', () => {
      render(<AvatarUpload currentAvatarUrl={null} onUploadSuccess={vi.fn()} />);

      const input = screen.getByTestId('avatar-input');
      expect(input).toHaveAttribute('aria-label');
    });
  });
});
