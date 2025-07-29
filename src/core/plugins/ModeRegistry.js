/**
 * Mode Registry
 * 
 * Central registry for managing and loading mode plugins
 */

import { ModePluginSchema, PluginStates, ValidationErrors } from './types';
import { validateMode } from './validator';

class ModeRegistry {
  constructor() {
    this.modes = new Map();
    this.activeMode = null;
    this.listeners = new Set();
    this.state = new Map();
  }
  
  /**
   * Register a new mode plugin
   * @param {Object} mode - Mode plugin object
   * @returns {Object} Registration result
   */
  async register(mode) {
    try {
      // Validate mode structure
      const validation = await validateMode(mode);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          details: validation.details
        };
      }
      
      // Check for duplicate ID
      if (this.modes.has(mode.id)) {
        return {
          success: false,
          error: ValidationErrors.DUPLICATE_MODE_ID,
          details: `Mode with ID '${mode.id}' already exists`
        };
      }
      
      // Set initial state
      this.state.set(mode.id, PluginStates.LOADED);
      
      // Store mode
      this.modes.set(mode.id, mode);
      
      // Notify listeners
      this.notifyListeners({
        type: 'mode-registered',
        modeId: mode.id,
        mode
      });
      
      return {
        success: true,
        modeId: mode.id
      };
    } catch (error) {
      return {
        success: false,
        error: 'REGISTRATION_ERROR',
        details: error.message
      };
    }
  }
  
  /**
   * Unregister a mode plugin
   * @param {string} modeId - Mode ID to unregister
   * @returns {boolean} Success status
   */
  async unregister(modeId) {
    if (!this.modes.has(modeId)) {
      return false;
    }
    
    // If this is the active mode, deactivate it first
    if (this.activeMode === modeId) {
      await this.deactivate(modeId);
    }
    
    // Remove mode
    this.modes.delete(modeId);
    this.state.delete(modeId);
    
    // Notify listeners
    this.notifyListeners({
      type: 'mode-unregistered',
      modeId
    });
    
    return true;
  }
  
  /**
   * Activate a mode
   * @param {string} modeId - Mode ID to activate
   * @returns {Object} Activation result
   */
  async activate(modeId) {
    const mode = this.modes.get(modeId);
    if (!mode) {
      return {
        success: false,
        error: 'MODE_NOT_FOUND',
        details: `Mode '${modeId}' not found in registry`
      };
    }
    
    try {
      // Deactivate current mode if any
      if (this.activeMode && this.activeMode !== modeId) {
        await this.deactivate(this.activeMode);
      }
      
      // Update state
      this.state.set(modeId, PluginStates.ACTIVE);
      
      // Call mode's activation hook
      if (mode.onActivate) {
        await mode.onActivate();
      }
      
      // Set as active mode
      this.activeMode = modeId;
      
      // Notify listeners
      this.notifyListeners({
        type: 'mode-activated',
        modeId,
        mode
      });
      
      return {
        success: true,
        mode
      };
    } catch (error) {
      this.state.set(modeId, PluginStates.ERROR);
      return {
        success: false,
        error: 'ACTIVATION_ERROR',
        details: error.message
      };
    }
  }
  
  /**
   * Deactivate a mode
   * @param {string} modeId - Mode ID to deactivate
   * @returns {boolean} Success status
   */
  async deactivate(modeId) {
    const mode = this.modes.get(modeId);
    if (!mode) {
      return false;
    }
    
    try {
      // Update state
      this.state.set(modeId, PluginStates.LOADED);
      
      // Call mode's deactivation hook
      if (mode.onDeactivate) {
        await mode.onDeactivate();
      }
      
      // Clear active mode if this was it
      if (this.activeMode === modeId) {
        this.activeMode = null;
      }
      
      // Notify listeners
      this.notifyListeners({
        type: 'mode-deactivated',
        modeId
      });
      
      return true;
    } catch (error) {
      console.error(`Error deactivating mode ${modeId}:`, error);
      return false;
    }
  }
  
  /**
   * Get a registered mode
   * @param {string} modeId - Mode ID
   * @returns {Object|null} Mode object or null
   */
  getMode(modeId) {
    return this.modes.get(modeId) || null;
  }
  
  /**
   * Get the active mode
   * @returns {Object|null} Active mode object or null
   */
  getActiveMode() {
    return this.activeMode ? this.modes.get(this.activeMode) : null;
  }
  
  /**
   * Get all registered modes
   * @returns {Array} Array of mode objects
   */
  getAllModes() {
    return Array.from(this.modes.values());
  }
  
  /**
   * Get mode state
   * @param {string} modeId - Mode ID
   * @returns {string} Mode state
   */
  getModeState(modeId) {
    return this.state.get(modeId) || PluginStates.UNLOADED;
  }
  
  /**
   * Check if a mode is registered
   * @param {string} modeId - Mode ID
   * @returns {boolean} Registration status
   */
  isRegistered(modeId) {
    return this.modes.has(modeId);
  }
  
  /**
   * Check if a mode is active
   * @param {string} modeId - Mode ID
   * @returns {boolean} Active status
   */
  isActive(modeId) {
    return this.activeMode === modeId;
  }
  
  /**
   * Add a listener for registry events
   * @param {Function} listener - Event listener function
   * @returns {Function} Unsubscribe function
   */
  addListener(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Notify all listeners of an event
   * @param {Object} event - Event object
   */
  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in mode registry listener:', error);
      }
    });
  }
  
  /**
   * Clear all modes and reset registry
   */
  clear() {
    // Deactivate active mode
    if (this.activeMode) {
      this.deactivate(this.activeMode);
    }
    
    // Clear all data
    this.modes.clear();
    this.state.clear();
    this.listeners.clear();
    this.activeMode = null;
  }
}

// Create singleton instance
const modeRegistry = new ModeRegistry();

// Export singleton
export default modeRegistry;

// Export class for testing
export { ModeRegistry };