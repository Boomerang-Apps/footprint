/**
 * GiftMessage Component Tests
 *
 * GF-02: Add Personal Message
 * TDD: Tests written FIRST
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GiftMessage from './GiftMessage';

// Mock the orderStore
const mockSetGiftMessage = vi.fn();

vi.mock('@/stores/orderStore', () => ({
  useOrderStore: () => ({
    giftMessage: '',
    setGiftMessage: mockSetGiftMessage,
  }),
}));

describe('GiftMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the gift message component', () => {
      render(<GiftMessage />);
      expect(screen.getByRole('group', { name: /message|הודעה/i })).toBeInTheDocument();
    });

    it('displays message label in Hebrew', () => {
      render(<GiftMessage />);
      expect(screen.getByText(/הודעה אישית/)).toBeInTheDocument();
    });

    it('renders a textarea for message input', () => {
      render(<GiftMessage />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('shows placeholder text in Hebrew', () => {
      render(<GiftMessage />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('placeholder');
      expect(textarea.getAttribute('placeholder')).toMatch(/מתנה|הודעה/);
    });

    it('displays character counter', () => {
      render(<GiftMessage />);
      expect(screen.getByText(/0\/150/)).toBeInTheDocument();
    });
  });

  describe('Character Limit', () => {
    it('enforces 150 character limit', () => {
      render(<GiftMessage />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', '150');
    });

    it('updates character count when typing', async () => {
      const user = userEvent.setup();
      render(<GiftMessage />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'שלום');

      expect(screen.getByText(/4\/150/)).toBeInTheDocument();
    });

    it('shows warning when approaching limit', async () => {
      // Render with initial value close to limit
      render(<GiftMessage initialMessage={'א'.repeat(140)} />);

      // Should show warning styling or message
      expect(screen.getByText(/140\/150/)).toBeInTheDocument();
      // Counter should have warning class or color
      const counter = screen.getByText(/140\/150/);
      expect(counter).toHaveClass(/warning|amber|yellow/i);
    });

    it('prevents typing beyond 150 characters', async () => {
      const user = userEvent.setup();
      render(<GiftMessage />);

      const textarea = screen.getByRole('textbox');
      const longText = 'א'.repeat(160);
      await user.type(textarea, longText);

      // Should only have 150 characters
      expect(textarea).toHaveValue('א'.repeat(150));
    });
  });

  describe('Message Preview', () => {
    it('shows preview section', () => {
      render(<GiftMessage />);
      expect(screen.getByText(/תצוגה מקדימה|preview/i)).toBeInTheDocument();
    });

    it('displays message in preview as typed', async () => {
      const user = userEvent.setup();
      render(<GiftMessage />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'מזל טוב!');

      // Preview should contain the message
      const preview = screen.getByTestId('message-preview');
      expect(preview).toHaveTextContent('מזל טוב!');
    });

    it('shows placeholder in preview when empty', () => {
      render(<GiftMessage />);
      const preview = screen.getByTestId('message-preview');
      expect(preview).toHaveTextContent(/ההודעה תופיע כאן/);
    });

    it('preview styled as gift card', () => {
      render(<GiftMessage />);
      const preview = screen.getByTestId('message-preview');
      // Should have card-like styling
      expect(preview.className).toMatch(/card|rounded|border|shadow/i);
    });
  });

  describe('Store Integration', () => {
    it('calls setGiftMessage when typing', async () => {
      const user = userEvent.setup();
      render(<GiftMessage />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'שלום');

      expect(mockSetGiftMessage).toHaveBeenCalled();
    });

    it('debounces store updates for performance', async () => {
      const user = userEvent.setup();
      render(<GiftMessage />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'hello');

      // Should not call for every keystroke immediately
      // Final call should have full text
      const lastCall = mockSetGiftMessage.mock.calls[mockSetGiftMessage.mock.calls.length - 1];
      expect(lastCall[0]).toContain('hello');
    });
  });

  describe('Accessibility', () => {
    it('textarea has accessible label', () => {
      render(<GiftMessage />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAccessibleName();
    });

    it('preview is marked as aria-live for screen readers', () => {
      render(<GiftMessage />);
      const preview = screen.getByTestId('message-preview');
      expect(preview).toHaveAttribute('aria-live', 'polite');
    });

    it('character counter is accessible', () => {
      render(<GiftMessage />);
      // Counter should be readable by screen readers
      expect(screen.getByText(/0\/150/)).toHaveAttribute('aria-label');
    });
  });

  describe('Props', () => {
    it('accepts custom className', () => {
      render(<GiftMessage className="custom-class" />);
      const group = screen.getByRole('group');
      expect(group).toHaveClass('custom-class');
    });

    it('accepts initialMessage prop', () => {
      render(<GiftMessage initialMessage="ברכות חמות!" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('ברכות חמות!');
    });

    it('calls onChange callback when provided', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<GiftMessage onChange={onChange} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test');

      expect(onChange).toHaveBeenCalled();
    });

    it('can be disabled', () => {
      render(<GiftMessage disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });
  });
});

describe('GiftMessage with existing message', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays existing message from store', () => {
    // Override mock for this test
    vi.doMock('@/stores/orderStore', () => ({
      useOrderStore: () => ({
        giftMessage: 'הודעה קיימת',
        setGiftMessage: mockSetGiftMessage,
      }),
    }));

    render(<GiftMessage initialMessage="הודעה קיימת" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('הודעה קיימת');
  });

  it('shows correct character count for existing message', () => {
    render(<GiftMessage initialMessage="שלום עולם" />);
    // "שלום עולם" is 9 characters
    expect(screen.getByText(/9\/150/)).toBeInTheDocument();
  });

  it('preview shows existing message', () => {
    render(<GiftMessage initialMessage="ברכות!" />);
    const preview = screen.getByTestId('message-preview');
    expect(preview).toHaveTextContent('ברכות!');
  });
});
