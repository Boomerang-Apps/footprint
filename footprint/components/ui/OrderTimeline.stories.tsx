import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { OrderTimeline } from './OrderTimeline';

const meta: Meta<typeof OrderTimeline> = {
  title: 'UI/OrderTimeline',
  component: OrderTimeline,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '5-step order status tracker. Displays order progress matching database flow.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    currentStatus: {
      control: 'select',
      options: ['pending', 'paid', 'processing', 'printing', 'shipped', 'delivered', 'cancelled'],
      description: 'Current order status',
    },
    locale: {
      control: 'select',
      options: ['he', 'en'],
      description: 'Language locale',
    },
    layout: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Layout direction',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '500px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  args: {
    currentStatus: 'pending',
    layout: 'horizontal',
  },
};

export const Paid: Story = {
  args: {
    currentStatus: 'paid',
    layout: 'horizontal',
  },
};

export const Processing: Story = {
  args: {
    currentStatus: 'processing',
    layout: 'horizontal',
  },
};

export const Shipped: Story = {
  args: {
    currentStatus: 'shipped',
    layout: 'horizontal',
  },
};

export const Delivered: Story = {
  args: {
    currentStatus: 'delivered',
    layout: 'horizontal',
  },
};

export const Cancelled: Story = {
  args: {
    currentStatus: 'cancelled',
    layout: 'horizontal',
  },
};

export const VerticalLayout: Story = {
  args: {
    currentStatus: 'processing',
    layout: 'vertical',
  },
};

export const English: Story = {
  args: {
    currentStatus: 'shipped',
    locale: 'en',
    layout: 'horizontal',
  },
};

export const AllStatuses: Story = {
  name: 'All Status States',
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-2">התקבלה (Pending)</h3>
        <OrderTimeline currentStatus="pending" layout="horizontal" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">שולם (Paid)</h3>
        <OrderTimeline currentStatus="paid" layout="horizontal" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">בהכנה (Processing)</h3>
        <OrderTimeline currentStatus="processing" layout="horizontal" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">נשלח (Shipped)</h3>
        <OrderTimeline currentStatus="shipped" layout="horizontal" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">הגיע (Delivered)</h3>
        <OrderTimeline currentStatus="delivered" layout="horizontal" />
      </div>
    </div>
  ),
};
