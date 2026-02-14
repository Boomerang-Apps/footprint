/**
 * Mock API Client
 * 
 * Simulates Uzerflow API responses for local development.
 * Replace with uzerflowClient when Uzerflow is ready.
 */

import type { ApiClient } from './types';
import type {
  User, Order, OrderStatus, CreateOrderInput,
  Style, Size, Paper, Frame, ProductConfig, PriceBreakdown
} from '@/types';
import { demoOrders } from '@/data/demo/orders';
import { logger } from '@/lib/logger';

// Simulated delay for realistic UX testing
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data stores - seeded with demo orders so order history works on page refresh
let mockUser: User | null = null;
const mockOrders: Order[] = [...demoOrders];

// ============================================
// MOCK DATA
// ============================================

const mockStyles: Style[] = [
  { id: 'original', name: 'No Filter', nameHe: 'ללא פילטר', description: 'Keep your photo as-is', descriptionHe: 'שמור על התמונה המקורית', thumbnailUrl: '/styles/original.jpg', processingTime: 0 },
  { id: 'watercolor', name: 'Watercolor', nameHe: 'צבעי מים', description: 'Soft, flowing artistic style', descriptionHe: 'סגנון אמנותי רך וזורם', thumbnailUrl: '/styles/watercolor.jpg', processingTime: 10 },
  { id: 'line_art', name: 'Line Art', nameHe: 'ציור קווי', description: 'Clean minimalist lines', descriptionHe: 'קווים נקיים ומינימליסטיים', thumbnailUrl: '/styles/line-art.jpg', processingTime: 6 },
  { id: 'line_art_watercolor', name: 'Line + Watercolor', nameHe: 'קווי + צבעי מים', description: 'Lines with watercolor fills', descriptionHe: 'קווים עם מילוי צבעי מים', thumbnailUrl: '/styles/line-watercolor.jpg', processingTime: 12 },
  { id: 'pop_art', name: 'Pop Art', nameHe: 'פופ ארט', description: 'Bold pop art style', descriptionHe: 'סגנון פופ ארט נועז', thumbnailUrl: '/styles/pop-art.jpg', processingTime: 8 },
];

const mockSizes: Size[] = [
  { id: 'A5', name: 'A5', dimensions: '14.8 × 21 ס"מ', dimensionsCm: { width: 14.8, height: 21 }, price: 89 },
  { id: 'A4', name: 'A4', dimensions: '21 × 29.7 ס"מ', dimensionsCm: { width: 21, height: 29.7 }, price: 129, popular: true },
  { id: 'A3', name: 'A3', dimensions: '29.7 × 42 ס"מ', dimensionsCm: { width: 29.7, height: 42 }, price: 189 },
  { id: 'A2', name: 'A2', dimensions: '42 × 59.4 ס"מ', dimensionsCm: { width: 42, height: 59.4 }, price: 279 },
];

const mockPapers: Paper[] = [
  { id: 'matte', name: 'Fine Art Matte', nameHe: 'מט אמנותי', description: 'Museum quality matte finish', descriptionHe: 'גימור מט באיכות מוזיאון', priceModifier: 0 },
  { id: 'glossy', name: 'Glossy Photo', nameHe: 'מבריק', description: 'Vibrant colors, photo finish', descriptionHe: 'צבעים חיים, גימור צילום', priceModifier: 0 },
  { id: 'canvas', name: 'Canvas Texture', nameHe: 'קנבס', description: 'Textured canvas feel', descriptionHe: 'מרקם קנבס אמנותי', priceModifier: 30 },
];

const mockFrames: Frame[] = [
  { id: 'none', name: 'No Frame', nameHe: 'ללא מסגרת', color: 'transparent', price: 0 },
  { id: 'black', name: 'Black Wood', nameHe: 'עץ שחור', color: '#1a1a1a', price: 80, popular: true },
  { id: 'white', name: 'White Wood', nameHe: 'עץ לבן', color: '#f5f5f5', price: 80 },
  { id: 'oak', name: 'Natural Oak', nameHe: 'אלון טבעי', color: '#c4a77d', price: 120 },
];

// ============================================
// MOCK CLIENT IMPLEMENTATION
// ============================================

export const mockClient: ApiClient = {
  // Authentication
  auth: {
    async login({ email, password }) {
      await delay(500);
      // Simulate login - accept any credentials for dev
      mockUser = {
        id: 'user_mock_001',
        email,
        name: email.split('@')[0],
        preferredLanguage: 'he',
        isAdmin: email.includes('admin'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return mockUser;
    },

    async register({ email, password, name, phone }) {
      await delay(500);
      mockUser = {
        id: `user_${Date.now()}`,
        email,
        name,
        phone,
        preferredLanguage: 'he',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return mockUser;
    },

    async logout() {
      await delay(200);
      mockUser = null;
    },

    async getSession() {
      await delay(100);
      return mockUser;
    },

    async resetPassword(email) {
      await delay(500);
      logger.info('Mock: password reset email sent', { email });
    },
  },

  // Orders
  orders: {
    async create(input) {
      await delay(800);
      const order: Order = {
        id: `order_${Date.now()}`,
        userId: mockUser?.id || 'guest',
        status: 'pending',
        items: input.items.map((item, index) => ({
          id: `item_${Date.now()}_${index}`,
          orderId: '',
          originalImageUrl: item.originalImageUrl,
          transformedImageUrl: item.transformedImageUrl || null,
          style: item.style,
          size: item.size,
          paperType: item.paperType,
          frameType: item.frameType,
          price: 0, // Will be calculated
          createdAt: new Date(),
        })),
        subtotal: 0,
        shipping: 25,
        discount: 0,
        total: 0,
        isGift: input.isGift,
        giftMessage: input.giftMessage || null,
        giftWrap: input.giftWrap || false,
        wrappingStyle: input.wrappingStyle || null,
        scheduledDeliveryDate: input.scheduledDeliveryDate || null,
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress || input.shippingAddress,
        paymentTransactionId: null,
        paidAt: null,
        trackingNumber: null,
        carrier: null,
        shippedAt: null,
        deliveredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockOrders.push(order);
      return order;
    },

    async get(id) {
      await delay(300);
      const order = mockOrders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      return order;
    },

    async list(userId) {
      await delay(300);
      if (userId) {
        return mockOrders.filter(o => o.userId === userId);
      }
      return mockOrders;
    },

    async updateStatus(id, status) {
      await delay(300);
      const order = mockOrders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      order.status = status;
      order.updatedAt = new Date();
      if (status === 'paid') order.paidAt = new Date();
      if (status === 'shipped') order.shippedAt = new Date();
      if (status === 'delivered') order.deliveredAt = new Date();
      return order;
    },

    async addTracking(id, trackingNumber, carrier) {
      await delay(300);
      const order = mockOrders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      order.trackingNumber = trackingNumber;
      order.carrier = carrier;
      order.updatedAt = new Date();
      return order;
    },
  },

  // Products
  products: {
    async getStyles() {
      await delay(200);
      return mockStyles;
    },

    async getSizes() {
      await delay(200);
      return mockSizes;
    },

    async getPapers() {
      await delay(200);
      return mockPapers;
    },

    async getFrames() {
      await delay(200);
      return mockFrames;
    },

    async calculatePrice(config) {
      await delay(100);
      const size = mockSizes.find(s => s.id === config.size)!;
      const paper = mockPapers.find(p => p.id === config.paperType)!;
      const frame = mockFrames.find(f => f.id === config.frameType)!;

      const basePrice = size.price;
      const paperModifier = paper.priceModifier;
      const framePrice = frame.price;
      const subtotal = basePrice + paperModifier + framePrice;
      const shipping = subtotal >= 299 ? 0 : 25;
      const discount = 0;
      const total = subtotal + shipping - discount;

      return {
        basePrice,
        paperModifier,
        framePrice,
        subtotal,
        shipping,
        discount,
        total,
      };
    },
  },

  // Users
  users: {
    async get(id) {
      await delay(200);
      if (mockUser && mockUser.id === id) return mockUser;
      throw new Error('User not found');
    },

    async update(id, data) {
      await delay(300);
      if (mockUser && mockUser.id === id) {
        mockUser = { ...mockUser, ...data, updatedAt: new Date() };
        return mockUser;
      }
      throw new Error('User not found');
    },

    async getAddresses(userId) {
      await delay(200);
      return []; // No saved addresses in mock
    },

    async addAddress(userId, address) {
      await delay(300);
      return { ...address, id: `addr_${Date.now()}` };
    },
  },
};
