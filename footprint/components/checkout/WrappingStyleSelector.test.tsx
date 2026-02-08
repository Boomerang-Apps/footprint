/**
 * @story GF-04
 * Tests for WrappingStyleSelector component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WrappingStyleSelector } from './WrappingStyleSelector';

describe('WrappingStyleSelector', () => {
  const defaultProps = {
    selectedStyle: 'classic' as const,
    onStyleChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC-003: Show wrapping style options', () => {
    it('should display all 3 wrapping style options', () => {
      render(<WrappingStyleSelector {...defaultProps} />);

      expect(screen.getByTestId('style-option-classic')).toBeInTheDocument();
      expect(screen.getByTestId('style-option-festive')).toBeInTheDocument();
      expect(screen.getByTestId('style-option-minimalist')).toBeInTheDocument();
    });

    it('should display Hebrew names for styles', () => {
      render(<WrappingStyleSelector {...defaultProps} />);

      expect(screen.getByText('קלאסי')).toBeInTheDocument();
      expect(screen.getByText('חגיגי')).toBeInTheDocument();
      expect(screen.getByText('מינימליסטי')).toBeInTheDocument();
    });

    it('should display descriptions for each style', () => {
      render(<WrappingStyleSelector {...defaultProps} />);

      expect(screen.getByText('אלגנטי ומעודן')).toBeInTheDocument();
      expect(screen.getByText('צבעוני ושמח')).toBeInTheDocument();
      expect(screen.getByText('פשוט ונקי')).toBeInTheDocument();
    });
  });

  describe('AC-004: Style selection', () => {
    it('should highlight selected style', () => {
      render(<WrappingStyleSelector {...defaultProps} selectedStyle="classic" />);

      const classicOption = screen.getByTestId('style-option-classic');
      expect(classicOption).toHaveAttribute('aria-pressed', 'true');
    });

    it('should NOT highlight unselected styles', () => {
      render(<WrappingStyleSelector {...defaultProps} selectedStyle="classic" />);

      const festiveOption = screen.getByTestId('style-option-festive');
      const minimalistOption = screen.getByTestId('style-option-minimalist');

      expect(festiveOption).toHaveAttribute('aria-pressed', 'false');
      expect(minimalistOption).toHaveAttribute('aria-pressed', 'false');
    });

    it('should call onStyleChange when style clicked', () => {
      const onStyleChange = vi.fn();
      render(<WrappingStyleSelector {...defaultProps} onStyleChange={onStyleChange} />);

      fireEvent.click(screen.getByTestId('style-option-festive'));

      expect(onStyleChange).toHaveBeenCalledWith('festive');
    });

    it('should change selection on click', () => {
      const onStyleChange = vi.fn();
      render(<WrappingStyleSelector {...defaultProps} onStyleChange={onStyleChange} />);

      // Click minimalist
      fireEvent.click(screen.getByTestId('style-option-minimalist'));
      expect(onStyleChange).toHaveBeenCalledWith('minimalist');

      // Click classic
      fireEvent.click(screen.getByTestId('style-option-classic'));
      expect(onStyleChange).toHaveBeenCalledWith('classic');
    });
  });

  describe('Visual indicators', () => {
    it('should show checkmark on selected style', () => {
      const { container } = render(
        <WrappingStyleSelector {...defaultProps} selectedStyle="festive" />
      );

      // The festive option should have a check icon
      const festiveOption = screen.getByTestId('style-option-festive');
      // Check for the checkmark container (purple circle)
      expect(festiveOption.querySelector('.bg-purple-600')).toBeInTheDocument();
    });

    it('should NOT show checkmark on unselected styles', () => {
      render(<WrappingStyleSelector {...defaultProps} selectedStyle="classic" />);

      const festiveOption = screen.getByTestId('style-option-festive');
      expect(festiveOption.querySelector('.bg-purple-600')).not.toBeInTheDocument();
    });

    it('should have visual preview for each style', () => {
      const { container } = render(<WrappingStyleSelector {...defaultProps} />);

      // Each style option should have a preview area
      const previews = container.querySelectorAll('.h-16');
      expect(previews).toHaveLength(3);
    });
  });

  describe('Accessibility', () => {
    it('should have RTL direction', () => {
      render(<WrappingStyleSelector {...defaultProps} />);

      const container = screen.getByTestId('wrapping-style-selector');
      expect(container).toHaveAttribute('dir', 'rtl');
    });

    it('should have accessible labels for style buttons', () => {
      render(<WrappingStyleSelector {...defaultProps} />);

      expect(screen.getByLabelText('בחר עטיפה קלאסי')).toBeInTheDocument();
      expect(screen.getByLabelText('בחר עטיפה חגיגי')).toBeInTheDocument();
      expect(screen.getByLabelText('בחר עטיפה מינימליסטי')).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<WrappingStyleSelector {...defaultProps} />);

      const classicOption = screen.getByTestId('style-option-classic');
      classicOption.focus();
      expect(document.activeElement).toBe(classicOption);
    });

    it('should have focus ring styling', () => {
      render(<WrappingStyleSelector {...defaultProps} />);

      const classicOption = screen.getByTestId('style-option-classic');
      expect(classicOption).toHaveClass('focus:ring-2');
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      render(<WrappingStyleSelector {...defaultProps} className="custom-class" />);

      const container = screen.getByTestId('wrapping-style-selector');
      expect(container).toHaveClass('custom-class');
    });

    it('should have section header', () => {
      render(<WrappingStyleSelector {...defaultProps} />);

      expect(screen.getByText('בחר סגנון עטיפה')).toBeInTheDocument();
    });

    it('should display styles in grid layout', () => {
      const { container } = render(<WrappingStyleSelector {...defaultProps} />);

      const grid = container.querySelector('.grid-cols-3');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Style type handling', () => {
    it('should work with classic style', () => {
      render(<WrappingStyleSelector {...defaultProps} selectedStyle="classic" />);

      expect(screen.getByTestId('style-option-classic')).toHaveAttribute('aria-pressed', 'true');
    });

    it('should work with festive style', () => {
      render(<WrappingStyleSelector {...defaultProps} selectedStyle="festive" />);

      expect(screen.getByTestId('style-option-festive')).toHaveAttribute('aria-pressed', 'true');
    });

    it('should work with minimalist style', () => {
      render(<WrappingStyleSelector {...defaultProps} selectedStyle="minimalist" />);

      expect(screen.getByTestId('style-option-minimalist')).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
