import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useState } from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible';
import { ChevronDown } from 'lucide-react';

const meta: Meta<typeof Collapsible> = {
  title: 'UI/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Expandable/collapsible content section with trigger.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const BasicDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-[300px]">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-zinc-100 rounded-lg">
        <span className="font-medium">לחץ לפתיחה</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="p-3 mt-2 bg-zinc-50 rounded-lg">
        <p className="text-sm">תוכן מוסתר שמתגלה בלחיצה על הכפתור.</p>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const Default: Story = {
  render: () => <BasicDemo />,
};

const OpenByDefaultDemo = () => {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-[300px]">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-zinc-100 rounded-lg">
        <span className="font-medium">פתוח כברירת מחדל</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="p-3 mt-2 bg-zinc-50 rounded-lg">
        <p className="text-sm">תוכן זה מוצג כברירת מחדל.</p>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const OpenByDefault: Story = {
  render: () => <OpenByDefaultDemo />,
};

const FAQDemo = () => {
  const [openItems, setOpenItems] = useState<string[]>(['faq1']);

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const faqs = [
    { id: 'faq1', question: 'כמה זמן לוקח המשלוח?', answer: 'משלוח רגיל לוקח 3-5 ימי עסקים. משלוח מהיר תוך 1-2 ימי עסקים.' },
    { id: 'faq2', question: 'מה מדיניות ההחזרות?', answer: 'ניתן להחזיר מוצרים תוך 14 יום מקבלת ההזמנה. המוצר חייב להיות באריזה המקורית.' },
    { id: 'faq3', question: 'האם אפשר להזמין מסגרת?', answer: 'כן! אנחנו מציעים מגוון מסגרות באיכות גבוהה בצבעים שונים.' },
  ];

  return (
    <div className="space-y-2 w-[350px]">
      <h3 className="font-medium mb-4">שאלות נפוצות</h3>
      {faqs.map(faq => (
        <Collapsible
          key={faq.id}
          open={openItems.includes(faq.id)}
          onOpenChange={() => toggleItem(faq.id)}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-zinc-100 rounded-lg text-right">
            <span className="font-medium text-sm">{faq.question}</span>
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${openItems.includes(faq.id) ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="p-3 text-sm text-zinc-600">
            {faq.answer}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

export const FAQ: Story = {
  render: () => <FAQDemo />,
};

const OrderDetailsDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-4 border rounded-lg w-[350px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-medium">הזמנה #12345</h3>
          <p className="text-sm text-zinc-500">15 בינואר 2026</p>
        </div>
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">הושלמה</span>
      </div>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-blue-600">
          <span>{open ? 'הסתר פרטים' : 'הצג פרטים'}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 pt-4 border-t">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-zinc-100 rounded-lg"></div>
              <div>
                <p className="font-medium text-sm">פורטרט משפחתי</p>
                <p className="text-xs text-zinc-500">A3 • מסגרת שחורה</p>
                <p className="text-sm font-medium mt-1">₪289</p>
              </div>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500">סה״כ ביניים</span>
                <span>₪289</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">משלוח</span>
                <span>₪29</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>סה״כ</span>
                <span>₪318</span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export const OrderDetails: Story = {
  render: () => <OrderDetailsDemo />,
};

const FiltersDemo = () => {
  const [openSections, setOpenSections] = useState<string[]>(['size', 'price']);

  const toggleSection = (id: string) => {
    setOpenSections(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-[250px] p-4 border rounded-lg">
      <h3 className="font-medium mb-4">סינון</h3>

      <Collapsible open={openSections.includes('size')} onOpenChange={() => toggleSection('size')} className="border-b pb-3 mb-3">
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <span className="font-medium text-sm">גודל</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('size') ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          {['A5', 'A4', 'A3', 'A2'].map(size => (
            <label key={size} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded" />
              {size}
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={openSections.includes('price')} onOpenChange={() => toggleSection('price')} className="border-b pb-3 mb-3">
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <span className="font-medium text-sm">מחיר</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('price') ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          {['עד ₪100', '₪100-₪200', '₪200-₪300', 'מעל ₪300'].map(range => (
            <label key={range} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded" />
              {range}
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={openSections.includes('frame')} onOpenChange={() => toggleSection('frame')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <span className="font-medium text-sm">מסגרת</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('frame') ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          {['ללא מסגרת', 'שחור', 'לבן', 'עץ טבעי'].map(frame => (
            <label key={frame} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded" />
              {frame}
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export const Filters: Story = {
  render: () => <FiltersDemo />,
};
