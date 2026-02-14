import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProfileHero } from './ProfileHero';

describe('ProfileHero', () => {
  const defaultProps = {
    name: 'ישראל ישראלי',
    email: 'israel@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    memberSince: '2024-03-15T00:00:00Z',
  };

  it('renders the profile name', () => {
    render(<ProfileHero {...defaultProps} />);
    expect(screen.getByTestId('profile-name')).toHaveTextContent('ישראל ישראלי');
  });

  it('renders the email', () => {
    render(<ProfileHero {...defaultProps} />);
    expect(screen.getByTestId('profile-email')).toHaveTextContent('israel@example.com');
  });

  it('renders member since date in Hebrew', () => {
    render(<ProfileHero {...defaultProps} />);
    expect(screen.getByTestId('member-since')).toHaveTextContent('חבר מאז');
  });

  it('renders avatar image when URL provided', () => {
    render(<ProfileHero {...defaultProps} />);
    const img = screen.getByAltText('תמונת הפרופיל של ישראל ישראלי');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders placeholder when no avatar URL', () => {
    render(<ProfileHero {...defaultProps} avatarUrl={null} />);
    expect(screen.getByTestId('avatar-placeholder')).toBeInTheDocument();
  });

  it('renders edit photo button', () => {
    render(<ProfileHero {...defaultProps} />);
    expect(screen.getByTestId('edit-photo-button')).toBeInTheDocument();
    expect(screen.getByText('ערוך תמונה')).toBeInTheDocument();
  });

  it('triggers file input on edit photo click', () => {
    render(<ProfileHero {...defaultProps} />);

    const fileInput = screen.getByTestId('avatar-file-input');
    const clickSpy = vi.spyOn(fileInput, 'click');

    fireEvent.click(screen.getByTestId('edit-photo-button'));
    expect(clickSpy).toHaveBeenCalled();
  });

  it('has gradient background classes', () => {
    render(<ProfileHero {...defaultProps} />);
    const hero = screen.getByTestId('profile-hero');
    expect(hero).toHaveClass('bg-gradient-to-l');
    expect(hero).toHaveClass('from-brand-purple');
    expect(hero).toHaveClass('to-brand-pink');
  });

  it('renders data-testid for the hero section', () => {
    render(<ProfileHero {...defaultProps} />);
    expect(screen.getByTestId('profile-hero')).toBeInTheDocument();
  });

  it('has accessible label on edit photo button', () => {
    render(<ProfileHero {...defaultProps} />);
    expect(screen.getByLabelText('ערוך תמונה')).toBeInTheDocument();
  });

  it('calls onAvatarChange when file is selected', () => {
    const onAvatarChange = vi.fn();
    render(<ProfileHero {...defaultProps} onAvatarChange={onAvatarChange} />);

    const fileInput = screen.getByTestId('avatar-file-input');
    const file = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(onAvatarChange).toHaveBeenCalledWith(file);
  });
});
