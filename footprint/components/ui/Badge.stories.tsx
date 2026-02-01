import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Badge } from './Badge';
import { Check, AlertTriangle, Info as InfoIcon, X } from 'lucide-react';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Status indicator component for labels, tags, and status display.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info', 'brand', 'secondary', 'destructive', 'outline'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size of the badge',
    },
    showDot: {
      control: 'boolean',
      description: 'Show a dot indicator',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'ברירת מחדל',
    variant: 'default',
  },
};

export const Success: Story = {
  args: {
    children: 'הצלחה',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'אזהרה',
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    children: 'שגיאה',
    variant: 'error',
  },
};

export const Info: Story = {
  args: {
    children: 'מידע',
    variant: 'info',
  },
};

export const Brand: Story = {
  args: {
    children: 'מותג',
    variant: 'brand',
  },
};

export const Secondary: Story = {
  args: {
    children: 'משני',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'מחיקה',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'מסגרת',
    variant: 'outline',
  },
};

export const WithDot: Story = {
  args: {
    children: 'עם נקודה',
    variant: 'success',
    showDot: true,
  },
};

export const WithIcon: Story = {
  args: {
    children: 'עם אייקון',
    variant: 'success',
    icon: <Check className="h-3 w-3" />,
  },
};

export const SmallSize: Story = {
  args: {
    children: 'קטן',
    size: 'sm',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">ברירת מחדל</Badge>
      <Badge variant="success">הצלחה</Badge>
      <Badge variant="warning">אזהרה</Badge>
      <Badge variant="error">שגיאה</Badge>
      <Badge variant="info">מידע</Badge>
      <Badge variant="brand">מותג</Badge>
      <Badge variant="secondary">משני</Badge>
      <Badge variant="destructive">מחיקה</Badge>
      <Badge variant="outline">מסגרת</Badge>
    </div>
  ),
};

export const OrderStatuses: Story = {
  name: 'Order Status Examples',
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="warning">ממתין לתשלום</Badge>
      <Badge variant="info">שולם</Badge>
      <Badge variant="brand">בהכנה</Badge>
      <Badge variant="info">נשלח</Badge>
      <Badge variant="success">הגיע</Badge>
      <Badge variant="error">בוטל</Badge>
    </div>
  ),
};
