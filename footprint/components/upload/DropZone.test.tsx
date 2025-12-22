/**
 * DropZone Component Tests
 *
 * TDD Test Suite for UP-02: Drag-and-Drop Upload on Desktop
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';
import DropZone from './DropZone';
import { useOrderStore } from '@/stores/orderStore';

// Mock react-hot-toast
vi.mock('react-hot-toast');

// Mock zustand store
vi.mock('@/stores/orderStore');

describe('DropZone', () => {
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
    it('renders drop zone area', () => {
      render(<DropZone />);
      expect(screen.getByText(/גררו תמונה לכאן|גרור תמונה/i)).toBeInTheDocument();
    });

    it('renders upload instructions', () => {
      render(<DropZone />);
      expect(screen.getByText(/לחצו לבחירה|או לחצו/i)).toBeInTheDocument();
    });

    it('shows accepted file types', () => {
      render(<DropZone />);
      expect(screen.getByText(/JPG.*PNG.*HEIC/i)).toBeInTheDocument();
    });

    it('shows maximum file size', () => {
      render(<DropZone />);
      expect(screen.getByText(/20MB/i)).toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('changes appearance on drag enter', () => {
      render(<DropZone />);
      const dropZone = screen.getByText(/גררו תמונה/i).closest('div');

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.dragEnter(dropZone!, {
        dataTransfer: { files: [file], types: ['Files'] },
      });

      expect(dropZone).toHaveClass('border-brand-purple');
    });

    it('handles drag events without errors', () => {
      render(<DropZone />);
      const dropZone = screen.getByText(/גררו תמונה/i).closest('div');

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      // Component should handle drag enter
      expect(() => {
        fireEvent.dragEnter(dropZone!, {
          dataTransfer: { files: [file], types: ['Files'] },
        });
      }).not.toThrow();

      // Should show active state
      expect(dropZone).toHaveClass('border-brand-purple');

      // Component should handle drag leave without errors
      // (visual reset tested via integration tests)
      expect(() => {
        fireEvent.dragLeave(dropZone!);
      }).not.toThrow();
    });

    it('handles valid file drop', async () => {
      render(<DropZone />);
      const dropZone = screen.getByText(/גררו תמונה/i).closest('div');

      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });

      global.URL.createObjectURL = vi.fn(() => 'blob:test-url');

      fireEvent.drop(dropZone!, {
        dataTransfer: { files: [file] },
      });

      await waitFor(() => {
        expect(mockSetOriginalImage).toHaveBeenCalledWith('blob:test-url', file);
      });
    });

    it('prevents default drag over behavior', () => {
      render(<DropZone />);
      const dropZone = screen.getByText(/גררו תמונה/i).closest('div');

      const event = fireEvent.dragOver(dropZone!, {
        dataTransfer: { files: [] },
      });

      expect(event).toBe(false);
    });
  });

  describe('File Click Upload', () => {
    it('allows file selection via click', async () => {
      const user = userEvent.setup();
      render(<DropZone />);

      const file = new File(['content'], 'photo.png', { type: 'image/png' });
      const input = screen.getByLabelText(/העלאת תמונה/i) as HTMLInputElement;

      global.URL.createObjectURL = vi.fn(() => 'blob:test-url');

      await user.upload(input, file);

      await waitFor(() => {
        expect(mockSetOriginalImage).toHaveBeenCalled();
      });
    });

    it('triggers file input on drop zone click', async () => {
      const user = userEvent.setup();
      render(<DropZone />);

      const dropZone = screen.getByText(/גררו תמונה/i).closest('div');
      const input = screen.getByLabelText(/העלאת תמונה/i) as HTMLInputElement;

      const clickSpy = vi.spyOn(input, 'click');

      await user.click(dropZone!);

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('File Validation', () => {
    it('rejects file larger than 20MB', async () => {
      render(<DropZone />);
      const dropZone = screen.getByText(/גררו תמונה/i).closest('div');

      const largeFile = new File(
        [new ArrayBuffer(21 * 1024 * 1024)],
        'large.jpg',
        { type: 'image/jpeg' }
      );

      fireEvent.drop(dropZone!, {
        dataTransfer: { files: [largeFile] },
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('גדול מדי')
        );
        expect(mockSetOriginalImage).not.toHaveBeenCalled();
      });
    });

    it('rejects invalid file type on drop', async () => {
      render(<DropZone />);
      const dropZone = screen.getByText(/גררו תמונה/i).closest('div');

      const invalidFile = new File(['content'], 'doc.pdf', { type: 'application/pdf' });

      fireEvent.drop(dropZone!, {
        dataTransfer: { files: [invalidFile] },
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('פורמט')
        );
        expect(mockSetOriginalImage).not.toHaveBeenCalled();
      });
    });

    it('handles empty drop', async () => {
      render(<DropZone />);
      const dropZone = screen.getByText(/גררו תמונה/i).closest('div');

      fireEvent.drop(dropZone!, {
        dataTransfer: { files: [] },
      });

      await waitFor(() => {
        expect(mockSetOriginalImage).not.toHaveBeenCalled();
      });
    });

    it('handles multiple files but only processes first', async () => {
      render(<DropZone />);
      const dropZone = screen.getByText(/גררו תמונה/i).closest('div');

      const file1 = new File(['content1'], 'photo1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['content2'], 'photo2.jpg', { type: 'image/jpeg' });

      global.URL.createObjectURL = vi.fn(() => 'blob:test-url');

      fireEvent.drop(dropZone!, {
        dataTransfer: { files: [file1, file2] },
      });

      await waitFor(() => {
        expect(mockSetOriginalImage).toHaveBeenCalledTimes(1);
        expect(mockSetOriginalImage).toHaveBeenCalledWith('blob:test-url', file1);
      });
    });
  });

  describe('Success Handling', () => {
    it('shows success toast on valid drop', async () => {
      render(<DropZone />);
      const dropZone = screen.getByText(/גררו תמונה/i).closest('div');

      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
      global.URL.createObjectURL = vi.fn(() => 'blob:test-url');

      fireEvent.drop(dropZone!, {
        dataTransfer: { files: [file] },
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('הועלתה בהצלחה')
        );
      });
    });

    it('creates preview URL for dropped file', async () => {
      render(<DropZone />);
      const dropZone = screen.getByText(/גררו תמונה/i).closest('div');

      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
      const mockUrl = 'blob:http://localhost/test-url';
      global.URL.createObjectURL = vi.fn(() => mockUrl);

      fireEvent.drop(dropZone!, {
        dataTransfer: { files: [file] },
      });

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
        expect(mockSetOriginalImage).toHaveBeenCalledWith(mockUrl, file);
      });
    });
  });

  describe('Accessibility', () => {
    it('has role="button" for keyboard interaction', () => {
      render(<DropZone />);
      // Get the drop zone container specifically (not the button inside)
      const dropZone = screen.getByText(/גררו תמונה/i).closest('[role="button"]');
      expect(dropZone).toBeInTheDocument();
      expect(dropZone).toHaveAttribute('tabindex', '0');
    });

    it('is keyboard accessible', () => {
      render(<DropZone />);

      // Get the drop zone container specifically
      const dropZone = screen.getByText(/גררו תמונה/i).closest('[role="button"]') as HTMLElement;

      dropZone.focus();
      expect(dropZone).toHaveFocus();
    });

    it('has accessible hidden file input', () => {
      render(<DropZone />);
      const input = screen.getByLabelText(/העלאת תמונה/i);
      expect(input).toHaveAttribute('type', 'file');
    });
  });

  describe('Visual States', () => {
    it('shows hover state styles', () => {
      render(<DropZone />);
      const dropZone = screen.getByText(/גררו תמונה/i).closest('div');

      expect(dropZone).toHaveClass('cursor-pointer');
    });

    it('displays upload icon', () => {
      render(<DropZone />);
      const icon = screen.getByText(/גררו תמונה/i).closest('div')?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });
});
