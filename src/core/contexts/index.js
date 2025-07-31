/**
 * Core Contexts Export
 * 
 * Central export point for all context providers and hooks
 */

// Mode Context
export { ModeProvider, useMode, MODES } from './SimpleModeContext';

// Theme Context
export { ThemeProvider, useTheme, THEME_MODES, THEME_VARIANTS } from './ThemeContext';

// Feedback Context
export { FeedbackProvider, useFeedback } from './FeedbackContext';

// Module Context
export { ModuleProvider, useModules } from './ModuleContext';

// Combined Provider for convenience
import React from 'react';
import { ModeProvider } from './SimpleModeContext';
import { ThemeProvider } from './ThemeContext';
import { FeedbackProvider } from './FeedbackContext';
import { ModuleProvider } from './ModuleContext';
import { DesignSystemProvider } from '../../design-system';

/**
 * Combined provider that includes all contexts
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.themeVariant='light'] - Theme variant (light/dark)
 */
export function AppProviders({ children, themeVariant = 'light' }) {
  return (
    <ModeProvider>
      <ModuleProvider>
        <DesignSystemProvider>
          <ThemeProvider variant={themeVariant}>
            <FeedbackProvider>
              {children}
            </FeedbackProvider>
          </ThemeProvider>
        </DesignSystemProvider>
      </ModuleProvider>
    </ModeProvider>
  );
}