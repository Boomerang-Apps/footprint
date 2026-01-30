/**
 * Order Tracking Layout Tests
 *
 * Tests the layout component for order tracking pages
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TrackLayout from './layout';

describe('TrackLayout', () => {
  it('should render children within the layout', () => {
    const testContent = 'Test tracking content';

    render(
      <TrackLayout>
        <div>{testContent}</div>
      </TrackLayout>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('should have minimum height and background styling', () => {
    const testContent = 'Test content';

    render(
      <TrackLayout>
        <div>{testContent}</div>
      </TrackLayout>
    );

    const layoutContainer = screen.getByText(testContent).parentElement;
    expect(layoutContainer).toHaveClass('min-h-screen', 'bg-background');
  });

  it('should have automatic text direction for RTL support', () => {
    const testContent = 'Test content';

    render(
      <TrackLayout>
        <div>{testContent}</div>
      </TrackLayout>
    );

    const layoutContainer = screen.getByText(testContent).parentElement;
    expect(layoutContainer).toHaveAttribute('dir', 'auto');
  });

  it('should render with proper HTML structure', () => {
    render(
      <TrackLayout>
        <main>Main content</main>
      </TrackLayout>
    );

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveTextContent('Main content');
  });
});