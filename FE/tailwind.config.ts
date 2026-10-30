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
        'surface-container-low': '#f5f5f7',
        primary: '#0066cc',
        secondary: '#7155d9',
        'on-surface': '#1d1d1f',
      },
    },
  },
  plugins: [],
} satisfies Config;
