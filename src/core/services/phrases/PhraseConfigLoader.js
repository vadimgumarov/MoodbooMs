/**
 * PhraseConfigLoader - Loads and validates phrase configurations
 * 
 * Handles:
 * - Loading mode-specific phrase configurations
 * - Validating configuration structure
 * - Merging with defaults
 * - Hot-reloading in development
 */

class PhraseConfigLoader {
  constructor() {
    this.configs = new Map();
    this.watchers = new Map();
    this.isDevelopment = (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') || false;
  }

  /**
   * Load a phrase configuration
   */
  async loadConfig(modeName, configPath) {
    try {
      // In a real implementation, this would load from file
      // For now, we'll import dynamically
      const config = await this.importConfig(configPath);
      
      // Validate the configuration
      this.validateConfig(modeName, config);
      
      // Store the validated config
      this.configs.set(modeName, config);
      
      // Set up hot-reloading in development
      if (this.isDevelopment) {
        this.setupHotReload(modeName, configPath);
      }
      
      return config;
    } catch (error) {
      console.error(`Failed to load phrase config for ${modeName}:`, error);
      throw error;
    }
  }

  /**
   * Import configuration (can be extended for different sources)
   */
  async importConfig(configPath) {
    // Handle direct config objects
    if (typeof configPath === 'object') {
      return configPath;
    }
    
    // For now, we don't support dynamic string paths to avoid webpack warnings
    // In future, this could be enhanced to load from JSON files, APIs, etc.
    throw new Error('Dynamic config paths not yet supported. Please pass config objects directly.');
  }

  /**
   * Validate configuration structure
   */
  validateConfig(modeName, config) {
    if (!config || typeof config !== 'object') {
      throw new Error(`Invalid config for ${modeName}: config must be an object`);
    }

    // Validate required fields
    if (!config.phases || typeof config.phases !== 'object') {
      throw new Error(`Invalid config for ${modeName}: missing or invalid phases`);
    }

    // Validate each phase
    const requiredPhases = ['menstrual', 'follicular', 'ovulation', 'luteal', 'lateLuteal', 'premenstrual'];
    for (const phase of requiredPhases) {
      if (!config.phases[phase]) {
        throw new Error(`Invalid config for ${modeName}: missing phase '${phase}'`);
      }

      const phaseConfig = config.phases[phase];
      
      // Validate phase structure
      if (!phaseConfig.name || typeof phaseConfig.name !== 'string') {
        throw new Error(`Invalid config for ${modeName}: phase '${phase}' missing name`);
      }

      if (!phaseConfig.moods || (!Array.isArray(phaseConfig.moods) && typeof phaseConfig.moods !== 'object')) {
        throw new Error(`Invalid config for ${modeName}: phase '${phase}' has invalid moods`);
      }

      if (!phaseConfig.cravings || !Array.isArray(phaseConfig.cravings)) {
        throw new Error(`Invalid config for ${modeName}: phase '${phase}' has invalid cravings`);
      }

      // Validate cravings structure
      for (const craving of phaseConfig.cravings) {
        if (!craving.icon || !craving.text) {
          throw new Error(`Invalid config for ${modeName}: phase '${phase}' has invalid craving format`);
        }
      }
    }

    // Validate UI text if present
    if (config.ui && typeof config.ui !== 'object') {
      throw new Error(`Invalid config for ${modeName}: ui must be an object`);
    }

    return true;
  }

  /**
   * Set up hot-reloading for development
   */
  setupHotReload(modeName, configPath) {
    // In a real implementation, this would use file watchers
    // For now, we'll provide a manual reload method
    console.log(`Hot-reload enabled for ${modeName} config`);
  }

  /**
   * Manually reload a configuration
   */
  async reloadConfig(modeName, configPath) {
    if (!this.isDevelopment) {
      console.warn('Config reloading is only available in development mode');
      return;
    }

    try {
      const newConfig = await this.loadConfig(modeName, configPath);
      console.log(`Reloaded config for ${modeName}`);
      return newConfig;
    } catch (error) {
      console.error(`Failed to reload config for ${modeName}:`, error);
      throw error;
    }
  }

  /**
   * Get a loaded configuration
   */
  getConfig(modeName) {
    return this.configs.get(modeName);
  }

  /**
   * Check if a configuration is loaded
   */
  hasConfig(modeName) {
    return this.configs.has(modeName);
  }

  /**
   * Get all loaded mode names
   */
  getLoadedModes() {
    return Array.from(this.configs.keys());
  }

  /**
   * Merge configurations (useful for extending modes)
   */
  mergeConfigs(baseConfig, overrides) {
    const merged = JSON.parse(JSON.stringify(baseConfig)); // Deep clone

    // Merge phases
    if (overrides.phases) {
      Object.keys(overrides.phases).forEach(phase => {
        if (merged.phases[phase]) {
          // Merge phase properties
          Object.assign(merged.phases[phase], overrides.phases[phase]);
          
          // Merge moods arrays
          if (overrides.phases[phase].moods) {
            if (Array.isArray(merged.phases[phase].moods)) {
              merged.phases[phase].moods = [
                ...merged.phases[phase].moods,
                ...overrides.phases[phase].moods
              ];
            } else {
              // Handle new format with contextual moods
              merged.phases[phase].moods = {
                ...merged.phases[phase].moods,
                ...overrides.phases[phase].moods
              };
            }
          }
          
          // Merge cravings
          if (overrides.phases[phase].cravings) {
            merged.phases[phase].cravings = [
              ...merged.phases[phase].cravings,
              ...overrides.phases[phase].cravings
            ];
          }
        } else {
          merged.phases[phase] = overrides.phases[phase];
        }
      });
    }

    // Merge special phrases
    if (overrides.special) {
      merged.special = {
        ...merged.special,
        ...overrides.special
      };
    }

    // Merge UI text
    if (overrides.ui) {
      merged.ui = {
        ...merged.ui,
        ...overrides.ui
      };
    }

    return merged;
  }

  /**
   * Clear all loaded configurations
   */
  clearAll() {
    this.configs.clear();
    this.watchers.clear();
  }
}

// Create singleton instance
const configLoader = new PhraseConfigLoader();

export default configLoader;