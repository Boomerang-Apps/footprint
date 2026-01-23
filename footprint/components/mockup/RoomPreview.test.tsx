/**
 * RoomPreview Component Tests
 *
 * Tests for the simplified artwork preview component
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RoomPreview from './RoomPreview';
import type { SizeType, FrameType } from '@/types';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('RoomPreview', () => {
  const defaultProps = {
    imageUrl: 'https://example.com/test-image.jpg',
    size: 'A4' as SizeType,
    frameType: 'black' as FrameType,
  };

  describe('Basic Rendering', () => {
    it('renders the preview container', () => {
      render(<RoomPreview {...defaultProps} />);
      expect(screen.getByTestId('room-preview')).toBeInTheDocument();
    });

    it('renders the art frame', () => {
      render(<RoomPreview {...defaultProps} />);
      expect(screen.getByTestId('art-frame')).toBeInTheDocument();
    });

    it('renders the artwork image', () => {
      render(<RoomPreview {...defaultProps} />);
      const artImage = screen.getByAltText(/your artwork/i);
      expect(artImage).toBeInTheDocument();
      expect(artImage).toHaveAttribute('src', defaultProps.imageUrl);
    });

    it('displays size dimensions in fullscreen modal', () => {
      render(<RoomPreview {...defaultProps} size="A4" />);
      // Open fullscreen to see dimensions
      const fullscreenButton = screen.getByRole('button', { name: /fullscreen/i });
      fireEvent.click(fullscreenButton);
      expect(screen.getByText(/21 x 29.7 cm/)).toBeInTheDocument();
    });
  });

  describe('Size Scaling', () => {
    it('applies A5 size attribute', () => {
      render(<RoomPreview {...defaultProps} size="A5" />);
      const artFrame = screen.getByTestId('art-frame');
      expect(artFrame).toHaveAttribute('data-size', 'A5');
    });

    it('applies A4 size attribute', () => {
      render(<RoomPreview {...defaultProps} size="A4" />);
      const artFrame = screen.getByTestId('art-frame');
      expect(artFrame).toHaveAttribute('data-size', 'A4');
    });

    it('applies A3 size attribute', () => {
      render(<RoomPreview {...defaultProps} size="A3" />);
      const artFrame = screen.getByTestId('art-frame');
      expect(artFrame).toHaveAttribute('data-size', 'A3');
    });

    it('applies A2 size attribute', () => {
      render(<RoomPreview {...defaultProps} size="A2" />);
      const artFrame = screen.getByTestId('art-frame');
      expect(artFrame).toHaveAttribute('data-size', 'A2');
    });
  });

  describe('Frame Styling', () => {
    it('applies black frame style', () => {
      render(<RoomPreview {...defaultProps} frameType="black" />);
      const artFrame = screen.getByTestId('art-frame');
      expect(artFrame).toHaveAttribute('data-frame', 'black');
    });

    it('applies white frame style', () => {
      render(<RoomPreview {...defaultProps} frameType="white" />);
      const artFrame = screen.getByTestId('art-frame');
      expect(artFrame).toHaveAttribute('data-frame', 'white');
    });

    it('applies oak frame style', () => {
      render(<RoomPreview {...defaultProps} frameType="oak" />);
      const artFrame = screen.getByTestId('art-frame');
      expect(artFrame).toHaveAttribute('data-frame', 'oak');
    });

    it('applies none frame style', () => {
      render(<RoomPreview {...defaultProps} frameType="none" />);
      const artFrame = screen.getByTestId('art-frame');
      expect(artFrame).toHaveAttribute('data-frame', 'none');
    });
  });

  describe('Fullscreen Mode', () => {
    it('renders fullscreen button', () => {
      render(<RoomPreview {...defaultProps} />);
      expect(screen.getByRole('button', { name: /fullscreen/i })).toBeInTheDocument();
    });

    it('opens fullscreen modal when clicked', () => {
      render(<RoomPreview {...defaultProps} />);
      const fullscreenButton = screen.getByRole('button', { name: /fullscreen/i });
      fireEvent.click(fullscreenButton);
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('closes fullscreen modal when close button clicked', () => {
      render(<RoomPreview {...defaultProps} />);
      const fullscreenButton = screen.getByRole('button', { name: /fullscreen/i });
      fireEvent.click(fullscreenButton);
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
    });
  });

  describe('Frame Color Selector', () => {
    it('renders 4 frame color options', () => {
      render(<RoomPreview {...defaultProps} />);
      // Frame options: ללא, שחור, לבן, אלון
      const colorButtons = screen.getAllByRole('button', { name: /ללא|שחור|לבן|אלון/i });
      expect(colorButtons.length).toBe(4);
    });

    it('calls onFrameChange when frame option clicked', () => {
      const onFrameChange = vi.fn();
      render(<RoomPreview {...defaultProps} onFrameChange={onFrameChange} />);
      const whiteButton = screen.getByRole('button', { name: /לבן/i });
      fireEvent.click(whiteButton);
      expect(onFrameChange).toHaveBeenCalledWith('white');
    });

    it('shows selected frame with visual indicator', () => {
      render(<RoomPreview {...defaultProps} frameType="black" />);
      const blackButton = screen.getByRole('button', { name: /שחור/i });
      // Selected button has scale-110 class
      expect(blackButton).toHaveClass('scale-110');
    });
  });

  describe('Passepartout Toggle', () => {
    it('renders passepartout toggle button', () => {
      render(<RoomPreview {...defaultProps} />);
      const passepartoutButton = screen.getByRole('button', { name: /פספרטו/i });
      expect(passepartoutButton).toBeInTheDocument();
    });

    it('toggles passepartout state when clicked', async () => {
      render(<RoomPreview {...defaultProps} />);
      const artFrame = screen.getByTestId('art-frame');
      expect(artFrame).toHaveAttribute('data-passepartout', 'false');

      const passepartoutButton = screen.getByRole('button', { name: /פספרטו/i });
      fireEvent.click(passepartoutButton);

      // Wait for React to re-render after state update
      await waitFor(() => {
        expect(screen.getByTestId('art-frame')).toHaveAttribute('data-passepartout', 'true');
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible alt text for artwork', () => {
      render(<RoomPreview {...defaultProps} />);
      expect(screen.getByAltText(/your artwork/i)).toBeInTheDocument();
    });

    it('fullscreen button has accessible name', () => {
      render(<RoomPreview {...defaultProps} />);
      expect(screen.getByRole('button', { name: /fullscreen/i })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('renders fallback when no image provided', () => {
      render(<RoomPreview {...defaultProps} imageUrl="" />);
      expect(screen.getByTestId('room-preview')).toBeInTheDocument();
      expect(screen.getByTestId('art-frame')).toBeInTheDocument();
    });
  });
});
