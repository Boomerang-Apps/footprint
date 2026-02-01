'use client';

/**
 * BulkActionToolbar Component - UI-07A
 *
 * Fixed toolbar for bulk actions when orders are selected.
 * Supports status updates and batch file downloads.
 */

import { RefreshCw, Download, X, Layers } from 'lucide-react';

export interface BulkActionToolbarProps {
  selectedCount: number;
  onUpdateStatus: () => void;
  onDownload: () => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export function BulkActionToolbar({
  selectedCount,
  onUpdateStatus,
  onDownload,
  onClearSelection,
  isLoading = false,
}: BulkActionToolbarProps) {
  if (selectedCount === 0) {
    return null;
  }

  const selectionText =
    selectedCount === 1 ? 'נבחרה הזמנה אחת' : `נבחרו ${selectedCount} הזמנות`;

  return (
    <div
      data-testid="bulk-toolbar"
      dir="rtl"
      className="fixed bottom-4 left-4 right-4 mx-auto max-w-3xl bg-zinc-900 text-white rounded-xl shadow-2xl p-3 sm:p-4 flex items-center justify-between gap-3 z-50"
    >
      {/* Selection info */}
      <div className="flex items-center gap-3">
        <button
          data-testid="clear-selection"
          onClick={onClearSelection}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="נקה בחירה"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium">{selectionText}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isLoading && (
          <div data-testid="loading-spinner" className="animate-spin">
            <RefreshCw className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={onDownload}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">הורד קבצי הדפסה</span>
        </button>

        <button
          onClick={onUpdateStatus}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-4 h-4" />
          <span>עדכן סטטוס</span>
        </button>
      </div>
    </div>
  );
}
