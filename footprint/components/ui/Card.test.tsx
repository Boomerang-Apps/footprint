/**
 * Card Component Tests
 * TDD Test Suite for UI-07: Base UI Primitives
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';

describe('Card', () => {
  describe('Base Card', () => {
    it('renders card container', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('custom-class');
    });

    it('has rounded corners', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('rounded-xl');
    });

    it('has border styling', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('border');
    });

    it('has background color', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('bg-white');
    });

    it('has shadow', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('shadow-soft-sm');
    });
  });

  describe('CardHeader', () => {
    it('renders header section', () => {
      render(
        <Card>
          <CardHeader data-testid="header">Header</CardHeader>
        </Card>
      );
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('has proper padding', () => {
      render(
        <Card>
          <CardHeader data-testid="header">Header</CardHeader>
        </Card>
      );
      expect(screen.getByTestId('header')).toHaveClass('p-6');
    });

    it('accepts custom className', () => {
      render(
        <Card>
          <CardHeader className="custom-header" data-testid="header">Header</CardHeader>
        </Card>
      );
      expect(screen.getByTestId('header')).toHaveClass('custom-header');
    });
  });

  describe('CardTitle', () => {
    it('renders title text', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>My Title</CardTitle>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('My Title')).toBeInTheDocument();
    });

    it('renders as h3 by default', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>My Title</CardTitle>
          </CardHeader>
        </Card>
      );
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('has proper text styling', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle data-testid="title">My Title</CardTitle>
          </CardHeader>
        </Card>
      );
      expect(screen.getByTestId('title')).toHaveClass('text-lg', 'font-semibold');
    });
  });

  describe('CardDescription', () => {
    it('renders description text', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Description text</CardDescription>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('has muted text color', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription data-testid="desc">Description</CardDescription>
          </CardHeader>
        </Card>
      );
      expect(screen.getByTestId('desc')).toHaveClass('text-text-muted');
    });
  });

  describe('CardContent', () => {
    it('renders content section', () => {
      render(
        <Card>
          <CardContent>Main content here</CardContent>
        </Card>
      );
      expect(screen.getByText('Main content here')).toBeInTheDocument();
    });

    it('has proper padding', () => {
      render(
        <Card>
          <CardContent data-testid="content">Content</CardContent>
        </Card>
      );
      expect(screen.getByTestId('content')).toHaveClass('p-6', 'pt-0');
    });

    it('accepts custom className', () => {
      render(
        <Card>
          <CardContent className="custom-content" data-testid="content">Content</CardContent>
        </Card>
      );
      expect(screen.getByTestId('content')).toHaveClass('custom-content');
    });
  });

  describe('CardFooter', () => {
    it('renders footer section', () => {
      render(
        <Card>
          <CardFooter>Footer content</CardFooter>
        </Card>
      );
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('has flex layout', () => {
      render(
        <Card>
          <CardFooter data-testid="footer">Footer</CardFooter>
        </Card>
      );
      expect(screen.getByTestId('footer')).toHaveClass('flex');
    });

    it('has proper padding', () => {
      render(
        <Card>
          <CardFooter data-testid="footer">Footer</CardFooter>
        </Card>
      );
      expect(screen.getByTestId('footer')).toHaveClass('p-6', 'pt-0');
    });

    it('accepts custom className', () => {
      render(
        <Card>
          <CardFooter className="custom-footer" data-testid="footer">Footer</CardFooter>
        </Card>
      );
      expect(screen.getByTestId('footer')).toHaveClass('custom-footer');
    });
  });

  describe('Full Card Composition', () => {
    it('renders complete card with all subcomponents', () => {
      render(
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card description text')).toBeInTheDocument();
      expect(screen.getByText('Main content goes here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });
});
