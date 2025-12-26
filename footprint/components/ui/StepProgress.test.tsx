/**
 * StepProgress Component Tests
 * TDD Test Suite for UI-08: Step Progress Indicator
 */

import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { StepProgress, type StepConfig } from './StepProgress';

const defaultSteps: StepConfig[] = [
  { key: 'upload', labelEn: 'Upload', labelHe: 'העלאה' },
  { key: 'style', labelEn: 'Style', labelHe: 'סגנון' },
  { key: 'customize', labelEn: 'Customize', labelHe: 'התאמה' },
  { key: 'checkout', labelEn: 'Checkout', labelHe: 'תשלום' },
  { key: 'complete', labelEn: 'Complete', labelHe: 'סיום' },
];

describe('StepProgress', () => {
  describe('Rendering', () => {
    it('renders all 5 steps', () => {
      render(<StepProgress steps={defaultSteps} currentStep={1} />);

      expect(screen.getByText('Upload')).toBeInTheDocument();
      expect(screen.getByText('Style')).toBeInTheDocument();
      expect(screen.getByText('Customize')).toBeInTheDocument();
      expect(screen.getByText('Checkout')).toBeInTheDocument();
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    it('renders step numbers', () => {
      render(<StepProgress steps={defaultSteps} currentStep={1} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      const { container } = render(
        <StepProgress steps={defaultSteps} currentStep={1} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Current Step Highlighting', () => {
    it('highlights step 1 as current when currentStep is 1', () => {
      render(<StepProgress steps={defaultSteps} currentStep={1} />);

      const step1 = screen.getByTestId('step-1');
      expect(step1).toHaveAttribute('aria-current', 'step');
    });

    it('highlights step 3 as current when currentStep is 3', () => {
      render(<StepProgress steps={defaultSteps} currentStep={3} />);

      const step3 = screen.getByTestId('step-3');
      expect(step3).toHaveAttribute('aria-current', 'step');
    });

    it('applies active styling to current step indicator', () => {
      render(<StepProgress steps={defaultSteps} currentStep={2} />);

      const step2Indicator = screen.getByTestId('step-indicator-2');
      expect(step2Indicator).toHaveClass('bg-brand-purple');
    });
  });

  describe('Completed Steps', () => {
    it('shows checkmark for completed steps', () => {
      render(<StepProgress steps={defaultSteps} currentStep={3} />);

      // Steps 1 and 2 should be completed
      expect(screen.getByTestId('step-check-1')).toBeInTheDocument();
      expect(screen.getByTestId('step-check-2')).toBeInTheDocument();
    });

    it('does not show checkmark for current step', () => {
      render(<StepProgress steps={defaultSteps} currentStep={3} />);

      expect(screen.queryByTestId('step-check-3')).not.toBeInTheDocument();
    });

    it('does not show checkmark for future steps', () => {
      render(<StepProgress steps={defaultSteps} currentStep={2} />);

      expect(screen.queryByTestId('step-check-3')).not.toBeInTheDocument();
      expect(screen.queryByTestId('step-check-4')).not.toBeInTheDocument();
      expect(screen.queryByTestId('step-check-5')).not.toBeInTheDocument();
    });

    it('applies completed styling to completed step indicators', () => {
      render(<StepProgress steps={defaultSteps} currentStep={3} />);

      const step1Indicator = screen.getByTestId('step-indicator-1');
      expect(step1Indicator).toHaveClass('bg-brand-purple');
    });
  });

  describe('Hebrew Labels (RTL)', () => {
    it('renders Hebrew labels when locale is he', () => {
      render(<StepProgress steps={defaultSteps} currentStep={1} locale="he" />);

      expect(screen.getByText('העלאה')).toBeInTheDocument();
      expect(screen.getByText('סגנון')).toBeInTheDocument();
      expect(screen.getByText('התאמה')).toBeInTheDocument();
      expect(screen.getByText('תשלום')).toBeInTheDocument();
      expect(screen.getByText('סיום')).toBeInTheDocument();
    });

    it('applies RTL direction when locale is he', () => {
      const { container } = render(
        <StepProgress steps={defaultSteps} currentStep={1} locale="he" />
      );

      expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    });

    it('defaults to LTR for English locale', () => {
      const { container } = render(
        <StepProgress steps={defaultSteps} currentStep={1} locale="en" />
      );

      expect(container.firstChild).toHaveAttribute('dir', 'ltr');
    });

    it('defaults to English locale when not specified', () => {
      render(<StepProgress steps={defaultSteps} currentStep={1} />);

      expect(screen.getByText('Upload')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper nav role', () => {
      render(<StepProgress steps={defaultSteps} currentStep={2} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('has aria-label for navigation', () => {
      render(<StepProgress steps={defaultSteps} currentStep={1} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Order progress');
    });

    it('has Hebrew aria-label when locale is he', () => {
      render(<StepProgress steps={defaultSteps} currentStep={1} locale="he" />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'התקדמות ההזמנה');
    });

    it('uses ordered list for steps', () => {
      render(<StepProgress steps={defaultSteps} currentStep={1} />);

      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('marks completed steps with aria-label', () => {
      render(<StepProgress steps={defaultSteps} currentStep={3} />);

      const step1 = screen.getByTestId('step-1');
      expect(step1).toHaveAttribute('aria-label', expect.stringContaining('completed'));
    });

    it('marks current step with aria-current', () => {
      render(<StepProgress steps={defaultSteps} currentStep={2} />);

      const step2 = screen.getByTestId('step-2');
      expect(step2).toHaveAttribute('aria-current', 'step');
    });
  });

  describe('Future Steps', () => {
    it('shows step number for future steps', () => {
      render(<StepProgress steps={defaultSteps} currentStep={1} />);

      const step3Indicator = screen.getByTestId('step-indicator-3');
      expect(within(step3Indicator).getByText('3')).toBeInTheDocument();
    });

    it('applies muted styling to future step indicators', () => {
      render(<StepProgress steps={defaultSteps} currentStep={2} />);

      const step4Indicator = screen.getByTestId('step-indicator-4');
      expect(step4Indicator).toHaveClass('bg-zinc-700');
    });

    it('applies muted styling to future step labels', () => {
      render(<StepProgress steps={defaultSteps} currentStep={2} />);

      const step4 = screen.getByTestId('step-4');
      const label = within(step4).getByText('Checkout');
      expect(label).toHaveClass('text-zinc-500');
    });
  });

  describe('Connector Lines', () => {
    it('renders connector lines between steps', () => {
      render(<StepProgress steps={defaultSteps} currentStep={1} />);

      // 4 connectors between 5 steps
      expect(screen.getByTestId('connector-1-2')).toBeInTheDocument();
      expect(screen.getByTestId('connector-2-3')).toBeInTheDocument();
      expect(screen.getByTestId('connector-3-4')).toBeInTheDocument();
      expect(screen.getByTestId('connector-4-5')).toBeInTheDocument();
    });

    it('applies active styling to completed connectors', () => {
      render(<StepProgress steps={defaultSteps} currentStep={3} />);

      const connector12 = screen.getByTestId('connector-1-2');
      expect(connector12).toHaveClass('bg-brand-purple');
    });

    it('applies muted styling to future connectors', () => {
      render(<StepProgress steps={defaultSteps} currentStep={2} />);

      const connector34 = screen.getByTestId('connector-3-4');
      expect(connector34).toHaveClass('bg-zinc-700');
    });
  });

  describe('Edge Cases', () => {
    it('handles step 1 correctly (no previous completed steps)', () => {
      render(<StepProgress steps={defaultSteps} currentStep={1} />);

      expect(screen.queryByTestId('step-check-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('step-1')).toHaveAttribute('aria-current', 'step');
    });

    it('handles step 5 correctly (all previous steps completed)', () => {
      render(<StepProgress steps={defaultSteps} currentStep={5} />);

      expect(screen.getByTestId('step-check-1')).toBeInTheDocument();
      expect(screen.getByTestId('step-check-2')).toBeInTheDocument();
      expect(screen.getByTestId('step-check-3')).toBeInTheDocument();
      expect(screen.getByTestId('step-check-4')).toBeInTheDocument();
      expect(screen.queryByTestId('step-check-5')).not.toBeInTheDocument();
    });

    it('handles custom steps array', () => {
      const customSteps: StepConfig[] = [
        { key: 'first', labelEn: 'First', labelHe: 'ראשון' },
        { key: 'second', labelEn: 'Second', labelHe: 'שני' },
        { key: 'third', labelEn: 'Third', labelHe: 'שלישי' },
      ];

      render(<StepProgress steps={customSteps} currentStep={2} />);

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
      expect(screen.queryByText('Upload')).not.toBeInTheDocument();
    });
  });
});
