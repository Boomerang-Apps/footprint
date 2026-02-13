import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProfileMenu } from './ProfileMenu';

describe('ProfileMenu', () => {
  it('renders all menu items', () => {
    render(<ProfileMenu />);

    expect(screen.getByText('ההזמנות שלי')).toBeInTheDocument();
    expect(screen.getByText('המועדפים שלי')).toBeInTheDocument();
    expect(screen.getByText('כתובות שמורות')).toBeInTheDocument();
    expect(screen.getByText('הגדרות')).toBeInTheDocument();
    expect(screen.getByText('פרטיות ואבטחה')).toBeInTheDocument();
    expect(screen.getByText('יצירת קשר')).toBeInTheDocument();
  });

  it('links to correct pages', () => {
    render(<ProfileMenu />);

    const ordersLink = screen.getByText('ההזמנות שלי').closest('a');
    expect(ordersLink).toHaveAttribute('href', '/account/orders');

    const favoritesLink = screen.getByText('המועדפים שלי').closest('a');
    expect(favoritesLink).toHaveAttribute('href', '/favorites');

    const addressesLink = screen.getByText('כתובות שמורות').closest('a');
    expect(addressesLink).toHaveAttribute('href', '/account/addresses');

    const settingsLink = screen.getByText('הגדרות').closest('a');
    expect(settingsLink).toHaveAttribute('href', '/account/settings');
  });

  it('renders with data-testid', () => {
    render(<ProfileMenu />);
    expect(screen.getByTestId('profile-menu')).toBeInTheDocument();
  });

  it('has navigation landmark with Hebrew label', () => {
    render(<ProfileMenu />);
    expect(screen.getByRole('navigation', { name: 'תפריט חשבון' })).toBeInTheDocument();
  });

  it('renders as a list', () => {
    render(<ProfileMenu />);
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(6);
  });
});
