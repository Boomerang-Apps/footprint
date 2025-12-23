/**
 * ShippingAddressForm Component Tests
 *
 * CO-01: Enter Shipping Address
 * TDD: Tests written FIRST
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShippingAddressForm from './ShippingAddressForm';

// Mock the orderStore
const mockSetShippingAddress = vi.fn();

vi.mock('@/stores/orderStore', () => ({
  useOrderStore: () => ({
    shippingAddress: null,
    setShippingAddress: mockSetShippingAddress,
  }),
}));

describe('ShippingAddressForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the form component', () => {
      render(<ShippingAddressForm />);
      expect(screen.getByRole('form', { name: /shipping|משלוח/i })).toBeInTheDocument();
    });

    it('displays form title in Hebrew', () => {
      render(<ShippingAddressForm />);
      expect(screen.getByText(/כתובת למשלוח/)).toBeInTheDocument();
    });

    it('renders all required input fields', () => {
      render(<ShippingAddressForm />);

      expect(screen.getByLabelText(/שם מלא/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/רחוב/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/עיר/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/מיקוד/i)).toBeInTheDocument();
    });

    it('renders country field with default value', () => {
      render(<ShippingAddressForm />);
      const countryField = screen.getByLabelText(/מדינה/i);
      expect(countryField).toBeInTheDocument();
      expect(countryField).toHaveValue('ישראל');
    });

    it('renders optional phone field', () => {
      render(<ShippingAddressForm />);
      expect(screen.getByLabelText(/טלפון/i)).toBeInTheDocument();
    });

    it('renders save for future checkbox', () => {
      render(<ShippingAddressForm />);
      expect(screen.getByRole('checkbox', { name: /שמור|save/i })).toBeInTheDocument();
    });
  });

  describe('Field Inputs', () => {
    it('allows entering name', async () => {
      const user = userEvent.setup();
      render(<ShippingAddressForm />);

      const nameInput = screen.getByLabelText(/שם מלא/i);
      await user.type(nameInput, 'ישראל ישראלי');

      expect(nameInput).toHaveValue('ישראל ישראלי');
    });

    it('allows entering street address', async () => {
      const user = userEvent.setup();
      render(<ShippingAddressForm />);

      const streetInput = screen.getByLabelText(/רחוב/i);
      await user.type(streetInput, 'הרצל 123');

      expect(streetInput).toHaveValue('הרצל 123');
    });

    it('allows entering city', async () => {
      const user = userEvent.setup();
      render(<ShippingAddressForm />);

      const cityInput = screen.getByLabelText(/עיר/i);
      await user.type(cityInput, 'תל אביב');

      expect(cityInput).toHaveValue('תל אביב');
    });

    it('allows entering postal code', async () => {
      const user = userEvent.setup();
      render(<ShippingAddressForm />);

      const postalInput = screen.getByLabelText(/מיקוד/i);
      await user.type(postalInput, '6100000');

      expect(postalInput).toHaveValue('6100000');
    });

    it('allows entering phone number', async () => {
      const user = userEvent.setup();
      render(<ShippingAddressForm />);

      const phoneInput = screen.getByLabelText(/טלפון/i);
      await user.type(phoneInput, '050-1234567');

      expect(phoneInput).toHaveValue('050-1234567');
    });
  });

  describe('Validation', () => {
    it('shows error when name is empty on blur', async () => {
      const user = userEvent.setup();
      render(<ShippingAddressForm />);

      const nameInput = screen.getByLabelText(/שם מלא/i);
      await user.click(nameInput);
      await user.tab(); // blur

      await waitFor(() => {
        expect(screen.getByText(/שם הוא שדה חובה/)).toBeInTheDocument();
      });
    });

    it('shows error when name is too short', async () => {
      const user = userEvent.setup();
      render(<ShippingAddressForm />);

      const nameInput = screen.getByLabelText(/שם מלא/i);
      await user.type(nameInput, 'א');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/שם חייב להכיל לפחות 2 תווים/)).toBeInTheDocument();
      });
    });

    it('shows error when street is empty', async () => {
      const user = userEvent.setup();
      render(<ShippingAddressForm />);

      const streetInput = screen.getByLabelText(/רחוב/i);
      await user.click(streetInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/כתובת היא שדה חובה/)).toBeInTheDocument();
      });
    });

    it('shows error when city is empty', async () => {
      const user = userEvent.setup();
      render(<ShippingAddressForm />);

      const cityInput = screen.getByLabelText(/עיר/i);
      await user.click(cityInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/עיר היא שדה חובה/)).toBeInTheDocument();
      });
    });

    it('shows error when postal code is invalid', async () => {
      const user = userEvent.setup();
      render(<ShippingAddressForm />);

      const postalInput = screen.getByLabelText(/מיקוד/i);
      await user.type(postalInput, '123');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/מיקוד חייב להכיל 7 ספרות/)).toBeInTheDocument();
      });
    });

    it('clears error when valid value entered', async () => {
      const user = userEvent.setup();
      render(<ShippingAddressForm />);

      const nameInput = screen.getByLabelText(/שם מלא/i);
      await user.click(nameInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/שם הוא שדה חובה/)).toBeInTheDocument();
      });

      await user.type(nameInput, 'ישראל ישראלי');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/שם הוא שדה חובה/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Store Integration', () => {
    it('calls setShippingAddress when form is valid', async () => {
      const user = userEvent.setup();
      render(<ShippingAddressForm />);

      // Fill all required fields
      await user.type(screen.getByLabelText(/שם מלא/i), 'ישראל ישראלי');
      await user.type(screen.getByLabelText(/רחוב/i), 'הרצל 123');
      await user.type(screen.getByLabelText(/עיר/i), 'תל אביב');
      await user.type(screen.getByLabelText(/מיקוד/i), '6100000');
      await user.tab(); // Trigger blur/validation

      await waitFor(() => {
        expect(mockSetShippingAddress).toHaveBeenCalled();
      });
    });

    it('includes all fields in address object', async () => {
      const user = userEvent.setup();
      render(<ShippingAddressForm />);

      await user.type(screen.getByLabelText(/שם מלא/i), 'ישראל ישראלי');
      await user.type(screen.getByLabelText(/רחוב/i), 'הרצל 123');
      await user.type(screen.getByLabelText(/עיר/i), 'תל אביב');
      await user.type(screen.getByLabelText(/מיקוד/i), '6100000');
      await user.type(screen.getByLabelText(/טלפון/i), '0501234567');
      await user.tab();

      await waitFor(() => {
        const lastCall = mockSetShippingAddress.mock.calls[mockSetShippingAddress.mock.calls.length - 1];
        expect(lastCall[0]).toMatchObject({
          name: 'ישראל ישראלי',
          street: 'הרצל 123',
          city: 'תל אביב',
          postalCode: '6100000',
          country: 'ישראל',
          phone: '0501234567',
        });
      });
    });
  });

  describe('Save for Future', () => {
    it('checkbox is unchecked by default', () => {
      render(<ShippingAddressForm />);
      const checkbox = screen.getByRole('checkbox', { name: /שמור|save/i });
      expect(checkbox).not.toBeChecked();
    });

    it('can toggle save checkbox', async () => {
      const user = userEvent.setup();
      render(<ShippingAddressForm />);

      const checkbox = screen.getByRole('checkbox', { name: /שמור|save/i });
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it('includes isDefault when checkbox is checked', async () => {
      const user = userEvent.setup();
      render(<ShippingAddressForm />);

      // Check save checkbox
      const checkbox = screen.getByRole('checkbox', { name: /שמור|save/i });
      await user.click(checkbox);

      // Fill required fields
      await user.type(screen.getByLabelText(/שם מלא/i), 'ישראל ישראלי');
      await user.type(screen.getByLabelText(/רחוב/i), 'הרצל 123');
      await user.type(screen.getByLabelText(/עיר/i), 'תל אביב');
      await user.type(screen.getByLabelText(/מיקוד/i), '6100000');
      await user.tab();

      await waitFor(() => {
        const lastCall = mockSetShippingAddress.mock.calls[mockSetShippingAddress.mock.calls.length - 1];
        expect(lastCall[0].isDefault).toBe(true);
      });
    });
  });

  describe('Accessibility', () => {
    it('form has accessible name', () => {
      render(<ShippingAddressForm />);
      expect(screen.getByRole('form')).toHaveAccessibleName();
    });

    it('all inputs have labels', () => {
      render(<ShippingAddressForm />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });
    });

    it('error messages are associated with inputs', async () => {
      const user = userEvent.setup();
      render(<ShippingAddressForm />);

      const nameInput = screen.getByLabelText(/שם מלא/i);
      await user.click(nameInput);
      await user.tab();

      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('required fields are marked as required', () => {
      render(<ShippingAddressForm />);

      expect(screen.getByLabelText(/שם מלא/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/רחוב/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/עיר/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/מיקוד/i)).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Props', () => {
    it('accepts custom className', () => {
      render(<ShippingAddressForm className="custom-class" />);
      const form = screen.getByRole('form');
      expect(form).toHaveClass('custom-class');
    });

    it('accepts initial address values', () => {
      const initialAddress = {
        name: 'ישראל ישראלי',
        street: 'הרצל 123',
        city: 'תל אביב',
        postalCode: '6100000',
        country: 'ישראל',
        phone: '0501234567',
      };

      render(<ShippingAddressForm initialAddress={initialAddress} />);

      expect(screen.getByLabelText(/שם מלא/i)).toHaveValue('ישראל ישראלי');
      expect(screen.getByLabelText(/רחוב/i)).toHaveValue('הרצל 123');
      expect(screen.getByLabelText(/עיר/i)).toHaveValue('תל אביב');
      expect(screen.getByLabelText(/מיקוד/i)).toHaveValue('6100000');
      expect(screen.getByLabelText(/טלפון/i)).toHaveValue('0501234567');
    });

    it('calls onValidChange callback', async () => {
      const onValidChange = vi.fn();
      const user = userEvent.setup();

      render(<ShippingAddressForm onValidChange={onValidChange} />);

      // Fill all required fields
      await user.type(screen.getByLabelText(/שם מלא/i), 'ישראל ישראלי');
      await user.type(screen.getByLabelText(/רחוב/i), 'הרצל 123');
      await user.type(screen.getByLabelText(/עיר/i), 'תל אביב');
      await user.type(screen.getByLabelText(/מיקוד/i), '6100000');
      await user.tab();

      await waitFor(() => {
        expect(onValidChange).toHaveBeenCalledWith(true);
      });
    });

    it('can be disabled', () => {
      render(<ShippingAddressForm disabled />);

      expect(screen.getByLabelText(/שם מלא/i)).toBeDisabled();
      expect(screen.getByLabelText(/רחוב/i)).toBeDisabled();
      expect(screen.getByLabelText(/עיר/i)).toBeDisabled();
      expect(screen.getByLabelText(/מיקוד/i)).toBeDisabled();
    });
  });
});

describe('ShippingAddressForm with existing address', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('populates form from store', () => {
    const existingAddress = {
      name: 'יעל כהן',
      street: 'דיזנגוף 50',
      city: 'תל אביב',
      postalCode: '6433222',
      country: 'ישראל',
      phone: '0521234567',
    };

    render(<ShippingAddressForm initialAddress={existingAddress} />);

    expect(screen.getByLabelText(/שם מלא/i)).toHaveValue('יעל כהן');
    expect(screen.getByLabelText(/רחוב/i)).toHaveValue('דיזנגוף 50');
  });
});
