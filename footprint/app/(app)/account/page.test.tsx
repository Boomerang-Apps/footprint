import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AccountPage from './page';

// Hoisted mocks
const mocks = vi.hoisted(() => ({
  mockUseProfile: vi.fn(),
  mockUseOrderHistory: vi.fn(),
  mockUseFavoritesStore: vi.fn(),
  mockPush: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.mockPush }),
  usePathname: () => '/account',
}));

vi.mock('@/hooks/useProfile', () => ({
  useProfile: mocks.mockUseProfile,
}));

vi.mock('@/hooks/useOrderHistory', () => ({
  useOrderHistory: mocks.mockUseOrderHistory,
}));

vi.mock('@/stores/favoritesStore', () => ({
  useFavoritesStore: mocks.mockUseFavoritesStore,
}));

vi.mock('@/components/account/ProfileHero', () => ({
  ProfileHero: function MockProfileHero({ name, email }: { name: string; email: string }) {
    return (
      <div data-testid="profile-hero">
        <span>{name}</span>
        <span>{email}</span>
      </div>
    );
  },
}));

vi.mock('@/components/account/ProfileStats', () => ({
  ProfileStats: function MockProfileStats({
    creationsCount,
    ordersCount,
    favoritesCount,
  }: {
    creationsCount: number;
    ordersCount: number;
    favoritesCount: number;
  }) {
    return (
      <div data-testid="profile-stats">
        <span data-testid="creations-count">{creationsCount}</span>
        <span data-testid="orders-count">{ordersCount}</span>
        <span data-testid="favorites-count">{favoritesCount}</span>
      </div>
    );
  },
}));

vi.mock('@/components/account/ProfileMenu', () => ({
  ProfileMenu: function MockProfileMenu() {
    return <div data-testid="profile-menu" />;
  },
}));

const mockProfile = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  phone: '050-1234567',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

describe('AccountPage (Profile Hub)', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseProfile.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    mocks.mockUseOrderHistory.mockReturnValue({
      data: {
        orders: [],
        totalOrders: 5,
        totalSpent: 500,
        inTransitCount: 1,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });

    mocks.mockUseFavoritesStore.mockImplementation((selector: (state: { favorites: unknown[] }) => unknown) =>
      selector({ favorites: [{ id: '1' }, { id: '2' }, { id: '3' }] })
    );
  });

  describe('Loaded State', () => {
    it('renders profile hub with hero, stats, and menu', () => {
      render(<AccountPage />);

      expect(screen.getByTestId('profile-hub')).toBeInTheDocument();
      expect(screen.getByTestId('profile-hero')).toBeInTheDocument();
      expect(screen.getByTestId('profile-stats')).toBeInTheDocument();
      expect(screen.getByTestId('profile-menu')).toBeInTheDocument();
    });

    it('passes profile data to hero', () => {
      render(<AccountPage />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('passes correct counts to stats', () => {
      render(<AccountPage />);

      expect(screen.getByTestId('orders-count')).toHaveTextContent('5');
      expect(screen.getByTestId('favorites-count')).toHaveTextContent('3');
    });

    it('has RTL direction', () => {
      render(<AccountPage />);
      expect(screen.getByTestId('profile-hub')).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton', () => {
      mocks.mockUseProfile.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<AccountPage />);
      expect(screen.getByTestId('profile-hub-loading')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error state with retry button', () => {
      mocks.mockUseProfile.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to load'),
        refetch: mockRefetch,
      });

      render(<AccountPage />);
      expect(screen.getByTestId('profile-hub-error')).toBeInTheDocument();
      expect(screen.getByText('שגיאה בטעינת הפרופיל')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /נסה שוב/i })).toBeInTheDocument();
    });

    it('redirects to login on unauthorized error', () => {
      mocks.mockUseProfile.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Unauthorized'),
        refetch: mockRefetch,
      });

      render(<AccountPage />);
      expect(mocks.mockPush).toHaveBeenCalledWith('/login');
    });
  });
});
