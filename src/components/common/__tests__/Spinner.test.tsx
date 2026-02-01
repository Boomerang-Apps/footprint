import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Spinner from '../Spinner';

describe('Spinner', () => {
  it('renders spinner with default size', () => {
    render(<Spinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-6', 'h-6');
  });

  it('renders spinner with custom size', () => {
    render(<Spinner size="lg" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('renders spinner with custom color', () => {
    render(<Spinner color="text-red-500" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('text-red-500');
  });
});
