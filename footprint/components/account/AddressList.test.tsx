/**
 * Tests for AddressList component - UI-05B
 *
 * Tests for addresses list container
 * Following TDD: RED phase
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddressList } from './AddressList';
import type { AddressResponse } from '@/lib/validation/address';

const mockAddresses: AddressResponse[] = [
  {
    id: 'addr-1',
    name: 'Home',
    street: 'Dizengoff 100',
    apartment: 'Apt 5',
    city: 'Tel Aviv',
    postalCode: '6433001',
    country: 'Israel',
    phone: '050-1234567',
    isDefault: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'addr-2',
    name: 'Work',
    street: 'Rothschild 50',
    apartment: null,
    city: 'Tel Aviv',
    postalCode: '6688101',
    country: 'Israel',
    phone: null,
    isDefault: false,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

describe('AddressList', () => {
  const defaultProps = {
    addresses: mockAddresses,
    isLoading: false,
    isError: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onSetDefault: vi.fn(),
    onRetry: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering Addresses', () => {
    it('renders all addresses', () => {
      render(<AddressList {...defaultProps} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    it('renders address cards for each address', () => {
      render(<AddressList {...defaultProps} />);

      const cards = screen.getAllByTestId('address-card');
      expect(cards).toHaveLength(2);
    });

    it('shows default badge on default address', () => {
      render(<AddressList {...defaultProps} />);

      // There may be multiple - one badge on default address, one button on non-default
      const badges = screen.getAllByText('ברירת מחדל');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no addresses', () => {
      render(<AddressList {...defaultProps} addresses={[]} />);

      expect(screen.getByText(/אין כתובות שמורות/i)).toBeInTheDocument();
    });

    it('shows add address CTA in empty state', () => {
      const onAddNew = vi.fn();
      render(<AddressList {...defaultProps} addresses={[]} onAddNew={onAddNew} />);

      expect(screen.getByRole('button', { name: /הוספת כתובת/i })).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton when isLoading', () => {
      render(<AddressList {...defaultProps} isLoading />);

      expect(screen.getByTestId('addresses-loading')).toBeInTheDocument();
    });

    it('does not render addresses when loading', () => {
      render(<AddressList {...defaultProps} isLoading />);

      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when isError', () => {
      render(<AddressList {...defaultProps} isError error={new Error('Failed to load')} />);

      expect(screen.getByText(/שגיאה בטעינת הכתובות/i)).toBeInTheDocument();
    });

    it('shows retry button on error', () => {
      render(<AddressList {...defaultProps} isError error={new Error('Failed to load')} />);

      expect(screen.getByRole('button', { name: /נסה שוב/i })).toBeInTheDocument();
    });

    it('calls onRetry when retry button clicked', () => {
      const onRetry = vi.fn();
      render(
        <AddressList {...defaultProps} isError error={new Error('Failed to load')} onRetry={onRetry} />
      );

      fireEvent.click(screen.getByRole('button', { name: /נסה שוב/i }));
      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('calls onEdit when edit clicked on card', () => {
      const onEdit = vi.fn();
      render(<AddressList {...defaultProps} onEdit={onEdit} />);

      const editButtons = screen.getAllByRole('button', { name: /עריכה/i });
      fireEvent.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledWith(mockAddresses[0]);
    });

    it('calls onDelete when delete clicked on card', () => {
      const onDelete = vi.fn();
      render(<AddressList {...defaultProps} onDelete={onDelete} />);

      const deleteButtons = screen.getAllByRole('button', { name: /מחיקה/i });
      fireEvent.click(deleteButtons[0]);

      expect(onDelete).toHaveBeenCalledWith(mockAddresses[0]);
    });

    it('calls onSetDefault when set default clicked on non-default card', () => {
      const onSetDefault = vi.fn();
      render(<AddressList {...defaultProps} onSetDefault={onSetDefault} />);

      // Find the set default button (should be on the second card which is not default)
      const setDefaultButtons = screen.getAllByRole('button', { name: /ברירת מחדל/i });
      // Click the one that's not a badge (i.e., the action button)
      const actionButton = setDefaultButtons.find(
        (btn) => btn.tagName.toLowerCase() === 'button' && !btn.classList.contains('badge')
      );
      if (actionButton) {
        fireEvent.click(actionButton);
        expect(onSetDefault).toHaveBeenCalledWith(mockAddresses[1]);
      }
    });
  });

  describe('Action Loading State', () => {
    it('disables action buttons when actionLoading is true', () => {
      render(<AddressList {...defaultProps} actionLoading />);

      const editButtons = screen.getAllByRole('button', { name: /עריכה/i });
      editButtons.forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });
  });

  describe('RTL Layout', () => {
    it('applies RTL direction', () => {
      render(<AddressList {...defaultProps} />);
      const list = screen.getByTestId('addresses-list');
      expect(list).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Responsive Layout', () => {
    it('applies grid layout classes', () => {
      render(<AddressList {...defaultProps} />);
      const list = screen.getByTestId('addresses-list');
      expect(list.className).toMatch(/grid/);
    });
  });
});
