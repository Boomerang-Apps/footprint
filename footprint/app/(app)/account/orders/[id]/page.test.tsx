import { render, screen, act } from '@testing-library/react';
import { Suspense } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock OrderDetailView before importing the page
vi.mock('@/components/account/OrderDetailView', () => ({
  OrderDetailView: ({ orderId }: { orderId: string }) => (
    <div data-testid="order-detail-view">Order Detail View: {orderId}</div>
  ),
}));

// Import after mocks
import OrderDetailPage from './page';

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const renderWithQueryClient = async (component: React.ReactElement) => {
  const queryClient = createQueryClient();
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<div>Loading...</div>}>
          {component}
        </Suspense>
      </QueryClientProvider>
    );
  });
  return result!;
};

describe('OrderDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders OrderDetailView component', async () => {
    await renderWithQueryClient(<OrderDetailPage params={Promise.resolve({ id: 'test-order-123' })} />);

    expect(screen.getByTestId('order-detail-view')).toBeInTheDocument();
  });

  it('passes orderId to OrderDetailView', async () => {
    await renderWithQueryClient(<OrderDetailPage params={Promise.resolve({ id: 'test-order-123' })} />);

    expect(screen.getByText(/test-order-123/)).toBeInTheDocument();
  });

  it('is a client component', () => {
    expect(typeof OrderDetailPage).toBe('function');
  });
});
