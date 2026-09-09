/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        midnight: {
          50: '#eef2f8',
          100: '#d7e0ee',
          200: '#b0c1dd',
          300: '#7f99c4',
          400: '#4f72a8',
          500: '#34548f',
          600: '#243d72',
          700: '#1a2d58',
          800: '#121f3f',
          900: '#0b1428',
          950: '#060c1c',
        },
        sky: {
          50: '#f0faff',
          100: '#def4ff',
          200: '#b8e9ff',
          300: '#7bd8ff',
          400: '#36c2ff',
          500: '#0aa8f0',
          600: '#0086cf',
          700: '#006aa6',
          800: '#005787',
          900: '#064a6e',
        },
        coral: {
          50: '#fff5f0',
          100: '#ffe8df',
          200: '#ffcfbf',
          300: '#ffac92',
          400: '#ff7e5f',
          500: '#fb5a36',
          600: '#ec3d18',
          700: '#c42d10',
          800: '#9c2611',
          900: '#7e2412',
        },
        sand: {
          50: '#fbfaf7',
          100: '#f5f3ec',
          200: '#ebe7da',
          300: '#dcd5c1',
          400: '#c4ba9c',
          500: '#b0a47e',
          600: '#9a8c66',
          700: '#7d7153',
          800: '#665b48',
          900: '#544b3c',
        },
      },
      boxShadow: {
        soft: '0 1px 3px -1px rgba(11, 20, 40, 0.06)',
        card: '0 2px 12px -4px rgba(11, 20, 40, 0.08)',
        glow: '0 0 0 1px rgba(54, 194, 255, 0.15), 0 2px 12px -4px rgba(10, 168, 240, 0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
