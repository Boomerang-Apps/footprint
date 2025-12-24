import { describe, it, expect } from 'vitest';
import {
  demoOrders,
  demoUsers,
  demoAddresses,
  demoImages,
  demoStyles,
  createDemoOrder,
  createDemoUser,
  getDemoOrderByStatus,
  getDemoOrdersByUser,
  getStylePreviewImage,
  getRandomOriginalImage,
  getStyleById,
  getPopularStyles,
} from './index';
import type { OrderStatus, StyleType } from '@/types';

describe('Demo Data Module', () => {
  describe('demoOrders', () => {
    it('should export an array of orders', () => {
      expect(Array.isArray(demoOrders)).toBe(true);
      expect(demoOrders.length).toBeGreaterThan(0);
    });

    it('should have orders with all required fields', () => {
      demoOrders.forEach((order) => {
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('userId');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('items');
        expect(order).toHaveProperty('subtotal');
        expect(order).toHaveProperty('shipping');
        expect(order).toHaveProperty('total');
        expect(order).toHaveProperty('shippingAddress');
        expect(order).toHaveProperty('createdAt');
      });
    });

    it('should have orders covering all statuses', () => {
      const statuses: OrderStatus[] = ['pending', 'paid', 'processing', 'printing', 'shipped', 'delivered'];

      statuses.forEach((status) => {
        const orderWithStatus = demoOrders.find((o) => o.status === status);
        expect(orderWithStatus).toBeDefined();
      });
    });

    it('should have valid order items', () => {
      demoOrders.forEach((order) => {
        expect(order.items.length).toBeGreaterThan(0);
        order.items.forEach((item) => {
          expect(item).toHaveProperty('id');
          expect(item).toHaveProperty('originalImageUrl');
          expect(item).toHaveProperty('style');
          expect(item).toHaveProperty('size');
          expect(item).toHaveProperty('paperType');
          expect(item).toHaveProperty('frameType');
          expect(item).toHaveProperty('price');
        });
      });
    });

    it('should have valid shipping addresses', () => {
      demoOrders.forEach((order) => {
        expect(order.shippingAddress).toHaveProperty('name');
        expect(order.shippingAddress).toHaveProperty('street');
        expect(order.shippingAddress).toHaveProperty('city');
        expect(order.shippingAddress).toHaveProperty('postalCode');
        expect(order.shippingAddress).toHaveProperty('country');
      });
    });

    it('should have at least one gift order', () => {
      const giftOrder = demoOrders.find((o) => o.isGift === true);
      expect(giftOrder).toBeDefined();
      expect(giftOrder?.giftMessage).toBeTruthy();
    });
  });

  describe('demoUsers', () => {
    it('should export an array of users', () => {
      expect(Array.isArray(demoUsers)).toBe(true);
      expect(demoUsers.length).toBeGreaterThan(0);
    });

    it('should have users with all required fields', () => {
      demoUsers.forEach((user) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('preferredLanguage');
        expect(user).toHaveProperty('isAdmin');
        expect(user).toHaveProperty('createdAt');
      });
    });

    it('should include at least one regular user', () => {
      const regularUser = demoUsers.find((u) => u.isAdmin === false);
      expect(regularUser).toBeDefined();
    });

    it('should include at least one admin user', () => {
      const adminUser = demoUsers.find((u) => u.isAdmin === true);
      expect(adminUser).toBeDefined();
    });

    it('should have Hebrew preferred language for demo users', () => {
      const hebrewUsers = demoUsers.filter((u) => u.preferredLanguage === 'he');
      expect(hebrewUsers.length).toBeGreaterThan(0);
    });
  });

  describe('demoAddresses', () => {
    it('should export an array of addresses', () => {
      expect(Array.isArray(demoAddresses)).toBe(true);
      expect(demoAddresses.length).toBeGreaterThan(0);
    });

    it('should have addresses with all required fields', () => {
      demoAddresses.forEach((address) => {
        expect(address).toHaveProperty('name');
        expect(address).toHaveProperty('street');
        expect(address).toHaveProperty('city');
        expect(address).toHaveProperty('postalCode');
        expect(address).toHaveProperty('country');
      });
    });

    it('should have addresses in Israel', () => {
      demoAddresses.forEach((address) => {
        expect(address.country).toBe('ישראל');
      });
    });

    it('should have 7-digit postal codes', () => {
      demoAddresses.forEach((address) => {
        expect(address.postalCode).toMatch(/^\d{7}$/);
      });
    });

    it('should have at least one default address', () => {
      const defaultAddress = demoAddresses.find((a) => a.isDefault === true);
      expect(defaultAddress).toBeDefined();
    });
  });

  describe('demoImages', () => {
    it('should export image object with original photos', () => {
      expect(demoImages).toHaveProperty('originals');
      expect(Array.isArray(demoImages.originals)).toBe(true);
      expect(demoImages.originals.length).toBeGreaterThan(0);
    });

    it('should export style preview images', () => {
      expect(demoImages).toHaveProperty('stylePreviews');
      expect(typeof demoImages.stylePreviews).toBe('object');
    });

    it('should have preview image for each style', () => {
      const styles: StyleType[] = [
        'original',
        'pop_art',
        'watercolor',
        'line_art',
        'oil_painting',
        'romantic',
        'comic_book',
        'vintage',
      ];

      styles.forEach((style) => {
        expect(demoImages.stylePreviews[style]).toBeDefined();
        expect(typeof demoImages.stylePreviews[style]).toBe('string');
      });
    });

    it('should have valid URL format for images', () => {
      demoImages.originals.forEach((url) => {
        expect(url).toMatch(/^(https?:\/\/|\/)/);
      });

      Object.values(demoImages.stylePreviews).forEach((url) => {
        expect(url).toMatch(/^(https?:\/\/|\/)/);
      });
    });
  });

  describe('demoStyles', () => {
    it('should export an array of styles', () => {
      expect(Array.isArray(demoStyles)).toBe(true);
      expect(demoStyles.length).toBe(8);
    });

    it('should have styles with all required fields', () => {
      demoStyles.forEach((style) => {
        expect(style).toHaveProperty('id');
        expect(style).toHaveProperty('name');
        expect(style).toHaveProperty('nameHe');
        expect(style).toHaveProperty('description');
        expect(style).toHaveProperty('descriptionHe');
        expect(style).toHaveProperty('thumbnailUrl');
        expect(style).toHaveProperty('processingTime');
      });
    });

    it('should have at least one popular style', () => {
      const popularStyle = demoStyles.find((s) => s.popular === true);
      expect(popularStyle).toBeDefined();
    });
  });

  describe('createDemoOrder', () => {
    it('should create a new demo order with default values', () => {
      const order = createDemoOrder();

      expect(order).toHaveProperty('id');
      expect(order.id).toMatch(/^demo_order_/);
      expect(order.status).toBe('pending');
      expect(order.items.length).toBeGreaterThan(0);
    });

    it('should create order with custom status', () => {
      const order = createDemoOrder({ status: 'shipped' });

      expect(order.status).toBe('shipped');
      expect(order.shippedAt).toBeDefined();
    });

    it('should create gift order when specified', () => {
      const order = createDemoOrder({ isGift: true, giftMessage: 'Happy Birthday!' });

      expect(order.isGift).toBe(true);
      expect(order.giftMessage).toBe('Happy Birthday!');
    });

    it('should use provided address', () => {
      const customAddress = {
        name: 'Test User',
        street: 'Test Street 123',
        city: 'Test City',
        postalCode: '1234567',
        country: 'ישראל',
      };

      const order = createDemoOrder({ shippingAddress: customAddress });

      expect(order.shippingAddress.name).toBe('Test User');
      expect(order.shippingAddress.city).toBe('Test City');
    });
  });

  describe('createDemoUser', () => {
    it('should create a new demo user with default values', () => {
      const user = createDemoUser();

      expect(user).toHaveProperty('id');
      expect(user.id).toMatch(/^demo_user_/);
      expect(user.isAdmin).toBe(false);
      expect(user.preferredLanguage).toBe('he');
    });

    it('should create admin user when specified', () => {
      const user = createDemoUser({ isAdmin: true });

      expect(user.isAdmin).toBe(true);
    });

    it('should use provided name and email', () => {
      const user = createDemoUser({ name: 'Custom Name', email: 'custom@example.com' });

      expect(user.name).toBe('Custom Name');
      expect(user.email).toBe('custom@example.com');
    });
  });

  describe('getDemoOrderByStatus', () => {
    it('should return order with pending status', () => {
      const order = getDemoOrderByStatus('pending');
      expect(order).toBeDefined();
      expect(order?.status).toBe('pending');
    });

    it('should return order with paid status', () => {
      const order = getDemoOrderByStatus('paid');
      expect(order).toBeDefined();
      expect(order?.status).toBe('paid');
    });

    it('should return order with shipped status', () => {
      const order = getDemoOrderByStatus('shipped');
      expect(order).toBeDefined();
      expect(order?.status).toBe('shipped');
      expect(order?.trackingNumber).toBeDefined();
    });

    it('should return order with delivered status', () => {
      const order = getDemoOrderByStatus('delivered');
      expect(order).toBeDefined();
      expect(order?.status).toBe('delivered');
      expect(order?.deliveredAt).toBeDefined();
    });
  });

  describe('getStylePreviewImage', () => {
    it('should return preview image for pop_art style', () => {
      const url = getStylePreviewImage('pop_art');
      expect(url).toBeDefined();
      expect(typeof url).toBe('string');
    });

    it('should return preview image for all styles', () => {
      const styles: StyleType[] = [
        'original',
        'pop_art',
        'watercolor',
        'line_art',
        'oil_painting',
        'romantic',
        'comic_book',
        'vintage',
      ];

      styles.forEach((style) => {
        const url = getStylePreviewImage(style);
        expect(url).toBeDefined();
      });
    });

    it('should return fallback for minimalist style', () => {
      const url = getStylePreviewImage('minimalist');
      expect(url).toBeDefined();
    });
  });

  describe('getRandomOriginalImage', () => {
    it('should return a valid image URL', () => {
      const url = getRandomOriginalImage();
      expect(url).toBeDefined();
      expect(typeof url).toBe('string');
      expect(url).toMatch(/^https?:\/\//);
    });

    it('should return URL from originals array', () => {
      const url = getRandomOriginalImage();
      expect(demoImages.originals).toContain(url);
    });
  });

  describe('getStyleById', () => {
    it('should return style for valid id', () => {
      const style = getStyleById('pop_art');
      expect(style).toBeDefined();
      expect(style?.id).toBe('pop_art');
      expect(style?.name).toBe('Pop Art');
    });

    it('should return undefined for invalid id', () => {
      const style = getStyleById('invalid_style' as StyleType);
      expect(style).toBeUndefined();
    });

    it('should return correct style data', () => {
      const style = getStyleById('watercolor');
      expect(style?.nameHe).toBe('צבעי מים');
      expect(style?.processingTime).toBe(10);
    });
  });

  describe('getPopularStyles', () => {
    it('should return array of popular styles', () => {
      const popular = getPopularStyles();
      expect(Array.isArray(popular)).toBe(true);
      expect(popular.length).toBeGreaterThan(0);
    });

    it('should only include styles with popular=true', () => {
      const popular = getPopularStyles();
      popular.forEach((style) => {
        expect(style.popular).toBe(true);
      });
    });

    it('should include pop_art and watercolor', () => {
      const popular = getPopularStyles();
      const ids = popular.map((s) => s.id);
      expect(ids).toContain('pop_art');
      expect(ids).toContain('watercolor');
    });
  });

  describe('getDemoOrdersByUser', () => {
    it('should return orders for existing user', () => {
      const orders = getDemoOrdersByUser('demo_user_001');
      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBeGreaterThan(0);
      orders.forEach((order) => {
        expect(order.userId).toBe('demo_user_001');
      });
    });

    it('should return empty array for non-existent user', () => {
      const orders = getDemoOrdersByUser('non_existent_user');
      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBe(0);
    });
  });

  describe('createDemoOrder edge cases', () => {
    it('should set timestamps for delivered order', () => {
      const order = createDemoOrder({ status: 'delivered' });
      expect(order.status).toBe('delivered');
      expect(order.deliveredAt).toBeDefined();
      expect(order.shippedAt).toBeDefined();
      expect(order.paidAt).toBeDefined();
      expect(order.trackingNumber).toBeDefined();
    });

    it('should set timestamps for paid order', () => {
      const order = createDemoOrder({ status: 'paid' });
      expect(order.status).toBe('paid');
      expect(order.paidAt).toBeDefined();
    });

    it('should preserve provided timestamps', () => {
      const customPaidAt = new Date('2024-01-01');
      const order = createDemoOrder({ status: 'delivered', paidAt: customPaidAt });
      expect(order.paidAt).toEqual(customPaidAt);
    });

    it('should preserve provided tracking number', () => {
      const order = createDemoOrder({ status: 'shipped', trackingNumber: 'CUSTOM123' });
      expect(order.trackingNumber).toBe('CUSTOM123');
    });
  });
});
