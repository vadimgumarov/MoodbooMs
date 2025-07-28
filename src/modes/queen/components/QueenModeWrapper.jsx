import React, { useEffect } from 'react';
import { queenTheme, queenCSSVariables } from '../config/theme';
import { queenPersonality } from '../config/personality';
import './QueenMode.css';

const QueenModeWrapper = ({ children }) => {
  // Apply Queen mode theme on mount
  useEffect(() => {
    // Apply CSS variables to root
    const root = document.documentElement;
    Object.entries(queenCSSVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Add Queen mode class for specific styling
    document.body.classList.add('queen-mode');
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('queen-mode');
      // Reset CSS variables if needed
      Object.keys(queenCSSVariables).forEach(key => {
        root.style.removeProperty(key);
      });
    };
  }, []);
  
  return (
    <div className="queen-mode-wrapper" style={{
      backgroundColor: queenTheme.colors.background,
      color: queenTheme.colors.text.primary,
      minHeight: '100vh'
    }}>
      <div 
        className="queen-content"
        data-queen-mode="active"
        data-personality={queenPersonality.traits.name}
      >
        {children}
      </div>
    </div>
  );
};

export default QueenModeWrapper;