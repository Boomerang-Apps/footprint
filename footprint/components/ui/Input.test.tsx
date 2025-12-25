/**
 * Input Component Tests
 * TDD Test Suite for UI-07: Base UI Primitives
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input aria-label="Test input" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('accepts placeholder text', () => {
      render(<Input placeholder="Enter text..." />);
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      render(<Input className="custom-class" aria-label="Test" />);
      expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });

    it('forwards ref to input element', () => {
      const ref = vi.fn();
      render(<Input ref={ref} aria-label="Test" />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('has border styling', () => {
      render(<Input aria-label="Test" />);
      expect(screen.getByRole('textbox')).toHaveClass('border');
    });

    it('has rounded corners', () => {
      render(<Input aria-label="Test" />);
      expect(screen.getByRole('textbox')).toHaveClass('rounded-lg');
    });

    it('has proper height', () => {
      render(<Input aria-label="Test" />);
      expect(screen.getByRole('textbox')).toHaveClass('h-10');
    });

    it('has focus ring styles', () => {
      render(<Input aria-label="Test" />);
      expect(screen.getByRole('textbox')).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Interaction', () => {
    it('handles text input', async () => {
      const user = userEvent.setup();
      render(<Input aria-label="Test" />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello World');

      expect(input).toHaveValue('Hello World');
    });

    it('calls onChange handler', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Input aria-label="Test" onChange={handleChange} />);
      await user.type(screen.getByRole('textbox'), 'a');

      expect(handleChange).toHaveBeenCalled();
    });

    it('calls onFocus handler', async () => {
      const handleFocus = vi.fn();
      const user = userEvent.setup();

      render(<Input aria-label="Test" onFocus={handleFocus} />);
      await user.click(screen.getByRole('textbox'));

      expect(handleFocus).toHaveBeenCalled();
    });

    it('calls onBlur handler', async () => {
      const handleBlur = vi.fn();
      const user = userEvent.setup();

      render(<Input aria-label="Test" onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab();

      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('can be disabled', () => {
      render(<Input disabled aria-label="Test" />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('shows disabled styling', () => {
      render(<Input disabled aria-label="Test" />);
      expect(screen.getByRole('textbox')).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('does not accept input when disabled', async () => {
      const user = userEvent.setup();
      render(<Input disabled aria-label="Test" />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Test');

      expect(input).toHaveValue('');
    });
  });

  describe('Error State', () => {
    it('shows error styling when error prop is true', () => {
      render(<Input error aria-label="Test" />);
      expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
    });

    it('shows error message when provided', () => {
      render(<Input error errorMessage="This field is required" aria-label="Test" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('has aria-invalid when error', () => {
      render(<Input error aria-label="Test" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('associates error message with input via aria-describedby', () => {
      render(<Input error errorMessage="Error text" aria-label="Test" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby');
    });
  });

  describe('Input Types', () => {
    it('defaults to text type', () => {
      render(<Input aria-label="Test" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    it('supports email type', () => {
      render(<Input type="email" aria-label="Email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('supports password type', () => {
      render(<Input type="password" aria-label="Password" />);
      // Password inputs don't have textbox role
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('supports number type', () => {
      render(<Input type="number" aria-label="Number" />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
    });
  });

  describe('RTL Support', () => {
    it('supports RTL text direction', () => {
      render(<Input dir="rtl" aria-label="Hebrew input" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Accessibility', () => {
    it('can be labeled via aria-label', () => {
      render(<Input aria-label="Username" />);
      expect(screen.getByRole('textbox', { name: 'Username' })).toBeInTheDocument();
    });

    it('is keyboard focusable', async () => {
      const user = userEvent.setup();
      render(
        <>
          <button>Before</button>
          <Input aria-label="Test" />
        </>
      );

      await user.tab();
      await user.tab();
      expect(screen.getByRole('textbox')).toHaveFocus();
    });
  });
});
