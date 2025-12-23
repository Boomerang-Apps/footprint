import { describe, it, expect } from 'vitest';
import {
  validateAddress,
  validatePostalCode,
  validatePhone,
  validateCity,
  isValidIsraeliCity,
  formatPhoneNumber,
  ISRAELI_CITIES,
  AddressValidationResult,
} from './validation';
import type { Address } from '@/types';

describe('Address Validation', () => {
  describe('ISRAELI_CITIES', () => {
    it('should include major Israeli cities', () => {
      expect(ISRAELI_CITIES).toContain('Tel Aviv');
      expect(ISRAELI_CITIES).toContain('Jerusalem');
      expect(ISRAELI_CITIES).toContain('Haifa');
      expect(ISRAELI_CITIES).toContain('Beer Sheva');
    });

    it('should include Hebrew city names', () => {
      expect(ISRAELI_CITIES).toContain('תל אביב');
      expect(ISRAELI_CITIES).toContain('ירושלים');
      expect(ISRAELI_CITIES).toContain('חיפה');
    });
  });

  describe('isValidIsraeliCity', () => {
    it('should accept valid English city names', () => {
      expect(isValidIsraeliCity('Tel Aviv')).toBe(true);
      expect(isValidIsraeliCity('Jerusalem')).toBe(true);
      expect(isValidIsraeliCity('Haifa')).toBe(true);
    });

    it('should accept valid Hebrew city names', () => {
      expect(isValidIsraeliCity('תל אביב')).toBe(true);
      expect(isValidIsraeliCity('ירושלים')).toBe(true);
      expect(isValidIsraeliCity('חיפה')).toBe(true);
    });

    it('should be case insensitive for English names', () => {
      expect(isValidIsraeliCity('tel aviv')).toBe(true);
      expect(isValidIsraeliCity('TEL AVIV')).toBe(true);
      expect(isValidIsraeliCity('Tel Aviv')).toBe(true);
    });

    it('should reject invalid cities', () => {
      expect(isValidIsraeliCity('New York')).toBe(false);
      expect(isValidIsraeliCity('London')).toBe(false);
      expect(isValidIsraeliCity('')).toBe(false);
    });
  });

  describe('validatePostalCode', () => {
    it('should accept valid 7-digit postal codes', () => {
      expect(validatePostalCode('1234567')).toEqual({ valid: true });
      expect(validatePostalCode('6100000')).toEqual({ valid: true });
      expect(validatePostalCode('9999999')).toEqual({ valid: true });
    });

    it('should accept postal codes with spaces', () => {
      expect(validatePostalCode('123 4567')).toEqual({ valid: true });
      expect(validatePostalCode('12 34 567')).toEqual({ valid: true });
    });

    it('should reject invalid postal codes', () => {
      expect(validatePostalCode('123456').valid).toBe(false);
      expect(validatePostalCode('12345678').valid).toBe(false);
      expect(validatePostalCode('abcdefg').valid).toBe(false);
      expect(validatePostalCode('').valid).toBe(false);
    });

    it('should return error message for invalid codes', () => {
      const result = validatePostalCode('123');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Postal code must be 7 digits');
    });
  });

  describe('validatePhone', () => {
    it('should accept valid Israeli mobile numbers', () => {
      expect(validatePhone('050-1234567').valid).toBe(true);
      expect(validatePhone('052-1234567').valid).toBe(true);
      expect(validatePhone('054-1234567').valid).toBe(true);
      expect(validatePhone('058-1234567').valid).toBe(true);
    });

    it('should accept numbers without dashes', () => {
      expect(validatePhone('0501234567').valid).toBe(true);
      expect(validatePhone('0521234567').valid).toBe(true);
    });

    it('should accept international format', () => {
      expect(validatePhone('+972-50-1234567').valid).toBe(true);
      expect(validatePhone('+97250123456').valid).toBe(true);
      expect(validatePhone('972501234567').valid).toBe(true);
    });

    it('should accept landline numbers', () => {
      expect(validatePhone('02-1234567').valid).toBe(true);
      expect(validatePhone('03-1234567').valid).toBe(true);
      expect(validatePhone('04-1234567').valid).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123').valid).toBe(false);
      expect(validatePhone('abc').valid).toBe(false);
      expect(validatePhone('').valid).toBe(false);
    });

    it('should return error message for invalid phones', () => {
      const result = validatePhone('invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid Israeli phone number');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format mobile numbers with dashes', () => {
      expect(formatPhoneNumber('0501234567')).toBe('050-1234567');
      expect(formatPhoneNumber('0521234567')).toBe('052-1234567');
    });

    it('should handle already formatted numbers', () => {
      expect(formatPhoneNumber('050-1234567')).toBe('050-1234567');
    });

    it('should convert international to local format', () => {
      expect(formatPhoneNumber('+972501234567')).toBe('050-1234567');
      expect(formatPhoneNumber('972501234567')).toBe('050-1234567');
    });

    it('should return original for invalid formats', () => {
      expect(formatPhoneNumber('invalid')).toBe('invalid');
    });
  });

  describe('validateCity', () => {
    it('should accept valid Israeli cities', () => {
      expect(validateCity('Tel Aviv').valid).toBe(true);
      expect(validateCity('Jerusalem').valid).toBe(true);
    });

    it('should reject unknown cities', () => {
      const result = validateCity('Unknown City');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('City not recognized');
    });

    it('should reject empty city', () => {
      const result = validateCity('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('City is required');
    });
  });

  describe('validateAddress', () => {
    const validAddress: Address = {
      name: 'John Doe',
      street: '123 Main Street',
      city: 'Tel Aviv',
      postalCode: '6100000',
      country: 'Israel',
      phone: '050-1234567',
    };

    it('should accept valid complete address', () => {
      const result = validateAddress(validAddress);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject empty name', () => {
      const result = validateAddress({ ...validAddress, name: '' });

      expect(result.valid).toBe(false);
      expect(result.errors.name).toBe('Name is required');
    });

    it('should reject empty street', () => {
      const result = validateAddress({ ...validAddress, street: '' });

      expect(result.valid).toBe(false);
      expect(result.errors.street).toBe('Street address is required');
    });

    it('should reject invalid city', () => {
      const result = validateAddress({ ...validAddress, city: 'Unknown' });

      expect(result.valid).toBe(false);
      expect(result.errors.city).toBe('City not recognized');
    });

    it('should reject invalid postal code', () => {
      const result = validateAddress({ ...validAddress, postalCode: '123' });

      expect(result.valid).toBe(false);
      expect(result.errors.postalCode).toBe('Postal code must be 7 digits');
    });

    it('should reject invalid phone', () => {
      const result = validateAddress({ ...validAddress, phone: 'invalid' });

      expect(result.valid).toBe(false);
      expect(result.errors.phone).toBe('Invalid Israeli phone number');
    });

    it('should accept address without phone (optional)', () => {
      const addressNoPhone: Address = {
        name: 'John Doe',
        street: '123 Main Street',
        city: 'Tel Aviv',
        postalCode: '6100000',
        country: 'Israel',
      };

      const result = validateAddress(addressNoPhone);

      expect(result.valid).toBe(true);
    });

    it('should collect multiple errors', () => {
      const invalidAddress: Address = {
        name: '',
        street: '',
        city: 'Unknown',
        postalCode: '123',
        country: 'Israel',
        phone: 'invalid',
      };

      const result = validateAddress(invalidAddress);

      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(1);
    });

    it('should validate Hebrew addresses', () => {
      const hebrewAddress: Address = {
        name: 'ישראל ישראלי',
        street: 'רחוב הרצל 123',
        city: 'תל אביב',
        postalCode: '6100000',
        country: 'ישראל',
        phone: '050-1234567',
      };

      const result = validateAddress(hebrewAddress);

      expect(result.valid).toBe(true);
    });
  });
});
