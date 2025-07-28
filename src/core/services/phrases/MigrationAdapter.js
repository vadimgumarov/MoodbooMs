/**
 * MigrationAdapter - Provides compatibility layer for existing phrase system
 * 
 * This adapter allows the new phrase configuration system to work with
 * the existing modeContent.js structure while we migrate to the new system
 */

import phraseSystem from './index';
import { modeContent } from '../../../content/modeContent';

class MigrationAdapter {
  constructor() {
    this.initialized = false;
    this.phraseTracking = {
      queen: {},
      king: {}
    };
  }

  /**
   * Initialize the phrase system with existing modeContent
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Convert existing modeContent to new format and register
      const configs = {};
      
      for (const [modeName, modeData] of Object.entries(modeContent)) {
        configs[modeName] = this.convertToNewFormat(modeName, modeData);
      }

      await phraseSystem.initialize(configs);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize migration adapter:', error);
      throw error;
    }
  }

  /**
   * Convert existing mode content to new configuration format
   */
  convertToNewFormat(modeName, modeData) {
    const converted = {
      phases: {},
      special: {},
      ui: modeData.ui || {},
      metadata: {
        migrated: true,
        originalMode: modeName
      }
    };

    // Convert phases
    for (const [phaseName, phaseData] of Object.entries(modeData.phases)) {
      converted.phases[phaseName] = {
        name: phaseData.name,
        description: phaseData.description,
        calendarTooltip: phaseData.calendarTooltip,
        moods: this.convertMoods(phaseData.moods),
        cravings: phaseData.cravings || []
      };
    }

    // Add special phrases if they don't exist
    converted.special = {
      firstDay: ["Starting this journey again..."],
      lastDay: ["Almost there..."],
      ovulation: ["Peak time"]
    };

    return converted;
  }

  /**
   * Convert moods to support both legacy and new format
   */
  convertMoods(moods) {
    if (Array.isArray(moods)) {
      // Legacy format - array of strings
      return {
        default: moods
      };
    }
    // Already in new format
    return moods;
  }

  /**
   * Drop-in replacement for getRandomPhrase
   */
  getRandomPhrase(mode, phase, type) {
    if (!this.initialized) {
      console.warn('Migration adapter not initialized, using fallback');
      return type === 'cravings' 
        ? { icon: 'Cookie', text: 'something' }
        : 'Loading...';
    }

    const context = phraseSystem.getCurrentContext();
    return phraseSystem.getPhrase(mode, phase, type, context);
  }

  /**
   * Drop-in replacement for resetPhraseTracking
   */
  resetPhraseTracking(mode) {
    phraseSystem.clearHistory(mode);
  }

  /**
   * Drop-in replacement for getUIText
   */
  getUIText(mode, category, key) {
    return phraseSystem.getUIText(mode, category, key);
  }

  /**
   * Get phase tracking compatible with old system
   */
  getLastUsedPhrases(mode, phase, type) {
    const key = `${mode}_${phase}_${type}`;
    return this.phraseTracking[mode][key] || [];
  }

  /**
   * Set phase tracking compatible with old system
   */
  setLastUsedPhrases(mode, phase, type, phrases) {
    const key = `${mode}_${phase}_${type}`;
    if (!this.phraseTracking[mode]) {
      this.phraseTracking[mode] = {};
    }
    this.phraseTracking[mode][key] = phrases;
  }

  /**
   * Export adapter state for persistence
   */
  exportState() {
    return {
      phraseHistory: phraseSystem.exportHistory(),
      initialized: this.initialized
    };
  }

  /**
   * Import adapter state from persistence
   */
  importState(state) {
    if (state && state.phraseHistory) {
      phraseSystem.importHistory(state.phraseHistory);
    }
  }

  /**
   * Check if migration is complete
   */
  isMigrationComplete() {
    // In future, this could check if all components are using new system
    return false;
  }

  /**
   * Get migration status report
   */
  getMigrationStatus() {
    return {
      initialized: this.initialized,
      modesLoaded: phraseSystem.phraseManager.getModes(),
      usingNewSystem: false,
      components: {
        MenuBarApp: 'legacy',
        KingMode: 'legacy',
        QueenMode: 'legacy'
      }
    };
  }
}

// Create singleton instance
const migrationAdapter = new MigrationAdapter();

// Auto-initialize on first import
if (typeof window !== 'undefined') {
  // Browser environment - initialize immediately
  migrationAdapter.initialize().catch(console.error);
}

export default migrationAdapter;

// Export functions that match the old API
export const getRandomPhrase = (mode, phase, type) => 
  migrationAdapter.getRandomPhrase(mode, phase, type);

export const resetPhraseTracking = (mode) => 
  migrationAdapter.resetPhraseTracking(mode);

export const getUIText = (mode, category, key) => 
  migrationAdapter.getUIText(mode, category, key);