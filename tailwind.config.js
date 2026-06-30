/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,tsx}',
    './src/**/*.{js,ts,tsx}',
  ],
  darkMode: 'media',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#E84520',
        'primary-light': '#FF6040',
        surface: '#FFFFFF',
        'surface-alt': '#F5F4EF',
        'surface-dark': '#1C1C1E',
        'surface-dark-alt': '#2A2A2A',
        'card-pink': '#F2A0C4',
        'card-terra': '#A05048',
        'card-sage': '#9A9A6E',
        ink: '#1C1C1E',
        'ink-muted': '#8A8A8A',
        'ink-dark': '#F5F4EF',
        'ink-dark-muted': '#6A6A6A',
        border: '#E5E5E0',
        'border-dark': '#3A3A3A',
        success: '#34C759',
        danger: '#FF3B30',
        warning: '#FF9500',
        'success-dark': '#30D158',
        'danger-dark': '#FF453A',
        'warning-dark': '#FF9F0A',
      },
      fontFamily: {
        sans: ['Inter-Regular'],
        medium: ['Inter-Medium'],
        semibold: ['Inter-SemiBold'],
        bold: ['Inter-Bold'],
      },
    },
  },
  plugins: [],
};
