import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Boolean toggle with RTL label positioning support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text to display',
    },
    labelPosition: {
      control: 'select',
      options: ['start', 'end'],
      description: 'Position of label (for RTL support)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the checkbox',
    },
    checked: {
      control: 'boolean',
      description: 'Checked state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'אני מסכים לתנאי השימוש',
  },
};

export const Checked: Story = {
  args: {
    label: 'מסומן',
    defaultChecked: true,
  },
};

export const Unchecked: Story = {
  args: {
    label: 'לא מסומן',
  },
};

export const LabelStart: Story = {
  name: 'Label at Start (RTL)',
  args: {
    label: 'תווית בהתחלה',
    labelPosition: 'start',
  },
};

export const LabelEnd: Story = {
  name: 'Label at End',
  args: {
    label: 'תווית בסוף',
    labelPosition: 'end',
  },
};

export const Disabled: Story = {
  args: {
    label: 'לא זמין',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'לא זמין ומסומן',
    disabled: true,
    defaultChecked: true,
  },
};

export const NoLabel: Story = {
  args: {},
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-4" style={{ width: '300px' }}>
      <div className="space-y-3">
        <Checkbox label="אני מסכים לתנאי השימוש" />
        <Checkbox label="קבל עדכונים במייל" defaultChecked />
        <Checkbox label="שמור את הפרטים שלי" />
        <Checkbox label="הזמנה כמתנה" />
      </div>
    </div>
  ),
};

export const GiftOptions: Story = {
  name: 'Gift Options Example',
  render: () => (
    <div className="space-y-3 p-4 border rounded-lg" style={{ width: '300px' }}>
      <h3 className="font-medium mb-2">אפשרויות מתנה</h3>
      <Checkbox label="זוהי מתנה" />
      <Checkbox label="הוסף אריזת מתנה (+₪15)" />
      <Checkbox label="הסתר מחיר מהחשבונית" />
    </div>
  ),
};
