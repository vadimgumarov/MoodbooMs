import React, { useEffect } from 'react';
import { useMode } from '../core/contexts/SimpleModeContext';
import { generateCSSVariables } from './tokens';

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
    
    // Remove existing style tag if present
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Create new style tag with CSS variables
    const styleTag = document.createElement('style');
    styleTag.id = styleId;
    styleTag.innerHTML = generateCSSVariables(theme);
    document.head.appendChild(styleTag);
    
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