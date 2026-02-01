import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { Separator } from './separator';

const meta: Meta<typeof Separator> = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Visual divider for separating content sections.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Orientation of the separator',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ height: '100px' }}>
        <Story />
      </div>
    ),
  ],
};

export const BetweenText: Story = {
  render: () => (
    <div style={{ width: '300px' }}>
      <p className="text-sm">תוכן למעלה</p>
      <Separator className="my-4" />
      <p className="text-sm">תוכן למטה</p>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="p-4 bg-white border rounded-lg" style={{ width: '300px' }}>
      <h3 className="font-medium">פרטי הזמנה</h3>
      <p className="text-sm text-zinc-500">הזמנה #12345</p>
      <Separator className="my-4" />
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>סה״כ ביניים</span>
          <span>₪289</span>
        </div>
        <div className="flex justify-between">
          <span>משלוח</span>
          <span>₪29</span>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex justify-between font-medium">
        <span>סה״כ</span>
        <span>₪318</span>
      </div>
    </div>
  ),
};

export const VerticalInline: Story = {
  render: () => (
    <div className="flex items-center gap-4 h-6">
      <span className="text-sm">פריט 1</span>
      <Separator orientation="vertical" />
      <span className="text-sm">פריט 2</span>
      <Separator orientation="vertical" />
      <span className="text-sm">פריט 3</span>
    </div>
  ),
};

export const NavSeparator: Story = {
  render: () => (
    <nav className="flex items-center gap-2 text-sm">
      <a href="#" className="text-blue-600 hover:underline">דף הבית</a>
      <Separator orientation="vertical" className="h-4" />
      <a href="#" className="text-blue-600 hover:underline">מוצרים</a>
      <Separator orientation="vertical" className="h-4" />
      <a href="#" className="text-blue-600 hover:underline">הדפסים</a>
      <Separator orientation="vertical" className="h-4" />
      <span className="text-zinc-500">פורטרט משפחתי</span>
    </nav>
  ),
};

export const FormSections: Story = {
  render: () => (
    <div className="space-y-4" style={{ width: '300px' }}>
      <div>
        <h4 className="font-medium mb-2">פרטים אישיים</h4>
        <p className="text-sm text-zinc-500">שם, אימייל, טלפון</p>
      </div>
      <Separator />
      <div>
        <h4 className="font-medium mb-2">כתובת למשלוח</h4>
        <p className="text-sm text-zinc-500">רחוב, עיר, מיקוד</p>
      </div>
      <Separator />
      <div>
        <h4 className="font-medium mb-2">אמצעי תשלום</h4>
        <p className="text-sm text-zinc-500">כרטיס אשראי, PayPal</p>
      </div>
    </div>
  ),
};
