import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// Define available modes
export const MODES = {
  QUEEN: 'queen',
  KING: 'king'
};

// Default mode
const DEFAULT_MODE = MODES.QUEEN;

// Create the context
const ModeContext = createContext();

// Simple mode provider that doesn't cause re-render loops
export function ModeProvider({ children }) {
  const [currentMode, setCurrentMode] = useState(DEFAULT_MODE);
  const [isReady, setIsReady] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  
  // Load mode from store once on mount
  useEffect(() => {
    const loadMode = async () => {
      try {
        if (window.electronAPI?.store?.get) {
          const preferences = await window.electronAPI.store.get('preferences');
          if (preferences) {
            // Handle new mode field
            if (preferences.mode && Object.values(MODES).includes(preferences.mode)) {
              setCurrentMode(preferences.mode);
            } 
            // Handle legacy badassMode
            else if (preferences.badassMode !== undefined) {
              setCurrentMode(preferences.badassMode ? MODES.KING : MODES.QUEEN);
            }
          }
        }
      } catch (error) {
        console.error('Error loading mode:', error);
      } finally {
        setIsReady(true);
      }
    };
    
    loadMode();
  }, []); // Empty dependency array - only run once
  
  // Use ref to track switching state to avoid closure issues
  const switchingRef = useRef(false);
  
  // Switch mode with debouncing
  const switchMode = useCallback(async (newMode) => {
    // Prevent rapid switching
    if (switchingRef.current || isSwitching) return false;
    
    // Validate mode
    if (!Object.values(MODES).includes(newMode)) {
      console.error(`Invalid mode: ${newMode}`);
      return false;
    }
    
    // Don't switch if already in that mode
    if (newMode === currentMode) return false;
    
    try {
      switchingRef.current = true;
      setIsSwitching(true);
      
      // Update local state immediately
      setCurrentMode(newMode);
      
      // Persist to store
      if (window.electronAPI?.store?.set) {
        const preferences = await window.electronAPI.store.get('preferences') || {};
        const updatedPreferences = {
          ...preferences,
          mode: newMode,
          badassMode: newMode === MODES.KING // For backward compatibility
        };
        await window.electronAPI.store.set('preferences', updatedPreferences);
        
        // Log mode switch
        if (window.electronAPI?.app?.log) {
          window.electronAPI.app.log(`Mode switched to: ${newMode}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error switching mode:', error);
      return false;
    } finally {
      // Allow next switch after delay
      setTimeout(() => {
        switchingRef.current = false;
        setIsSwitching(false);
      }, 1000); // Increased delay to prevent rapid toggling
    }
  }, [currentMode, isSwitching]);
  
  // Toggle between modes
  const toggleMode = useCallback(() => {
    const newMode = currentMode === MODES.QUEEN ? MODES.KING : MODES.QUEEN;
    return switchMode(newMode);
  }, [currentMode, switchMode]);
  
  // Context value - memoized to prevent unnecessary re-renders
  const value = React.useMemo(() => ({
    currentMode,
    isReady,
    isQueenMode: currentMode === MODES.QUEEN,
    isKingMode: currentMode === MODES.KING,
    switchMode,
    toggleMode,
    isSwitching,
    MODES
  }), [currentMode, isReady, switchMode, toggleMode, isSwitching]);
  
  return (
    <ModeContext.Provider value={value}>
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