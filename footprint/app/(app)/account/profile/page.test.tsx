/**
 * Tests for Profile Page - UI-05A
 *
 * Tests for /account/profile page
 * Following TDD: RED phase
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfilePage from './page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock ProfileForm
vi.mock('@/components/account/ProfileForm', () => ({
  ProfileForm: function MockProfileForm({ onSuccess }: { onSuccess?: () => void }) {
    return (
      <div data-testid="profile-form">
        <button onClick={onSuccess}>Mock Save</button>
      </div>
    );
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
};

describe('Profile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Layout', () => {
    it('renders page with header', () => {
      render(<ProfilePage />, { wrapper: createWrapper() });

      expect(screen.getByText(/הפרופיל שלי/i)).toBeInTheDocument();
    });

    it('renders back button', () => {
      render(<ProfilePage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    it('renders ProfileForm component', () => {
      render(<ProfilePage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('profile-form')).toBeInTheDocument();
    });

    it('applies RTL direction', () => {
      render(<ProfilePage />, { wrapper: createWrapper() });

      const container = screen.getByTestId('profile-page');
      expect(container).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Navigation', () => {
    it('navigates back when back button clicked', () => {
      render(<ProfilePage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByTestId('back-button'));

      expect(mockPush).toHaveBeenCalledWith('/account');
    });
  });

  describe('Success Handling', () => {
    it('shows success toast on profile save', async () => {
      render(<ProfilePage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Mock Save'));

      await waitFor(() => {
        expect(screen.getByText(/הפרופיל נשמר בהצלחה/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive container classes', () => {
      render(<ProfilePage />, { wrapper: createWrapper() });

      const main = screen.getByRole('main');
      expect(main).toHaveClass('max-w-[600px]');
    });
  });
});
