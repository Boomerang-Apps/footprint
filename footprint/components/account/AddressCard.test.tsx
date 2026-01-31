/**
 * Tests for AddressCard component - UI-05B
 *
 * Tests for address display card with actions
 * Following TDD: RED phase
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddressCard } from './AddressCard';
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

const mockDefaultAddress: AddressResponse = {
  ...mockAddress,
  id: 'addr-2',
  isDefault: true,
};

describe('AddressCard', () => {
  const defaultProps = {
    address: mockAddress,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onSetDefault: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders address name', () => {
      render(<AddressCard {...defaultProps} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('renders address street and apartment', () => {
      render(<AddressCard {...defaultProps} />);
      expect(screen.getByText(/Dizengoff 100/)).toBeInTheDocument();
      expect(screen.getByText(/Apt 5/)).toBeInTheDocument();
    });

    it('renders city and postal code', () => {
      render(<AddressCard {...defaultProps} />);
      expect(screen.getByText(/Tel Aviv/)).toBeInTheDocument();
      expect(screen.getByText(/6433001/)).toBeInTheDocument();
    });

    it('renders phone number when provided', () => {
      render(<AddressCard {...defaultProps} />);
      expect(screen.getByText('050-1234567')).toBeInTheDocument();
    });

    it('does not render phone when null', () => {
      const addressWithoutPhone = { ...mockAddress, phone: null };
      render(<AddressCard {...defaultProps} address={addressWithoutPhone} />);
      expect(screen.queryByText('050-1234567')).not.toBeInTheDocument();
    });

    it('renders without apartment when null', () => {
      const addressWithoutApartment = { ...mockAddress, apartment: null };
      render(<AddressCard {...defaultProps} address={addressWithoutApartment} />);
      expect(screen.queryByText(/Apt/)).not.toBeInTheDocument();
    });
  });

  describe('Default Badge', () => {
    it('shows default badge when isDefault is true', () => {
      render(<AddressCard {...defaultProps} address={mockDefaultAddress} />);
      expect(screen.getByText('ברירת מחדל')).toBeInTheDocument();
    });

    it('does not show default badge when isDefault is false', () => {
      render(<AddressCard {...defaultProps} />);
      // The badge has a specific class, the button doesn't have fill-current
      const badge = document.querySelector('.fill-current');
      expect(badge).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders edit button', () => {
      render(<AddressCard {...defaultProps} />);
      expect(screen.getByRole('button', { name: /עריכה/i })).toBeInTheDocument();
    });

    it('renders delete button', () => {
      render(<AddressCard {...defaultProps} />);
      expect(screen.getByRole('button', { name: /מחיקה/i })).toBeInTheDocument();
    });

    it('renders set default button when not default', () => {
      render(<AddressCard {...defaultProps} />);
      expect(screen.getByRole('button', { name: /ברירת מחדל/i })).toBeInTheDocument();
    });

    it('does not render set default button when already default', () => {
      render(<AddressCard {...defaultProps} address={mockDefaultAddress} />);
      // Should only have edit and delete buttons, not "set as default"
      const buttons = screen.getAllByRole('button');
      const setDefaultButton = buttons.find(
        (btn) => btn.textContent?.includes('קבע') || btn.textContent?.includes('הגדר')
      );
      expect(setDefaultButton).toBeUndefined();
    });
  });

  describe('Interactions', () => {
    it('calls onEdit when edit button clicked', () => {
      const onEdit = vi.fn();
      render(<AddressCard {...defaultProps} onEdit={onEdit} />);

      fireEvent.click(screen.getByRole('button', { name: /עריכה/i }));
      expect(onEdit).toHaveBeenCalledWith(mockAddress);
    });

    it('calls onDelete when delete button clicked', () => {
      const onDelete = vi.fn();
      render(<AddressCard {...defaultProps} onDelete={onDelete} />);

      fireEvent.click(screen.getByRole('button', { name: /מחיקה/i }));
      expect(onDelete).toHaveBeenCalledWith(mockAddress);
    });

    it('calls onSetDefault when set default button clicked', () => {
      const onSetDefault = vi.fn();
      render(<AddressCard {...defaultProps} onSetDefault={onSetDefault} />);

      fireEvent.click(screen.getByRole('button', { name: /ברירת מחדל/i }));
      expect(onSetDefault).toHaveBeenCalledWith(mockAddress);
    });
  });

  describe('Loading State', () => {
    it('disables buttons when loading', () => {
      render(<AddressCard {...defaultProps} isLoading />);

      expect(screen.getByRole('button', { name: /עריכה/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /מחיקה/i })).toBeDisabled();
    });
  });

  describe('RTL Layout', () => {
    it('applies RTL direction', () => {
      render(<AddressCard {...defaultProps} />);
      const card = screen.getByTestId('address-card');
      expect(card).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Accessibility', () => {
    it('has accessible card structure', () => {
      render(<AddressCard {...defaultProps} />);
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('buttons have accessible labels', () => {
      render(<AddressCard {...defaultProps} />);
      expect(screen.getByRole('button', { name: /עריכה/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /מחיקה/i })).toBeInTheDocument();
    });
  });
});
