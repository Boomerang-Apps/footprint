/**
 * Demo Data Module
 *
 * Centralized demo data for UI testing and development.
 * Provides sample orders, users, addresses, images, and styles.
 *
 * @example
 * import { demoOrders, demoUsers, demoImages } from '@/data/demo';
 *
 * // Get all demo orders
 * const orders = demoOrders;
 *
 * // Get order by status
 * const shippedOrder = getDemoOrderByStatus('shipped');
 *
 * // Create a new demo order
 * const newOrder = createDemoOrder({ status: 'paid' });
 */

// Export demo data collections
export { demoUsers, demoAddresses, createDemoUser } from './users';
export { demoImages, getStylePreviewImage, getRandomOriginalImage } from './images';
export { demoStyles, demoSizes, demoPapers, demoFrames, getStyleById, getPopularStyles } from './products';
export { demoOrders, createDemoOrder, getDemoOrderByStatus, getDemoOrdersByUser } from './orders';

// Re-export types for convenience
export type { User, SavedAddress } from '@/types';
export type { Order, OrderItem, OrderStatus, Address } from '@/types';
export type { Style, StyleType, Size, Paper, Frame } from '@/types';
