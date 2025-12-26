/**
 * Tracking Number Management Tests
 *
 * TDD: Tests written FIRST before implementation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Import after implementation
import {
  CarrierCode,
  CARRIERS,
  isValidCarrier,
  validateTrackingNumber,
  generateTrackingUrl,
  TrackingInfo,
  createTrackingInfo,
} from './tracking';

describe('Tracking Number Management', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-26T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ============================================================================
  // Carrier Validation Tests
  // ============================================================================

  describe('isValidCarrier', () => {
    it('should accept israel_post as valid carrier', () => {
      expect(isValidCarrier('israel_post')).toBe(true);
    });

    it('should accept dhl as valid carrier', () => {
      expect(isValidCarrier('dhl')).toBe(true);
    });

    it('should accept fedex as valid carrier', () => {
      expect(isValidCarrier('fedex')).toBe(true);
    });

    it('should accept ups as valid carrier', () => {
      expect(isValidCarrier('ups')).toBe(true);
    });

    it('should accept other as valid carrier', () => {
      expect(isValidCarrier('other')).toBe(true);
    });

    it('should reject invalid carrier codes', () => {
      expect(isValidCarrier('invalid')).toBe(false);
      expect(isValidCarrier('')).toBe(false);
      expect(isValidCarrier('ISRAEL_POST')).toBe(false);
    });
  });

  // ============================================================================
  // Tracking Number Validation Tests
  // ============================================================================

  describe('validateTrackingNumber', () => {
    describe('Israel Post', () => {
      it('should accept valid RR tracking numbers', () => {
        const result = validateTrackingNumber('RR123456789IL', 'israel_post');
        expect(result.valid).toBe(true);
      });

      it('should accept valid RL tracking numbers', () => {
        const result = validateTrackingNumber('RL987654321IL', 'israel_post');
        expect(result.valid).toBe(true);
      });

      it('should accept valid EA tracking numbers', () => {
        const result = validateTrackingNumber('EA111222333IL', 'israel_post');
        expect(result.valid).toBe(true);
      });

      it('should reject invalid Israel Post format', () => {
        const result = validateTrackingNumber('XX123456789IL', 'israel_post');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('format');
      });

      it('should reject wrong length for Israel Post', () => {
        const result = validateTrackingNumber('RR12345IL', 'israel_post');
        expect(result.valid).toBe(false);
      });
    });

    describe('DHL', () => {
      it('should accept valid 10-digit DHL numbers', () => {
        const result = validateTrackingNumber('1234567890', 'dhl');
        expect(result.valid).toBe(true);
      });

      it('should reject non-numeric DHL numbers', () => {
        const result = validateTrackingNumber('123456789A', 'dhl');
        expect(result.valid).toBe(false);
      });

      it('should reject wrong length for DHL', () => {
        const result = validateTrackingNumber('123456789', 'dhl');
        expect(result.valid).toBe(false);
      });
    });

    describe('FedEx', () => {
      it('should accept valid 12-digit FedEx numbers', () => {
        const result = validateTrackingNumber('123456789012', 'fedex');
        expect(result.valid).toBe(true);
      });

      it('should accept valid 22-digit FedEx numbers', () => {
        const result = validateTrackingNumber('1234567890123456789012', 'fedex');
        expect(result.valid).toBe(true);
      });

      it('should reject non-numeric FedEx numbers', () => {
        const result = validateTrackingNumber('12345678901A', 'fedex');
        expect(result.valid).toBe(false);
      });

      it('should reject too short FedEx numbers', () => {
        const result = validateTrackingNumber('12345678901', 'fedex');
        expect(result.valid).toBe(false);
      });
    });

    describe('UPS', () => {
      it('should accept valid 1Z format UPS numbers', () => {
        const result = validateTrackingNumber('1Z12345E0205271688', 'ups');
        expect(result.valid).toBe(true);
      });

      it('should reject UPS numbers not starting with 1Z', () => {
        const result = validateTrackingNumber('2Z12345E0205271688', 'ups');
        expect(result.valid).toBe(false);
      });

      it('should reject wrong length UPS numbers', () => {
        const result = validateTrackingNumber('1Z12345E', 'ups');
        expect(result.valid).toBe(false);
      });
    });

    describe('Other', () => {
      it('should accept any non-empty string for other carrier', () => {
        const result = validateTrackingNumber('ANY-TRACKING-123', 'other');
        expect(result.valid).toBe(true);
      });

      it('should reject empty tracking for other carrier', () => {
        const result = validateTrackingNumber('', 'other');
        expect(result.valid).toBe(false);
      });
    });
  });

  // ============================================================================
  // Tracking URL Generation Tests
  // ============================================================================

  describe('generateTrackingUrl', () => {
    it('should generate correct Israel Post URL', () => {
      const url = generateTrackingUrl('RR123456789IL', 'israel_post');
      expect(url).toBe('https://israelpost.co.il/itemtrace?itemcode=RR123456789IL');
    });

    it('should generate correct DHL URL', () => {
      const url = generateTrackingUrl('1234567890', 'dhl');
      expect(url).toBe('https://www.dhl.com/il-he/home/tracking.html?tracking-id=1234567890');
    });

    it('should generate correct FedEx URL', () => {
      const url = generateTrackingUrl('123456789012', 'fedex');
      expect(url).toBe('https://www.fedex.com/fedextrack/?trknbr=123456789012');
    });

    it('should generate correct UPS URL', () => {
      const url = generateTrackingUrl('1Z12345E0205271688', 'ups');
      expect(url).toBe('https://www.ups.com/track?tracknum=1Z12345E0205271688');
    });

    it('should return null for other carrier', () => {
      const url = generateTrackingUrl('ANY-123', 'other');
      expect(url).toBeNull();
    });
  });

  // ============================================================================
  // Carrier Info Tests
  // ============================================================================

  describe('CARRIERS', () => {
    it('should have name for all carriers', () => {
      expect(CARRIERS.israel_post.name).toBe('Israel Post');
      expect(CARRIERS.dhl.name).toBe('DHL');
      expect(CARRIERS.fedex.name).toBe('FedEx');
      expect(CARRIERS.ups.name).toBe('UPS');
      expect(CARRIERS.other.name).toBe('Other');
    });

    it('should have Hebrew names for all carriers', () => {
      expect(CARRIERS.israel_post.nameHe).toBe('דואר ישראל');
      expect(CARRIERS.dhl.nameHe).toBe('DHL');
      expect(CARRIERS.fedex.nameHe).toBe('FedEx');
      expect(CARRIERS.ups.nameHe).toBe('UPS');
      expect(CARRIERS.other.nameHe).toBe('אחר');
    });
  });

  // ============================================================================
  // Create Tracking Info Tests
  // ============================================================================

  describe('createTrackingInfo', () => {
    it('should create tracking info with all fields', () => {
      const info = createTrackingInfo(
        'RR123456789IL',
        'israel_post',
        'admin_123'
      );

      expect(info.trackingNumber).toBe('RR123456789IL');
      expect(info.carrier).toBe('israel_post');
      expect(info.trackingUrl).toBe('https://israelpost.co.il/itemtrace?itemcode=RR123456789IL');
      expect(info.addedBy).toBe('admin_123');
      expect(info.addedAt).toEqual(new Date('2025-12-26T12:00:00Z'));
    });

    it('should set trackingUrl to null for other carrier', () => {
      const info = createTrackingInfo('CUSTOM-123', 'other', 'admin_123');

      expect(info.trackingNumber).toBe('CUSTOM-123');
      expect(info.carrier).toBe('other');
      expect(info.trackingUrl).toBeNull();
    });

    it('should include optional note', () => {
      const info = createTrackingInfo(
        'RR123456789IL',
        'israel_post',
        'admin_123',
        'Sent express'
      );

      expect(info.note).toBe('Sent express');
    });
  });
});
