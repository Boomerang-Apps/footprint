import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Footprint brand colors
        brand: {
          purple: '#8b5cf6',
          pink: '#ec4899',
          cyan: '#22d3ee',
          orange: '#f59e0b',
        },
        // Light theme (primary)
        light: {
          bg: '#ffffff',
          soft: '#fafafa',
          muted: '#f5f5f5',
          border: '#e5e5e5',
          'border-soft': '#ebebeb',
        },
        // Text colors
        text: {
          primary: '#1a1a1a',
          secondary: '#525252',
          muted: '#737373',
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(to left, #8b5cf6, #ec4899)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      fontFamily: {
        heebo: ['Heebo', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 2px rgba(0,0,0,0.04)',
        'soft-md': '0 4px 12px rgba(0,0,0,0.06)',
        'soft-lg': '0 8px 24px rgba(0,0,0,0.08)',
        'brand': '0 4px 16px rgba(139,92,246,0.25)',
        'brand-lg': '0 8px 32px rgba(139,92,246,0.3)',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
}

export default config
