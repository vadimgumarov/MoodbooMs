/**
 * Theme Demo Component
 * 
 * Demonstrates how to use the theme system in components
 */

import React from 'react';
import { useTheme } from '../core/contexts/ThemeContext';
import { useMode } from '../core/contexts/SimpleModeContext';

function ThemeDemo() {
  const { theme, isQueenTheme, isKingTheme, isDark } = useTheme();
  const { toggleMode } = useMode();
  
  return (
    <div className="p-8" style={{ backgroundColor: 'var(--color-background)' }}>
      <h1 
        className="text-3xl font-bold mb-4"
        style={{ 
          color: 'var(--color-primary)',
          fontFamily: 'var(--font-family-heading)'
        }}
      >
        {theme.name} Demo
      </h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div 
          className="p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-md)',
            borderRadius: 'var(--radius-card)'
          }}
        >
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Primary Button
          </h2>
          <button
            className="px-6 py-2 text-white font-medium transition-all"
            style={{
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--radius-button)',
              boxShadow: 'var(--shadow-button)'
            }}
            onClick={toggleMode}
          >
            Toggle Mode
          </button>
        </div>
        
        <div 
          className="p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--color-surface-alt)',
            boxShadow: 'var(--shadow-sm)',
            borderRadius: 'var(--radius-card)'
          }}
        >
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Theme Info
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Mode: {isQueenTheme ? 'Queen' : 'King'}<br />
            Variant: {isDark ? 'Dark' : 'Light'}
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
          Phase Colors
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(theme.colors.phases).map(([phase, color]) => (
            <div
              key={phase}
              className="p-3 rounded text-white text-center"
              style={{
                backgroundColor: color,
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {phase}
            </div>
          ))}
        </div>
      </div>
      
      <div 
        className="p-4 rounded-lg"
        style={{
          background: 'var(--gradient-hero)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <h3 className="text-lg font-semibold text-white mb-2">
          Gradient Example
        </h3>
        <p className="text-white opacity-90">
          This uses the hero gradient from the current theme
        </p>
      </div>
    </div>
  );
}

export default ThemeDemo;