/**
 * Main token export
 * Combines all design tokens into a single source of truth
 */

import { baseColors, phaseColors } from './base/colors';
import { spacing, layout, gaps } from './base/spacing';
import { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textStyles } from './base/typography';
import { shadows } from './base/shadows';
import { queenTheme } from './themes/queen';
import { kingTheme } from './themes/king';
import { platforms } from './platforms';

export const tokens = {
  // Base tokens
  colors: baseColors,
  phaseColors,
  spacing,
  layout,
  gaps,
  typography: {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    textStyles,
  },
  shadows,
  
  // Theme tokens
  themes: {
    queen: queenTheme,
    king: kingTheme,
  },
  
  // Platform tokens
  platforms,
};

// Helper to generate CSS variables from tokens
export function generateCSSVariables(theme = 'queen') {
  const selectedTheme = tokens.themes[theme];
  
  return `
    :root {
      /* Spacing */
      --spacing-xs: ${spacing.xs};
      --spacing-sm: ${spacing.sm};
      --spacing-md: ${spacing.md};
      --spacing-lg: ${spacing.lg};
      --spacing-xl: ${spacing.xl};
      --spacing-2xl: ${spacing['2xl']};
      
      /* Typography */
      --font-sans: ${fontFamily.sans};
      --font-mono: ${fontFamily.mono};
      --text-tiny: ${fontSize.tiny};
      --text-small: ${fontSize.small};
      --text-body: ${fontSize.body};
      --text-heading: ${fontSize.heading};
      --text-title: ${fontSize.title};
      --text-display: ${fontSize.display};
      
      /* Shadows */
      --shadow-sm: ${shadows.sm};
      --shadow-md: ${shadows.md};
      --shadow-lg: ${shadows.lg};
      
      /* Theme Colors */
      --color-primary: ${selectedTheme.colors.primary};
      --color-primary-light: ${selectedTheme.colors.primaryLight};
      --color-primary-dark: ${selectedTheme.colors.primaryDark};
      --color-background: ${selectedTheme.colors.background};
      --color-surface: ${selectedTheme.colors.surface};
      --color-border: ${selectedTheme.colors.border};
      --color-text-primary: ${selectedTheme.colors.text.primary};
      --color-text-secondary: ${selectedTheme.colors.text.secondary};
      --color-text-muted: ${selectedTheme.colors.text.muted};
      --color-success: ${selectedTheme.colors.success};
      --color-warning: ${selectedTheme.colors.warning};
      --color-error: ${selectedTheme.colors.error};
      --color-accent: ${selectedTheme.colors.accent};
    }
  `;
}