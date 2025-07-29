/**
 * Dark Mode Hook
 * 
 * Manages dark mode preferences with system detection and persistence
 */

import { useState, useEffect } from 'react';

/**
 * Hook for managing dark mode state
 * @param {string} defaultTheme - Default theme ('light' or 'dark')
 * @returns {[boolean, function]} - [isDark, toggleDarkMode]
 */
export function useDarkMode(defaultTheme = 'light') {
  // Check for saved preference or system preference
  const getInitialTheme = () => {
    // Check electron store first
    if (window.electronAPI?.store) {
      const savedTheme = window.electronAPI.store.get('preferences.theme');
      if (savedTheme && savedTheme !== 'auto') {
        return savedTheme === 'dark';
      }
    }
    
    // Check localStorage as fallback
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    
    // Check system preference
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    return defaultTheme === 'dark';
  };
  
  const [isDark, setIsDark] = useState(getInitialTheme);
  
  // Save preference
  const saveTheme = (dark) => {
    const theme = dark ? 'dark' : 'light';
    
    // Save to electron store if available
    if (window.electronAPI?.store) {
      window.electronAPI.store.set('preferences.theme', theme);
    }
    
    // Always save to localStorage as fallback
    localStorage.setItem('theme', theme);
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDark(prev => {
      const newValue = !prev;
      saveTheme(newValue);
      return newValue;
    });
  };
  
  // Listen for system theme changes
  useEffect(() => {
    if (!window.matchMedia) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only update if user hasn't set a manual preference
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        setIsDark(e.matches);
      }
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);
  
  // Apply theme class to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);
  
  return [isDark, toggleDarkMode];
}

/**
 * Hook to get system color scheme preference
 * @returns {string} - 'light' or 'dark'
 */
export function useSystemColorScheme() {
  const [scheme, setScheme] = useState(() => {
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  
  useEffect(() => {
    if (!window.matchMedia) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setScheme(e.matches ? 'dark' : 'light');
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);
  
  return scheme;
}