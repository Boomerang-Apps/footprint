import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SettingsSection } from './SettingsSection';

describe('SettingsSection', () => {
  it('renders section label', () => {
    render(
      <SettingsSection label="כללי">
        <div>content</div>
      </SettingsSection>
    );
    expect(screen.getByText('כללי')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <SettingsSection label="כללי">
        <div data-testid="child">Child content</div>
      </SettingsSection>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('has data-testid with label', () => {
    render(
      <SettingsSection label="כללי">
        <div>content</div>
      </SettingsSection>
    );
    expect(screen.getByTestId('settings-section-כללי')).toBeInTheDocument();
  });

  it('renders label as heading', () => {
    render(
      <SettingsSection label="כללי">
        <div>content</div>
      </SettingsSection>
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('כללי');
  });

  it('has purple text styling on label', () => {
    render(
      <SettingsSection label="כללי">
        <div>content</div>
      </SettingsSection>
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('text-brand-purple');
    expect(heading).toHaveClass('uppercase');
  });
});
