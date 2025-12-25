/**
 * Checkbox Component Tests
 * TDD Test Suite for UI-07: Base UI Primitives
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  describe('Rendering', () => {
    it('renders checkbox element', () => {
      render(<Checkbox aria-label="Test checkbox" />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders with label when provided', () => {
      render(<Checkbox label="Accept terms" />);
      expect(screen.getByText('Accept terms')).toBeInTheDocument();
    });

    it('associates label with checkbox', () => {
      render(<Checkbox label="Accept terms" />);
      expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      render(<Checkbox className="custom-class" aria-label="Test" />);
      // Custom class goes on wrapper
      expect(screen.getByRole('checkbox').parentElement).toHaveClass('custom-class');
    });

    it('forwards ref to checkbox element', () => {
      const ref = vi.fn();
      render(<Checkbox ref={ref} aria-label="Test" />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('States', () => {
    it('is unchecked by default', () => {
      render(<Checkbox aria-label="Test" />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('can be checked via prop', () => {
      render(<Checkbox checked aria-label="Test" onChange={() => {}} />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('can have default checked state', () => {
      render(<Checkbox defaultChecked aria-label="Test" />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('toggles on click', async () => {
      const user = userEvent.setup();
      render(<Checkbox aria-label="Test" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Interaction', () => {
    it('calls onChange handler', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Checkbox onChange={handleChange} aria-label="Test" />);
      await user.click(screen.getByRole('checkbox'));

      expect(handleChange).toHaveBeenCalled();
    });

    it('can toggle by clicking label', async () => {
      const user = userEvent.setup();
      render(<Checkbox label="Click me" />);

      await user.click(screen.getByText('Click me'));
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  describe('Disabled State', () => {
    it('can be disabled', () => {
      render(<Checkbox disabled aria-label="Test" />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('shows disabled styling', () => {
      render(<Checkbox disabled aria-label="Test" />);
      expect(screen.getByRole('checkbox')).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('does not toggle when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Checkbox disabled onChange={handleChange} aria-label="Test" />);
      await user.click(screen.getByRole('checkbox'));

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('has proper checkbox size', () => {
      render(<Checkbox aria-label="Test" />);
      expect(screen.getByRole('checkbox')).toHaveClass('h-4', 'w-4');
    });

    it('has rounded corners', () => {
      render(<Checkbox aria-label="Test" />);
      expect(screen.getByRole('checkbox')).toHaveClass('rounded');
    });

    it('has focus ring styles', () => {
      render(<Checkbox aria-label="Test" />);
      expect(screen.getByRole('checkbox')).toHaveClass('focus-visible:ring-2');
    });

    it('has brand color when checked', () => {
      render(<Checkbox checked aria-label="Test" onChange={() => {}} />);
      expect(screen.getByRole('checkbox')).toHaveClass('accent-brand-purple');
    });
  });

  describe('RTL Support', () => {
    it('label can be positioned at start for RTL', () => {
      render(<Checkbox label="Hebrew text" labelPosition="start" />);
      const label = screen.getByText('Hebrew text');
      // Label should come before checkbox in DOM
      expect(label.nextElementSibling).toBe(screen.getByRole('checkbox'));
    });

    it('label is positioned at end by default (LTR)', () => {
      render(<Checkbox label="English text" />);
      const checkbox = screen.getByRole('checkbox');
      // Checkbox should come before label in DOM
      expect(checkbox.nextElementSibling).toHaveTextContent('English text');
    });
  });

  describe('Accessibility', () => {
    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      render(
        <>
          <button>Before</button>
          <Checkbox aria-label="Test" />
        </>
      );

      await user.tab();
      await user.tab();
      expect(screen.getByRole('checkbox')).toHaveFocus();
    });

    it('can be toggled with space key', async () => {
      const user = userEvent.setup();
      render(<Checkbox aria-label="Test" />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      await user.keyboard(' ');

      expect(checkbox).toBeChecked();
    });
  });
});
