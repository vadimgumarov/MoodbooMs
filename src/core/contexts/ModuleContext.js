/**
 * Module Context
 * 
 * React Context for managing module state throughout the application
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { moduleRegistry } from '../modules/registry';

// Action types
const MODULE_ACTIONS = {
  INITIALIZE: 'INITIALIZE',
  TOGGLE_MODULE: 'TOGGLE_MODULE',
  UPDATE_MODULE_CONFIG: 'UPDATE_MODULE_CONFIG',
  RESTORE_STATE: 'RESTORE_STATE',
  SET_LOADING: 'SET_LOADING'
};

// Initial state
const initialState = {
  initialized: false,
  loading: false,
  enabledModules: [],
  moduleConfigs: {},
  error: null
};

// Reducer
function moduleReducer(state, action) {
  switch (action.type) {
    case MODULE_ACTIONS.INITIALIZE:
      return {
        ...state,
        initialized: true,
        enabledModules: action.payload.enabledModules,
        moduleConfigs: action.payload.moduleConfigs
      };

    case MODULE_ACTIONS.TOGGLE_MODULE:
      const { moduleId, enabled } = action.payload;
      const newEnabledModules = enabled
        ? [...state.enabledModules, moduleId]
        : state.enabledModules.filter(id => id !== moduleId);
      
      return {
        ...state,
        enabledModules: newEnabledModules
      };

    case MODULE_ACTIONS.UPDATE_MODULE_CONFIG:
      return {
        ...state,
        moduleConfigs: {
          ...state.moduleConfigs,
          [action.payload.moduleId]: {
            ...state.moduleConfigs[action.payload.moduleId],
            ...action.payload.config
          }
        }
      };

    case MODULE_ACTIONS.RESTORE_STATE:
      return {
        ...state,
        ...action.payload,
        initialized: true
      };

    case MODULE_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    default:
      return state;
  }
}

// Create context
const ModuleContext = createContext(null);

/**
 * Module Provider Component
 */
export function ModuleProvider({ children }) {
  const [state, dispatch] = useReducer(moduleReducer, initialState);
  const saveTimeoutRef = useRef(null);
  const initializationRef = useRef(false);

  // Initialize modules with delay to avoid render conflicts
  useEffect(() => {
    // Prevent double initialization in React strict mode
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializeModules = async () => {
      // Delay initialization to let the app stabilize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      dispatch({ type: MODULE_ACTIONS.SET_LOADING, payload: true });
      
      try {
        // Initialize registry
        moduleRegistry.initialize();

        // Load saved state from electron store
        if (window.electronAPI && window.electronAPI.store) {
          try {
            const savedModuleState = await window.electronAPI.store.get('moduleState');
            if (savedModuleState) {
              moduleRegistry.restorePersistedState(savedModuleState);
            }
          } catch (storeError) {
            console.warn('Failed to load module state from store:', storeError);
            // Continue with defaults if store access fails
          }
        }

        // Get enabled modules
        const enabledModules = moduleRegistry.getEnabledModules().map(m => m.id);
        const moduleConfigs = {};
        
        moduleRegistry.getAllModules().forEach(module => {
          const state = moduleRegistry.getModuleState(module.id);
          if (state) {
            moduleConfigs[module.id] = state.config;
          }
        });

        dispatch({
          type: MODULE_ACTIONS.INITIALIZE,
          payload: { enabledModules, moduleConfigs }
        });
      } catch (error) {
        console.error('Failed to initialize modules:', error);
      } finally {
        dispatch({ type: MODULE_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeModules();
  }, []);

  // Save state to electron store with debouncing
  const saveState = useCallback(() => {
    if (!window.electronAPI || !window.electronAPI.store) return;
    if (!state.initialized) return; // Don't save until initialized

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const persistedState = moduleRegistry.getPersistedState();
        await window.electronAPI.store.set('moduleState', persistedState);
      } catch (error) {
        console.error('Failed to save module state:', error);
      }
    }, 1000); // 1s debounce to reduce save frequency
  }, [state.initialized]);

  // Save state whenever it changes
  useEffect(() => {
    if (state.initialized) {
      saveState();
    }
  }, [state.enabledModules, state.moduleConfigs, saveState]);

  /**
   * Toggle a module on/off
   */
  const toggleModule = useCallback(async (moduleId) => {
    const module = moduleRegistry.getModule(moduleId);
    if (!module) return;

    const currentlyEnabled = state.enabledModules.includes(moduleId);
    
    if (!currentlyEnabled) {
      // Check if module can be enabled
      const { canEnable, missingDependencies } = moduleRegistry.canEnableModule(moduleId);
      if (!canEnable) {
        throw new Error(`Cannot enable ${module.name}. Missing dependencies: ${missingDependencies.join(', ')}`);
      }
    } else {
      // Check if other modules depend on this one
      const dependentModules = moduleRegistry.getDependentModules(moduleId);
      const enabledDependents = dependentModules.filter(m => 
        state.enabledModules.includes(m.id)
      );
      
      if (enabledDependents.length > 0) {
        throw new Error(
          `Cannot disable ${module.name}. The following modules depend on it: ${
            enabledDependents.map(m => m.name).join(', ')
          }`
        );
      }
    }

    // Update registry
    moduleRegistry.updateModuleState(moduleId, { enabled: !currentlyEnabled });
    
    // Update context state
    dispatch({
      type: MODULE_ACTIONS.TOGGLE_MODULE,
      payload: { moduleId, enabled: !currentlyEnabled }
    });
  }, [state.enabledModules]);

  /**
   * Check if a module is enabled
   */
  const isModuleEnabled = useCallback((moduleId) => {
    return state.enabledModules.includes(moduleId);
  }, [state.enabledModules]);

  /**
   * Get all modules
   */
  const getAllModules = useCallback(() => {
    return moduleRegistry.getAllModules();
  }, []);

  /**
   * Get a specific module
   */
  const getModule = useCallback((moduleId) => {
    return moduleRegistry.getModule(moduleId);
  }, []);

  /**
   * Get module configuration
   */
  const getModuleConfig = useCallback((moduleId) => {
    return state.moduleConfigs[moduleId] || {};
  }, [state.moduleConfigs]);

  /**
   * Update module configuration
   */
  const updateModuleConfig = useCallback((moduleId, config) => {
    moduleRegistry.updateModuleState(moduleId, { config });
    dispatch({
      type: MODULE_ACTIONS.UPDATE_MODULE_CONFIG,
      payload: { moduleId, config }
    });
  }, []);

  /**
   * Check if a module can be enabled
   */
  const canEnableModule = useCallback((moduleId) => {
    return moduleRegistry.canEnableModule(moduleId);
  }, []);

  /**
   * Get modules that depend on a given module
   */
  const getDependentModules = useCallback((moduleId) => {
    return moduleRegistry.getDependentModules(moduleId);
  }, []);

  /**
   * Get enabled modules with tab names
   */
  const getEnabledTabModules = useCallback(() => {
    return getAllModules()
      .filter(module => isModuleEnabled(module.id) && module.tabName)
      .map(module => ({
        id: module.id,
        tabName: module.tabName
      }));
  }, [getAllModules, isModuleEnabled]);

  const value = {
    // State
    initialized: state.initialized,
    loading: state.loading,
    enabledModules: state.enabledModules,
    
    // Methods
    toggleModule,
    isModuleEnabled,
    getAllModules,
    getModule,
    getModuleConfig,
    updateModuleConfig,
    canEnableModule,
    getDependentModules,
    getEnabledTabModules,
    
    // Save method for manual saves
    saveModuleState: saveState
  };

  // Don't render children until initialized to avoid conflicts
  if (!state.initialized && state.loading) {
    return null; // Or a minimal loading state
  }

  return (
    <ModuleContext.Provider value={value}>
      {children}
    </ModuleContext.Provider>
  );
}

/**
 * Hook to use module context
 */
export function useModules() {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModules must be used within a ModuleProvider');
  }
  return context;
}