/**
 * Demo Users and Addresses
 *
 * Sample user data for UI testing and development.
 */

import type { User, SavedAddress } from '@/types';

// Demo Addresses (Hebrew, Israel)
export const demoAddresses: SavedAddress[] = [
  {
    id: 'addr_001',
    name: 'יעל כהן',
    street: 'רחוב דיזנגוף 123',
    city: 'תל אביב',
    postalCode: '6433101',
    country: 'ישראל',
    phone: '052-1234567',
    isDefault: true,
  },
  {
    id: 'addr_002',
    name: 'דוד לוי',
    street: 'שדרות רוטשילד 45',
    city: 'תל אביב',
    postalCode: '6578801',
    country: 'ישראל',
    phone: '054-9876543',
    isDefault: false,
  },
  {
    id: 'addr_003',
    name: 'שרה ישראלי',
    street: 'רחוב הרצל 78',
    city: 'ירושלים',
    postalCode: '9422801',
    country: 'ישראל',
    phone: '050-5555555',
    isDefault: false,
  },
  {
    id: 'addr_004',
    name: 'משה אברהם',
    street: 'רחוב הנביאים 12',
    city: 'חיפה',
    postalCode: '3304301',
    country: 'ישראל',
    phone: '053-1112222',
    isDefault: false,
  },
  {
    id: 'addr_005',
    name: 'רחל גולן',
    street: 'שדרות ירושלים 89',
    city: 'באר שבע',
    postalCode: '8458701',
    country: 'ישראל',
    phone: '058-3334444',
    isDefault: false,
  },
];

// Demo Users
export const demoUsers: User[] = [
  {
    id: 'demo_user_001',
    email: 'yael@example.com',
    name: 'יעל כהן',
    phone: '052-1234567',
    preferredLanguage: 'he',
    isAdmin: false,
    defaultAddress: demoAddresses[0],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-20'),
  },
  {
    id: 'demo_user_002',
    email: 'david@example.com',
    name: 'דוד לוי',
    phone: '054-9876543',
    preferredLanguage: 'he',
    isAdmin: false,
    defaultAddress: demoAddresses[1],
    createdAt: new Date('2024-03-22'),
    updatedAt: new Date('2024-12-18'),
  },
  {
    id: 'demo_user_admin',
    email: 'admin@footprint.co.il',
    name: 'מנהל מערכת',
    phone: '050-0000000',
    preferredLanguage: 'he',
    isAdmin: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-24'),
  },
  {
    id: 'demo_user_003',
    email: 'sarah@example.com',
    name: 'שרה ישראלי',
    phone: '050-5555555',
    preferredLanguage: 'he',
    isAdmin: false,
    defaultAddress: demoAddresses[2],
    createdAt: new Date('2024-06-10'),
    updatedAt: new Date('2024-12-15'),
  },
];

/**
 * Create a new demo user with custom overrides
 */
export function createDemoUser(overrides?: Partial<User>): User {
  const id = `demo_user_${Date.now()}`;
  const now = new Date();

  return {
    id,
    email: `user_${id}@example.com`,
    name: 'משתמש חדש',
    preferredLanguage: 'he',
    isAdmin: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
