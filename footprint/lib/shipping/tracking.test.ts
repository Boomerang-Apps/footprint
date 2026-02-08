/**
 * Shipping Tracking Module Tests
 *
 * Tests for carrier detection, tracking number validation,
 * carrier names, and tracking URL generation.
 */

import { describe, it, expect } from 'vitest';
import {
  detectCarrier,
  validateTrackingNumber,
  getTrackingUrl,
  CARRIER_PATTERNS,
  CARRIER_NAMES,
  CARRIER_TRACKING_URLS,
  type CarrierCode,
} from './tracking';

describe('Carrier Patterns', () => {
  it('should define patterns for all carriers', () => {
    const carriers: CarrierCode[] = ['israel_post', 'dhl', 'fedex', 'ups', 'other'];
    for (const carrier of carriers) {
      expect(carrier in CARRIER_PATTERNS).toBe(true);
    }
  });

  it('should have null pattern for "other" carrier', () => {
    expect(CARRIER_PATTERNS.other).toBeNull();
  });

  it('should have regex patterns for known carriers', () => {
    expect(CARRIER_PATTERNS.israel_post).toBeInstanceOf(RegExp);
    expect(CARRIER_PATTERNS.dhl).toBeInstanceOf(RegExp);
    expect(CARRIER_PATTERNS.fedex).toBeInstanceOf(RegExp);
    expect(CARRIER_PATTERNS.ups).toBeInstanceOf(RegExp);
  });
});

describe('detectCarrier', () => {
  it('should detect Israel Post tracking numbers (RR prefix)', () => {
    expect(detectCarrier('RR123456789IL')).toBe('israel_post');
  });

  it('should detect Israel Post tracking numbers (RL prefix)', () => {
    expect(detectCarrier('RL987654321IL')).toBe('israel_post');
  });

  it('should detect Israel Post tracking numbers (EA prefix)', () => {
    expect(detectCarrier('EA123456789IL')).toBe('israel_post');
  });

  it('should detect Israel Post tracking numbers (EE prefix)', () => {
    expect(detectCarrier('EE123456789IL')).toBe('israel_post');
  });

  it('should detect Israel Post case-insensitively', () => {
    expect(detectCarrier('rr123456789il')).toBe('israel_post');
  });

  it('should detect DHL tracking numbers (10 digits)', () => {
    expect(detectCarrier('1234567890')).toBe('dhl');
  });

  it('should detect FedEx tracking numbers (12 digits)', () => {
    expect(detectCarrier('123456789012')).toBe('fedex');
  });

  it('should detect FedEx tracking numbers (22 digits)', () => {
    expect(detectCarrier('1234567890123456789012')).toBe('fedex');
  });

  it('should detect UPS tracking numbers', () => {
    expect(detectCarrier('1Z12345E0205271688')).toBe('ups');
  });

  it('should detect UPS case-insensitively', () => {
    expect(detectCarrier('1z12345e0205271688')).toBe('ups');
  });

  it('should return null for unrecognized tracking numbers', () => {
    expect(detectCarrier('UNKNOWN123')).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(detectCarrier('')).toBeNull();
  });

  it('should trim whitespace before detection', () => {
    expect(detectCarrier('  RR123456789IL  ')).toBe('israel_post');
  });
});

describe('validateTrackingNumber', () => {
  describe('Israel Post', () => {
    it('should validate correct Israel Post tracking number', () => {
      expect(validateTrackingNumber('RR123456789IL', 'israel_post')).toBe(true);
    });

    it('should validate case-insensitively', () => {
      expect(validateTrackingNumber('rr123456789il', 'israel_post')).toBe(true);
    });

    it('should reject invalid Israel Post format', () => {
      expect(validateTrackingNumber('XX123456789IL', 'israel_post')).toBe(false);
    });

    it('should reject too-short Israel Post number', () => {
      expect(validateTrackingNumber('RR12345IL', 'israel_post')).toBe(false);
    });

    it('should reject Israel Post without IL suffix', () => {
      expect(validateTrackingNumber('RR123456789US', 'israel_post')).toBe(false);
    });
  });

  describe('DHL', () => {
    it('should validate correct DHL tracking number', () => {
      expect(validateTrackingNumber('1234567890', 'dhl')).toBe(true);
    });

    it('should reject non-10-digit DHL number', () => {
      expect(validateTrackingNumber('12345', 'dhl')).toBe(false);
    });

    it('should reject DHL number with letters', () => {
      expect(validateTrackingNumber('123456789A', 'dhl')).toBe(false);
    });
  });

  describe('FedEx', () => {
    it('should validate 12-digit FedEx tracking number', () => {
      expect(validateTrackingNumber('123456789012', 'fedex')).toBe(true);
    });

    it('should validate 22-digit FedEx tracking number', () => {
      expect(validateTrackingNumber('1234567890123456789012', 'fedex')).toBe(true);
    });

    it('should reject too-short FedEx number', () => {
      expect(validateTrackingNumber('12345678901', 'fedex')).toBe(false);
    });

    it('should reject too-long FedEx number', () => {
      expect(validateTrackingNumber('12345678901234567890123', 'fedex')).toBe(false);
    });
  });

  describe('UPS', () => {
    it('should validate correct UPS tracking number', () => {
      expect(validateTrackingNumber('1Z12345E0205271688', 'ups')).toBe(true);
    });

    it('should validate UPS case-insensitively', () => {
      expect(validateTrackingNumber('1z12345e0205271688', 'ups')).toBe(true);
    });

    it('should reject UPS without 1Z prefix', () => {
      expect(validateTrackingNumber('2Z12345E0205271688', 'ups')).toBe(false);
    });
  });

  describe('Other', () => {
    it('should accept any tracking number for "other" carrier', () => {
      expect(validateTrackingNumber('anything-goes', 'other')).toBe(true);
    });

    it('should accept empty string for "other" carrier', () => {
      expect(validateTrackingNumber('', 'other')).toBe(true);
    });
  });

  it('should trim whitespace before validation', () => {
    expect(validateTrackingNumber('  RR123456789IL  ', 'israel_post')).toBe(true);
  });
});

describe('CARRIER_NAMES', () => {
  it('should have display names for all carriers', () => {
    expect(CARRIER_NAMES.israel_post).toBe('Israel Post');
    expect(CARRIER_NAMES.dhl).toBe('DHL');
    expect(CARRIER_NAMES.fedex).toBe('FedEx');
    expect(CARRIER_NAMES.ups).toBe('UPS');
    expect(CARRIER_NAMES.other).toBe('Other');
  });
});

describe('CARRIER_TRACKING_URLS', () => {
  it('should have tracking URLs for known carriers', () => {
    expect(CARRIER_TRACKING_URLS.israel_post).toContain('israelpost');
    expect(CARRIER_TRACKING_URLS.dhl).toContain('dhl.com');
    expect(CARRIER_TRACKING_URLS.fedex).toContain('fedex.com');
    expect(CARRIER_TRACKING_URLS.ups).toContain('ups.com');
  });

  it('should have null tracking URL for "other"', () => {
    expect(CARRIER_TRACKING_URLS.other).toBeNull();
  });
});

describe('getTrackingUrl', () => {
  it('should generate Israel Post tracking URL', () => {
    const url = getTrackingUrl('RR123456789IL', 'israel_post');
    expect(url).toContain('israelpost');
    expect(url).toContain('RR123456789IL');
  });

  it('should generate DHL tracking URL', () => {
    const url = getTrackingUrl('1234567890', 'dhl');
    expect(url).toContain('dhl.com');
    expect(url).toContain('1234567890');
  });

  it('should generate FedEx tracking URL', () => {
    const url = getTrackingUrl('123456789012', 'fedex');
    expect(url).toContain('fedex.com');
    expect(url).toContain('123456789012');
  });

  it('should generate UPS tracking URL', () => {
    const url = getTrackingUrl('1Z12345E0205271688', 'ups');
    expect(url).toContain('ups.com');
    expect(url).toContain('1Z12345E0205271688');
  });

  it('should return null for "other" carrier', () => {
    const url = getTrackingUrl('TRACK123', 'other');
    expect(url).toBeNull();
  });

  it('should URL-encode the tracking number', () => {
    const url = getTrackingUrl('RR 123456789IL', 'israel_post');
    expect(url).toContain('RR%20123456789IL');
  });
});
