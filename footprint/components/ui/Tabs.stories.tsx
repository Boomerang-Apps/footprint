import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from './tabs';

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Tab navigation component for switching between content sections.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const TabsDemo = () => {
  const [value, setValue] = useState('tab1');
  return (
    <Tabs value={value} onValueChange={setValue}>
      <TabsList>
        <TabsTrigger value="tab1">לשונית 1</TabsTrigger>
        <TabsTrigger value="tab2">לשונית 2</TabsTrigger>
        <TabsTrigger value="tab3">לשונית 3</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export const Default: Story = {
  render: () => <TabsDemo />,
};

const TwoTabsDemo = () => {
  const [value, setValue] = useState('details');
  return (
    <Tabs value={value} onValueChange={setValue}>
      <TabsList>
        <TabsTrigger value="details">פרטים</TabsTrigger>
        <TabsTrigger value="shipping">משלוח</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export const TwoTabs: Story = {
  render: () => <TwoTabsDemo />,
};

const ProductTabsDemo = () => {
  const [value, setValue] = useState('description');
  return (
    <div style={{ width: '400px' }}>
      <Tabs value={value} onValueChange={setValue}>
        <TabsList className="w-full">
          <TabsTrigger value="description">תיאור</TabsTrigger>
          <TabsTrigger value="specs">מפרט</TabsTrigger>
          <TabsTrigger value="reviews">ביקורות</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mt-4 p-4 bg-zinc-50 rounded-lg">
        {value === 'description' && (
          <p className="text-sm">הדפס אומנותי באיכות גבוהה על נייר ארכיבי. מושלם לתלייה בבית או במשרד.</p>
        )}
        {value === 'specs' && (
          <ul className="text-sm space-y-1">
            <li>גודל: A4 (21×29.7 ס״מ)</li>
            <li>נייר: 300gsm מט</li>
            <li>דיו: פיגמנט ארכיבי</li>
          </ul>
        )}
        {value === 'reviews' && (
          <p className="text-sm text-zinc-500">אין ביקורות עדיין</p>
        )}
      </div>
    </div>
  );
};

export const WithContent: Story = {
  render: () => <ProductTabsDemo />,
};

const OrderTabsDemo = () => {
  const [value, setValue] = useState('all');
  return (
    <div style={{ width: '500px' }}>
      <Tabs value={value} onValueChange={setValue}>
        <TabsList>
          <TabsTrigger value="all">כל ההזמנות</TabsTrigger>
          <TabsTrigger value="active">פעילות</TabsTrigger>
          <TabsTrigger value="completed">הושלמו</TabsTrigger>
          <TabsTrigger value="cancelled">בוטלו</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm text-zinc-500">
          מציג: {value === 'all' ? 'כל ההזמנות' : value === 'active' ? 'הזמנות פעילות' : value === 'completed' ? 'הזמנות שהושלמו' : 'הזמנות שבוטלו'}
        </p>
      </div>
    </div>
  );
};

export const OrderHistory: Story = {
  render: () => <OrderTabsDemo />,
};

const AccountTabsDemo = () => {
  const [value, setValue] = useState('profile');
  return (
    <div style={{ width: '400px' }}>
      <Tabs value={value} onValueChange={setValue}>
        <TabsList className="w-full">
          <TabsTrigger value="profile">פרופיל</TabsTrigger>
          <TabsTrigger value="orders">הזמנות</TabsTrigger>
          <TabsTrigger value="settings">הגדרות</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mt-4 p-4 bg-white border rounded-lg">
        {value === 'profile' && (
          <div className="space-y-2">
            <h3 className="font-medium">פרטי החשבון</h3>
            <p className="text-sm text-zinc-500">ישראל ישראלי</p>
            <p className="text-sm text-zinc-500">israel@example.com</p>
          </div>
        )}
        {value === 'orders' && (
          <div className="space-y-2">
            <h3 className="font-medium">הזמנות אחרונות</h3>
            <p className="text-sm text-zinc-500">3 הזמנות בחודש האחרון</p>
          </div>
        )}
        {value === 'settings' && (
          <div className="space-y-2">
            <h3 className="font-medium">הגדרות</h3>
            <p className="text-sm text-zinc-500">התראות, שפה, פרטיות</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const AccountSettings: Story = {
  render: () => <AccountTabsDemo />,
};
