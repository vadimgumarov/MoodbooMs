/**
 * Mode Loader
 * 
 * Discovers and loads mode plugins from various sources
 */

import modeRegistry from './ModeRegistry';
import { PluginStates } from './types';

// Built-in modes
import { QueenModePlugin } from '../../modes/queen/plugin';
import { KingModePlugin } from '../../modes/king/plugin';

class ModeLoader {
  constructor() {
    this.builtInModes = new Map([
      ['queen', QueenModePlugin],
      ['king', KingModePlugin]
    ]);
    this.customModesPath = null;
    this.loadedModes = new Set();
  }
  
  /**
   * Initialize the mode loader and load built-in modes
   */
  async initialize() {
    console.log('[ModeLoader] Initializing...');
    
    // Load built-in modes
    for (const [id, ModeClass] of this.builtInModes) {
      try {
        await this.loadBuiltInMode(id, ModeClass);
      } catch (error) {
        console.error(`[ModeLoader] Failed to load built-in mode '${id}':`, error);
      }
    }
    
    // Check for custom modes directory
    if (window.electronAPI?.app) {
      try {
        const userDataPath = await window.electronAPI.app.getPath('userData');
        this.customModesPath = `${userDataPath}/modes`;
        await this.loadCustomModes();
      } catch (error) {
        console.error('[ModeLoader] Failed to setup custom modes path:', error);
      }
    }
    
    console.log('[ModeLoader] Initialization complete');
  }
  
  /**
   * Load a built-in mode
   * @param {string} id - Mode ID
   * @param {Function} ModeClass - Mode class/factory
   */
  async loadBuiltInMode(id, ModeClass) {
    try {
      console.log(`[ModeLoader] Loading built-in mode '${id}'...`);
      
      // Create mode instance
      const mode = typeof ModeClass === 'function' ? new ModeClass() : ModeClass;
      
      // Register with the registry
      const result = await modeRegistry.register(mode);
      
      if (result.success) {
        this.loadedModes.add(id);
        console.log(`[ModeLoader] Successfully loaded built-in mode '${id}'`);
      } else {
        console.error(`[ModeLoader] Failed to register mode '${id}':`, result.error, result.details);
      }
    } catch (error) {
      console.error(`[ModeLoader] Error loading built-in mode '${id}':`, error);
      throw error;
    }
  }
  
  /**
   * Load custom modes from user directory
   */
  async loadCustomModes() {
    if (!this.customModesPath || !window.electronAPI?.fs) {
      return;
    }
    
    try {
      console.log(`[ModeLoader] Scanning for custom modes in: ${this.customModesPath}`);
      
      // Check if custom modes directory exists
      const exists = await window.electronAPI.fs.exists(this.customModesPath);
      if (!exists) {
        console.log('[ModeLoader] Custom modes directory does not exist');
        return;
      }
      
      // Read directory contents
      const entries = await window.electronAPI.fs.readdir(this.customModesPath);
      
      // Load each mode directory
      for (const entry of entries) {
        if (entry.isDirectory) {
          await this.loadCustomMode(entry.name);
        }
      }
    } catch (error) {
      console.error('[ModeLoader] Error loading custom modes:', error);
    }
  }
  
  /**
   * Load a single custom mode
   * @param {string} modeName - Mode directory name
   */
  async loadCustomMode(modeName) {
    const modePath = `${this.customModesPath}/${modeName}`;
    
    try {
      console.log(`[ModeLoader] Loading custom mode from: ${modePath}`);
      
      // Check for manifest file
      const manifestPath = `${modePath}/manifest.json`;
      const manifestExists = await window.electronAPI.fs.exists(manifestPath);
      
      if (!manifestExists) {
        console.warn(`[ModeLoader] No manifest.json found for mode '${modeName}'`);
        return;
      }
      
      // Read and parse manifest
      const manifestContent = await window.electronAPI.fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);
      
      // Validate manifest
      if (!manifest.id || !manifest.main) {
        console.error(`[ModeLoader] Invalid manifest for mode '${modeName}'`);
        return;
      }
      
      // Dynamic import of the mode (this would need special handling in Electron)
      // For now, we'll just log that we found it
      console.log(`[ModeLoader] Found custom mode '${manifest.id}' v${manifest.version}`);
      
      // In a real implementation, you'd need to:
      // 1. Use Electron's protocol to serve the custom mode files
      // 2. Dynamically import the mode module
      // 3. Register it with the registry
      
    } catch (error) {
      console.error(`[ModeLoader] Error loading custom mode '${modeName}':`, error);
    }
  }
  
  /**
   * Reload all modes
   */
  async reload() {
    console.log('[ModeLoader] Reloading all modes...');
    
    // Clear loaded modes
    this.loadedModes.clear();
    
    // Re-initialize
    await this.initialize();
  }
  
  /**
   * Get list of available modes
   * @returns {Array} Array of mode info objects
   */
  getAvailableModes() {
    const modes = modeRegistry.getAllModes();
    return modes.map(mode => ({
      id: mode.id,
      name: mode.name,
      description: mode.description,
      version: mode.version,
      author: mode.author,
      isBuiltIn: this.builtInModes.has(mode.id),
      isActive: modeRegistry.isActive(mode.id),
      state: modeRegistry.getModeState(mode.id)
    }));
  }
  
  /**
   * Load a mode by ID
   * @param {string} modeId - Mode ID to load
   * @returns {Object} Load result
   */
  async loadMode(modeId) {
    // Check if already loaded
    if (this.loadedModes.has(modeId)) {
      return {
        success: true,
        message: 'Mode already loaded'
      };
    }
    
    // Check built-in modes
    if (this.builtInModes.has(modeId)) {
      const ModeClass = this.builtInModes.get(modeId);
      await this.loadBuiltInMode(modeId, ModeClass);
      return {
        success: true,
        message: 'Built-in mode loaded'
      };
    }
    
    // Try to load as custom mode
    await this.loadCustomMode(modeId);
    
    return {
      success: this.loadedModes.has(modeId),
      message: this.loadedModes.has(modeId) ? 'Mode loaded' : 'Mode not found'
    };
  }
  
  /**
   * Unload a mode
   * @param {string} modeId - Mode ID to unload
   * @returns {boolean} Success status
   */
  async unloadMode(modeId) {
    const success = await modeRegistry.unregister(modeId);
    if (success) {
      this.loadedModes.delete(modeId);
    }
    return success;
  }
}

// Create singleton instance
const modeLoader = new ModeLoader();

// Export singleton
export default modeLoader;

// Export class for testing
export { ModeLoader };