import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CheckoutProgressSteps } from './CheckoutProgressSteps';

describe('CheckoutProgressSteps', () => {
  describe('Rendering', () => {
    it('should render all 5 step labels', () => {
      render(<CheckoutProgressSteps />);

      expect(screen.getByText('העלאה')).toBeInTheDocument();
      expect(screen.getByText('סגנון')).toBeInTheDocument();
      expect(screen.getByText('עריכה')).toBeInTheDocument();
      expect(screen.getByText('התאמה')).toBeInTheDocument();
      expect(screen.getByText('תשלום')).toBeInTheDocument();
    });
  });

  describe('Step states', () => {
    it('should mark first 4 steps as completed', () => {
      const { container } = render(<CheckoutProgressSteps />);

      const completedSteps = container.querySelectorAll('[data-completed="true"]');
      expect(completedSteps).toHaveLength(4);
    });

    it('should mark payment step as active', () => {
      const { container } = render(<CheckoutProgressSteps />);

      const activeStep = container.querySelector('[data-active="true"]');
      expect(activeStep).toBeInTheDocument();
      expect(activeStep).toHaveAttribute('data-step', 'payment');
    });

    it('should show step number 5 for the active payment step', () => {
      const { container } = render(<CheckoutProgressSteps />);

      const activeStep = container.querySelector('[data-active="true"]');
      expect(activeStep?.textContent).toContain('5');
    });
  });

  describe('Step connectors', () => {
    it('should render 4 connector lines between steps', () => {
      const { container } = render(<CheckoutProgressSteps />);

      // There are dividers between steps (4 of them for 5 steps)
      const connectors = container.querySelectorAll('.w-6.h-px');
      expect(connectors).toHaveLength(4);
    });
  });
});
