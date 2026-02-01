import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { Progress } from './progress';

const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Progress bar component for showing completion status.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100 },
      description: 'Progress value (0-100)',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
  },
};

export const Empty: Story = {
  args: {
    value: 0,
  },
};

export const Quarter: Story = {
  args: {
    value: 25,
  },
};

export const Half: Story = {
  args: {
    value: 50,
  },
};

export const ThreeQuarters: Story = {
  args: {
    value: 75,
  },
};

export const Complete: Story = {
  args: {
    value: 100,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-4" style={{ width: '300px' }}>
      <div>
        <span className="text-sm text-zinc-500 mb-1 block">0%</span>
        <Progress value={0} />
      </div>
      <div>
        <span className="text-sm text-zinc-500 mb-1 block">25%</span>
        <Progress value={25} />
      </div>
      <div>
        <span className="text-sm text-zinc-500 mb-1 block">50%</span>
        <Progress value={50} />
      </div>
      <div>
        <span className="text-sm text-zinc-500 mb-1 block">75%</span>
        <Progress value={75} />
      </div>
      <div>
        <span className="text-sm text-zinc-500 mb-1 block">100%</span>
        <Progress value={100} />
      </div>
    </div>
  ),
};

export const UploadProgress: Story = {
  render: () => (
    <div className="p-4 bg-zinc-100 rounded-lg" style={{ width: '300px' }}>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">מעלה תמונה...</span>
        <span className="text-sm text-zinc-500">67%</span>
      </div>
      <Progress value={67} />
      <p className="text-xs text-zinc-500 mt-2">2.4MB מתוך 3.6MB</p>
    </div>
  ),
};

export const OrderProgress: Story = {
  render: () => (
    <div className="p-4 bg-zinc-100 rounded-lg" style={{ width: '300px' }}>
      <h3 className="font-medium mb-3">התקדמות ההזמנה</h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>עיבוד</span>
            <span className="text-green-600">הושלם</span>
          </div>
          <Progress value={100} />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>הדפסה</span>
            <span className="text-blue-600">בתהליך</span>
          </div>
          <Progress value={60} />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>משלוח</span>
            <span className="text-zinc-400">ממתין</span>
          </div>
          <Progress value={0} />
        </div>
      </div>
    </div>
  ),
};
