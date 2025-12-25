/**
 * Badge Component Tests
 * TDD Test Suite for UI-07: Base UI Primitives
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders badge with text', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('renders as span element', () => {
      render(<Badge data-testid="badge">Test</Badge>);
      expect(screen.getByTestId('badge').tagName).toBe('SPAN');
    });

    it('accepts custom className', () => {
      render(<Badge className="custom-class">Test</Badge>);
      expect(screen.getByText('Test')).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('renders default variant', () => {
      render(<Badge>Default</Badge>);
      expect(screen.getByText('Default')).toHaveClass('bg-light-muted', 'text-text-primary');
    });

    it('renders success variant', () => {
      render(<Badge variant="success">Success</Badge>);
      expect(screen.getByText('Success')).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('renders warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>);
      expect(screen.getByText('Warning')).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('renders error variant', () => {
      render(<Badge variant="error">Error</Badge>);
      expect(screen.getByText('Error')).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('renders info variant', () => {
      render(<Badge variant="info">Info</Badge>);
      expect(screen.getByText('Info')).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('renders brand variant', () => {
      render(<Badge variant="brand">Brand</Badge>);
      expect(screen.getByText('Brand')).toHaveClass('bg-brand-purple', 'text-white');
    });
  });

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      render(<Badge>Medium</Badge>);
      expect(screen.getByText('Medium')).toHaveClass('px-2.5', 'py-0.5', 'text-xs');
    });

    it('renders small size', () => {
      render(<Badge size="sm">Small</Badge>);
      expect(screen.getByText('Small')).toHaveClass('px-2', 'py-0.5', 'text-xs');
    });
  });

  describe('Styling', () => {
    it('has rounded corners', () => {
      render(<Badge>Test</Badge>);
      expect(screen.getByText('Test')).toHaveClass('rounded-full');
    });

    it('has inline-flex display', () => {
      render(<Badge>Test</Badge>);
      expect(screen.getByText('Test')).toHaveClass('inline-flex');
    });

    it('has font weight', () => {
      render(<Badge>Test</Badge>);
      expect(screen.getByText('Test')).toHaveClass('font-medium');
    });
  });

  describe('With Icon', () => {
    it('renders icon when provided', () => {
      render(<Badge icon={<span data-testid="icon">*</span>}>With Icon</Badge>);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('icon appears before text', () => {
      render(<Badge icon={<span data-testid="icon">*</span>}>Text</Badge>);
      const icon = screen.getByTestId('icon');
      // Icon should be rendered before the text content
      expect(icon.parentElement?.textContent).toBe('*Text');
    });
  });

  describe('Dot Indicator', () => {
    it('renders dot when showDot is true', () => {
      render(<Badge showDot>With Dot</Badge>);
      expect(screen.getByTestId('badge-dot')).toBeInTheDocument();
    });

    it('dot has appropriate styling', () => {
      render(<Badge showDot variant="success">Online</Badge>);
      const dot = screen.getByTestId('badge-dot');
      expect(dot).toHaveClass('rounded-full', 'bg-current');
    });
  });
});
