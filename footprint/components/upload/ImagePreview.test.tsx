/**
 * ImagePreview Component Tests
 *
 * TDD Test Suite for UP-04: Preview Uploaded Photo
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImagePreview from './ImagePreview';

describe('ImagePreview', () => {
  const mockImageUrl = 'blob:http://localhost/test-image';
  const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
  const mockOnReplace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders image with provided URL', () => {
      render(<ImagePreview imageUrl={mockImageUrl} file={mockFile} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockImageUrl);
    });

    it('renders replace button when onReplace provided', () => {
      render(
        <ImagePreview imageUrl={mockImageUrl} file={mockFile} onReplace={mockOnReplace} />
      );
      expect(screen.getByText(/החלף תמונה|החלפת תמונה/i)).toBeInTheDocument();
    });

    it('shows image dimensions when provided', () => {
      render(
        <ImagePreview
          imageUrl={mockImageUrl}
          file={mockFile}
          dimensions={{ width: 1920, height: 1080 }}
        />
      );
      expect(screen.getByText(/1920.*1080/)).toBeInTheDocument();
    });

    it('shows file size when provided', () => {
      const largeFile = new File([new ArrayBuffer(5 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });
      render(<ImagePreview imageUrl={mockImageUrl} file={largeFile} />);
      expect(screen.getByText(/5.*MB|MB/i)).toBeInTheDocument();
    });
  });

  describe('Replace Functionality', () => {
    it('calls onReplace when replace button clicked', async () => {
      const user = userEvent.setup();
      render(
        <ImagePreview imageUrl={mockImageUrl} file={mockFile} onReplace={mockOnReplace} />
      );

      const replaceButton = screen.getByText(/החלף תמונה|החלפת תמונה/i);
      await user.click(replaceButton);

      expect(mockOnReplace).toHaveBeenCalledTimes(1);
    });

    it('replace button is keyboard accessible', async () => {
      const user = userEvent.setup();
      render(
        <ImagePreview imageUrl={mockImageUrl} file={mockFile} onReplace={mockOnReplace} />
      );

      const replaceButton = screen.getByRole('button', { name: /החלף|החלפת/i });
      await user.tab();
      expect(replaceButton).toHaveFocus();
    });
  });

  describe('Image Display', () => {
    it('has alt text for accessibility', () => {
      render(<ImagePreview imageUrl={mockImageUrl} file={mockFile} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt');
    });

    it('displays filename', () => {
      render(<ImagePreview imageUrl={mockImageUrl} file={mockFile} />);
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });
  });

  describe('Optional Zoom Feature', () => {
    it('renders without zoom controls by default', () => {
      render(<ImagePreview imageUrl={mockImageUrl} file={mockFile} />);
      expect(screen.queryByLabelText(/zoom|הגדלה/i)).not.toBeInTheDocument();
    });
  });
});
