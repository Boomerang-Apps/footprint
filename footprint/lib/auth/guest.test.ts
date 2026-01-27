/**
 * Guest Validation Tests
 *
 * Tests for guest checkout validation logic.
 * Tests email format validation and complete guest info validation.
 */

import { describe, it, expect } from 'vitest';
import { isValidGuestEmail, isValidGuestInfo, type GuestInfo } from './guest';

describe('Guest Validation', () => {
  describe('isValidGuestEmail', () => {
    it('should accept valid email addresses', () => {
      expect(isValidGuestEmail('user@example.com')).toBe(true);
      expect(isValidGuestEmail('john.doe@company.co.il')).toBe(true);
      expect(isValidGuestEmail('test+tag@gmail.com')).toBe(true);
      expect(isValidGuestEmail('user123@domain.com')).toBe(true);
      expect(isValidGuestEmail('first.last@sub.domain.com')).toBe(true);
    });

    it('should reject empty or whitespace emails', () => {
      expect(isValidGuestEmail('')).toBe(false);
      expect(isValidGuestEmail('   ')).toBe(false);
      expect(isValidGuestEmail('\t')).toBe(false);
    });

    it('should reject emails without @ symbol', () => {
      expect(isValidGuestEmail('invalidemail.com')).toBe(false);
      expect(isValidGuestEmail('user.example.com')).toBe(false);
    });

    it('should reject emails without domain', () => {
      expect(isValidGuestEmail('user@')).toBe(false);
      expect(isValidGuestEmail('@example.com')).toBe(false);
    });

    it('should reject emails with spaces', () => {
      expect(isValidGuestEmail('user @example.com')).toBe(false);
      expect(isValidGuestEmail('user@exam ple.com')).toBe(false);
      expect(isValidGuestEmail('user @example .com')).toBe(false);
    });

    it('should reject emails with multiple @ symbols', () => {
      expect(isValidGuestEmail('user@@example.com')).toBe(false);
      expect(isValidGuestEmail('user@test@example.com')).toBe(false);
    });

    it('should reject emails without TLD', () => {
      expect(isValidGuestEmail('user@localhost')).toBe(false);
      expect(isValidGuestEmail('user@domain')).toBe(false);
    });

    it('should reject emails with invalid characters', () => {
      expect(isValidGuestEmail('user name@example.com')).toBe(false);
      expect(isValidGuestEmail('user#name@example.com')).toBe(false);
    });

    it('should handle edge cases', () => {
      // Too short
      expect(isValidGuestEmail('a@b.c')).toBe(false);

      // Very long but valid
      const longEmail = 'a'.repeat(50) + '@example.com';
      expect(isValidGuestEmail(longEmail)).toBe(true);

      // Trim whitespace
      expect(isValidGuestEmail(' user@example.com ')).toBe(true);
    });
  });

  describe('isValidGuestInfo', () => {
    const validGuest: GuestInfo = {
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '050-1234567',
      marketingConsent: false,
    };

    it('should accept valid guest info', () => {
      const result = isValidGuestInfo(validGuest);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept guest info without phone', () => {
      const guest: GuestInfo = {
        ...validGuest,
        phone: undefined,
      };
      const result = isValidGuestInfo(guest);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept guest info with marketing consent', () => {
      const guest: GuestInfo = {
        ...validGuest,
        marketingConsent: true,
      };
      const result = isValidGuestInfo(guest);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    describe('Email validation', () => {
      it('should reject empty email', () => {
        const guest: GuestInfo = {
          ...validGuest,
          email: '',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Email is required');
      });

      it('should reject invalid email format', () => {
        const guest: GuestInfo = {
          ...validGuest,
          email: 'not-an-email',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Email format is invalid');
      });

      it('should trim email before validation', () => {
        const guest: GuestInfo = {
          ...validGuest,
          email: '  john@example.com  ',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('First name validation', () => {
      it('should reject empty first name', () => {
        const guest: GuestInfo = {
          ...validGuest,
          firstName: '',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('First name is required');
      });

      it('should reject whitespace-only first name', () => {
        const guest: GuestInfo = {
          ...validGuest,
          firstName: '   ',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('First name is required');
      });

      it('should accept names with spaces', () => {
        const guest: GuestInfo = {
          ...validGuest,
          firstName: 'Mary Jane',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(true);
      });

      it('should accept names with hyphens', () => {
        const guest: GuestInfo = {
          ...validGuest,
          firstName: 'Jean-Pierre',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(true);
      });

      it('should accept names with apostrophes', () => {
        const guest: GuestInfo = {
          ...validGuest,
          firstName: "O'Brien",
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(true);
      });

      it('should reject names with numbers', () => {
        const guest: GuestInfo = {
          ...validGuest,
          firstName: 'John123',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('First name contains invalid characters');
      });

      it('should reject names with special characters', () => {
        const guest: GuestInfo = {
          ...validGuest,
          firstName: 'John@Doe',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('First name contains invalid characters');
      });

      it('should reject very short names', () => {
        const guest: GuestInfo = {
          ...validGuest,
          firstName: 'J',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('First name must be at least 2 characters');
      });

      it('should reject very long names', () => {
        const guest: GuestInfo = {
          ...validGuest,
          firstName: 'A'.repeat(51),
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('First name must be at most 50 characters');
      });
    });

    describe('Last name validation', () => {
      it('should reject empty last name', () => {
        const guest: GuestInfo = {
          ...validGuest,
          lastName: '',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Last name is required');
      });

      it('should reject whitespace-only last name', () => {
        const guest: GuestInfo = {
          ...validGuest,
          lastName: '   ',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Last name is required');
      });

      it('should accept last names with spaces', () => {
        const guest: GuestInfo = {
          ...validGuest,
          lastName: 'Van Der Berg',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(true);
      });

      it('should reject last names with numbers', () => {
        const guest: GuestInfo = {
          ...validGuest,
          lastName: 'Smith123',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Last name contains invalid characters');
      });

      it('should reject very short last names', () => {
        const guest: GuestInfo = {
          ...validGuest,
          lastName: 'D',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Last name must be at least 2 characters');
      });

      it('should reject very long last names', () => {
        const guest: GuestInfo = {
          ...validGuest,
          lastName: 'B'.repeat(51),
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Last name must be at most 50 characters');
      });
    });

    describe('Phone validation', () => {
      it('should accept valid Israeli mobile format', () => {
        const guest: GuestInfo = {
          ...validGuest,
          phone: '050-1234567',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(true);
      });

      it('should accept phone without dashes', () => {
        const guest: GuestInfo = {
          ...validGuest,
          phone: '0501234567',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(true);
      });

      it('should accept international format', () => {
        const guest: GuestInfo = {
          ...validGuest,
          phone: '+972-50-1234567',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(true);
      });

      it('should accept empty phone', () => {
        const guest: GuestInfo = {
          ...validGuest,
          phone: '',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(true);
      });

      it('should reject phone with letters', () => {
        const guest: GuestInfo = {
          ...validGuest,
          phone: '050-CALL-NOW',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Phone number format is invalid');
      });

      it('should reject very short phone', () => {
        const guest: GuestInfo = {
          ...validGuest,
          phone: '123',
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Phone number format is invalid');
      });

      it('should reject very long phone', () => {
        const guest: GuestInfo = {
          ...validGuest,
          phone: '1'.repeat(25),
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Phone number format is invalid');
      });
    });

    describe('Multiple errors', () => {
      it('should return all validation errors', () => {
        const guest: GuestInfo = {
          email: 'invalid-email',
          firstName: 'J',
          lastName: 'D',
          phone: 'abc',
          marketingConsent: false,
        };
        const result = isValidGuestInfo(guest);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(1);
        expect(result.errors).toContain('Email format is invalid');
        expect(result.errors).toContain('First name must be at least 2 characters');
        expect(result.errors).toContain('Last name must be at least 2 characters');
        expect(result.errors).toContain('Phone number format is invalid');
      });
    });
  });
});
