import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProfileStats } from './ProfileStats';

describe('ProfileStats', () => {
  const defaultProps = {
    creationsCount: 12,
    ordersCount: 5,
    favoritesCount: 8,
  };

  it('renders all three stat values', () => {
    render(<ProfileStats {...defaultProps} />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('renders Hebrew stat labels', () => {
    render(<ProfileStats {...defaultProps} />);

    expect(screen.getByText('יצירות')).toBeInTheDocument();
    expect(screen.getByText('הזמנות')).toBeInTheDocument();
    expect(screen.getByText('מועדפים')).toBeInTheDocument();
  });

  it('renders with data-testid', () => {
    render(<ProfileStats {...defaultProps} />);

    expect(screen.getByTestId('profile-stats')).toBeInTheDocument();
  });

  it('handles zero counts', () => {
    render(
      <ProfileStats creationsCount={0} ordersCount={0} favoritesCount={0} />
    );

    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(3);
  });

  it('displays in a 3-column grid', () => {
    render(<ProfileStats {...defaultProps} />);

    const grid = screen.getByTestId('profile-stats').querySelector('.grid-cols-3');
    expect(grid).toBeInTheDocument();
  });

  it('has negative top margin for hero overlap', () => {
    render(<ProfileStats {...defaultProps} />);

    expect(screen.getByTestId('profile-stats')).toHaveClass('-mt-6');
  });
});
