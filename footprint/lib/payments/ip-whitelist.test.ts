import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getWhitelistedIPs, isPayPlusIP, extractClientIP } from './ip-whitelist';

describe('IP Whitelisting', () => {
  beforeEach(() => {
    vi.stubEnv('PAYPLUS_WEBHOOK_IPS', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('getWhitelistedIPs', () => {
    it('parses comma-separated IPs from env var', () => {
      vi.stubEnv('PAYPLUS_WEBHOOK_IPS', '1.2.3.4, 5.6.7.8, 10.0.0.0/8');
      const ips = getWhitelistedIPs();
      expect(ips).toEqual(['1.2.3.4', '5.6.7.8', '10.0.0.0/8']);
    });

    it('returns empty array when env var is not set', () => {
      vi.stubEnv('PAYPLUS_WEBHOOK_IPS', '');
      const ips = getWhitelistedIPs();
      expect(ips).toEqual([]);
    });
  });

  describe('isPayPlusIP', () => {
    it('matches exact IP address', () => {
      vi.stubEnv('PAYPLUS_WEBHOOK_IPS', '1.2.3.4,5.6.7.8');
      expect(isPayPlusIP('1.2.3.4')).toBe(true);
      expect(isPayPlusIP('5.6.7.8')).toBe(true);
    });

    it('matches IP within CIDR range', () => {
      vi.stubEnv('PAYPLUS_WEBHOOK_IPS', '192.168.1.0/24');
      expect(isPayPlusIP('192.168.1.50')).toBe(true);
      expect(isPayPlusIP('192.168.1.255')).toBe(true);
    });

    it('rejects IP outside CIDR range', () => {
      vi.stubEnv('PAYPLUS_WEBHOOK_IPS', '192.168.1.0/24');
      expect(isPayPlusIP('192.168.2.1')).toBe(false);
      expect(isPayPlusIP('10.0.0.1')).toBe(false);
    });

    it('returns true for any IP when whitelist is empty', () => {
      vi.stubEnv('PAYPLUS_WEBHOOK_IPS', '');
      expect(isPayPlusIP('1.2.3.4')).toBe(true);
      expect(isPayPlusIP('255.255.255.255')).toBe(true);
    });

    it('rejects IP not in whitelist', () => {
      vi.stubEnv('PAYPLUS_WEBHOOK_IPS', '1.2.3.4,5.6.7.8');
      expect(isPayPlusIP('9.9.9.9')).toBe(false);
    });
  });

  describe('extractClientIP', () => {
    it('extracts IP from X-Forwarded-For header (first entry)', () => {
      const request = new Request('https://example.com', {
        headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12' },
      });
      expect(extractClientIP(request)).toBe('1.2.3.4');
    });

    it('extracts IP from X-Real-IP header', () => {
      const request = new Request('https://example.com', {
        headers: { 'x-real-ip': '10.0.0.1' },
      });
      expect(extractClientIP(request)).toBe('10.0.0.1');
    });

    it('returns null when no IP headers present', () => {
      const request = new Request('https://example.com');
      expect(extractClientIP(request)).toBeNull();
    });
  });
});
