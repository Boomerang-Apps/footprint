/**
 * Admin Users List Page Tests - ADMIN-01
 *
 * Tests for the admin users list page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminUsersPage from './page';

// Mock the hooks
const mockUseAdminUsers = vi.fn();
const mockUseAdminUserStats = vi.fn();

vi.mock('@/hooks/useAdminUsers', () => ({
  useAdminUsers: () => mockUseAdminUsers(),
  useAdminUserStats: () => mockUseAdminUserStats(),
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockUsers = [
  {
    id: 'user-1',
    email: 'john@example.com',
    name: 'John Doe',
    phone: '054-1234567',
    avatarUrl: null,
    preferredLanguage: 'he',
    isAdmin: false,
    status: 'active',
    orderCount: 5,
    totalSpent: 1250,
    lastOrderDate: '2026-01-18T10:00:00Z',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'user-2',
    email: 'jane@example.com',
    name: 'Jane Smith',
    phone: '054-7654321',
    avatarUrl: 'https://example.com/avatar.jpg',
    preferredLanguage: 'en',
    isAdmin: true,
    status: 'active',
    orderCount: 12,
    totalSpent: 3500,
    lastOrderDate: '2026-01-25T10:00:00Z',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-25T10:00:00Z',
  },
];

const mockStats = {
  totalUsers: 150,
  newThisWeek: 12,
  newThisMonth: 45,
  adminCount: 3,
  activeUsers: 142,
};

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAdminUsers.mockReturnValue({
      users: mockUsers,
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseAdminUserStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner while fetching', () => {
      mockUseAdminUsers.mockReturnValue({
        users: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
      });

      render(<AdminUsersPage />);

      expect(screen.getByText('טוען משתמשים...')).toBeInTheDocument();
    });

    it('should hide loading after fetch completes', () => {
      render(<AdminUsersPage />);

      expect(screen.queryByText('טוען משתמשים...')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no users', () => {
      mockUseAdminUsers.mockReturnValue({
        users: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(<AdminUsersPage />);

      expect(screen.getByText('לא נמצאו משתמשים')).toBeInTheDocument();
    });
  });

  describe('Users List', () => {
    it('should render all users in list', () => {
      render(<AdminUsersPage />);

      expect(screen.getByTestId('user-row-user-1')).toBeInTheDocument();
      expect(screen.getByTestId('user-row-user-2')).toBeInTheDocument();
    });

    it('should highlight admin users with badge', () => {
      render(<AdminUsersPage />);

      // Admin badge should be visible for Jane (admin)
      expect(screen.getByTestId('admin-badge-user-2')).toBeInTheDocument();
    });

    it('should show user details on each row', () => {
      render(<AdminUsersPage />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('should navigate to detail on row click', async () => {
      render(<AdminUsersPage />);

      const userRow = screen.getByTestId('user-row-user-1');
      const clickableArea = userRow.querySelector('[class*="min-w-0"]');
      if (clickableArea) {
        fireEvent.click(clickableArea);
      }

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/users/user-1');
      });
    });

    it('should show quick action menu', () => {
      render(<AdminUsersPage />);

      const actionButton = screen.getByTestId('action-button-user-1');
      fireEvent.click(actionButton);

      expect(screen.getByTestId('dropdown-user-1')).toBeInTheDocument();
      expect(screen.getByText('צפייה')).toBeInTheDocument();
      expect(screen.getByText('הפוך למנהל')).toBeInTheDocument();
      expect(screen.getByText('השבת חשבון')).toBeInTheDocument();
    });
  });

  describe('Search & Filter', () => {
    it('should have search input', () => {
      render(<AdminUsersPage />);

      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('should have filter tabs', () => {
      render(<AdminUsersPage />);

      expect(screen.getByTestId('filter-all')).toBeInTheDocument();
      expect(screen.getByTestId('filter-admin')).toBeInTheDocument();
      expect(screen.getByTestId('filter-user')).toBeInTheDocument();
    });

    it('should filter by role tab', () => {
      render(<AdminUsersPage />);

      const adminFilter = screen.getByTestId('filter-admin');
      fireEvent.click(adminFilter);

      expect(adminFilter).toHaveAttribute('data-active', 'true');
    });
  });

  describe('Stats Cards', () => {
    it('should display total user count', () => {
      render(<AdminUsersPage />);

      const statCard = screen.getByTestId('stat-card-total');
      expect(statCard).toBeInTheDocument();
      expect(statCard).toHaveTextContent('150');
    });

    it('should display new users this week', () => {
      render(<AdminUsersPage />);

      const statCard = screen.getByTestId('stat-card-new-week');
      expect(statCard).toBeInTheDocument();
      expect(statCard).toHaveTextContent('12');
    });

    it('should display admin count', () => {
      render(<AdminUsersPage />);

      const statCard = screen.getByTestId('stat-card-admins');
      expect(statCard).toBeInTheDocument();
      expect(statCard).toHaveTextContent('3');
    });
  });

  describe('Pagination', () => {
    it('should show pagination controls when multiple pages', () => {
      mockUseAdminUsers.mockReturnValue({
        users: mockUsers,
        total: 100,
        page: 1,
        limit: 20,
        totalPages: 5,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(<AdminUsersPage />);

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByText('עמוד 1 מתוך 5')).toBeInTheDocument();
    });

    it('should not show pagination for single page', () => {
      render(<AdminUsersPage />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });

  describe('RTL & Accessibility', () => {
    it('should have dir=rtl on container', () => {
      render(<AdminUsersPage />);

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('dir', 'rtl');
    });

    it('should use Hebrew labels', () => {
      render(<AdminUsersPage />);

      // Page title
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('משתמשים');
      // Stats card labels
      expect(screen.getByText('סה״כ משתמשים')).toBeInTheDocument();
      // Filter tabs contain Hebrew text
      expect(screen.getByTestId('filter-all')).toHaveTextContent('הכל');
    });
  });

  describe('Error Handling', () => {
    it('should show error message on fetch failure', () => {
      mockUseAdminUsers.mockReturnValue({
        users: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        isLoading: false,
        isError: true,
        refetch: vi.fn(),
      });

      render(<AdminUsersPage />);

      expect(screen.getByText('שגיאה בטעינת משתמשים')).toBeInTheDocument();
      expect(screen.getByText('נסה שוב')).toBeInTheDocument();
    });
  });
});
