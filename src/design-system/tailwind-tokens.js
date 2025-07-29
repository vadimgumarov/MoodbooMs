/**
 * Tailwind configuration using design tokens
 * This extends the existing Tailwind config with our token values
 */

import { tokens } from './tokens';

export const tailwindTokens = {
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
  
  spacing: tokens.spacing,
  
  fontSize: {
    tiny: 'var(--text-tiny)',
    small: 'var(--text-small)',
    body: 'var(--text-body)',
    heading: 'var(--text-heading)',
    title: 'var(--text-title)',
    display: 'var(--text-display)',
  },
  
  fontFamily: {
    sans: tokens.typography.fontFamily.sans,
    mono: tokens.typography.fontFamily.mono,
  },
  
  boxShadow: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
  },
};