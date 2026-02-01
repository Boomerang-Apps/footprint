import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Dropdown selection component with consistent styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    error: {
      control: 'boolean',
      description: 'Show error state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the select',
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

const sizeOptions = [
  { value: 'A5', label: 'A5 (14.8 × 21 ס״מ)' },
  { value: 'A4', label: 'A4 (21 × 29.7 ס״מ)' },
  { value: 'A3', label: 'A3 (29.7 × 42 ס״מ)' },
  { value: 'A2', label: 'A2 (42 × 59.4 ס״מ)' },
];

const frameOptions = [
  { value: 'none', label: 'ללא מסגרת' },
  { value: 'black', label: 'מסגרת שחורה' },
  { value: 'white', label: 'מסגרת לבנה' },
  { value: 'wood', label: 'מסגרת עץ טבעי' },
];

const paperOptions = [
  { value: 'matte', label: 'נייר מט' },
  { value: 'glossy', label: 'נייר מבריק' },
  { value: 'canvas', label: 'קנבס' },
];

export const Default: Story = {
  args: {
    options: sizeOptions,
    placeholder: 'בחר גודל',
  },
};

export const WithValue: Story = {
  args: {
    options: sizeOptions,
    defaultValue: 'A4',
  },
};

export const Error: Story = {
  args: {
    options: sizeOptions,
    placeholder: 'בחר גודל',
    error: true,
  },
};

export const Disabled: Story = {
  args: {
    options: sizeOptions,
    defaultValue: 'A4',
    disabled: true,
  },
};

export const FrameSelection: Story = {
  args: {
    options: frameOptions,
    placeholder: 'בחר סוג מסגרת',
  },
};

export const PaperSelection: Story = {
  args: {
    options: paperOptions,
    placeholder: 'בחר סוג נייר',
  },
};

export const ProductConfig: Story = {
  name: 'Product Configuration Example',
  render: () => (
    <div className="space-y-4" style={{ width: '300px' }}>
      <div>
        <label className="block text-sm font-medium mb-1">גודל</label>
        <Select options={sizeOptions} placeholder="בחר גודל" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">סוג נייר</label>
        <Select options={paperOptions} defaultValue="matte" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">מסגרת</label>
        <Select options={frameOptions} defaultValue="none" />
      </div>
    </div>
  ),
};

export const AddressForm: Story = {
  name: 'Address Form Example',
  render: () => {
    const cityOptions = [
      { value: 'tel-aviv', label: 'תל אביב' },
      { value: 'jerusalem', label: 'ירושלים' },
      { value: 'haifa', label: 'חיפה' },
      { value: 'beer-sheva', label: 'באר שבע' },
      { value: 'other', label: 'אחר' },
    ];

    return (
      <div className="space-y-4" style={{ width: '300px' }}>
        <div>
          <label className="block text-sm font-medium mb-1">עיר</label>
          <Select options={cityOptions} placeholder="בחר עיר" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">עיר (שגיאה)</label>
          <Select options={cityOptions} placeholder="בחר עיר" error />
        </div>
      </div>
    );
  },
};
