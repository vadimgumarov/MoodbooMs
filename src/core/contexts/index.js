/**
 * Core Contexts Export
 * 
 * Central export point for all context providers and hooks
 */

// Mode Context
export { ModeProvider, useMode, MODES } from './SimpleModeContext';

// Theme Context
export { ThemeProvider, useTheme, THEME_MODES, THEME_VARIANTS } from './ThemeContext';

// Combined Provider for convenience
import React from 'react';
import { ModeProvider } from './SimpleModeContext';
import { ThemeProvider } from './ThemeContext';

/**
 * Combined provider that includes both Mode and Theme contexts
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.themeVariant='light'] - Theme variant (light/dark)
 */
export function AppProviders({ children, themeVariant = 'light' }) {
  return (
    <ModeProvider>
      <ThemeProvider variant={themeVariant}>
        {children}
      </ThemeProvider>
    </ModeProvider>
  );
}