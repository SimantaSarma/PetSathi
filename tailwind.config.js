/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FAF7F2',
        surface: '#FFFFFF',
        sand: {
          100: '#F2EDE4',
          200: '#E6DFD2',
        },
        ink: {
          900: '#16211F',
          700: '#3E4A47',
          500: '#5B6865',
          400: '#7C8985',
        },
        moss: {
          800: '#0A4A3C',
          700: '#0D5C4B',
          600: '#11705B',
          100: '#DDF0E9',
          50: '#EEF8F4',
        },
        saffron: {
          500: '#F2A93B',
          100: '#FDEFD3',
        },
        alert: {
          700: '#B3261E',
          100: '#FCE8E6',
        },
        amber: {
          800: '#7A4B00',
          100: '#FFF1D6',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Figtree', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        btn: '8px',
        input: '8px',
        card: '12px',
        hero: '20px',
        pill: '9999px',
      },
      boxShadow: {
        floating: '0 8px 24px rgba(22, 33, 31, 0.10)',
        dropdown: '0 4px 16px rgba(22, 33, 31, 0.08)',
        subtle: '0 1px 3px rgba(22, 33, 31, 0.05)',
      },
      maxWidth: {
        prose: '68ch',
        container: '1200px',
      },
      transitionDuration: {
        DEFAULT: '180ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
