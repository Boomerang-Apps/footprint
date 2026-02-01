import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StyleList from '../StyleList';
import * as styleService from '../../services/styleService';

// Mock the style service
vi.mock('../../services/styleService');

const mockStyleService = vi.mocked(styleService);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('StyleList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Load Styles button (AC-001)', () => {
    render(<StyleList />, { wrapper: createWrapper() });
    
    expect(screen.getByRole('button', { name: /load styles/i })).toBeInTheDocument();
  });

  it('shows loading spinner when button is clicked (AC-002)', async () => {
    mockStyleService.fetchStyles.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<StyleList />, { wrapper: createWrapper() });
    
    const loadButton = screen.getByRole('button', { name: /load styles/i });
    fireEvent.click(loadButton);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading styles...')).toBeInTheDocument();
  });

  it('calls fetchStyles service when button is clicked (AC-003)', async () => {
    mockStyleService.fetchStyles.mockResolvedValue([]);

    render(<StyleList />, { wrapper: createWrapper() });
    
    const loadButton = screen.getByRole('button', { name: /load styles/i });
    fireEvent.click(loadButton);

    expect(mockStyleService.fetchStyles).toHaveBeenCalledTimes(1);
  });

  it('displays styles as list with names (AC-005)', async () => {
    const mockStyles = [
      { id: '1', name: 'Modern Style', description: 'A modern design' },
      { id: '2', name: 'Classic Style', description: 'A classic design' },
    ];

    mockStyleService.fetchStyles.mockResolvedValue(mockStyles);

    render(<StyleList />, { wrapper: createWrapper() });
    
    const loadButton = screen.getByRole('button', { name: /load styles/i });
    fireEvent.click(loadButton);

    await waitFor(() => {
      expect(screen.getByText('Modern Style')).toBeInTheDocument();
      expect(screen.getByText('Classic Style')).toBeInTheDocument();
    });

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('displays error message when fetch fails', async () => {
    mockStyleService.fetchStyles.mockRejectedValue(new Error('Failed to fetch'));

    render(<StyleList />, { wrapper: createWrapper() });
    
    const loadButton = screen.getByRole('button', { name: /load styles/i });
    fireEvent.click(loadButton);

    await waitFor(() => {
      expect(screen.getByText(/error loading styles/i)).toBeInTheDocument();
    });
  });

  it('disables button while loading', async () => {
    mockStyleService.fetchStyles.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<StyleList />, { wrapper: createWrapper() });
    
    const loadButton = screen.getByRole('button', { name: /load styles/i });
    fireEvent.click(loadButton);

    expect(loadButton).toBeDisabled();
  });
});
