/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        gradient: {
          start: '#0ea5e9',
          end: '#8b5cf6',
        },
        surface: {
          DEFAULT: '#ffffff',
          elevated: '#fafbfc',
          hover: '#f8f9fa',
        },
        border: {
          light: '#e5e7eb',
          DEFAULT: '#d1d5db',
          dark: '#9ca3af',
        }
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.1)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'nav': '0 1px 0 0 rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'nav': '12px',
        'card': '16px',
      },
      spacing: {
        'nav': '72px',
        'rail': '280px',
      },
      transitionDuration: {
        'nav': '200ms',
      },
      transitionTimingFunction: {
        'nav': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}

