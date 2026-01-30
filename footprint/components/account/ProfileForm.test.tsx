/**
 * Tests for ProfileForm component - UI-05A
 *
 * Tests for user profile editing form
 * Following TDD: RED phase
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileForm } from './ProfileForm';

// Define mocks using vi.hoisted
const mocks = vi.hoisted(() => ({
  mockUseProfile: vi.fn(),
  mockUseUpdateProfile: vi.fn(),
}));

vi.mock('@/hooks/useProfile', () => ({
  useProfile: mocks.mockUseProfile,
}));

vi.mock('@/hooks/useUpdateProfile', () => ({
  useUpdateProfile: mocks.mockUseUpdateProfile,
}));

// Mock AvatarUpload
vi.mock('./AvatarUpload', () => ({
  AvatarUpload: function MockAvatarUpload({
    onUploadSuccess,
  }: {
    onUploadSuccess: (url: string) => void;
  }) {
    return (
      <div data-testid="avatar-upload">
        <button onClick={() => onUploadSuccess('new-url')}>Mock Upload</button>
      </div>
    );
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
};

const mockProfile = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  phone: '050-1234567',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

describe('ProfileForm', () => {
  const mockMutate = vi.fn();
  const mockMutateAsync = vi.fn();
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

    mocks.mockUseUpdateProfile.mockReturnValue({
      mutate: mockMutate,
      mutateAsync: mockMutateAsync.mockResolvedValue({ success: true }),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('renders profile form with data', () => {
      render(<ProfileForm />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/שם/i)).toHaveValue('Test User');
      expect(screen.getByLabelText(/טלפון/i)).toHaveValue('050-1234567');
    });

    it('renders email as read-only', () => {
      render(<ProfileForm />, { wrapper: createWrapper() });

      const emailField = screen.getByText('test@example.com');
      expect(emailField).toBeInTheDocument();
    });

    it('renders avatar upload component', () => {
      render(<ProfileForm />, { wrapper: createWrapper() });

      expect(screen.getByTestId('avatar-upload')).toBeInTheDocument();
    });

    it('renders save button', () => {
      render(<ProfileForm />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /שמור/i })).toBeInTheDocument();
    });

    it('applies RTL direction', () => {
      render(<ProfileForm />, { wrapper: createWrapper() });

      const form = screen.getByTestId('profile-form');
      expect(form).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton when data is loading', () => {
      mocks.mockUseProfile.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<ProfileForm />, { wrapper: createWrapper() });

      expect(screen.getByTestId('profile-loading')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when data fetch fails', () => {
      mocks.mockUseProfile.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to load'),
        refetch: mockRefetch,
      });

      render(<ProfileForm />, { wrapper: createWrapper() });

      expect(screen.getByText(/שגיאה בטעינת הפרופיל/i)).toBeInTheDocument();
    });

    it('shows retry button on error', () => {
      mocks.mockUseProfile.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to load'),
        refetch: mockRefetch,
      });

      render(<ProfileForm />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /נסה שוב/i })).toBeInTheDocument();
    });

    it('calls refetch on retry click', () => {
      mocks.mockUseProfile.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to load'),
        refetch: mockRefetch,
      });

      render(<ProfileForm />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: /נסה שוב/i }));

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Form Editing', () => {
    it('allows editing name field', () => {
      render(<ProfileForm />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/שם/i);
      fireEvent.change(nameInput, { target: { value: 'New Name' } });

      expect(nameInput).toHaveValue('New Name');
    });

    it('allows editing phone field', () => {
      render(<ProfileForm />, { wrapper: createWrapper() });

      const phoneInput = screen.getByLabelText(/טלפון/i);
      fireEvent.change(phoneInput, { target: { value: '052-9876543' } });

      expect(phoneInput).toHaveValue('052-9876543');
    });

    it('disables save button when form unchanged', () => {
      render(<ProfileForm />, { wrapper: createWrapper() });

      const saveButton = screen.getByRole('button', { name: /שמור/i });
      expect(saveButton).toBeDisabled();
    });

    it('enables save button when form changed', () => {
      render(<ProfileForm />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/שם/i);
      fireEvent.change(nameInput, { target: { value: 'New Name' } });

      const saveButton = screen.getByRole('button', { name: /שמור/i });
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    it('shows error for name less than 2 characters', async () => {
      render(<ProfileForm />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/שם/i);
      fireEvent.change(nameInput, { target: { value: 'A' } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText(/שם חייב להכיל לפחות 2 תווים/i)).toBeInTheDocument();
      });
    });

    it('shows error for name more than 50 characters', async () => {
      render(<ProfileForm />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/שם/i);
      fireEvent.change(nameInput, { target: { value: 'A'.repeat(51) } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText(/שם יכול להכיל עד 50 תווים/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid phone format', async () => {
      render(<ProfileForm />, { wrapper: createWrapper() });

      const phoneInput = screen.getByLabelText(/טלפון/i);
      fireEvent.change(phoneInput, { target: { value: '12345' } });
      fireEvent.blur(phoneInput);

      await waitFor(() => {
        expect(screen.getByText(/מספר טלפון לא תקין/i)).toBeInTheDocument();
      });
    });

    it('accepts valid Israeli phone number', async () => {
      render(<ProfileForm />, { wrapper: createWrapper() });

      const phoneInput = screen.getByLabelText(/טלפון/i);
      fireEvent.change(phoneInput, { target: { value: '052-1234567' } });
      fireEvent.blur(phoneInput);

      await waitFor(() => {
        expect(screen.queryByText(/מספר טלפון לא תקין/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls update mutation on submit', async () => {
      render(<ProfileForm />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/שם/i);
      fireEvent.change(nameInput, { target: { value: 'New Name' } });

      const saveButton = screen.getByRole('button', { name: /שמור/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({ name: 'New Name' });
      });
    });

    it('shows loading state during submission', async () => {
      mocks.mockUseUpdateProfile.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: mockMutateAsync.mockImplementation(
          () => new Promise(() => {})
        ),
        isPending: true,
        isSuccess: false,
        isError: false,
        error: null,
        reset: vi.fn(),
      });

      render(<ProfileForm />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/שם/i);
      fireEvent.change(nameInput, { target: { value: 'New Name' } });

      expect(screen.getByRole('button', { name: /שומר/i })).toBeInTheDocument();
    });

    it('shows success toast after successful save', async () => {
      const onSuccess = vi.fn();
      render(<ProfileForm onSuccess={onSuccess} />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/שם/i);
      fireEvent.change(nameInput, { target: { value: 'New Name' } });

      const saveButton = screen.getByRole('button', { name: /שמור/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('shows error message on submission failure', async () => {
      mocks.mockUseUpdateProfile.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: mockMutateAsync.mockRejectedValue(
          new Error('Update failed')
        ),
        isPending: false,
        isSuccess: false,
        isError: true,
        error: new Error('Update failed'),
        reset: vi.fn(),
      });

      render(<ProfileForm />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/שם/i);
      fireEvent.change(nameInput, { target: { value: 'New Name' } });

      const saveButton = screen.getByRole('button', { name: /שמור/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/שגיאה בשמירת הפרופיל/i)).toBeInTheDocument();
      });
    });
  });

  describe('Avatar Update', () => {
    it('refetches profile after avatar upload', async () => {
      render(<ProfileForm />, { wrapper: createWrapper() });

      const uploadButton = screen.getByText('Mock Upload');
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible form labels', () => {
      render(<ProfileForm />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/שם/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/טלפון/i)).toBeInTheDocument();
    });

    it('form is keyboard accessible', () => {
      render(<ProfileForm />, { wrapper: createWrapper() });

      const nameInput = screen.getByLabelText(/שם/i);
      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);
    });
  });
});
