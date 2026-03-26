/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gem: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          200: '#f3d0fe',
          300: '#e9a8fd',
          400: '#d875f9',
          500: '#c44df0',
          600: '#a82ed4',
          700: '#8b22ae',
          800: '#731f8e',
          900: '#5f1e73',
          950: '#3e0950',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: 0, transform: 'translateX(20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      },
      backgroundImage: {
        'gem-gradient': 'linear-gradient(135deg, #3e0950 0%, #731f8e 40%, #a82ed4 100%)',
        'hero-pattern': 'radial-gradient(ellipse at 20% 50%, rgba(168,46,212,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(196,77,240,0.1) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
};
