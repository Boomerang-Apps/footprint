import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { Button } from './Button';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Container component for grouped content with header, body, and footer sections.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '350px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>כותרת הכרטיס</CardTitle>
        <CardDescription>תיאור קצר של התוכן בכרטיס</CardDescription>
      </CardHeader>
      <CardContent>
        <p>תוכן הכרטיס מופיע כאן. ניתן להוסיף כל תוכן שתרצו.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>פרטי הזמנה</CardTitle>
        <CardDescription>סיכום ההזמנה שלך</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>סה״כ פריטים</span>
            <span>3</span>
          </div>
          <div className="flex justify-between">
            <span>משלוח</span>
            <span>₪29</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>סה״כ</span>
            <span>₪299</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button fullWidth>המשך לתשלום</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card>
      <CardContent className="pt-6">
        <p>כרטיס פשוט עם תוכן בלבד, ללא כותרת או כותרת תחתונה.</p>
      </CardContent>
    </Card>
  ),
};

export const ProductCard: Story = {
  name: 'Product Card Example',
  render: () => (
    <Card>
      <div className="aspect-square bg-zinc-100 rounded-t-xl flex items-center justify-center">
        <span className="text-zinc-400">תמונת מוצר</span>
      </div>
      <CardHeader>
        <CardTitle>הדפס אומנותי</CardTitle>
        <CardDescription>סגנון צבעי מים • A4</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">₪189</span>
          <Button size="sm">הוסף לסל</Button>
        </div>
      </CardContent>
    </Card>
  ),
};

export const OrderSummary: Story = {
  name: 'Order Summary Example',
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>סיכום הזמנה #12345</CardTitle>
        <CardDescription>נוצרה ב-15 בינואר 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-16 h-16 bg-zinc-100 rounded-lg flex items-center justify-center">
              <span className="text-xs text-zinc-400">תמונה</span>
            </div>
            <div>
              <p className="font-medium">פורטרט משפחתי</p>
              <p className="text-sm text-zinc-500">A3 • מסגרת שחורה</p>
            </div>
          </div>
          <hr className="border-zinc-200" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>סה״כ ביניים</span>
              <span>₪289</span>
            </div>
            <div className="flex justify-between">
              <span>משלוח</span>
              <span>₪29</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2">
              <span>סה״כ</span>
              <span>₪318</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" fullWidth>פרטים</Button>
        <Button fullWidth>מעקב משלוח</Button>
      </CardFooter>
    </Card>
  ),
};
