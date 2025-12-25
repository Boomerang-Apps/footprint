/**
 * Select Component Tests
 * TDD Test Suite for UI-07: Base UI Primitives
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

describe('Select', () => {
  const defaultOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  describe('Rendering', () => {
    it('renders select element', () => {
      render(<Select options={defaultOptions} aria-label="Test select" />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders all options', () => {
      render(<Select options={defaultOptions} aria-label="Test" />);
      expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    it('displays option labels', () => {
      render(<Select options={defaultOptions} aria-label="Test" />);
      expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      render(<Select options={defaultOptions} className="custom-class" aria-label="Test" />);
      expect(screen.getByRole('combobox')).toHaveClass('custom-class');
    });

    it('forwards ref to select element', () => {
      const ref = vi.fn();
      render(<Select ref={ref} options={defaultOptions} aria-label="Test" />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Placeholder', () => {
    it('shows placeholder option when provided', () => {
      render(<Select options={defaultOptions} placeholder="Select an option" aria-label="Test" />);
      expect(screen.getByRole('option', { name: 'Select an option' })).toBeInTheDocument();
    });

    it('placeholder option is disabled by default', () => {
      render(<Select options={defaultOptions} placeholder="Select an option" aria-label="Test" />);
      const placeholder = screen.getByRole('option', { name: 'Select an option' });
      expect(placeholder).toBeDisabled();
    });
  });

  describe('Styling', () => {
    it('has border styling', () => {
      render(<Select options={defaultOptions} aria-label="Test" />);
      expect(screen.getByRole('combobox')).toHaveClass('border');
    });

    it('has rounded corners', () => {
      render(<Select options={defaultOptions} aria-label="Test" />);
      expect(screen.getByRole('combobox')).toHaveClass('rounded-lg');
    });

    it('has proper height', () => {
      render(<Select options={defaultOptions} aria-label="Test" />);
      expect(screen.getByRole('combobox')).toHaveClass('h-10');
    });

    it('has focus ring styles', () => {
      render(<Select options={defaultOptions} aria-label="Test" />);
      expect(screen.getByRole('combobox')).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Interaction', () => {
    it('handles selection change', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Select options={defaultOptions} onChange={handleChange} aria-label="Test" />);
      await user.selectOptions(screen.getByRole('combobox'), 'option2');

      expect(handleChange).toHaveBeenCalled();
    });

    it('updates value on selection', async () => {
      const user = userEvent.setup();

      render(<Select options={defaultOptions} aria-label="Test" />);
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'option2');

      expect(select).toHaveValue('option2');
    });
  });

  describe('Controlled Value', () => {
    it('accepts value prop', () => {
      render(<Select options={defaultOptions} value="option2" aria-label="Test" onChange={() => {}} />);
      expect(screen.getByRole('combobox')).toHaveValue('option2');
    });

    it('accepts defaultValue prop', () => {
      render(<Select options={defaultOptions} defaultValue="option3" aria-label="Test" />);
      expect(screen.getByRole('combobox')).toHaveValue('option3');
    });
  });

  describe('Disabled State', () => {
    it('can be disabled', () => {
      render(<Select options={defaultOptions} disabled aria-label="Test" />);
      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('shows disabled styling', () => {
      render(<Select options={defaultOptions} disabled aria-label="Test" />);
      expect(screen.getByRole('combobox')).toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });

  describe('Error State', () => {
    it('shows error styling when error prop is true', () => {
      render(<Select options={defaultOptions} error aria-label="Test" />);
      expect(screen.getByRole('combobox')).toHaveClass('border-red-500');
    });

    it('has aria-invalid when error', () => {
      render(<Select options={defaultOptions} error aria-label="Test" />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Accessibility', () => {
    it('can be labeled via aria-label', () => {
      render(<Select options={defaultOptions} aria-label="Choose option" />);
      expect(screen.getByRole('combobox', { name: 'Choose option' })).toBeInTheDocument();
    });

    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      render(
        <>
          <button>Before</button>
          <Select options={defaultOptions} aria-label="Test" />
        </>
      );

      await user.tab();
      await user.tab();
      expect(screen.getByRole('combobox')).toHaveFocus();
    });
  });
});
