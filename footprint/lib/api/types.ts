/**
 * API Client Interface
 * 
 * This interface defines the contract that both mock and Uzerflow clients must implement.
 * When Uzerflow is ready, it just needs to implement this interface.
 */

import type { 
  User, LoginInput, RegisterInput,
  Order, CreateOrderInput, OrderStatus,
  Style, Size, Paper, Frame, ProductConfig, PriceBreakdown 
} from '@/types';

export interface ApiClient {
  // Authentication
  auth: {
    login(input: LoginInput): Promise<User>;
    register(input: RegisterInput): Promise<User>;
    logout(): Promise<void>;
    getSession(): Promise<User | null>;
    resetPassword(email: string): Promise<void>;
  };

  // Orders
  orders: {
    create(input: CreateOrderInput): Promise<Order>;
    get(id: string): Promise<Order>;
    list(userId?: string): Promise<Order[]>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
    addTracking(id: string, trackingNumber: string, carrier: string): Promise<Order>;
  };

  // Products & Pricing
  products: {
    getStyles(): Promise<Style[]>;
    getSizes(): Promise<Size[]>;
    getPapers(): Promise<Paper[]>;
    getFrames(): Promise<Frame[]>;
    calculatePrice(config: ProductConfig): Promise<PriceBreakdown>;
  };

  // Users
  users: {
    get(id: string): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
    getAddresses(userId: string): Promise<Address[]>;
    addAddress(userId: string, address: Address): Promise<Address>;
  };
}

// Address type for users module
interface Address {
  id?: string;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}
