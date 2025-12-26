/**
 * Order Store
 * 
 * Manages the order creation flow state using Zustand.
 * Persists state during the multi-step order creation process.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StyleType, SizeType, PaperType, FrameType, Address, PriceBreakdown } from '@/types';
import { applyDiscount, type ApplyDiscountResult } from '@/lib/pricing/discounts';
import {
  getMinDeliveryDate as getMinDate,
  getMaxDeliveryDate as getMaxDate,
  isValidDeliveryDate as isValidDate,
  formatDeliveryDate,
  parseDeliveryDate,
} from '@/lib/delivery/dates';

/**
 * Discount validation state
 */
export interface DiscountValidation {
  isValidating: boolean;
  error: string | null;
  appliedDiscount: ApplyDiscountResult | null;
}

interface OrderState {
  // Step tracking
  currentStep: 'upload' | 'style' | 'customize' | 'checkout' | 'complete';
  
  // Image data
  originalImage: string | null;
  originalImageFile: File | null;
  transformedImage: string | null;
  isTransforming: boolean;
  
  // Style selection
  selectedStyle: StyleType;
  
  // Product configuration
  size: SizeType;
  paperType: PaperType;
  frameType: FrameType;
  
  // Gift options
  isGift: boolean;
  giftMessage: string;
  giftWrap: boolean;

  // Addresses
  shippingAddress: Address | null;
  billingAddress: Address | null;
  useSameAddress: boolean;

  // Recipient (for gift orders)
  recipientAddress: Address | null;
  recipientName: string;
  useRecipientAddress: boolean;

  // Pricing
  pricing: PriceBreakdown | null;
  discountCode: string;
  discountValidation: DiscountValidation;

  // Scheduled Delivery (GF-05)
  scheduledDeliveryDate: string | null;

  // Order result
  orderId: string | null;
}

interface OrderActions {
  // Navigation
  setStep: (step: OrderState['currentStep']) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Image
  setOriginalImage: (url: string, file?: File) => void;
  setTransformedImage: (url: string | null) => void;
  setIsTransforming: (value: boolean) => void;
  
  // Style
  setSelectedStyle: (style: StyleType) => void;
  
  // Configuration
  setSize: (size: SizeType) => void;
  setPaperType: (paper: PaperType) => void;
  setFrameType: (frame: FrameType) => void;
  
  // Gift
  setIsGift: (value: boolean) => void;
  setGiftMessage: (message: string) => void;
  setGiftWrap: (value: boolean) => void;
  
  // Addresses
  setShippingAddress: (address: Address) => void;
  setBillingAddress: (address: Address | null) => void;
  setUseSameAddress: (value: boolean) => void;

  // Recipient
  setRecipientAddress: (address: Address | null) => void;
  setRecipientName: (name: string) => void;
  setUseRecipientAddress: (value: boolean) => void;

  // Pricing
  setPricing: (pricing: PriceBreakdown) => void;
  setDiscountCode: (code: string) => void;

  // Discount
  applyDiscountCode: () => void;
  clearDiscount: () => void;
  hasAppliedDiscount: () => boolean;
  getDiscountAmount: () => number;

  // Scheduled Delivery (GF-05)
  setScheduledDeliveryDate: (date: string | null) => void;
  clearScheduledDeliveryDate: () => void;
  getMinDeliveryDate: () => string;
  getMaxDeliveryDate: () => string;
  isValidDeliveryDate: (date: string) => boolean;

  // Order
  setOrderId: (id: string) => void;

  // Reset
  reset: () => void;
}

const initialState: OrderState = {
  currentStep: 'upload',
  originalImage: null,
  originalImageFile: null,
  transformedImage: null,
  isTransforming: false,
  selectedStyle: 'original',
  size: 'A4',
  paperType: 'matte',
  frameType: 'none',
  isGift: false,
  giftMessage: '',
  giftWrap: false,
  shippingAddress: null,
  billingAddress: null,
  useSameAddress: true,
  recipientAddress: null,
  recipientName: '',
  useRecipientAddress: false,
  pricing: null,
  discountCode: '',
  discountValidation: {
    isValidating: false,
    error: null,
    appliedDiscount: null,
  },
  scheduledDeliveryDate: null,
  orderId: null,
};

const stepOrder: OrderState['currentStep'][] = ['upload', 'style', 'customize', 'checkout', 'complete'];

export const useOrderStore = create<OrderState & OrderActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Navigation
      setStep: (step) => set({ currentStep: step }),
      
      nextStep: () => {
        const current = get().currentStep;
        const currentIndex = stepOrder.indexOf(current);
        if (currentIndex < stepOrder.length - 1) {
          set({ currentStep: stepOrder[currentIndex + 1] });
        }
      },
      
      prevStep: () => {
        const current = get().currentStep;
        const currentIndex = stepOrder.indexOf(current);
        if (currentIndex > 0) {
          set({ currentStep: stepOrder[currentIndex - 1] });
        }
      },

      // Image
      setOriginalImage: (url, file) => set({ 
        originalImage: url, 
        originalImageFile: file || null,
        transformedImage: null, // Reset transformed when new image uploaded
      }),
      
      setTransformedImage: (url) => set({ transformedImage: url }),
      
      setIsTransforming: (value) => set({ isTransforming: value }),

      // Style
      setSelectedStyle: (style) => set({ selectedStyle: style }),

      // Configuration
      setSize: (size) => set({ size }),
      setPaperType: (paper) => set({ paperType: paper }),
      setFrameType: (frame) => set({ frameType: frame }),

      // Gift
      setIsGift: (value) => set({ isGift: value }),
      setGiftMessage: (message) => set({ giftMessage: message }),
      setGiftWrap: (value) => set({ giftWrap: value }),

      // Addresses
      setShippingAddress: (address) => set({ shippingAddress: address }),
      setBillingAddress: (address) => set({ billingAddress: address }),
      setUseSameAddress: (value) => set({ useSameAddress: value }),

      // Recipient
      setRecipientAddress: (address) => set({ recipientAddress: address }),
      setRecipientName: (name) => set({ recipientName: name }),
      setUseRecipientAddress: (value) => set({ useRecipientAddress: value }),

      // Pricing
      setPricing: (pricing) => set({ pricing }),
      setDiscountCode: (code) =>
        set({
          discountCode: code,
          // Clear error when code changes
          discountValidation: {
            isValidating: false,
            error: null,
            appliedDiscount: null,
          },
        }),

      // Discount
      applyDiscountCode: () => {
        const state = get();
        const subtotal = state.pricing?.subtotal ?? 0;

        // Apply discount using pricing library
        const result = applyDiscount(state.discountCode, subtotal);

        // Update pricing with discount
        if (result.valid && state.pricing) {
          set({
            discountValidation: {
              isValidating: false,
              error: null,
              appliedDiscount: result,
            },
            pricing: {
              ...state.pricing,
              discount: result.discount,
              total: state.pricing.subtotal - result.discount + state.pricing.shipping,
            },
          });
        } else {
          set({
            discountValidation: {
              isValidating: false,
              error: result.error ?? null,
              appliedDiscount: result,
            },
          });
        }
      },

      clearDiscount: () => {
        const state = get();

        // Reset pricing discount
        if (state.pricing) {
          set({
            discountCode: '',
            discountValidation: {
              isValidating: false,
              error: null,
              appliedDiscount: null,
            },
            pricing: {
              ...state.pricing,
              discount: 0,
              total: state.pricing.subtotal + state.pricing.shipping,
            },
          });
        } else {
          set({
            discountCode: '',
            discountValidation: {
              isValidating: false,
              error: null,
              appliedDiscount: null,
            },
          });
        }
      },

      hasAppliedDiscount: () => {
        const state = get();
        return state.discountValidation.appliedDiscount?.valid === true;
      },

      getDiscountAmount: () => {
        const state = get();
        if (state.discountValidation.appliedDiscount?.valid) {
          return state.discountValidation.appliedDiscount.discount;
        }
        return 0;
      },

      // Scheduled Delivery (GF-05)
      setScheduledDeliveryDate: (date) => set({ scheduledDeliveryDate: date }),

      clearScheduledDeliveryDate: () => set({ scheduledDeliveryDate: null }),

      getMinDeliveryDate: () => {
        return formatDeliveryDate(getMinDate());
      },

      getMaxDeliveryDate: () => {
        return formatDeliveryDate(getMaxDate());
      },

      isValidDeliveryDate: (dateString) => {
        const date = parseDeliveryDate(dateString);
        if (!date) {
          return false;
        }
        return isValidDate(date);
      },

      // Order
      setOrderId: (id) => set({ orderId: id }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'footprint-order',
      partialize: (state) => ({
        // Only persist certain fields
        originalImage: state.originalImage,
        transformedImage: state.transformedImage,
        selectedStyle: state.selectedStyle,
        size: state.size,
        paperType: state.paperType,
        frameType: state.frameType,
        isGift: state.isGift,
        giftMessage: state.giftMessage,
        currentStep: state.currentStep,
        // Recipient (for gift orders)
        recipientAddress: state.recipientAddress,
        recipientName: state.recipientName,
        useRecipientAddress: state.useRecipientAddress,
        // Scheduled Delivery (GF-05)
        scheduledDeliveryDate: state.scheduledDeliveryDate,
      }),
    }
  )
);
