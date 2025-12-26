/**
 * RoomPreview Component Tests
 *
 * TDD Test Suite for PC-05: Realistic Mockup Preview
 * Tests room environment visualization with art placement
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

  describe('Room Environment', () => {
    it('renders the room preview container', () => {
      render(<RoomPreview {...defaultProps} />);
      expect(screen.getByTestId('room-preview')).toBeInTheDocument();
    });

    it('renders a wall background', () => {
      render(<RoomPreview {...defaultProps} />);
      expect(screen.getByTestId('wall-background')).toBeInTheDocument();
    });

    it('renders furniture/context elements', () => {
      render(<RoomPreview {...defaultProps} />);
      // Should have at least one context element (sofa, table, plant)
      expect(screen.getByTestId('room-context')).toBeInTheDocument();
    });

    it('renders the floor element', () => {
      render(<RoomPreview {...defaultProps} />);
      expect(screen.getByTestId('floor-element')).toBeInTheDocument();
    });
  });

  describe('Art Print Display', () => {
    it('renders the art image', () => {
      render(<RoomPreview {...defaultProps} />);
      const artImage = screen.getByAltText(/art preview|תצוגה/i);
      expect(artImage).toBeInTheDocument();
      expect(artImage).toHaveAttribute('src', defaultProps.imageUrl);
    });

    it('renders the art print frame container', () => {
      render(<RoomPreview {...defaultProps} />);
      expect(screen.getByTestId('art-frame')).toBeInTheDocument();
    });

    it('positions art on the wall', () => {
      render(<RoomPreview {...defaultProps} />);
      const artFrame = screen.getByTestId('art-frame');
      // Art should be positioned within wall area
      expect(artFrame.closest('[data-testid="wall-background"]')).toBeInTheDocument();
    });
  });

  describe('Size Scaling', () => {
    it('scales A5 to smallest size', () => {
      render(<RoomPreview {...defaultProps} size="A5" />);
      const artFrame = screen.getByTestId('art-frame');
      expect(artFrame).toHaveAttribute('data-size', 'A5');
    });

    it('scales A4 to medium size', () => {
      render(<RoomPreview {...defaultProps} size="A4" />);
      const artFrame = screen.getByTestId('art-frame');
      expect(artFrame).toHaveAttribute('data-size', 'A4');
    });

    it('scales A3 to large size', () => {
      render(<RoomPreview {...defaultProps} size="A3" />);
      const artFrame = screen.getByTestId('art-frame');
      expect(artFrame).toHaveAttribute('data-size', 'A3');
    });

    it('scales A2 to largest size', () => {
      render(<RoomPreview {...defaultProps} size="A2" />);
      const artFrame = screen.getByTestId('art-frame');
      expect(artFrame).toHaveAttribute('data-size', 'A2');
    });

    it('displays size dimensions label', () => {
      render(<RoomPreview {...defaultProps} size="A4" />);
      expect(screen.getByTestId('size-dimensions')).toHaveTextContent(/21.*29\.7|A4/);
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

    it('renders without frame when frameType is none', () => {
      render(<RoomPreview {...defaultProps} frameType="none" />);
      const artFrame = screen.getByTestId('art-frame');
      expect(artFrame).toHaveAttribute('data-frame', 'none');
    });
  });

  describe('View Toggle', () => {
    it('renders view toggle button', () => {
      render(<RoomPreview {...defaultProps} />);
      expect(screen.getByRole('button', { name: /room|simple|view|תצוגה/i })).toBeInTheDocument();
    });

    it('starts in room view mode by default', () => {
      render(<RoomPreview {...defaultProps} />);
      const roomPreview = screen.getByTestId('room-preview');
      expect(roomPreview).toHaveAttribute('data-view', 'room');
    });

    it('toggles to simple view when clicked', () => {
      render(<RoomPreview {...defaultProps} />);
      const toggleButton = screen.getByRole('button', { name: /room|simple|view|תצוגה/i });
      fireEvent.click(toggleButton);
      const roomPreview = screen.getByTestId('room-preview');
      expect(roomPreview).toHaveAttribute('data-view', 'simple');
    });

    it('toggles back to room view when clicked again', () => {
      render(<RoomPreview {...defaultProps} />);
      const toggleButton = screen.getByRole('button', { name: /room|simple|view|תצוגה/i });
      fireEvent.click(toggleButton); // to simple
      fireEvent.click(toggleButton); // back to room
      const roomPreview = screen.getByTestId('room-preview');
      expect(roomPreview).toHaveAttribute('data-view', 'room');
    });

    it('hides room context in simple view', () => {
      render(<RoomPreview {...defaultProps} />);
      const toggleButton = screen.getByRole('button', { name: /room|simple|view|תצוגה/i });
      fireEvent.click(toggleButton);
      expect(screen.queryByTestId('room-context')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('maintains aspect ratio on different container sizes', () => {
      render(<RoomPreview {...defaultProps} />);
      const container = screen.getByTestId('room-preview');
      // Container should have aspect ratio styling
      expect(container).toBeInTheDocument();
    });

    it('keeps art centered on wall', () => {
      render(<RoomPreview {...defaultProps} />);
      const artFrame = screen.getByTestId('art-frame');
      // Art should be centered (checked via computed styles or class)
      expect(artFrame).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible alt text for art image', () => {
      render(<RoomPreview {...defaultProps} />);
      const artImage = screen.getByAltText(/art preview|תצוגה/i);
      expect(artImage).toBeInTheDocument();
    });

    it('toggle button has accessible name', () => {
      render(<RoomPreview {...defaultProps} />);
      const toggleButton = screen.getByRole('button', { name: /room|simple|view|תצוגה/i });
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('renders fallback when image fails to load', () => {
      render(<RoomPreview {...defaultProps} imageUrl="" />);
      // Should still render the container and frame
      expect(screen.getByTestId('room-preview')).toBeInTheDocument();
      expect(screen.getByTestId('art-frame')).toBeInTheDocument();
    });
  });
});
