// User Types for Footprint

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  
  // Preferences
  defaultAddress?: SavedAddress;
  preferredLanguage: 'he' | 'en';
  
  // Account
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedAddress {
  id?: string;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
}
