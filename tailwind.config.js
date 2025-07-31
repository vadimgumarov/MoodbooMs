/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Map CSS variables to Tailwind classes
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        accent: 'var(--color-accent)',
      },
      // Typography scale
      fontSize: {
        'display': ['2.5rem', { lineHeight: '1.25', letterSpacing: '-0.025em', fontWeight: '700' }],
        'title': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.025em', fontWeight: '600' }],
        'heading': ['1.25rem', { lineHeight: '1.5', letterSpacing: '0em', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.5', letterSpacing: '0em', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0em', fontWeight: '400' }],
        'tiny': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em', fontWeight: '400' }],
      },
      fontFamily: {
        'sans': [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
      },
      lineHeight: {
        'tight': '1.25',
        'normal': '1.5',
        'relaxed': '1.75',
        'loose': '2',
      },
      letterSpacing: {
        'tight': '-0.025em',
        'normal': '0em',
        'wide': '0.025em',
      },
    },
  },
  plugins: [],
}