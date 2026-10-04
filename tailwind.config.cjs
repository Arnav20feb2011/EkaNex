/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1F3864',
          700: '#1a2f54',
          800: '#142544',
          900: '#0f1c34',
        },
        electric: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
        },
        accent: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
        forest: {
          DEFAULT: '#16A34A',
          dark: '#15803D',
        },
        canvas: '#F8FAFC',
        surface: '#F1F5F9',
        ink: '#0F172A',
        muted: '#64748B',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        hero: ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        section: ['clamp(2rem, 3.5vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.06), 0 6px 20px rgba(15, 23, 42, 0.06)',
        cardHover: '0 12px 34px rgba(15, 23, 42, 0.14)',
        nav: '0 1px 3px rgba(15, 23, 42, 0.08)',
        float: '0 18px 50px rgba(15, 23, 42, 0.22)',
      },
      maxWidth: {
        content: '1200px',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
