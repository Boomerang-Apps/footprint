import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { StepProgress, StepConfig } from './StepProgress';

const meta: Meta<typeof StepProgress> = {
  title: 'UI/StepProgress',
  component: StepProgress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '5-step progress indicator for order flow. Shows current step, completed steps, and supports Hebrew/RTL.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    currentStep: {
      control: { type: 'number', min: 1, max: 5 },
      description: 'Current step (1-indexed)',
    },
    locale: {
      control: 'select',
      options: ['he', 'en'],
      description: 'Language locale',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '600px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const checkoutSteps: StepConfig[] = [
  { key: 'cart', labelEn: 'Cart', labelHe: 'עגלה' },
  { key: 'shipping', labelEn: 'Shipping', labelHe: 'משלוח' },
  { key: 'payment', labelEn: 'Payment', labelHe: 'תשלום' },
  { key: 'review', labelEn: 'Review', labelHe: 'סיכום' },
  { key: 'complete', labelEn: 'Complete', labelHe: 'סיום' },
];

const orderSteps: StepConfig[] = [
  { key: 'received', labelEn: 'Received', labelHe: 'התקבלה' },
  { key: 'processing', labelEn: 'Processing', labelHe: 'בטיפול' },
  { key: 'printing', labelEn: 'Printing', labelHe: 'בהדפסה' },
  { key: 'shipping', labelEn: 'Shipping', labelHe: 'במשלוח' },
  { key: 'delivered', labelEn: 'Delivered', labelHe: 'הגיעה' },
];

export const Step1: Story = {
  args: {
    steps: checkoutSteps,
    currentStep: 1,
    locale: 'he',
  },
};

export const Step2: Story = {
  args: {
    steps: checkoutSteps,
    currentStep: 2,
    locale: 'he',
  },
};

export const Step3: Story = {
  args: {
    steps: checkoutSteps,
    currentStep: 3,
    locale: 'he',
  },
};

export const Step4: Story = {
  args: {
    steps: checkoutSteps,
    currentStep: 4,
    locale: 'he',
  },
};

export const Step5Complete: Story = {
  args: {
    steps: checkoutSteps,
    currentStep: 5,
    locale: 'he',
  },
};

export const EnglishLocale: Story = {
  args: {
    steps: checkoutSteps,
    currentStep: 3,
    locale: 'en',
  },
};

export const OrderProgress: Story = {
  name: 'Order Progress Steps',
  args: {
    steps: orderSteps,
    currentStep: 3,
    locale: 'he',
  },
};

export const AllSteps: Story = {
  name: 'All Step States',
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-3 text-zinc-400">Step 1 - Cart</h3>
        <StepProgress steps={checkoutSteps} currentStep={1} locale="he" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-3 text-zinc-400">Step 2 - Shipping</h3>
        <StepProgress steps={checkoutSteps} currentStep={2} locale="he" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-3 text-zinc-400">Step 3 - Payment</h3>
        <StepProgress steps={checkoutSteps} currentStep={3} locale="he" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-3 text-zinc-400">Step 4 - Review</h3>
        <StepProgress steps={checkoutSteps} currentStep={4} locale="he" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-3 text-zinc-400">Step 5 - Complete</h3>
        <StepProgress steps={checkoutSteps} currentStep={5} locale="he" />
      </div>
    </div>
  ),
};

export const CheckoutFlow: Story = {
  name: 'Checkout Flow Example',
  render: () => (
    <div className="bg-zinc-900 p-6 rounded-lg" style={{ width: '100%' }}>
      <StepProgress steps={checkoutSteps} currentStep={3} locale="he" />
      <div className="mt-8 p-6 bg-zinc-800 rounded-lg">
        <h2 className="text-white text-lg font-bold mb-4">פרטי תשלום</h2>
        <p className="text-zinc-400">טופס תשלום יופיע כאן...</p>
      </div>
    </div>
  ),
};

export const OrderTrackingFlow: Story = {
  name: 'Order Tracking Example',
  render: () => (
    <div className="bg-zinc-900 p-6 rounded-lg" style={{ width: '100%' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-white text-lg font-bold">הזמנה #12345</h2>
          <p className="text-zinc-400 text-sm">נוצרה ב-15 בינואר 2026</p>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          בהדפסה
        </span>
      </div>
      <StepProgress steps={orderSteps} currentStep={3} locale="he" />
      <div className="mt-6 p-4 bg-zinc-800 rounded-lg">
        <p className="text-zinc-400 text-sm">זמן משוער להגעה:</p>
        <p className="text-white font-medium">25-27 בינואר 2026</p>
      </div>
    </div>
  ),
};

export const ThreeSteps: Story = {
  name: 'Three Step Process',
  render: () => {
    const threeSteps: StepConfig[] = [
      { key: 'upload', labelEn: 'Upload', labelHe: 'העלאה' },
      { key: 'customize', labelEn: 'Customize', labelHe: 'עיצוב' },
      { key: 'order', labelEn: 'Order', labelHe: 'הזמנה' },
    ];

    return (
      <div className="space-y-6">
        <StepProgress steps={threeSteps} currentStep={1} locale="he" />
        <StepProgress steps={threeSteps} currentStep={2} locale="he" />
        <StepProgress steps={threeSteps} currentStep={3} locale="he" />
      </div>
    );
  },
};

export const LocaleComparison: Story = {
  name: 'Hebrew vs English',
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-3 text-zinc-400">Hebrew (RTL)</h3>
        <StepProgress steps={checkoutSteps} currentStep={3} locale="he" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-3 text-zinc-400">English (LTR)</h3>
        <StepProgress steps={checkoutSteps} currentStep={3} locale="en" />
      </div>
    </div>
  ),
};
