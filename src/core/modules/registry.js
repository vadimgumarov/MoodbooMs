/**
 * Module Registry
 * 
 * Central registry for all available modules and their configurations
 */

import { MODULE_IDS, MODULE_CATEGORIES } from './types';

/**
 * Core module definitions
 */
export const moduleDefinitions = {
  [MODULE_IDS.MOOD]: {
    id: MODULE_IDS.MOOD,
    name: 'Mood Tracking',
    description: 'Current phase, mood messages, and food cravings',
    category: MODULE_CATEGORIES.CORE,
    defaultEnabled: true,
    tabName: 'Today',
    dependencies: [],
    config: {
      showMoodMessage: true,
      showCravings: true,
      showPhaseIcon: true
    }
  },
  
  [MODULE_IDS.CALENDAR]: {
    id: MODULE_IDS.CALENDAR,
    name: 'Calendar View',
    description: 'Monthly calendar with fertility tracking and phase colors',
    category: MODULE_CATEGORIES.CORE,
    defaultEnabled: true,
    tabName: 'Calendar',
    dependencies: [],
    config: {
      showFertilityColors: true,
      showPhaseLabels: true
    }
  },
  
  [MODULE_IDS.HISTORY]: {
    id: MODULE_IDS.HISTORY,
    name: 'Cycle History',
    description: 'Track past cycles, view statistics, and predictions',
    category: MODULE_CATEGORIES.DISPLAY,
    defaultEnabled: true,
    tabName: 'History',
    dependencies: [],
    config: {
      showStatistics: true,
      showPredictions: true,
      maxCyclesToShow: 12
    }
  },
  
  [MODULE_IDS.PHASE_DETAIL]: {
    id: MODULE_IDS.PHASE_DETAIL,
    name: 'Phase Details',
    description: 'Detailed phase information when selecting calendar dates',
    category: MODULE_CATEGORIES.DISPLAY,
    defaultEnabled: true,
    dependencies: [MODULE_IDS.CALENDAR], // Requires calendar to be enabled
    config: {
      showFertilityPercentage: true,
      showPhaseDescription: true
    }
  }
};

/**
 * Module Registry Class
 */
class ModuleRegistry {
  constructor() {
    this.modules = new Map();
    this.moduleStates = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the registry with default modules
   */
  initialize() {
    if (this.initialized) return;
    
    // Register all default modules
    Object.values(moduleDefinitions).forEach(module => {
      this.registerModule(module);
    });
    
    this.initialized = true;
  }

  /**
   * Register a module
   * @param {Module} module - Module definition
   */
  registerModule(module) {
    if (!module.id) {
      throw new Error('Module must have an id');
    }
    
    this.modules.set(module.id, module);
    
    // Set default state if not exists
    if (!this.moduleStates.has(module.id)) {
      this.moduleStates.set(module.id, {
        enabled: module.defaultEnabled,
        config: module.config || {},
        lastToggled: null
      });
    }
  }

  /**
   * Get all registered modules
   * @returns {Module[]}
   */
  getAllModules() {
    return Array.from(this.modules.values());
  }

  /**
   * Get a specific module
   * @param {string} moduleId 
   * @returns {Module|undefined}
   */
  getModule(moduleId) {
    return this.modules.get(moduleId);
  }

  /**
   * Get module state
   * @param {string} moduleId 
   * @returns {ModuleState|undefined}
   */
  getModuleState(moduleId) {
    return this.moduleStates.get(moduleId);
  }

  /**
   * Check if a module is enabled
   * @param {string} moduleId 
   * @returns {boolean}
   */
  isModuleEnabled(moduleId) {
    const state = this.moduleStates.get(moduleId);
    return state ? state.enabled : false;
  }

  /**
   * Get all enabled modules
   * @returns {Module[]}
   */
  getEnabledModules() {
    return this.getAllModules().filter(module => 
      this.isModuleEnabled(module.id)
    );
  }

  /**
   * Check if a module can be enabled (dependencies satisfied)
   * @param {string} moduleId 
   * @returns {{canEnable: boolean, missingDependencies: string[]}}
   */
  canEnableModule(moduleId) {
    const module = this.getModule(moduleId);
    if (!module) {
      return { canEnable: false, missingDependencies: [] };
    }

    const missingDependencies = (module.dependencies || []).filter(
      depId => !this.isModuleEnabled(depId)
    );

    return {
      canEnable: missingDependencies.length === 0,
      missingDependencies
    };
  }

  /**
   * Get modules that depend on a given module
   * @param {string} moduleId 
   * @returns {Module[]}
   */
  getDependentModules(moduleId) {
    return this.getAllModules().filter(module =>
      (module.dependencies || []).includes(moduleId)
    );
  }

  /**
   * Update module state
   * @param {string} moduleId 
   * @param {Partial<ModuleState>} updates 
   */
  updateModuleState(moduleId, updates) {
    const currentState = this.moduleStates.get(moduleId);
    if (!currentState) return;

    this.moduleStates.set(moduleId, {
      ...currentState,
      ...updates,
      lastToggled: new Date()
    });
  }

  /**
   * Get registry state for persistence
   * @returns {Object}
   */
  getPersistedState() {
    const state = {};
    this.moduleStates.forEach((moduleState, moduleId) => {
      state[moduleId] = {
        enabled: moduleState.enabled,
        config: moduleState.config
      };
    });
    return state;
  }

  /**
   * Restore registry state from persistence
   * @param {Object} persistedState 
   */
  restorePersistedState(persistedState) {
    if (!persistedState) return;

    Object.entries(persistedState).forEach(([moduleId, state]) => {
      if (this.modules.has(moduleId)) {
        this.moduleStates.set(moduleId, {
          enabled: state.enabled,
          config: state.config || {},
          lastToggled: state.lastToggled ? new Date(state.lastToggled) : null
        });
      }
    });
  }
}

// Create singleton instance
export const moduleRegistry = new ModuleRegistry();