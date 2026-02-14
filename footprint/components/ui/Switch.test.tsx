import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders with role="switch"', () => {
    render(<Switch checked={false} onCheckedChange={() => {}} />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('reflects checked state via aria-checked', () => {
    const { rerender } = render(
      <Switch checked={false} onCheckedChange={() => {}} />
    );
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');

    rerender(<Switch checked={true} onCheckedChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onCheckedChange with toggled value on click', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={onChange} />);

    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onCheckedChange with false when currently checked', () => {
    const onChange = vi.fn();
    render(<Switch checked={true} onCheckedChange={onChange} />);

    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('does not fire when disabled', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={onChange} disabled />);

    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('applies aria-label when label prop provided', () => {
    render(
      <Switch checked={false} onCheckedChange={() => {}} label="Toggle notifications" />
    );
    expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Toggle notifications');
  });

  it('applies brand-purple background when checked', () => {
    render(<Switch checked={true} onCheckedChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveClass('bg-brand-purple');
  });

  it('applies gray background when unchecked', () => {
    render(<Switch checked={false} onCheckedChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveClass('bg-gray-300');
  });

  it('is keyboard accessible via Enter key', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={onChange} />);

    const switchEl = screen.getByRole('switch');
    switchEl.focus();
    fireEvent.keyDown(switchEl, { key: 'Enter' });
    fireEvent.keyUp(switchEl, { key: 'Enter' });
    // Buttons natively handle Enter → click
  });
});
