/**
 * Admin User Detail Page Tests - ADMIN-04
 *
 * Tests for the admin user detail page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminUserDetailPage from './page';

// Mock the hooks
const mockUseAdminUser = vi.fn();
const mockUseUpdateUserRole = vi.fn();
const mockUseUpdateUserStatus = vi.fn();

vi.mock('@/hooks/useAdminUser', () => ({
  useAdminUser: () => mockUseAdminUser(),
  useUpdateUserRole: () => mockUseUpdateUserRole(),
  useUpdateUserStatus: () => mockUseUpdateUserStatus(),
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({
    id: 'user-1',
  }),
}));

const mockUser = {
  id: 'user-1',
  email: 'john@example.com',
  name: 'John Doe',
  phone: '054-1234567',
  avatarUrl: 'https://example.com/avatar.jpg',
  preferredLanguage: 'he',
  isAdmin: false,
  status: 'active',
  orderCount: 5,
  totalSpent: 1250,
  lastOrderDate: '2026-01-18T10:00:00Z',
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-20T10:00:00Z',
  addresses: [
    {
      id: 'addr-1',
      name: 'Home',
      street: 'Herzl 1',
      city: 'Tel Aviv',
      postalCode: '12345',
      isDefault: true,
    },
  ],
  orders: [
    {
      id: 'order-1',
      orderNumber: 'FP-2026-001',
      status: 'delivered',
      total: 237,
      createdAt: '2026-01-18T10:00:00Z',
    },
  ],
};

const mockAdminUser = {
  ...mockUser,
  isAdmin: true,
};

describe('AdminUserDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAdminUser.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mockUseUpdateUserRole.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ success: true }),
      isPending: false,
    });
    mockUseUpdateUserStatus.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ success: true }),
      isPending: false,
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner while fetching', () => {
      mockUseAdminUser.mockReturnValue({
        user: null,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<AdminUserDetailPage />);

      expect(screen.getByText('טוען פרטי משתמש...')).toBeInTheDocument();
    });

    it('should hide loading after fetch completes', () => {
      render(<AdminUserDetailPage />);

      expect(screen.queryByText('טוען פרטי משתמש...')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error for non-existent user', () => {
      mockUseAdminUser.mockReturnValue({
        user: null,
        isLoading: false,
        isError: true,
        error: { message: 'משתמש לא נמצא' },
        refetch: vi.fn(),
      });

      render(<AdminUserDetailPage />);

      expect(screen.getByText('משתמש לא נמצא')).toBeInTheDocument();
    });

    it('should show error on fetch failure', () => {
      mockUseAdminUser.mockReturnValue({
        user: null,
        isLoading: false,
        isError: true,
        error: { message: 'שגיאת שרת' },
        refetch: vi.fn(),
      });

      render(<AdminUserDetailPage />);

      expect(screen.getByText('שגיאת שרת')).toBeInTheDocument();
    });
  });

  describe('Profile Display', () => {
    it('should display user avatar', () => {
      render(<AdminUserDetailPage />);

      expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
    });

    it('should display user name and email', () => {
      render(<AdminUserDetailPage />);

      expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('user-email')).toHaveTextContent('john@example.com');
    });

    it('should display user phone', () => {
      render(<AdminUserDetailPage />);

      expect(screen.getByTestId('user-phone')).toHaveTextContent('054-1234567');
    });

    it('should display registration date', () => {
      render(<AdminUserDetailPage />);

      const registrationDate = screen.getByTestId('registration-date');
      expect(registrationDate).toHaveTextContent('הצטרף בתאריך:');
    });

    it('should show admin badge for admins', () => {
      mockUseAdminUser.mockReturnValue({
        user: mockAdminUser,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<AdminUserDetailPage />);

      expect(screen.getByTestId('admin-badge')).toBeInTheDocument();
    });

    it('should show account status', () => {
      render(<AdminUserDetailPage />);

      expect(screen.getByTestId('status-badge')).toHaveTextContent('פעיל');
    });
  });

  describe('Stats Section', () => {
    it('should show order count', () => {
      render(<AdminUserDetailPage />);

      expect(screen.getByTestId('order-count')).toHaveTextContent('5');
    });

    it('should show total spent', () => {
      render(<AdminUserDetailPage />);

      const totalSpent = screen.getByTestId('total-spent');
      expect(totalSpent).toHaveTextContent('₪1,250');
    });

    it('should show last order date', () => {
      render(<AdminUserDetailPage />);

      const lastOrderDate = screen.getByTestId('last-order-date');
      expect(lastOrderDate).toBeInTheDocument();
    });
  });

  describe('Order History', () => {
    it('should display orders table', () => {
      render(<AdminUserDetailPage />);

      expect(screen.getByTestId('orders-table')).toBeInTheDocument();
    });

    it('should show order details in rows', () => {
      render(<AdminUserDetailPage />);

      expect(screen.getByTestId('order-row-order-1')).toBeInTheDocument();
      expect(screen.getByText('FP-2026-001')).toBeInTheDocument();
    });

    it('should navigate to order on click', async () => {
      render(<AdminUserDetailPage />);

      const orderRow = screen.getByTestId('order-row-order-1');
      fireEvent.click(orderRow);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/orders/order-1');
      });
    });
  });

  describe('Addresses Section', () => {
    it('should display address cards', () => {
      render(<AdminUserDetailPage />);

      expect(screen.getByTestId('addresses-section')).toBeInTheDocument();
      expect(screen.getByTestId('address-card-addr-1')).toBeInTheDocument();
    });

    it('should show default badge on default address', () => {
      render(<AdminUserDetailPage />);

      expect(screen.getByTestId('default-badge')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should show make admin button for users', () => {
      render(<AdminUserDetailPage />);

      const roleButton = screen.getByTestId('role-action-button');
      expect(roleButton).toHaveTextContent('הפוך למנהל');
    });

    it('should show remove admin button for admins', () => {
      mockUseAdminUser.mockReturnValue({
        user: mockAdminUser,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<AdminUserDetailPage />);

      const roleButton = screen.getByTestId('role-action-button');
      expect(roleButton).toHaveTextContent('הסר הרשאות מנהל');
    });

    it('should show confirmation modal on action click', () => {
      render(<AdminUserDetailPage />);

      const roleButton = screen.getByTestId('role-action-button');
      fireEvent.click(roleButton);

      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    });

    it('should call role mutation on confirm', async () => {
      const mockMutate = vi.fn().mockResolvedValue({ success: true });
      mockUseUpdateUserRole.mockReturnValue({
        mutateAsync: mockMutate,
        isPending: false,
      });

      render(<AdminUserDetailPage />);

      const roleButton = screen.getByTestId('role-action-button');
      fireEvent.click(roleButton);

      const confirmButton = screen.getByTestId('confirm-button');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({ userId: 'user-1', isAdmin: true });
      });
    });
  });

  describe('Navigation', () => {
    it('should have back button', () => {
      render(<AdminUserDetailPage />);

      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    it('should navigate to /admin/users on back', async () => {
      render(<AdminUserDetailPage />);

      const backButton = screen.getByTestId('back-button');
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/users');
      });
    });
  });

  describe('RTL & Accessibility', () => {
    it('should have dir=rtl on container', () => {
      render(<AdminUserDetailPage />);

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('dir', 'rtl');
    });

    it('should use Hebrew labels', () => {
      render(<AdminUserDetailPage />);

      expect(screen.getByText('חזרה לרשימת המשתמשים')).toBeInTheDocument();
      expect(screen.getByText('היסטוריית הזמנות')).toBeInTheDocument();
      expect(screen.getByText('כתובות שמורות')).toBeInTheDocument();
    });
  });
});
