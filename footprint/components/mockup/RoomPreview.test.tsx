/**
 * RoomPreview Component Tests
 *
 * Tests for the simplified artwork preview component
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

    it('displays size dimensions', () => {
      render(<RoomPreview {...defaultProps} size="A4" />);
      expect(screen.getByText('21 x 29.7 cm')).toBeInTheDocument();
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

  describe('Wall Color Selector', () => {
    it('renders 4 wall color options', () => {
      render(<RoomPreview {...defaultProps} />);
      const colorButtons = screen.getAllByRole('button', { name: /לבן|בז׳|אפור|כהה/i });
      expect(colorButtons.length).toBe(4);
    });

    it('changes wall color when clicked', () => {
      render(<RoomPreview {...defaultProps} />);
      const grayButton = screen.getByRole('button', { name: /אפור/i });
      fireEvent.click(grayButton);
      // Button should now be selected (has scale-110 class via border-violet-500)
      expect(grayButton).toHaveClass('scale-110');
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
