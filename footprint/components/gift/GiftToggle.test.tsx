/**
 * GiftToggle Component Tests
 *
 * GF-01: Mark Order as Gift
 * TDD: Tests written FIRST
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GiftToggle from './GiftToggle';

// Mock the orderStore
const mockSetIsGift = vi.fn();
const mockSetGiftWrap = vi.fn();

vi.mock('@/stores/orderStore', () => ({
  useOrderStore: () => ({
    isGift: false,
    giftWrap: false,
    setIsGift: mockSetIsGift,
    setGiftWrap: mockSetGiftWrap,
  }),
}));

describe('GiftToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the gift toggle component', () => {
      render(<GiftToggle />);
      expect(screen.getByRole('group', { name: /gift/i })).toBeInTheDocument();
    });

    it('displays gift toggle label in Hebrew', () => {
      render(<GiftToggle />);
      expect(screen.getByText('שליחה כמתנה')).toBeInTheDocument();
    });

    it('renders a toggle switch', () => {
      render(<GiftToggle />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('toggle is OFF by default', () => {
      render(<GiftToggle />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('Gift Toggle Interaction', () => {
    it('calls setIsGift when toggle is clicked', async () => {
      const user = userEvent.setup();
      render(<GiftToggle />);

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      expect(mockSetIsGift).toHaveBeenCalledWith(true);
    });

    it('toggle is keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<GiftToggle />);

      const toggle = screen.getByRole('switch');
      toggle.focus();
      await user.keyboard('{Enter}');

      expect(mockSetIsGift).toHaveBeenCalledWith(true);
    });

    it('toggle responds to Space key', async () => {
      const user = userEvent.setup();
      render(<GiftToggle />);

      const toggle = screen.getByRole('switch');
      toggle.focus();
      await user.keyboard(' ');

      expect(mockSetIsGift).toHaveBeenCalledWith(true);
    });

    it('resets gift wrap when turning off gift', async () => {
      const onGiftWrapChange = vi.fn();
      const user = userEvent.setup();

      render(<GiftToggle isGiftEnabled={true} onGiftWrapChange={onGiftWrapChange} />);

      // Click toggle to turn gift OFF
      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      // Should reset gift wrap to false
      expect(mockSetGiftWrap).toHaveBeenCalledWith(false);
      expect(onGiftWrapChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Gift Wrap Option', () => {
    it('gift wrap option is hidden when gift toggle is OFF', () => {
      render(<GiftToggle />);
      expect(screen.queryByText('אריזת מתנה')).not.toBeInTheDocument();
    });
  });

  describe('Price Notice', () => {
    it('does not show price notice box when gift is OFF', () => {
      render(<GiftToggle />);
      // The notice box contains "על האריזה" which only appears in the green notice, not the description
      expect(screen.queryByText(/על האריזה/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label on toggle', () => {
      render(<GiftToggle />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-label');
    });

    it('group has accessible name', () => {
      render(<GiftToggle />);
      expect(screen.getByRole('group')).toHaveAttribute('aria-label');
    });
  });

  describe('Props', () => {
    it('accepts custom className', () => {
      render(<GiftToggle className="custom-class" />);
      const group = screen.getByRole('group');
      expect(group).toHaveClass('custom-class');
    });

    it('calls onGiftChange callback when provided', async () => {
      const onGiftChange = vi.fn();
      const user = userEvent.setup();

      render(<GiftToggle onGiftChange={onGiftChange} />);

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      expect(onGiftChange).toHaveBeenCalledWith(true);
    });
  });
});

describe('GiftToggle with isGift=true', () => {
  const mockSetIsGiftActive = vi.fn();
  const mockSetGiftWrapActive = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.doMock('@/stores/orderStore', () => ({
      useOrderStore: () => ({
        isGift: true,
        giftWrap: false,
        setIsGift: mockSetIsGiftActive,
        setGiftWrap: mockSetGiftWrapActive,
      }),
    }));
  });

  it('shows gift wrap option when gift is enabled via prop', () => {
    // Test with controlled props
    render(<GiftToggle isGiftEnabled={true} />);
    expect(screen.getByText('אריזת מתנה')).toBeInTheDocument();
  });

  it('shows price notice when gift is enabled via prop', () => {
    render(<GiftToggle isGiftEnabled={true} />);
    // Look for the strong text in the notice
    expect(screen.getByText('מחיר לא יופיע')).toBeInTheDocument();
    // And the full message
    expect(screen.getByText(/על תעודת המשלוח או על האריזה/)).toBeInTheDocument();
  });

  it('gift wrap checkbox is visible when gift enabled', () => {
    render(<GiftToggle isGiftEnabled={true} />);
    expect(screen.getByRole('checkbox', { name: /אריזת מתנה/i })).toBeInTheDocument();
  });

  it('clicking gift wrap calls setGiftWrap', async () => {
    const onGiftWrapChange = vi.fn();
    const user = userEvent.setup();

    render(<GiftToggle isGiftEnabled={true} onGiftWrapChange={onGiftWrapChange} />);

    const checkbox = screen.getByRole('checkbox', { name: /אריזת מתנה/i });
    await user.click(checkbox);

    expect(onGiftWrapChange).toHaveBeenCalledWith(true);
  });

  it('gift wrap checkbox responds to keyboard', async () => {
    const onGiftWrapChange = vi.fn();
    const user = userEvent.setup();

    render(<GiftToggle isGiftEnabled={true} onGiftWrapChange={onGiftWrapChange} />);

    const checkbox = screen.getByRole('checkbox', { name: /אריזת מתנה/i });
    checkbox.focus();
    await user.keyboard('{Enter}');

    expect(onGiftWrapChange).toHaveBeenCalledWith(true);
  });

  it('shows gift wrap price', () => {
    render(<GiftToggle isGiftEnabled={true} />);
    expect(screen.getByText(/\+₪15/)).toBeInTheDocument();
  });
});
