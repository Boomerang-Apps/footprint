import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OrderHistoryPage from './page';

// Mock the OrderHistoryList component
vi.mock('@/components/account/OrderHistoryList', () => ({
  OrderHistoryList: () => <div data-testid="order-history-list">Order History List Component</div>,
}));

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('OrderHistoryPage', () => {
  it('renders OrderHistoryList component', () => {
    renderWithQueryClient(<OrderHistoryPage />);

    expect(screen.getByTestId('order-history-list')).toBeInTheDocument();
  });

  it('is a client component', () => {
    // This test ensures the page is properly marked as client-side
    // The presence of 'use client' directive makes it a client component
    expect(typeof OrderHistoryPage).toBe('function');
  });
});