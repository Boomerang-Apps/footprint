/**
 * Tests for Mock API Client
 *
 * Covers all methods in mockClient: auth, orders, products, users.
 * Uses vi.useFakeTimers to advance through delays quickly.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { CreateOrderInput, Address } from '@/types';

// We need to re-import mockClient fresh per describe block to reset module state.
// The mockUser and mockOrders are module-level mutable state.

// Helper address used across order and user tests
const testAddress: Address = {
  name: 'Test User',
  street: '123 Test St',
  city: 'Tel Aviv',
  postalCode: '6100000',
  country: 'Israel',
  phone: '050-1234567',
};

// Minimal valid CreateOrderInput
function makeOrderInput(overrides?: Partial<CreateOrderInput>): CreateOrderInput {
  return {
    items: [
      {
        originalImageUrl: 'https://example.com/photo.jpg',
        transformedImageUrl: 'https://example.com/styled.jpg',
        style: 'watercolor',
        size: 'A4',
        paperType: 'matte',
        frameType: 'black',
      },
    ],
    isGift: false,
    shippingAddress: testAddress,
    ...overrides,
  };
}

describe('mockClient', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Helper to flush all pending timers and microtasks
  async function flush<T>(promise: Promise<T>): Promise<T> {
    vi.advanceTimersByTime(5000);
    return promise;
  }

  // ─── Auth ───────────────────────────────────────────────

  describe('auth', () => {
    // Reset module state before each auth test so mockUser starts as null
    let mockClient: typeof import('./mock').mockClient;

    beforeEach(async () => {
      vi.resetModules();
      const mod = await import('./mock');
      mockClient = mod.mockClient;
    });

    describe('login', () => {
      it('should return a user with the provided email', async () => {
        const p = mockClient.auth.login({ email: 'alice@example.com', password: 'password123' });
        const user = await flush(p);

        expect(user).toBeDefined();
        expect(user.email).toBe('alice@example.com');
        expect(user.id).toBe('user_mock_001');
        expect(user.name).toBe('alice');
        expect(user.preferredLanguage).toBe('he');
        expect(user.isAdmin).toBe(false);
        expect(user.createdAt).toBeInstanceOf(Date);
        expect(user.updatedAt).toBeInstanceOf(Date);
      });

      it('should set isAdmin to true when email contains "admin"', async () => {
        const p = mockClient.auth.login({ email: 'admin@example.com', password: 'password123' });
        const user = await flush(p);

        expect(user.isAdmin).toBe(true);
      });

      it('should set the mock user so getSession returns it', async () => {
        await flush(mockClient.auth.login({ email: 'bob@test.com', password: 'pw' }));
        const session = await flush(mockClient.auth.getSession());

        expect(session).not.toBeNull();
        expect(session!.email).toBe('bob@test.com');
      });
    });

    describe('register', () => {
      it('should create a new user with provided details', async () => {
        const p = mockClient.auth.register({
          email: 'newuser@test.com',
          password: 'secure123',
          name: 'New User',
          phone: '050-9999999',
        });
        const user = await flush(p);

        expect(user.email).toBe('newuser@test.com');
        expect(user.name).toBe('New User');
        expect(user.phone).toBe('050-9999999');
        expect(user.isAdmin).toBe(false);
        expect(user.preferredLanguage).toBe('he');
        expect(user.id).toMatch(/^user_/);
        expect(user.createdAt).toBeInstanceOf(Date);
        expect(user.updatedAt).toBeInstanceOf(Date);
      });

      it('should set the mock user for subsequent getSession calls', async () => {
        await flush(mockClient.auth.register({
          email: 'reg@test.com',
          password: 'pw',
          name: 'Reg',
        }));
        const session = await flush(mockClient.auth.getSession());

        expect(session).not.toBeNull();
        expect(session!.email).toBe('reg@test.com');
      });
    });

    describe('logout', () => {
      it('should clear the current user', async () => {
        // Login first
        await flush(mockClient.auth.login({ email: 'a@b.com', password: 'pw' }));
        expect(await flush(mockClient.auth.getSession())).not.toBeNull();

        // Logout
        await flush(mockClient.auth.logout());
        const session = await flush(mockClient.auth.getSession());

        expect(session).toBeNull();
      });
    });

    describe('getSession', () => {
      it('should return null when no user is logged in', async () => {
        const session = await flush(mockClient.auth.getSession());
        expect(session).toBeNull();
      });

      it('should return the logged-in user after login', async () => {
        await flush(mockClient.auth.login({ email: 'x@y.com', password: 'pw' }));
        const session = await flush(mockClient.auth.getSession());

        expect(session).not.toBeNull();
        expect(session!.email).toBe('x@y.com');
      });
    });

    describe('resetPassword', () => {
      it('should not throw', async () => {
        await expect(flush(mockClient.auth.resetPassword('user@test.com'))).resolves.toBeUndefined();
      });
    });
  });

  // ─── Orders ─────────────────────────────────────────────

  describe('orders', () => {
    let mockClient: typeof import('./mock').mockClient;

    beforeEach(async () => {
      vi.resetModules();
      const mod = await import('./mock');
      mockClient = mod.mockClient;
    });

    describe('create', () => {
      it('should create an order with pending status', async () => {
        const input = makeOrderInput();
        const order = await flush(mockClient.orders.create(input));

        expect(order.id).toMatch(/^order_/);
        expect(order.status).toBe('pending');
        expect(order.items).toHaveLength(1);
        expect(order.items[0].originalImageUrl).toBe('https://example.com/photo.jpg');
        expect(order.items[0].transformedImageUrl).toBe('https://example.com/styled.jpg');
        expect(order.items[0].style).toBe('watercolor');
        expect(order.items[0].size).toBe('A4');
        expect(order.items[0].paperType).toBe('matte');
        expect(order.items[0].frameType).toBe('black');
        expect(order.shipping).toBe(25);
        expect(order.createdAt).toBeInstanceOf(Date);
        expect(order.updatedAt).toBeInstanceOf(Date);
      });

      it('should set userId to "guest" when no user is logged in', async () => {
        const order = await flush(mockClient.orders.create(makeOrderInput()));
        expect(order.userId).toBe('guest');
      });

      it('should use the logged-in user id when available', async () => {
        await flush(mockClient.auth.login({ email: 'test@test.com', password: 'pw' }));
        const order = await flush(mockClient.orders.create(makeOrderInput()));
        expect(order.userId).toBe('user_mock_001');
      });

      it('should handle gift options', async () => {
        const input = makeOrderInput({
          isGift: true,
          giftMessage: 'Happy birthday!',
          giftWrap: true,
          wrappingStyle: 'festive',
        });
        const order = await flush(mockClient.orders.create(input));

        expect(order.isGift).toBe(true);
        expect(order.giftMessage).toBe('Happy birthday!');
        expect(order.giftWrap).toBe(true);
        expect(order.wrappingStyle).toBe('festive');
      });

      it('should handle scheduled delivery date', async () => {
        const input = makeOrderInput({
          scheduledDeliveryDate: '2025-03-15',
        });
        const order = await flush(mockClient.orders.create(input));
        expect(order.scheduledDeliveryDate).toBe('2025-03-15');
      });

      it('should use shippingAddress as billingAddress when billingAddress is not provided', async () => {
        const input = makeOrderInput();
        const order = await flush(mockClient.orders.create(input));
        expect(order.billingAddress).toEqual(testAddress);
      });

      it('should use separate billingAddress when provided', async () => {
        const billingAddr: Address = {
          name: 'Billing User',
          street: '456 Billing St',
          city: 'Haifa',
          postalCode: '3100000',
          country: 'Israel',
        };
        const input = makeOrderInput({ billingAddress: billingAddr });
        const order = await flush(mockClient.orders.create(input));
        expect(order.billingAddress).toEqual(billingAddr);
      });

      it('should handle multiple items', async () => {
        const input = makeOrderInput({
          items: [
            {
              originalImageUrl: 'https://example.com/photo1.jpg',
              style: 'watercolor',
              size: 'A4',
              paperType: 'matte',
              frameType: 'black',
            },
            {
              originalImageUrl: 'https://example.com/photo2.jpg',
              style: 'oil_painting',
              size: 'A3',
              paperType: 'canvas',
              frameType: 'oak',
            },
          ],
        });
        const order = await flush(mockClient.orders.create(input));

        expect(order.items).toHaveLength(2);
        expect(order.items[0].id).toMatch(/^item_/);
        expect(order.items[1].id).toMatch(/^item_/);
        expect(order.items[0].id).not.toBe(order.items[1].id);
      });

      it('should set transformedImageUrl to null when not provided', async () => {
        const input = makeOrderInput({
          items: [
            {
              originalImageUrl: 'https://example.com/photo.jpg',
              style: 'watercolor',
              size: 'A4',
              paperType: 'matte',
              frameType: 'black',
              // no transformedImageUrl
            },
          ],
        });
        const order = await flush(mockClient.orders.create(input));
        expect(order.items[0].transformedImageUrl).toBeNull();
      });

      it('should initialize payment and shipping fields as null', async () => {
        const order = await flush(mockClient.orders.create(makeOrderInput()));

        expect(order.paymentTransactionId).toBeNull();
        expect(order.paidAt).toBeNull();
        expect(order.trackingNumber).toBeNull();
        expect(order.carrier).toBeNull();
        expect(order.shippedAt).toBeNull();
        expect(order.deliveredAt).toBeNull();
      });
    });

    describe('get', () => {
      it('should find an existing demo order by id', async () => {
        const order = await flush(mockClient.orders.get('demo_order_001'));

        expect(order).toBeDefined();
        expect(order.id).toBe('demo_order_001');
        expect(order.status).toBe('pending');
      });

      it('should throw when order is not found', async () => {
        await expect(flush(mockClient.orders.get('nonexistent_id'))).rejects.toThrow('Order not found');
      });

      it('should find a newly created order', async () => {
        const created = await flush(mockClient.orders.create(makeOrderInput()));
        const fetched = await flush(mockClient.orders.get(created.id));

        expect(fetched.id).toBe(created.id);
      });
    });

    describe('list', () => {
      it('should return all orders when no userId filter is provided', async () => {
        const orders = await flush(mockClient.orders.list());

        // At minimum, the seeded demo orders should be present
        expect(orders.length).toBeGreaterThanOrEqual(7);
      });

      it('should filter orders by userId', async () => {
        const orders = await flush(mockClient.orders.list('demo_user_001'));

        expect(orders.length).toBeGreaterThanOrEqual(1);
        orders.forEach(o => {
          expect(o.userId).toBe('demo_user_001');
        });
      });

      it('should return empty array for unknown userId', async () => {
        const orders = await flush(mockClient.orders.list('nonexistent_user'));
        expect(orders).toEqual([]);
      });

      it('should include newly created orders in the list', async () => {
        const created = await flush(mockClient.orders.create(makeOrderInput()));
        const allOrders = await flush(mockClient.orders.list());

        const found = allOrders.find(o => o.id === created.id);
        expect(found).toBeDefined();
        expect(found!.id).toBe(created.id);
      });
    });

    describe('updateStatus', () => {
      it('should update the order status', async () => {
        const order = await flush(mockClient.orders.updateStatus('demo_order_001', 'paid'));

        expect(order.status).toBe('paid');
        expect(order.updatedAt).toBeInstanceOf(Date);
      });

      it('should set paidAt when status is "paid"', async () => {
        const created = await flush(mockClient.orders.create(makeOrderInput()));
        const updated = await flush(mockClient.orders.updateStatus(created.id, 'paid'));

        expect(updated.paidAt).toBeInstanceOf(Date);
      });

      it('should set shippedAt when status is "shipped"', async () => {
        const created = await flush(mockClient.orders.create(makeOrderInput()));
        const updated = await flush(mockClient.orders.updateStatus(created.id, 'shipped'));

        expect(updated.shippedAt).toBeInstanceOf(Date);
      });

      it('should set deliveredAt when status is "delivered"', async () => {
        const created = await flush(mockClient.orders.create(makeOrderInput()));
        const updated = await flush(mockClient.orders.updateStatus(created.id, 'delivered'));

        expect(updated.deliveredAt).toBeInstanceOf(Date);
      });

      it('should not set timestamps for other statuses', async () => {
        const created = await flush(mockClient.orders.create(makeOrderInput()));
        const updated = await flush(mockClient.orders.updateStatus(created.id, 'processing'));

        expect(updated.status).toBe('processing');
        expect(updated.paidAt).toBeNull();
        expect(updated.shippedAt).toBeNull();
        expect(updated.deliveredAt).toBeNull();
      });

      it('should throw when order is not found', async () => {
        await expect(
          flush(mockClient.orders.updateStatus('nonexistent_id', 'paid')),
        ).rejects.toThrow('Order not found');
      });
    });

    describe('addTracking', () => {
      it('should add tracking info to the order', async () => {
        const created = await flush(mockClient.orders.create(makeOrderInput()));
        const updated = await flush(
          mockClient.orders.addTracking(created.id, 'IL999888777', 'Israel Post'),
        );

        expect(updated.trackingNumber).toBe('IL999888777');
        expect(updated.carrier).toBe('Israel Post');
        expect(updated.updatedAt).toBeInstanceOf(Date);
      });

      it('should throw when order is not found', async () => {
        await expect(
          flush(mockClient.orders.addTracking('nonexistent_id', 'TRACK123', 'DHL')),
        ).rejects.toThrow('Order not found');
      });
    });
  });

  // ─── Products ───────────────────────────────────────────

  describe('products', () => {
    let mockClient: typeof import('./mock').mockClient;

    beforeEach(async () => {
      vi.resetModules();
      const mod = await import('./mock');
      mockClient = mod.mockClient;
    });

    describe('getStyles', () => {
      it('should return an array of styles', async () => {
        const styles = await flush(mockClient.products.getStyles());

        expect(Array.isArray(styles)).toBe(true);
        expect(styles.length).toBeGreaterThan(0);
      });

      it('should include expected style properties', async () => {
        const styles = await flush(mockClient.products.getStyles());
        const watercolor = styles.find(s => s.id === 'watercolor');

        expect(watercolor).toBeDefined();
        expect(watercolor!.name).toBe('Watercolor');
        expect(watercolor!.nameHe).toBe('צבעי מים');
        expect(watercolor!.description).toBeDefined();
        expect(watercolor!.descriptionHe).toBeDefined();
        expect(watercolor!.thumbnailUrl).toBeDefined();
        expect(typeof watercolor!.processingTime).toBe('number');
      });

      it('should include the original (no filter) style', async () => {
        const styles = await flush(mockClient.products.getStyles());
        const original = styles.find(s => s.id === 'original');

        expect(original).toBeDefined();
        expect(original!.processingTime).toBe(0);
      });
    });

    describe('getSizes', () => {
      it('should return an array of sizes', async () => {
        const sizes = await flush(mockClient.products.getSizes());

        expect(Array.isArray(sizes)).toBe(true);
        expect(sizes.length).toBeGreaterThan(0);
      });

      it('should include expected size properties', async () => {
        const sizes = await flush(mockClient.products.getSizes());
        const a4 = sizes.find(s => s.id === 'A4');

        expect(a4).toBeDefined();
        expect(a4!.name).toBe('A4');
        expect(a4!.dimensions).toBeDefined();
        expect(a4!.dimensionsCm).toBeDefined();
        expect(a4!.dimensionsCm.width).toBe(21);
        expect(a4!.dimensionsCm.height).toBe(29.7);
        expect(typeof a4!.price).toBe('number');
        expect(a4!.price).toBe(129);
      });

      it('should have A5, A4, A3, A2 sizes', async () => {
        const sizes = await flush(mockClient.products.getSizes());
        const ids = sizes.map(s => s.id);

        expect(ids).toContain('A5');
        expect(ids).toContain('A4');
        expect(ids).toContain('A3');
        expect(ids).toContain('A2');
      });
    });

    describe('getPapers', () => {
      it('should return an array of papers', async () => {
        const papers = await flush(mockClient.products.getPapers());

        expect(Array.isArray(papers)).toBe(true);
        expect(papers.length).toBeGreaterThan(0);
      });

      it('should include expected paper properties', async () => {
        const papers = await flush(mockClient.products.getPapers());
        const canvas = papers.find(p => p.id === 'canvas');

        expect(canvas).toBeDefined();
        expect(canvas!.name).toBe('Canvas Texture');
        expect(canvas!.nameHe).toBe('קנבס');
        expect(typeof canvas!.priceModifier).toBe('number');
        expect(canvas!.priceModifier).toBe(30);
      });

      it('should have matte, glossy, canvas papers', async () => {
        const papers = await flush(mockClient.products.getPapers());
        const ids = papers.map(p => p.id);

        expect(ids).toContain('matte');
        expect(ids).toContain('glossy');
        expect(ids).toContain('canvas');
      });
    });

    describe('getFrames', () => {
      it('should return an array of frames', async () => {
        const frames = await flush(mockClient.products.getFrames());

        expect(Array.isArray(frames)).toBe(true);
        expect(frames.length).toBeGreaterThan(0);
      });

      it('should include expected frame properties', async () => {
        const frames = await flush(mockClient.products.getFrames());
        const black = frames.find(f => f.id === 'black');

        expect(black).toBeDefined();
        expect(black!.name).toBe('Black Wood');
        expect(black!.nameHe).toBe('עץ שחור');
        expect(typeof black!.price).toBe('number');
        expect(black!.price).toBe(80);
        expect(black!.color).toBe('#1a1a1a');
      });

      it('should have none, black, white, oak frames', async () => {
        const frames = await flush(mockClient.products.getFrames());
        const ids = frames.map(f => f.id);

        expect(ids).toContain('none');
        expect(ids).toContain('black');
        expect(ids).toContain('white');
        expect(ids).toContain('oak');
      });

      it('should have a zero-price "none" frame', async () => {
        const frames = await flush(mockClient.products.getFrames());
        const none = frames.find(f => f.id === 'none');

        expect(none).toBeDefined();
        expect(none!.price).toBe(0);
      });
    });

    describe('calculatePrice', () => {
      it('should calculate price for A4 + matte + no frame', async () => {
        const result = await flush(mockClient.products.calculatePrice({
          style: 'watercolor',
          size: 'A4',
          paperType: 'matte',
          frameType: 'none',
          orientation: 'portrait',
        }));

        expect(result.basePrice).toBe(129);     // A4 price
        expect(result.paperModifier).toBe(0);    // matte is free
        expect(result.framePrice).toBe(0);       // no frame
        expect(result.subtotal).toBe(129);       // 129 + 0 + 0
        expect(result.shipping).toBe(25);        // under 299, so 25
        expect(result.discount).toBe(0);
        expect(result.total).toBe(154);          // 129 + 25 - 0
      });

      it('should calculate price for A3 + canvas + oak (free shipping)', async () => {
        const result = await flush(mockClient.products.calculatePrice({
          style: 'oil_painting',
          size: 'A3',
          paperType: 'canvas',
          frameType: 'oak',
          orientation: 'landscape',
        }));

        expect(result.basePrice).toBe(189);     // A3 price
        expect(result.paperModifier).toBe(30);   // canvas modifier
        expect(result.framePrice).toBe(120);     // oak price
        expect(result.subtotal).toBe(339);       // 189 + 30 + 120
        expect(result.shipping).toBe(0);         // >= 299, free shipping
        expect(result.discount).toBe(0);
        expect(result.total).toBe(339);          // 339 + 0 - 0
      });

      it('should apply free shipping when subtotal >= 299', async () => {
        // A2 (279) + canvas (30) + none (0) = 309 >= 299 => free
        const result = await flush(mockClient.products.calculatePrice({
          style: 'line_art',
          size: 'A2',
          paperType: 'canvas',
          frameType: 'none',
          orientation: 'portrait',
        }));

        expect(result.subtotal).toBe(309);
        expect(result.shipping).toBe(0);
      });

      it('should charge shipping when subtotal < 299', async () => {
        // A5 (89) + matte (0) + none (0) = 89 < 299
        const result = await flush(mockClient.products.calculatePrice({
          style: 'original',
          size: 'A5',
          paperType: 'matte',
          frameType: 'none',
          orientation: 'portrait',
        }));

        expect(result.subtotal).toBe(89);
        expect(result.shipping).toBe(25);
        expect(result.total).toBe(114);
      });

      it('should calculate correct total with all components', async () => {
        // A4 (129) + canvas (30) + black (80) = 239
        const result = await flush(mockClient.products.calculatePrice({
          style: 'watercolor',
          size: 'A4',
          paperType: 'canvas',
          frameType: 'black',
          orientation: 'portrait',
        }));

        expect(result.basePrice).toBe(129);
        expect(result.paperModifier).toBe(30);
        expect(result.framePrice).toBe(80);
        expect(result.subtotal).toBe(239);
        expect(result.shipping).toBe(25);  // 239 < 299
        expect(result.total).toBe(264);
      });

      it('should return a PriceBreakdown with all required fields', async () => {
        const result = await flush(mockClient.products.calculatePrice({
          style: 'watercolor',
          size: 'A4',
          paperType: 'matte',
          frameType: 'none',
          orientation: 'portrait',
        }));

        expect(result).toHaveProperty('basePrice');
        expect(result).toHaveProperty('paperModifier');
        expect(result).toHaveProperty('framePrice');
        expect(result).toHaveProperty('subtotal');
        expect(result).toHaveProperty('shipping');
        expect(result).toHaveProperty('discount');
        expect(result).toHaveProperty('total');
      });
    });
  });

  // ─── Users ──────────────────────────────────────────────

  describe('users', () => {
    let mockClient: typeof import('./mock').mockClient;

    beforeEach(async () => {
      vi.resetModules();
      const mod = await import('./mock');
      mockClient = mod.mockClient;
    });

    describe('get', () => {
      it('should return the logged-in user when id matches', async () => {
        await flush(mockClient.auth.login({ email: 'test@test.com', password: 'pw' }));
        const user = await flush(mockClient.users.get('user_mock_001'));

        expect(user).toBeDefined();
        expect(user.email).toBe('test@test.com');
        expect(user.id).toBe('user_mock_001');
      });

      it('should throw when no user is logged in', async () => {
        await expect(flush(mockClient.users.get('user_mock_001'))).rejects.toThrow('User not found');
      });

      it('should throw when id does not match logged-in user', async () => {
        await flush(mockClient.auth.login({ email: 'test@test.com', password: 'pw' }));
        await expect(flush(mockClient.users.get('different_user_id'))).rejects.toThrow('User not found');
      });
    });

    describe('update', () => {
      it('should update user data and return the updated user', async () => {
        await flush(mockClient.auth.login({ email: 'test@test.com', password: 'pw' }));
        const updated = await flush(mockClient.users.update('user_mock_001', { name: 'Updated Name' }));

        expect(updated.name).toBe('Updated Name');
        expect(updated.email).toBe('test@test.com'); // unchanged
        expect(updated.updatedAt).toBeInstanceOf(Date);
      });

      it('should persist updates across subsequent get calls', async () => {
        await flush(mockClient.auth.login({ email: 'test@test.com', password: 'pw' }));
        await flush(mockClient.users.update('user_mock_001', { name: 'Persistent Name' }));
        const fetched = await flush(mockClient.users.get('user_mock_001'));

        expect(fetched.name).toBe('Persistent Name');
      });

      it('should throw when no user is logged in', async () => {
        await expect(
          flush(mockClient.users.update('user_mock_001', { name: 'New' })),
        ).rejects.toThrow('User not found');
      });

      it('should throw when id does not match logged-in user', async () => {
        await flush(mockClient.auth.login({ email: 'test@test.com', password: 'pw' }));
        await expect(
          flush(mockClient.users.update('different_id', { name: 'New' })),
        ).rejects.toThrow('User not found');
      });
    });

    describe('getAddresses', () => {
      it('should return an empty array', async () => {
        const addresses = await flush(mockClient.users.getAddresses('any_user_id'));

        expect(Array.isArray(addresses)).toBe(true);
        expect(addresses).toHaveLength(0);
      });
    });

    describe('addAddress', () => {
      it('should return the address with a generated id', async () => {
        const address: Address = {
          name: 'Home',
          street: '789 Main St',
          city: 'Jerusalem',
          postalCode: '9100000',
          country: 'Israel',
          phone: '02-1234567',
          isDefault: true,
        };

        const result = await flush(mockClient.users.addAddress('any_user_id', address));

        expect(result.id).toBeDefined();
        expect(result.id).toMatch(/^addr_/);
        expect(result.name).toBe('Home');
        expect(result.street).toBe('789 Main St');
        expect(result.city).toBe('Jerusalem');
        expect(result.postalCode).toBe('9100000');
        expect(result.country).toBe('Israel');
        expect(result.phone).toBe('02-1234567');
        expect(result.isDefault).toBe(true);
      });
    });
  });
});
