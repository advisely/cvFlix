/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in-from-bottom': 'slideInFromBottom 0.5s ease-out',
        'float': 'float 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInFromBottom: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '100%': { transform: 'translateY(-12px) scale(1.03)' },
        },
      },
      boxShadow: {
        'netflix': '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(229, 9, 20, 0.1)',
        'netflix-hover': '0 16px 64px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(229, 9, 20, 0.3)',
        'mobile': '0 4px 16px rgba(0, 0, 0, 0.2), 0 1px 4px rgba(229, 9, 20, 0.1)',
        'mobile-hover': '0 8px 24px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(229, 9, 20, 0.2)',
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      aspectRatio: {
        'card': '16 / 12', // Custom aspect ratio for experience cards
        'logo': '1 / 1',   // Square aspect ratio for logos
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
