/**
 * Order Status Management
 *
 * Handles order status transitions, validation, labels, and history tracking.
 */

/**
 * Valid order statuses in the system
 */
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'printing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

/**
 * Status history entry for tracking status changes
 */
export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: Date;
  changedBy: string;
  note?: string;
}

/**
 * Valid status transitions map
 *
 * Flow: pending -> paid -> processing -> printing -> shipped -> delivered
 * Cancellation allowed from: pending, paid, processing (not after printing starts)
 * Terminal states: delivered, cancelled (no transitions allowed)
 */
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled'],
  processing: ['printing', 'cancelled'],
  printing: ['shipped'], // No cancellation once printing starts
  shipped: ['delivered'],
  delivered: [], // Terminal state
  cancelled: [], // Terminal state
};

/**
 * Status labels in Hebrew (default) and English
 */
const STATUS_LABELS: Record<OrderStatus, { he: string; en: string }> = {
  pending: { he: 'ממתין לתשלום', en: 'Pending Payment' },
  paid: { he: 'שולם', en: 'Paid' },
  processing: { he: 'בטיפול', en: 'Processing' },
  printing: { he: 'בהדפסה', en: 'Printing' },
  shipped: { he: 'נשלח', en: 'Shipped' },
  delivered: { he: 'נמסר', en: 'Delivered' },
  cancelled: { he: 'בוטל', en: 'Cancelled' },
};

/**
 * Check if a status transition is valid
 *
 * @param from - Current status
 * @param to - Target status
 * @returns true if transition is allowed
 */
export function isValidStatusTransition(
  from: OrderStatus,
  to: OrderStatus
): boolean {
  // Cannot transition to same status
  if (from === to) {
    return false;
  }

  const allowedTransitions = VALID_TRANSITIONS[from];
  return allowedTransitions.includes(to);
}

/**
 * Get the display label for a status
 *
 * @param status - The order status
 * @param locale - 'he' (default) or 'en'
 * @returns Localized status label
 */
export function getStatusLabel(
  status: OrderStatus,
  locale: 'he' | 'en' = 'he'
): string {
  return STATUS_LABELS[status][locale];
}

/**
 * Get valid next statuses from current status
 *
 * @param status - Current order status
 * @returns Array of valid next statuses
 */
export function getValidNextStatuses(status: OrderStatus): OrderStatus[] {
  return VALID_TRANSITIONS[status];
}

/**
 * Create a status history entry
 *
 * @param status - The new status
 * @param changedBy - User ID who made the change
 * @param note - Optional note about the change
 * @returns StatusHistoryEntry with current timestamp
 */
export function createStatusHistoryEntry(
  status: OrderStatus,
  changedBy: string,
  note?: string
): StatusHistoryEntry {
  return {
    status,
    timestamp: new Date(),
    changedBy,
    ...(note !== undefined && { note }),
  };
}
