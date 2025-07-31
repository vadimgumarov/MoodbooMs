/**
 * Module System Type Definitions
 * 
 * Core types and interfaces for the modular system
 */

/**
 * Module definition structure
 * @typedef {Object} Module
 * @property {string} id - Unique module identifier
 * @property {string} name - Display name for the module
 * @property {string} description - Brief description of module functionality
 * @property {string[]} [dependencies] - Array of module IDs this module depends on
 * @property {boolean} defaultEnabled - Whether module is enabled by default
 * @property {string} [tabName] - Tab name if module adds a tab
 * @property {string} category - Module category (core, display, advanced)
 * @property {Object} [config] - Module-specific configuration
 */

/**
 * Module categories
 */
export const MODULE_CATEGORIES = {
  CORE: 'core',
  DISPLAY: 'display',
  ADVANCED: 'advanced'
};

/**
 * Module IDs
 */
export const MODULE_IDS = {
  MOOD: 'mood',
  CALENDAR: 'calendar',
  HISTORY: 'history',
  PHASE_DETAIL: 'phaseDetail'
};

/**
 * Module state in the registry
 * @typedef {Object} ModuleState
 * @property {boolean} enabled - Whether the module is currently enabled
 * @property {Object} [config] - Module-specific configuration overrides
 * @property {Date} [lastToggled] - When the module was last toggled
 */

/**
 * Registry state structure
 * @typedef {Object} RegistryState
 * @property {Object.<string, Module>} modules - All registered modules
 * @property {Object.<string, ModuleState>} moduleStates - Current state of each module
 * @property {boolean} initialized - Whether the registry has been initialized
 */