/**
 * Theme Preview Tool
 * 
 * Allows users to preview and switch between different themes and modes
 */

import React from 'react';
import { useTheme } from '../core/contexts/ThemeContext';
import { useMode } from '../core/contexts/SimpleModeContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { Sun, Moon, Crown, Shield } from 'lucide-react';

function ThemePreview() {
  const { theme, isQueenTheme, isDark } = useTheme();
  const { toggleMode, isSwitching } = useMode();
  const [, toggleDarkMode] = useDarkMode();
  
  return (
    <div className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50"
         style={{
           backgroundColor: 'var(--color-surface)',
           border: '1px solid var(--color-border)',
           maxWidth: '320px'
         }}>
      <h3 className="text-sm font-semibold mb-3" 
          style={{ color: 'var(--color-text)' }}>
        Theme Preview
      </h3>
      
      {/* Mode Toggle */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Mode:
        </span>
        <button
          onClick={toggleMode}
          disabled={isSwitching}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-on-primary)',
            opacity: isSwitching ? 0.6 : 1,
            cursor: isSwitching ? 'not-allowed' : 'pointer'
          }}
        >
          {isQueenTheme ? (
            <><Crown size={16} /> Queen</>
          ) : (
            <><Shield size={16} /> King</>
          )}
        </button>
      </div>
      
      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Theme:
        </span>
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all"
          style={{
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-text-on-secondary)'
          }}
        >
          {isDark ? (
            <><Moon size={16} /> Dark</>
          ) : (
            <><Sun size={16} /> Light</>
          )}
        </button>
      </div>
      
      {/* Color Swatches */}
      <div className="mt-3 pt-3" 
           style={{ borderTop: '1px solid var(--color-border)' }}>
        <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Theme Colors:
        </p>
        <div className="flex gap-1">
          <div className="w-8 h-8 rounded" 
               style={{ backgroundColor: 'var(--color-primary)' }} 
               title="Primary" />
          <div className="w-8 h-8 rounded" 
               style={{ backgroundColor: 'var(--color-secondary)' }} 
               title="Secondary" />
          <div className="w-8 h-8 rounded" 
               style={{ backgroundColor: 'var(--color-tertiary)' }} 
               title="Tertiary" />
          <div className="w-8 h-8 rounded border" 
               style={{ 
                 backgroundColor: 'var(--color-background)',
                 borderColor: 'var(--color-border)' 
               }} 
               title="Background" />
          <div className="w-8 h-8 rounded border" 
               style={{ 
                 backgroundColor: 'var(--color-surface)',
                 borderColor: 'var(--color-border)' 
               }} 
               title="Surface" />
        </div>
      </div>
      
      {/* Current Theme Name */}
      <p className="text-xs mt-3 text-center" 
         style={{ color: 'var(--color-text-secondary)' }}>
        {theme.name} {isDark ? '(Dark)' : '(Light)'}
      </p>
    </div>
  );
}

export default ThemePreview;