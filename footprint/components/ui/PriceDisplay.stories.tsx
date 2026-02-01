import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { PriceDisplay } from './PriceDisplay';

const meta: Meta<typeof PriceDisplay> = {
  title: 'UI/PriceDisplay',
  component: PriceDisplay,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'ILS currency formatting component. Displays prices in Israeli Shekels with proper formatting.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    amount: {
      control: 'number',
      description: 'Amount in ILS (can be negative for discounts)',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size variant',
    },
    strikethrough: {
      control: 'boolean',
      description: 'Show strikethrough for original prices',
    },
    showZeroAsPrice: {
      control: 'boolean',
      description: 'Show "Free" text for zero amounts',
    },
    showThousandsSeparator: {
      control: 'boolean',
      description: 'Add thousands separator (e.g., 1,500)',
    },
    locale: {
      control: 'select',
      options: ['he', 'en'],
      description: 'Locale for text',
    },
    color: {
      control: 'select',
      options: ['default', 'success', 'muted'],
      description: 'Color variant',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    amount: 189,
  },
};

export const Small: Story = {
  args: {
    amount: 89,
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    amount: 189,
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    amount: 289,
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    amount: 399,
    size: 'xl',
  },
};

export const WithDecimals: Story = {
  args: {
    amount: 189.90,
    size: 'lg',
  },
};

export const WithThousandsSeparator: Story = {
  args: {
    amount: 1500,
    showThousandsSeparator: true,
    size: 'lg',
  },
};

export const LargeAmount: Story = {
  args: {
    amount: 12500,
    showThousandsSeparator: true,
    size: 'xl',
  },
};

export const Free: Story = {
  args: {
    amount: 0,
  },
};

export const FreeEnglish: Story = {
  args: {
    amount: 0,
    locale: 'en',
  },
};

export const ZeroAsPrice: Story = {
  args: {
    amount: 0,
    showZeroAsPrice: true,
  },
};

export const Strikethrough: Story = {
  args: {
    amount: 299,
    strikethrough: true,
    size: 'lg',
  },
};

export const Discount: Story = {
  args: {
    amount: -50,
    size: 'lg',
  },
};

export const SuccessColor: Story = {
  args: {
    amount: 189,
    color: 'success',
    size: 'lg',
  },
};

export const MutedColor: Story = {
  args: {
    amount: 189,
    color: 'muted',
    size: 'lg',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4 bg-zinc-900 p-6 rounded-lg">
      <div className="flex items-center gap-4">
        <span className="text-zinc-400 w-16">sm:</span>
        <PriceDisplay amount={189} size="sm" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-zinc-400 w-16">md:</span>
        <PriceDisplay amount={189} size="md" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-zinc-400 w-16">lg:</span>
        <PriceDisplay amount={189} size="lg" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-zinc-400 w-16">xl:</span>
        <PriceDisplay amount={189} size="xl" />
      </div>
    </div>
  ),
};

export const PriceWithDiscount: Story = {
  name: 'Price with Discount',
  render: () => (
    <div className="flex items-center gap-3 bg-zinc-900 p-4 rounded-lg">
      <PriceDisplay amount={299} strikethrough size="lg" />
      <PriceDisplay amount={199} size="xl" />
      <span className="text-green-500 text-sm">(-33%)</span>
    </div>
  ),
};

export const ProductPricing: Story = {
  name: 'Product Pricing Example',
  render: () => (
    <div className="space-y-6 bg-zinc-900 p-6 rounded-lg" style={{ width: '300px' }}>
      <div className="space-y-2">
        <h3 className="text-white font-medium">הדפס אומנותי A4</h3>
        <div className="flex items-baseline gap-2">
          <PriceDisplay amount={189} size="xl" />
          <span className="text-zinc-500 text-sm">כולל מע״מ</span>
        </div>
      </div>
      <hr className="border-zinc-700" />
      <div className="space-y-2">
        <h3 className="text-white font-medium">הדפס אומנותי A3</h3>
        <div className="flex items-baseline gap-2">
          <PriceDisplay amount={349} strikethrough size="lg" />
          <PriceDisplay amount={289} size="xl" />
        </div>
        <span className="text-green-500 text-sm">חיסכון של ₪60!</span>
      </div>
    </div>
  ),
};

export const OrderSummary: Story = {
  name: 'Order Summary Example',
  render: () => (
    <div className="space-y-3 bg-zinc-900 p-6 rounded-lg" style={{ width: '300px' }}>
      <div className="flex justify-between">
        <span className="text-zinc-400">סה״כ ביניים</span>
        <PriceDisplay amount={378} />
      </div>
      <div className="flex justify-between">
        <span className="text-zinc-400">הנחה</span>
        <PriceDisplay amount={-50} />
      </div>
      <div className="flex justify-between">
        <span className="text-zinc-400">משלוח</span>
        <PriceDisplay amount={0} />
      </div>
      <hr className="border-zinc-700" />
      <div className="flex justify-between">
        <span className="text-white font-medium">סה״כ לתשלום</span>
        <PriceDisplay amount={328} size="lg" />
      </div>
    </div>
  ),
};
