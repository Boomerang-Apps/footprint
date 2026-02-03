/**
 * Guest Checkout Analytics
 *
 * Analytics tracking for guest checkout flow.
 * Tracks conversion events and user behavior.
 *
 * @story AUTH-02
 * @acceptance-criteria AC-011
 */

export interface GuestCheckoutEventData {
  email?: string;
  orderId?: string;
  orderTotal?: number;
  source?: string;
}

export interface ConversionEventData extends GuestCheckoutEventData {
  userId?: string;
  conversionType: 'guest_to_account' | 'guest_to_purchase';
}

/**
 * Track guest checkout started event
 */
export function trackGuestCheckoutStarted(data: GuestCheckoutEventData = {}): void {
  if (typeof window === 'undefined') return;

  const event = {
    event: 'guest_checkout_started',
    timestamp: new Date().toISOString(),
    ...data,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Guest checkout started:', event);
  }

  // Send to analytics (Google Analytics, Mixpanel, etc.)
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'guest_checkout_started', {
      event_category: 'checkout',
      event_label: 'guest',
      ...data,
    });
  }

  // Custom event for internal tracking
  window.dispatchEvent(new CustomEvent('analytics:guest_checkout', { detail: event }));
}

/**
 * Track guest email submitted event
 */
export function trackGuestEmailSubmitted(data: GuestCheckoutEventData): void {
  if (typeof window === 'undefined') return;

  const event = {
    event: 'guest_email_submitted',
    timestamp: new Date().toISOString(),
    ...data,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Guest email submitted:', event);
  }

  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'guest_email_submitted', {
      event_category: 'checkout',
      event_label: 'guest',
      ...data,
    });
  }

  window.dispatchEvent(new CustomEvent('analytics:guest_email', { detail: event }));
}

/**
 * Track guest checkout completed event
 */
export function trackGuestCheckoutCompleted(data: GuestCheckoutEventData): void {
  if (typeof window === 'undefined') return;

  const event = {
    event: 'guest_checkout_completed',
    timestamp: new Date().toISOString(),
    ...data,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Guest checkout completed:', event);
  }

  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'purchase', {
      event_category: 'checkout',
      event_label: 'guest',
      value: data.orderTotal,
      transaction_id: data.orderId,
      ...data,
    });
  }

  window.dispatchEvent(new CustomEvent('analytics:guest_purchase', { detail: event }));
}

/**
 * Track guest to account conversion event
 */
export function trackGuestConversion(data: ConversionEventData): void {
  if (typeof window === 'undefined') return;

  const event = {
    event: 'guest_conversion',
    timestamp: new Date().toISOString(),
    ...data,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Guest conversion:', event);
  }

  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'sign_up', {
      event_category: 'conversion',
      event_label: data.conversionType,
      ...data,
    });
  }

  window.dispatchEvent(new CustomEvent('analytics:guest_conversion', { detail: event }));
}

/**
 * Track post-purchase signup prompt shown
 */
export function trackSignupPromptShown(data: GuestCheckoutEventData = {}): void {
  if (typeof window === 'undefined') return;

  const event = {
    event: 'signup_prompt_shown',
    timestamp: new Date().toISOString(),
    ...data,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Signup prompt shown:', event);
  }

  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'signup_prompt_shown', {
      event_category: 'engagement',
      event_label: 'post_purchase',
      ...data,
    });
  }

  window.dispatchEvent(new CustomEvent('analytics:signup_prompt', { detail: event }));
}

/**
 * Track post-purchase signup prompt dismissed
 */
export function trackSignupPromptDismissed(data: GuestCheckoutEventData = {}): void {
  if (typeof window === 'undefined') return;

  const event = {
    event: 'signup_prompt_dismissed',
    timestamp: new Date().toISOString(),
    ...data,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Signup prompt dismissed:', event);
  }

  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'signup_prompt_dismissed', {
      event_category: 'engagement',
      event_label: 'post_purchase',
      ...data,
    });
  }

  window.dispatchEvent(new CustomEvent('analytics:signup_dismissed', { detail: event }));
}
