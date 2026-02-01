import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { Textarea } from './textarea';

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Multi-line text input for longer form content.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the textarea',
    },
    rows: {
      control: 'number',
      description: 'Number of visible rows',
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
    placeholder: 'הקלד כאן...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'זהו טקסט לדוגמה שכבר הוזן בתיבת הטקסט.',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'לא ניתן לערוך',
    disabled: true,
  },
};

export const DisabledWithValue: Story = {
  args: {
    defaultValue: 'תוכן שלא ניתן לעריכה',
    disabled: true,
  },
};

export const MoreRows: Story = {
  args: {
    placeholder: 'תיבת טקסט גבוהה יותר...',
    rows: 6,
  },
};

export const GiftMessage: Story = {
  render: () => (
    <div className="space-y-2" style={{ width: '300px' }}>
      <label className="block text-sm font-medium">הודעה למתנה</label>
      <Textarea
        placeholder="כתוב הודעה אישית שתצורף להזמנה..."
        rows={4}
      />
      <p className="text-xs text-zinc-500">עד 200 תווים</p>
    </div>
  ),
};

export const FeedbackForm: Story = {
  render: () => (
    <div className="space-y-4 p-4 bg-zinc-50 rounded-lg" style={{ width: '350px' }}>
      <h3 className="font-medium">ספר לנו מה דעתך</h3>
      <div className="space-y-2">
        <label className="block text-sm font-medium">הערות</label>
        <Textarea
          placeholder="שתף אותנו בחוויה שלך..."
          rows={5}
        />
      </div>
      <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">
        שלח משוב
      </button>
    </div>
  ),
};

export const ShippingNotes: Story = {
  render: () => (
    <div className="space-y-2" style={{ width: '300px' }}>
      <label className="block text-sm font-medium">הערות למשלוח</label>
      <Textarea
        placeholder="הוראות מיוחדות לשליח, קוד כניסה, וכו׳..."
        rows={3}
      />
    </div>
  ),
};

export const ProductDescription: Story = {
  render: () => (
    <div className="space-y-2" style={{ width: '350px' }}>
      <label className="block text-sm font-medium">תיאור המוצר</label>
      <Textarea
        defaultValue="הדפס אומנותי מקורי בסגנון צבעי מים. מושלם לעיצוב הבית או כמתנה מיוחדת. מודפס על נייר ארכיבי באיכות גבוהה."
        rows={4}
      />
      <div className="flex justify-between text-xs text-zinc-500">
        <span>מינימום 50 תווים</span>
        <span>156/500</span>
      </div>
    </div>
  ),
};

export const ContactForm: Story = {
  render: () => (
    <div className="space-y-4 p-4 border rounded-lg" style={{ width: '350px' }}>
      <h3 className="font-medium">צור קשר</h3>
      <div className="space-y-2">
        <label className="block text-sm font-medium">שם</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md text-sm"
          placeholder="השם שלך"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">אימייל</label>
        <input
          type="email"
          className="w-full px-3 py-2 border rounded-md text-sm"
          placeholder="email@example.com"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">הודעה</label>
        <Textarea
          placeholder="איך נוכל לעזור?"
          rows={4}
        />
      </div>
      <button className="w-full bg-zinc-900 text-white py-2 rounded-lg text-sm font-medium">
        שלח הודעה
      </button>
    </div>
  ),
};
