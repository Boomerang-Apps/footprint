/**
 * Fulfillment Status Transitions
 *
 * Defines valid status transitions for order fulfillment workflow.
 * Used by bulk operations and single order status updates.
 */

export type FulfillmentStatus =
  | 'pending'
  | 'printing'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

/**
 * Valid status transitions map.
 * Key is current status, value is array of valid next statuses.
 */
export const VALID_TRANSITIONS: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  pending: ['printing', 'cancelled'],
  printing: ['ready_to_ship', 'pending'],
  ready_to_ship: ['shipped', 'printing'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

/**
 * All valid fulfillment statuses
 */
export const FULFILLMENT_STATUSES: FulfillmentStatus[] = [
  'pending',
  'printing',
  'ready_to_ship',
  'shipped',
  'delivered',
  'cancelled',
];

/**
 * Check if a status transition is valid
 */
export function isValidFulfillmentTransition(
  from: FulfillmentStatus,
  to: FulfillmentStatus
): boolean {
  const validNextStatuses = VALID_TRANSITIONS[from];
  return validNextStatuses?.includes(to) ?? false;
}

/**
 * Get valid next statuses for a given status
 */
export function getValidNextStatuses(status: FulfillmentStatus): FulfillmentStatus[] {
  return VALID_TRANSITIONS[status] || [];
}

/**
 * Check if a string is a valid fulfillment status
 */
export function isValidFulfillmentStatus(status: string): status is FulfillmentStatus {
  return FULFILLMENT_STATUSES.includes(status as FulfillmentStatus);
}

/**
 * Get human-readable Hebrew label for status
 */
export function getStatusLabel(status: FulfillmentStatus): string {
  const labels: Record<FulfillmentStatus, string> = {
    pending: 'ממתין',
    printing: 'בהדפסה',
    ready_to_ship: 'מוכן למשלוח',
    shipped: 'נשלח',
    delivered: 'נמסר',
    cancelled: 'בוטל',
  };
  return labels[status] || status;
}

/**
 * Validate a batch of status transitions
 * Returns arrays of valid and invalid transitions
 */
export function validateBatchTransitions(
  orders: Array<{ id: string; currentStatus: FulfillmentStatus }>,
  newStatus: FulfillmentStatus
): {
  valid: string[];
  invalid: Array<{ orderId: string; reason: string }>;
} {
  const valid: string[] = [];
  const invalid: Array<{ orderId: string; reason: string }> = [];

  for (const order of orders) {
    if (isValidFulfillmentTransition(order.currentStatus, newStatus)) {
      valid.push(order.id);
    } else {
      invalid.push({
        orderId: order.id,
        reason: `לא ניתן לשנות מ-'${getStatusLabel(order.currentStatus)}' ל-'${getStatusLabel(newStatus)}'`,
      });
    }
  }

  return { valid, invalid };
}
