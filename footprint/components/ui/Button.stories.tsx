import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Primary interaction element. Supports multiple variants, sizes, and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive', 'outline'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon'],
      description: 'Size of the button',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch to full width',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'כפתור ראשי',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'כפתור משני',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    children: 'כפתור שקוף',
    variant: 'ghost',
  },
};

export const Destructive: Story = {
  args: {
    children: 'מחק',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'כפתור מסגרת',
    variant: 'outline',
  },
};

export const Small: Story = {
  args: {
    children: 'קטן',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: 'בינוני',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: 'גדול',
    size: 'lg',
  },
};

export const Loading: Story = {
  args: {
    children: 'טוען...',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'לא זמין',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'כפתור רחב',
    fullWidth: true,
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button variant="primary">ראשי</Button>
        <Button variant="secondary">משני</Button>
        <Button variant="ghost">שקוף</Button>
        <Button variant="outline">מסגרת</Button>
        <Button variant="destructive">מחק</Button>
      </div>
      <div className="flex gap-2 items-center">
        <Button size="sm">קטן</Button>
        <Button size="md">בינוני</Button>
        <Button size="lg">גדול</Button>
      </div>
    </div>
  ),
};
