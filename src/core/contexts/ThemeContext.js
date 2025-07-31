/**
 * Theme Context Provider
 * 
 * Provides theme management and application based on the current mode
 * Handles theme switching, dark mode support, and CSS variable injection
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useMode } from './SimpleModeContext';
import { queenTheme, queenThemeDark } from '../../modes/queen/config/theme';
import { kingTheme, kingThemeDark } from '../../modes/king/config/theme';
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
    
    console.log('ThemeContext: Applying theme:', currentTheme.name, currentTheme.colors.primary);
    
    try {
      const root = document.documentElement;
      
      // Apply colors
      if (currentTheme.colors) {
        // Set primary colors
        root.style.setProperty('--color-primary', currentTheme.colors.primary);
        root.style.setProperty('--color-primary-light', currentTheme.colors.primaryLight || currentTheme.colors.tertiary);
        root.style.setProperty('--color-primary-dark', currentTheme.colors.primaryDark || currentTheme.colors.secondary);
        
        // Set background and surface colors
        root.style.setProperty('--color-background', currentTheme.colors.background);
        root.style.setProperty('--color-surface', currentTheme.colors.surface);
        root.style.setProperty('--color-border', currentTheme.colors.border);
        
        // Set text colors
        root.style.setProperty('--color-text-primary', currentTheme.colors.text);
        root.style.setProperty('--color-text-secondary', currentTheme.colors.textSecondary);
        root.style.setProperty('--color-text-muted', currentTheme.colors.textSecondary);
        
        // Set state colors
        root.style.setProperty('--color-success', currentTheme.colors.success);
        root.style.setProperty('--color-warning', currentTheme.colors.warning);
        root.style.setProperty('--color-error', currentTheme.colors.error);
        root.style.setProperty('--color-accent', currentTheme.colors.tertiary);
        
        // Log what we're setting
        console.log('Setting CSS variables:', {
          primary: currentTheme.colors.primary,
          background: currentTheme.colors.background,
          text: currentTheme.colors.text
        });
        
        // Apply all other colors (phases, hover, gradients)
        Object.entries(currentTheme.colors).forEach(([key, value]) => {
          if (typeof value === 'object' && value) {
            // Handle nested colors (like phases, hover, gradients)
            Object.entries(value).forEach(([subKey, subValue]) => {
              if (subValue) {
                root.style.setProperty(`--color-${key}-${subKey}`, subValue);
              }
            });
          }
        });
      }
      
      // Apply typography
      if (currentTheme.typography) {
        if (currentTheme.typography.fontFamily) {
          root.style.setProperty('--font-family', currentTheme.typography.fontFamily);
        }
        if (currentTheme.typography.headingFontFamily) {
          root.style.setProperty('--font-family-heading', currentTheme.typography.headingFontFamily);
        }
        
        if (currentTheme.typography.sizes) {
          Object.entries(currentTheme.typography.sizes).forEach(([key, value]) => {
            if (value) root.style.setProperty(`--font-size-${key}`, value);
          });
        }
        
        if (currentTheme.typography.weights) {
          Object.entries(currentTheme.typography.weights).forEach(([key, value]) => {
            if (value) root.style.setProperty(`--font-weight-${key}`, value);
          });
        }
        
        if (currentTheme.typography.lineHeights) {
          Object.entries(currentTheme.typography.lineHeights).forEach(([key, value]) => {
            if (value) root.style.setProperty(`--line-height-${key}`, value);
          });
        }
      }
      
      // Apply spacing
      if (currentTheme.spacing) {
        Object.entries(currentTheme.spacing).forEach(([key, value]) => {
          if (value) root.style.setProperty(`--spacing-${key}`, value);
        });
      }
      
      // Apply border radius
      if (currentTheme.borderRadius) {
        Object.entries(currentTheme.borderRadius).forEach(([key, value]) => {
          if (value) root.style.setProperty(`--radius-${key}`, value);
        });
      }
      
      // Apply shadows
      if (currentTheme.shadows) {
        Object.entries(currentTheme.shadows).forEach(([key, value]) => {
          if (value) root.style.setProperty(`--shadow-${key}`, value);
        });
      }
      
      // Apply transitions
      if (currentTheme.transitions) {
        Object.entries(currentTheme.transitions).forEach(([key, value]) => {
          if (value) root.style.setProperty(`--transition-${key}`, value);
        });
      }
      
      // Apply animations
      if (currentTheme.animations) {
        Object.entries(currentTheme.animations).forEach(([key, value]) => {
          if (value) root.style.setProperty(`--animation-${key}`, value);
        });
      }
    } catch (error) {
      console.error('Error applying theme:', error);
    }
    
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