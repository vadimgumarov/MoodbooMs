/**
 * useKeyboardNavigation Hook
 * 
 * Provides keyboard navigation support for the application
 * following WCAG 2.1 standards
 */

import { useEffect, useCallback } from 'react';

/**
 * Hook for keyboard navigation
 * @param {Array} tabs - Array of tab IDs
 * @param {string} activeTab - Currently active tab
 * @param {Function} setActiveTab - Function to set active tab
 * @param {boolean} enabled - Whether keyboard navigation is enabled
 */
export function useKeyboardNavigation(tabs, activeTab, setActiveTab, enabled = true) {
  const handleKeyDown = useCallback((e) => {
    if (!enabled) return;
    
    const currentIndex = tabs.indexOf(activeTab);
    
    switch(e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        setActiveTab(tabs[prevIndex]);
        // Focus the tab button
        setTimeout(() => {
          const tabButton = document.querySelector(`[role="tab"][aria-selected="true"]`);
          if (tabButton) tabButton.focus();
        }, 50);
        break;
        
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        setActiveTab(tabs[nextIndex]);
        // Focus the tab button
        setTimeout(() => {
          const tabButton = document.querySelector(`[role="tab"][aria-selected="true"]`);
          if (tabButton) tabButton.focus();
        }, 50);
        break;
        
      case 'Home':
        e.preventDefault();
        setActiveTab(tabs[0]);
        break;
        
      case 'End':
        e.preventDefault();
        setActiveTab(tabs[tabs.length - 1]);
        break;
    }
  }, [tabs, activeTab, setActiveTab, enabled]);
  
  useEffect(() => {
    // Only attach listeners to tab buttons
    const tabList = document.querySelector('[role="tablist"]');
    if (!tabList) return;
    
    tabList.addEventListener('keydown', handleKeyDown);
    
    return () => {
      tabList.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Add keyboard navigation class to body
  useEffect(() => {
    const handleKeyUp = (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigating');
      }
    };
    
    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigating');
    };
    
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
}

/**
 * Hook for escape key handling
 * @param {Function} onEscape - Function to call on escape key
 * @param {boolean} enabled - Whether escape handling is enabled
 */
export function useEscapeKey(onEscape, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onEscape, enabled]);
}

/**
 * Hook for quit keyboard shortcut (Cmd/Ctrl+Q)
 * @param {Function} onQuit - Function to call on quit shortcut
 * @param {boolean} enabled - Whether quit shortcut is enabled
 */
export function useQuitShortcut(onQuit, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    
    const handleQuit = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'q') {
        e.preventDefault();
        onQuit();
      }
    };
    
    document.addEventListener('keydown', handleQuit);
    
    return () => {
      document.removeEventListener('keydown', handleQuit);
    };
  }, [onQuit, enabled]);
}