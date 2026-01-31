/**
 * Tests for AddressForm component - UI-05B
 *
 * Tests for add/edit address form with validation
 * Following TDD: RED phase
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddressForm } from './AddressForm';
import type { AddressResponse } from '@/lib/validation/address';

const mockAddress: AddressResponse = {
  id: 'addr-1',
  name: 'Home',
  street: 'Dizengoff 100',
  apartment: 'Apt 5',
  city: 'Tel Aviv',
  postalCode: '6433001',
  country: 'Israel',
  phone: '050-1234567',
  isDefault: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

describe('AddressForm', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Add Mode (No Initial Data)', () => {
    it('renders empty form fields', () => {
      render(<AddressForm {...defaultProps} />);

      expect(screen.getByLabelText(/שם/i)).toHaveValue('');
      expect(screen.getByLabelText(/רחוב/i)).toHaveValue('');
      expect(screen.getByLabelText(/עיר/i)).toHaveValue('');
      expect(screen.getByLabelText(/מיקוד/i)).toHaveValue('');
    });

    it('renders add mode title', () => {
      render(<AddressForm {...defaultProps} />);
      expect(screen.getByText(/הוספת כתובת/i)).toBeInTheDocument();
    });

    it('renders save button', () => {
      render(<AddressForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /שמירה/i })).toBeInTheDocument();
    });

    it('renders cancel button', () => {
      render(<AddressForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /ביטול/i })).toBeInTheDocument();
    });
  });

  describe('Edit Mode (With Initial Data)', () => {
    it('renders pre-filled form fields', () => {
      render(<AddressForm {...defaultProps} initialData={mockAddress} />);

      expect(screen.getByLabelText(/שם/i)).toHaveValue('Home');
      expect(screen.getByLabelText(/רחוב/i)).toHaveValue('Dizengoff 100');
      expect(screen.getByLabelText(/דירה/i)).toHaveValue('Apt 5');
      expect(screen.getByLabelText(/עיר/i)).toHaveValue('Tel Aviv');
      expect(screen.getByLabelText(/מיקוד/i)).toHaveValue('6433001');
      expect(screen.getByLabelText(/טלפון/i)).toHaveValue('050-1234567');
    });

    it('renders edit mode title', () => {
      render(<AddressForm {...defaultProps} initialData={mockAddress} />);
      expect(screen.getByText(/עריכת כתובת/i)).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('has name field (required)', () => {
      render(<AddressForm {...defaultProps} />);
      const field = screen.getByLabelText(/שם/i);
      expect(field).toBeInTheDocument();
      expect(field).toHaveAttribute('required');
    });

    it('has street field (required)', () => {
      render(<AddressForm {...defaultProps} />);
      const field = screen.getByLabelText(/רחוב/i);
      expect(field).toBeInTheDocument();
      expect(field).toHaveAttribute('required');
    });

    it('has apartment field (optional)', () => {
      render(<AddressForm {...defaultProps} />);
      const field = screen.getByLabelText(/דירה/i);
      expect(field).toBeInTheDocument();
      expect(field).not.toHaveAttribute('required');
    });

    it('has city field (required)', () => {
      render(<AddressForm {...defaultProps} />);
      const field = screen.getByLabelText(/עיר/i);
      expect(field).toBeInTheDocument();
      expect(field).toHaveAttribute('required');
    });

    it('has postal code field (required)', () => {
      render(<AddressForm {...defaultProps} />);
      const field = screen.getByLabelText(/מיקוד/i);
      expect(field).toBeInTheDocument();
      expect(field).toHaveAttribute('required');
    });

    it('has phone field (optional)', () => {
      render(<AddressForm {...defaultProps} />);
      const field = screen.getByLabelText(/טלפון/i);
      expect(field).toBeInTheDocument();
      expect(field).not.toHaveAttribute('required');
    });
  });

  describe('Validation', () => {
    it('shows error for empty name', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      const nameField = screen.getByLabelText(/שם/i);
      await user.click(nameField);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/שם הוא שדה חובה/i)).toBeInTheDocument();
      });
    });

    it('shows error for empty street', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      const streetField = screen.getByLabelText(/רחוב/i);
      await user.click(streetField);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/רחוב הוא שדה חובה/i)).toBeInTheDocument();
      });
    });

    it('shows error for empty city', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      const cityField = screen.getByLabelText(/עיר/i);
      await user.click(cityField);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/עיר היא שדה חובה/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid postal code (not 7 digits)', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      const postalField = screen.getByLabelText(/מיקוד/i);
      await user.type(postalField, '12345');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/מיקוד חייב להכיל 7 ספרות/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid phone format', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      const phoneField = screen.getByLabelText(/טלפון/i);
      await user.type(phoneField, 'invalid');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/מספר טלפון לא תקין/i)).toBeInTheDocument();
      });
    });

    it('accepts valid Israeli phone number', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      const phoneField = screen.getByLabelText(/טלפון/i);
      await user.type(phoneField, '050-1234567');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/מספר טלפון לא תקין/i)).not.toBeInTheDocument();
      });
    });

    it('accepts valid postal code (7 digits)', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      const postalField = screen.getByLabelText(/מיקוד/i);
      await user.type(postalField, '6433001');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/מיקוד חייב להכיל 7 ספרות/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with form data on valid submission', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<AddressForm {...defaultProps} onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText(/שם/i), 'Home');
      await user.type(screen.getByLabelText(/רחוב/i), 'Dizengoff 100');
      await user.type(screen.getByLabelText(/עיר/i), 'Tel Aviv');
      await user.type(screen.getByLabelText(/מיקוד/i), '6433001');

      fireEvent.click(screen.getByRole('button', { name: /שמירה/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Home',
            street: 'Dizengoff 100',
            city: 'Tel Aviv',
            postalCode: '6433001',
          })
        );
      });
    });

    it('does not call onSubmit when form is invalid', async () => {
      const onSubmit = vi.fn();
      render(<AddressForm {...defaultProps} onSubmit={onSubmit} />);

      fireEvent.click(screen.getByRole('button', { name: /שמירה/i }));

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });

    it('shows loading state during submission', async () => {
      render(<AddressForm {...defaultProps} isSubmitting />);

      const submitButton = screen.getByRole('button', { name: /שומר/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Cancel', () => {
    it('calls onCancel when cancel button clicked', () => {
      const onCancel = vi.fn();
      render(<AddressForm {...defaultProps} onCancel={onCancel} />);

      fireEvent.click(screen.getByRole('button', { name: /ביטול/i }));
      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('RTL Layout', () => {
    it('applies RTL direction', () => {
      render(<AddressForm {...defaultProps} />);
      const form = screen.getByTestId('address-form');
      expect(form).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Accessibility', () => {
    it('has accessible form labels', () => {
      render(<AddressForm {...defaultProps} />);

      expect(screen.getByLabelText(/שם/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/רחוב/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/עיר/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/מיקוד/i)).toBeInTheDocument();
    });

    it('form is keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      const nameField = screen.getByLabelText(/שם/i);
      await user.tab();
      expect(nameField).toHaveFocus();
    });
  });
});
