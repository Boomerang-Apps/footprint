/**
 * Guest Checkout Analytics Tests
 *
 * Tests for guest checkout analytics tracking.
 *
 * @story AUTH-02
 * @acceptance-criteria AC-011
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  trackGuestCheckoutStarted,
  trackGuestEmailSubmitted,
  trackGuestCheckoutCompleted,
  trackGuestConversion,
  trackSignupPromptShown,
  trackSignupPromptDismissed,
} from './guest-checkout';

describe('Guest Checkout Analytics', () => {
  const mockGtag = vi.fn();
  let dispatchEventSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock gtag
    (window as unknown as { gtag: typeof mockGtag }).gtag = mockGtag;

    // Spy on window.dispatchEvent
    dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    dispatchEventSpy.mockRestore();
    delete (window as unknown as { gtag?: typeof mockGtag }).gtag;
  });

  describe('trackGuestCheckoutStarted', () => {
    it('should dispatch custom event with correct data', () => {
      trackGuestCheckoutStarted({ source: 'checkout_page' });

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'analytics:guest_checkout',
        })
      );

      const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.detail.event).toBe('guest_checkout_started');
      expect(event.detail.source).toBe('checkout_page');
      expect(event.detail.timestamp).toBeDefined();
    });

    it('should call gtag when available', () => {
      trackGuestCheckoutStarted({ source: 'checkout_page' });

      expect(mockGtag).toHaveBeenCalledWith('event', 'guest_checkout_started', {
        event_category: 'checkout',
        event_label: 'guest',
        source: 'checkout_page',
      });
    });

    it('should work without gtag', () => {
      delete (window as unknown as { gtag?: typeof mockGtag }).gtag;

      expect(() => {
        trackGuestCheckoutStarted();
      }).not.toThrow();

      expect(dispatchEventSpy).toHaveBeenCalled();
    });
  });

  describe('trackGuestEmailSubmitted', () => {
    it('should track email submission with data', () => {
      trackGuestEmailSubmitted({ email: 'test@example.com' });

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'analytics:guest_email',
        })
      );

      const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.detail.event).toBe('guest_email_submitted');
      expect(event.detail.email).toBe('test@example.com');
    });

    it('should call gtag with email submitted event', () => {
      trackGuestEmailSubmitted({ email: 'test@example.com' });

      expect(mockGtag).toHaveBeenCalledWith('event', 'guest_email_submitted', {
        event_category: 'checkout',
        event_label: 'guest',
        email: 'test@example.com',
      });
    });
  });

  describe('trackGuestCheckoutCompleted', () => {
    it('should track checkout completion with order data', () => {
      trackGuestCheckoutCompleted({
        orderId: 'FP-2026-1234',
        orderTotal: 299,
        email: 'buyer@example.com',
      });

      const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.detail.event).toBe('guest_checkout_completed');
      expect(event.detail.orderId).toBe('FP-2026-1234');
      expect(event.detail.orderTotal).toBe(299);
    });

    it('should call gtag with purchase event', () => {
      trackGuestCheckoutCompleted({
        orderId: 'FP-2026-1234',
        orderTotal: 299,
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'purchase', {
        event_category: 'checkout',
        event_label: 'guest',
        value: 299,
        transaction_id: 'FP-2026-1234',
        orderId: 'FP-2026-1234',
        orderTotal: 299,
      });
    });
  });

  describe('trackGuestConversion', () => {
    it('should track conversion to account', () => {
      trackGuestConversion({
        conversionType: 'guest_to_account',
        email: 'convert@example.com',
        userId: 'user-123',
      });

      const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.detail.event).toBe('guest_conversion');
      expect(event.detail.conversionType).toBe('guest_to_account');
      expect(event.detail.userId).toBe('user-123');
    });

    it('should call gtag with sign_up event', () => {
      trackGuestConversion({
        conversionType: 'guest_to_account',
        email: 'convert@example.com',
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'sign_up', {
        event_category: 'conversion',
        event_label: 'guest_to_account',
        conversionType: 'guest_to_account',
        email: 'convert@example.com',
      });
    });
  });

  describe('trackSignupPromptShown', () => {
    it('should track signup prompt display', () => {
      trackSignupPromptShown({ orderId: 'FP-2026-5678' });

      const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.detail.event).toBe('signup_prompt_shown');
      expect(event.detail.orderId).toBe('FP-2026-5678');
    });

    it('should call gtag with prompt event', () => {
      trackSignupPromptShown();

      expect(mockGtag).toHaveBeenCalledWith('event', 'signup_prompt_shown', {
        event_category: 'engagement',
        event_label: 'post_purchase',
      });
    });
  });

  describe('trackSignupPromptDismissed', () => {
    it('should track signup prompt dismissal', () => {
      trackSignupPromptDismissed({ orderId: 'FP-2026-5678' });

      const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.detail.event).toBe('signup_prompt_dismissed');
      expect(event.detail.orderId).toBe('FP-2026-5678');
    });

    it('should call gtag with dismissed event', () => {
      trackSignupPromptDismissed();

      expect(mockGtag).toHaveBeenCalledWith('event', 'signup_prompt_dismissed', {
        event_category: 'engagement',
        event_label: 'post_purchase',
      });
    });
  });
});
