import React, { useEffect } from 'react';
import { useMode } from '../core/contexts/SimpleModeContext';
import { generateCSSVariables } from './tokens/index.js';

/**
 * DesignSystemProvider - Applies design tokens based on current mode
 * Lightweight approach using CSS variables
 */
export function DesignSystemProvider({ children }) {
  const { currentMode } = useMode();
  
  useEffect(() => {
    // Inject CSS variables based on current mode
    const theme = currentMode === 'queen' ? 'queen' : 'king';
    const styleId = 'design-system-tokens';
    
    console.log('DesignSystemProvider: Applying theme:', theme);
    
    // Remove existing style tag if present
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Create new style tag with CSS variables
    const styleTag = document.createElement('style');
    styleTag.id = styleId;
    
    try {
      const cssVariables = generateCSSVariables(theme);
      console.log('Generated CSS:', cssVariables.substring(0, 200));
      styleTag.innerHTML = cssVariables;
      document.head.appendChild(styleTag);
    } catch (error) {
      console.error('Error generating CSS variables:', error);
    }
    
    // Add theme class to body for additional styling hooks
    document.body.className = `theme-${theme}`;
    
    return () => {
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
    };
  }, [currentMode]);
  
  return children;
}