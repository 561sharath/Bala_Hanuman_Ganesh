/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#121412',
        'surface-dim': '#121412',
        'surface-bright': '#383938',
        'surface-container-lowest': '#0d0f0d',
        'surface-container-low': '#1a1c1a',
        'surface-container': '#1f201e',
        'surface-container-high': '#292a29',
        'surface-container-highest': '#343533',
        'on-surface': '#e3e2e0',
        'on-surface-variant': '#e0bfbf',
        outline: '#a78a8a',
        'outline-variant': '#584141',
        primary: '#ffb3b5',
        'on-primary': '#680018',
        'primary-container': '#800020',
        'on-primary-container': '#ff828a',
        secondary: '#ffb77a',
        'on-secondary': '#4c2700',
        'secondary-container': '#d7790d',
        tertiary: '#e9c349',
        'on-tertiary': '#3c2f00',
        'tertiary-container': '#cca730',
        error: '#ffb4ab',
        'on-error': '#690005',
        'error-container': '#93000a',
      },
      fontFamily: {
        headline: ['Newsreader', 'serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        marquee: 'marquee 18s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
};
