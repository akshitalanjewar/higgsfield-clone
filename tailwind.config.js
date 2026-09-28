/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          accent: '#9333ea',
          glow: '#a855f7',
        },
        dark: {
          bg: '#08090d',
          surface: '#0f1118',
          card: '#151822',
          cardHover: '#1c202e',
          border: '#222738',
          borderLight: '#2f354c',
          muted: '#848ca5',
        },
        cinema: {
          gold: '#e5a93c',
          amber: '#f59e0b',
          cyan: '#06b6d4',
          red: '#ef4444',
          emerald: '#10b981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(139, 92, 246, 0.25)',
        'glow-md': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glow-lg': '0 0 40px -10px rgba(139, 92, 246, 0.45)',
        'glow-gold': '0 0 25px -5px rgba(229, 169, 60, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
    },
  },
  plugins: [],
};
