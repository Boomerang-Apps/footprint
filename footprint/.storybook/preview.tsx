import type { Preview } from '@storybook/nextjs-vite';
import '../app/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'soft', value: '#fafafa' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
  globalTypes: {
    direction: {
      description: 'Text direction',
      defaultValue: 'rtl',
      toolbar: {
        title: 'Direction',
        icon: 'globe',
        items: [
          { value: 'rtl', title: 'RTL (Hebrew)' },
          { value: 'ltr', title: 'LTR (English)' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Locale',
      defaultValue: 'he',
      toolbar: {
        title: 'Locale',
        icon: 'certificate',
        items: [
          { value: 'he', title: 'Hebrew' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const direction = context.globals.direction || 'rtl';
      return (
        <div dir={direction} style={{ fontFamily: 'Heebo, sans-serif' }}>
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
