/**
 * Theme Context Provider
 * 
 * Provides theme management and application based on the current mode
 * Handles theme switching, dark mode support, and CSS variable injection
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useMode } from './SimpleModeContext';
import { queenTheme, queenThemeDark } from '../../modes/queen/theme';
import { kingTheme, kingThemeDark } from '../../modes/king/theme';
import { THEME_MODES, THEME_VARIANTS } from '../themes/types';

// Theme Context
const ThemeContext = createContext(null);

// Available themes mapping
const THEMES = {
  [THEME_MODES.QUEEN]: {
    [THEME_VARIANTS.LIGHT]: queenTheme,
    [THEME_VARIANTS.DARK]: queenThemeDark
  },
  [THEME_MODES.KING]: {
    [THEME_VARIANTS.LIGHT]: kingTheme,
    [THEME_VARIANTS.DARK]: kingThemeDark
  }
};

/**
 * Theme Provider Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.variant='light'] - Theme variant (light/dark)
 */
export function ThemeProvider({ children, variant = THEME_VARIANTS.LIGHT }) {
  const { currentMode, isSwitching } = useMode();
  
  // Get the current theme based on mode and variant
  const currentTheme = useMemo(() => {
    const modeThemes = THEMES[currentMode] || THEMES[THEME_MODES.QUEEN];
    return modeThemes[variant] || modeThemes[THEME_VARIANTS.LIGHT];
  }, [currentMode, variant]);
  
  // Apply theme to CSS variables
  useEffect(() => {
    if (!currentTheme) return;
    
    const root = document.documentElement;
    
    // Apply colors
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--color-${key}`, value);
      } else if (typeof value === 'object') {
        // Handle nested colors (like phases, hover, gradients)
        Object.entries(value).forEach(([subKey, subValue]) => {
          root.style.setProperty(`--color-${key}-${subKey}`, subValue);
        });
      }
    });
    
    // Apply typography
    root.style.setProperty('--font-family', currentTheme.typography.fontFamily);
    root.style.setProperty('--font-family-heading', currentTheme.typography.headingFontFamily);
    
    Object.entries(currentTheme.typography.sizes).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    
    Object.entries(currentTheme.typography.weights).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value);
    });
    
    Object.entries(currentTheme.typography.lineHeights).forEach(([key, value]) => {
      root.style.setProperty(`--line-height-${key}`, value);
    });
    
    // Apply spacing
    Object.entries(currentTheme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Apply border radius
    Object.entries(currentTheme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
    
    // Apply shadows
    Object.entries(currentTheme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    // Apply transitions
    Object.entries(currentTheme.transitions).forEach(([key, value]) => {
      root.style.setProperty(`--transition-${key}`, value);
    });
    
    // Apply animations
    Object.entries(currentTheme.animations).forEach(([key, value]) => {
      root.style.setProperty(`--animation-${key}`, value);
    });
    
    // Add theme mode class to body
    document.body.className = `theme-${currentTheme.mode} theme-${variant}`;
    
    // Add switching class during transitions
    if (isSwitching) {
      document.body.classList.add('theme-switching');
      const timer = setTimeout(() => {
        document.body.classList.remove('theme-switching');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentTheme, variant, isSwitching]);
  
  const contextValue = {
    theme: currentTheme,
    variant,
    isQueenTheme: currentMode === THEME_MODES.QUEEN,
    isKingTheme: currentMode === THEME_MODES.KING,
    isDark: variant === THEME_VARIANTS.DARK,
    isLight: variant === THEME_VARIANTS.LIGHT
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * @returns {Object} Theme context value
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Re-export for convenience
export { THEME_MODES, THEME_VARIANTS };