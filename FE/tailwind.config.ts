import type { Config } from 'tailwindcss';
import stitch from './src/design/theme.json';
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      ...(stitch as unknown as NonNullable<Config['theme']>),
      colors: {
        ...stitch.colors,
        surface: '#ffffff',
        'surface-container-low': '#f0f4f9',
        primary: '#165dde',
        secondary: '#6941c6',
        'on-surface': '#17243b',
      },
    },
  },
  plugins: [],
} satisfies Config;
