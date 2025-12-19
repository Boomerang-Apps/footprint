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
        // Dark theme
        dark: {
          bg: '#000000',
          card: '#18181b',
          border: '#27272a',
          hover: '#3f3f46',
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(to left, #8b5cf6, #ec4899)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      fontFamily: {
        heebo: ['Heebo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
