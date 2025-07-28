import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useStore } from '../hooks/useStore';

// Define available modes
export const MODES = {
  QUEEN: 'queen',
  KING: 'king'
};

// Default mode configuration
const DEFAULT_MODE = MODES.QUEEN;

// Create the context
const ModeContext = createContext();

// Mode provider component
export function ModeProvider({ children }) {
  const [currentMode, setCurrentMode] = useState(DEFAULT_MODE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false);
  
  // Use store for persistence
  const { value: preferences, setValue: setPreferences } = useStore('preferences', {
    mode: DEFAULT_MODE
  });

  // Load saved mode on mount
  useEffect(() => {
    if (isLoading && preferences) {
      // Validate mode before setting
      if (preferences.mode && Object.values(MODES).includes(preferences.mode)) {
        setCurrentMode(preferences.mode);
      } else if (preferences.badassMode !== undefined) {
        // Handle legacy badassMode
        setCurrentMode(preferences.badassMode ? MODES.KING : MODES.QUEEN);
      } else {
        setCurrentMode(DEFAULT_MODE);
      }
      setIsLoading(false);
    }
  }, [preferences, isLoading]);

  // Switch mode function
  const switchMode = useCallback(async (newMode) => {
    // Prevent switching if already switching
    if (isSwitching) return false;
    
    try {
      setIsSwitching(true);
      
      // Validate new mode
      if (!Object.values(MODES).includes(newMode)) {
        throw new Error(`Invalid mode: ${newMode}`);
      }

      // Update local state
      setCurrentMode(newMode);
      setError(null);

      // Persist to store
      const updatedPreferences = {
        ...preferences,
        mode: newMode,
        badassMode: newMode === MODES.KING // Keep for backward compatibility
      };
      await setPreferences(updatedPreferences);

      // Log mode switch
      if (window.electronAPI?.app?.log) {
        window.electronAPI.app.log(`Mode switched to: ${newMode}`);
      }

      return true;
    } catch (err) {
      console.error('Failed to switch mode:', err);
      setError(err.message);
      return false;
    } finally {
      // Add small delay before allowing next switch
      setTimeout(() => setIsSwitching(false), 500);
    }
  }, [preferences, setPreferences, isSwitching]);

  // Toggle between modes with debouncing
  const toggleMode = useCallback(() => {
    // Prevent toggling while loading
    if (isLoading) return Promise.resolve(false);
    
    const newMode = currentMode === MODES.QUEEN ? MODES.KING : MODES.QUEEN;
    return switchMode(newMode);
  }, [currentMode, switchMode, isLoading]);

  // Get mode display name
  const getModeDisplayName = useCallback(() => {
    return currentMode === MODES.QUEEN ? 'Queen' : 'King';
  }, [currentMode]);

  // Check if specific mode is active
  const isModeActive = useCallback((mode) => {
    return currentMode === mode;
  }, [currentMode]);

  // Context value
  const contextValue = {
    // State
    currentMode,
    isLoading,
    isSwitching,
    error,
    
    // Mode constants
    MODES,
    
    // Actions
    switchMode,
    toggleMode,
    
    // Helpers
    getModeDisplayName,
    isModeActive,
    isQueenMode: currentMode === MODES.QUEEN,
    isKingMode: currentMode === MODES.KING
  };

  return (
    <ModeContext.Provider value={contextValue}>
      {children}
    </ModeContext.Provider>
  );
}

// Custom hook to use mode context
export function useMode() {
  const context = useContext(ModeContext);
  
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  
  return context;
}

// Higher-order component for mode-specific rendering
export function withMode(Component) {
  return function ModeWrappedComponent(props) {
    const modeContext = useMode();
    return <Component {...props} mode={modeContext} />;
  };
}