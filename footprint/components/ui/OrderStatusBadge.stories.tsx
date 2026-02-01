import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { OrderStatusBadge } from './OrderStatusBadge';

const meta: Meta<typeof OrderStatusBadge> = {
  title: 'UI/OrderStatusBadge',
  component: OrderStatusBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Visual indicator for order status with icon, color, and Hebrew text.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['pending', 'paid', 'processing', 'printing', 'shipped', 'delivered', 'cancelled'],
      description: 'Order status to display',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size variant',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  args: {
    status: 'pending',
  },
};

export const Paid: Story = {
  args: {
    status: 'paid',
  },
};

export const Processing: Story = {
  args: {
    status: 'processing',
  },
};

export const Printing: Story = {
  args: {
    status: 'printing',
  },
};

export const Shipped: Story = {
  args: {
    status: 'shipped',
  },
};

export const Delivered: Story = {
  args: {
    status: 'delivered',
  },
};

export const Cancelled: Story = {
  args: {
    status: 'cancelled',
  },
};

export const SmallSize: Story = {
  args: {
    status: 'processing',
    size: 'sm',
  },
};

export const MediumSize: Story = {
  args: {
    status: 'processing',
    size: 'md',
  },
};

export const AllStatuses: Story = {
  name: 'All Status States',
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-zinc-400 w-24 text-sm">pending:</span>
        <OrderStatusBadge status="pending" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-zinc-400 w-24 text-sm">paid:</span>
        <OrderStatusBadge status="paid" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-zinc-400 w-24 text-sm">processing:</span>
        <OrderStatusBadge status="processing" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-zinc-400 w-24 text-sm">printing:</span>
        <OrderStatusBadge status="printing" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-zinc-400 w-24 text-sm">shipped:</span>
        <OrderStatusBadge status="shipped" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-zinc-400 w-24 text-sm">delivered:</span>
        <OrderStatusBadge status="delivered" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-zinc-400 w-24 text-sm">cancelled:</span>
        <OrderStatusBadge status="cancelled" />
      </div>
    </div>
  ),
};

export const SizeComparison: Story = {
  name: 'Size Comparison',
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-zinc-400 w-16 text-sm">sm:</span>
        <OrderStatusBadge status="processing" size="sm" />
        <OrderStatusBadge status="shipped" size="sm" />
        <OrderStatusBadge status="delivered" size="sm" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-zinc-400 w-16 text-sm">md:</span>
        <OrderStatusBadge status="processing" size="md" />
        <OrderStatusBadge status="shipped" size="md" />
        <OrderStatusBadge status="delivered" size="md" />
      </div>
    </div>
  ),
};

export const OrderListExample: Story = {
  name: 'Order List Example',
  render: () => (
    <div className="space-y-3 p-4 bg-zinc-900 rounded-lg" style={{ width: '350px' }}>
      <div className="flex justify-between items-center p-3 bg-zinc-800 rounded">
        <div>
          <p className="text-white font-medium">הזמנה #12345</p>
          <p className="text-zinc-400 text-sm">15 בינואר 2026</p>
        </div>
        <OrderStatusBadge status="delivered" />
      </div>
      <div className="flex justify-between items-center p-3 bg-zinc-800 rounded">
        <div>
          <p className="text-white font-medium">הזמנה #12346</p>
          <p className="text-zinc-400 text-sm">18 בינואר 2026</p>
        </div>
        <OrderStatusBadge status="shipped" />
      </div>
      <div className="flex justify-between items-center p-3 bg-zinc-800 rounded">
        <div>
          <p className="text-white font-medium">הזמנה #12347</p>
          <p className="text-zinc-400 text-sm">20 בינואר 2026</p>
        </div>
        <OrderStatusBadge status="processing" />
      </div>
      <div className="flex justify-between items-center p-3 bg-zinc-800 rounded">
        <div>
          <p className="text-white font-medium">הזמנה #12348</p>
          <p className="text-zinc-400 text-sm">22 בינואר 2026</p>
        </div>
        <OrderStatusBadge status="pending" />
      </div>
    </div>
  ),
};

export const OrderDetailHeader: Story = {
  name: 'Order Detail Header Example',
  render: () => (
    <div className="p-6 bg-zinc-900 rounded-lg" style={{ width: '400px' }}>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-white text-xl font-bold">הזמנה #12345</h2>
          <p className="text-zinc-400 text-sm mt-1">נוצרה ב-15 בינואר 2026</p>
        </div>
        <OrderStatusBadge status="shipped" />
      </div>
      <hr className="border-zinc-700 my-4" />
      <div className="space-y-2">
        <p className="text-zinc-400 text-sm">זמן משוער להגעה:</p>
        <p className="text-white font-medium">25-27 בינואר 2026</p>
      </div>
    </div>
  ),
};
