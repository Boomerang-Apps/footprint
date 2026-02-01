/**
 * BulkActionToolbar Component Tests - UI-07A
 *
 * Tests for the bulk actions toolbar component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BulkActionToolbar, type BulkActionToolbarProps } from './BulkActionToolbar';

describe('BulkActionToolbar', () => {
  describe('Display', () => {
    it('should not render when no items selected', () => {
      render(
        <BulkActionToolbar
          selectedCount={0}
          onUpdateStatus={vi.fn()}
          onDownload={vi.fn()}
          onClearSelection={vi.fn()}
        />
      );

      expect(screen.queryByTestId('bulk-toolbar')).not.toBeInTheDocument();
    });

    it('should render when items are selected', () => {
      render(
        <BulkActionToolbar
          selectedCount={5}
          onUpdateStatus={vi.fn()}
          onDownload={vi.fn()}
          onClearSelection={vi.fn()}
        />
      );

      expect(screen.getByTestId('bulk-toolbar')).toBeInTheDocument();
    });

    it('should display selected count', () => {
      render(
        <BulkActionToolbar
          selectedCount={5}
          onUpdateStatus={vi.fn()}
          onDownload={vi.fn()}
          onClearSelection={vi.fn()}
        />
      );

      expect(screen.getByText(/5/)).toBeInTheDocument();
      expect(screen.getByText(/נבחרו/)).toBeInTheDocument();
    });

    it('should show singular text for single selection', () => {
      render(
        <BulkActionToolbar
          selectedCount={1}
          onUpdateStatus={vi.fn()}
          onDownload={vi.fn()}
          onClearSelection={vi.fn()}
        />
      );

      expect(screen.getByText('נבחרה הזמנה אחת')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should render status update button', () => {
      render(
        <BulkActionToolbar
          selectedCount={3}
          onUpdateStatus={vi.fn()}
          onDownload={vi.fn()}
          onClearSelection={vi.fn()}
        />
      );

      expect(screen.getByText('עדכן סטטוס')).toBeInTheDocument();
    });

    it('should call onUpdateStatus when button clicked', () => {
      const onUpdateStatus = vi.fn();
      render(
        <BulkActionToolbar
          selectedCount={3}
          onUpdateStatus={onUpdateStatus}
          onDownload={vi.fn()}
          onClearSelection={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText('עדכן סטטוס'));

      expect(onUpdateStatus).toHaveBeenCalled();
    });

    it('should render download button', () => {
      render(
        <BulkActionToolbar
          selectedCount={3}
          onUpdateStatus={vi.fn()}
          onDownload={vi.fn()}
          onClearSelection={vi.fn()}
        />
      );

      expect(screen.getByText('הורד קבצי הדפסה')).toBeInTheDocument();
    });

    it('should call onDownload when button clicked', () => {
      const onDownload = vi.fn();
      render(
        <BulkActionToolbar
          selectedCount={3}
          onUpdateStatus={vi.fn()}
          onDownload={onDownload}
          onClearSelection={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText('הורד קבצי הדפסה'));

      expect(onDownload).toHaveBeenCalled();
    });

    it('should render clear selection button', () => {
      render(
        <BulkActionToolbar
          selectedCount={3}
          onUpdateStatus={vi.fn()}
          onDownload={vi.fn()}
          onClearSelection={vi.fn()}
        />
      );

      expect(screen.getByTestId('clear-selection')).toBeInTheDocument();
    });

    it('should call onClearSelection when button clicked', () => {
      const onClearSelection = vi.fn();
      render(
        <BulkActionToolbar
          selectedCount={3}
          onUpdateStatus={vi.fn()}
          onDownload={vi.fn()}
          onClearSelection={onClearSelection}
        />
      );

      fireEvent.click(screen.getByTestId('clear-selection'));

      expect(onClearSelection).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading state during operation', () => {
      render(
        <BulkActionToolbar
          selectedCount={3}
          onUpdateStatus={vi.fn()}
          onDownload={vi.fn()}
          onClearSelection={vi.fn()}
          isLoading
        />
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should disable buttons during loading', () => {
      render(
        <BulkActionToolbar
          selectedCount={3}
          onUpdateStatus={vi.fn()}
          onDownload={vi.fn()}
          onClearSelection={vi.fn()}
          isLoading
        />
      );

      // Get buttons by their text content's parent button element
      expect(screen.getByText('עדכן סטטוס').closest('button')).toBeDisabled();
      expect(screen.getByText('הורד קבצי הדפסה').closest('button')).toBeDisabled();
    });
  });

  describe('Styling', () => {
    it('should have RTL direction', () => {
      render(
        <BulkActionToolbar
          selectedCount={3}
          onUpdateStatus={vi.fn()}
          onDownload={vi.fn()}
          onClearSelection={vi.fn()}
        />
      );

      const toolbar = screen.getByTestId('bulk-toolbar');
      expect(toolbar).toHaveAttribute('dir', 'rtl');
    });

    it('should be fixed at bottom of screen', () => {
      render(
        <BulkActionToolbar
          selectedCount={3}
          onUpdateStatus={vi.fn()}
          onDownload={vi.fn()}
          onClearSelection={vi.fn()}
        />
      );

      const toolbar = screen.getByTestId('bulk-toolbar');
      expect(toolbar.className).toContain('fixed');
      expect(toolbar.className).toContain('bottom');
    });
  });
});
