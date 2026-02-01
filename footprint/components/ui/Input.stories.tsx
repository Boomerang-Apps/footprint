import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Text entry field with error states, RTL support, and accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'tel', 'number', 'search'],
      description: 'Input type',
    },
    error: {
      control: 'boolean',
      description: 'Show error state styling',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message to display',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
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
    placeholder: 'הזן טקסט...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'שלום עולם',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'סיסמה',
  },
};

export const Phone: Story = {
  args: {
    type: 'tel',
    placeholder: '050-1234567',
  },
};

export const Error: Story = {
  args: {
    error: true,
    defaultValue: 'ערך לא תקין',
  },
};

export const ErrorWithMessage: Story = {
  args: {
    error: true,
    errorMessage: 'שדה חובה',
    placeholder: 'שם מלא',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'לא ניתן לעריכה',
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-4" style={{ width: '300px' }}>
      <div>
        <label className="block text-sm font-medium mb-1">שם מלא</label>
        <Input placeholder="ישראל ישראלי" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">אימייל</label>
        <Input type="email" placeholder="email@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">טלפון</label>
        <Input type="tel" placeholder="050-1234567" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">כתובת (שגיאה)</label>
        <Input error errorMessage="שדה חובה" />
      </div>
    </div>
  ),
};
