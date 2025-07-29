import React from 'react';
import { kingTheme, kingThemeClasses } from '../config/theme';
import './KingMode.css';

const KingModeWrapper = ({ children }) => {
  // Apply King mode theme
  React.useEffect(() => {
    // Add King mode class to root element
    document.documentElement.classList.add('king-mode');
    
    // Apply CSS variables
    const root = document.documentElement;
    const style = document.createElement('style');
    style.innerHTML = kingTheme.cssVariables;
    style.id = 'king-theme-variables';
    document.head.appendChild(style);
    
    // Cleanup on unmount
    return () => {
      document.documentElement.classList.remove('king-mode');
      const themeStyle = document.getElementById('king-theme-variables');
      if (themeStyle) {
        themeStyle.remove();
      }
    };
  }, []);
  
  return (
    <div className={`${kingThemeClasses.container} king-mode-wrapper`}>
      <div className="king-mode-background">
        {/* Alert pattern background */}
        <div className="alert-pattern" />
      </div>
      <div className="king-mode-content">
        {children}
      </div>
    </div>
  );
};

export default KingModeWrapper;