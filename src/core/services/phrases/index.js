/**
 * Phrase Configuration System
 * 
 * Provides a flexible, mode-agnostic phrase management system
 * with support for contextual selection, history tracking, and hot-reloading
 */

import phraseManager from './PhraseManager';
import configLoader from './PhraseConfigLoader';
import { TIME_PERIODS, SPECIAL_EVENTS } from './types';

// Initialize and connect the services
let initialized = false;

/**
 * Initialize the phrase system with mode configurations
 */
export async function initializePhraseSystem(modeConfigs = {}) {
  if (initialized) {
    console.warn('Phrase system already initialized');
    return;
  }

  try {
    // Load each mode configuration
    for (const [modeName, config] of Object.entries(modeConfigs)) {
      await configLoader.loadConfig(modeName, config);
      const loadedConfig = configLoader.getConfig(modeName);
      phraseManager.registerMode(modeName, loadedConfig);
    }

    initialized = true;
    console.log('Phrase system initialized with modes:', Object.keys(modeConfigs));
  } catch (error) {
    console.error('Failed to initialize phrase system:', error);
    throw error;
  }
}

/**
 * Get a phrase with full context awareness
 */
export function getPhrase(modeName, phase, type = 'moods', context = {}) {
  if (!initialized) {
    console.warn('Phrase system not initialized, returning fallback');
    return phraseManager.getFallbackPhrase(type);
  }

  // Build full context
  const fullContext = {
    currentTime: new Date(),
    ...context
  };

  return phraseManager.getPhrase(modeName, phase, type, fullContext);
}

/**
 * Get a special event phrase
 */
export function getSpecialPhrase(modeName, eventType) {
  return phraseManager.getSpecialPhrase(modeName, eventType);
}

/**
 * Get UI text
 */
export function getUIText(modeName, category, key) {
  return phraseManager.getUIText(modeName, category, key);
}

/**
 * Clear phrase history
 */
export function clearPhraseHistory(modeName = null) {
  phraseManager.clearHistory(modeName);
}

/**
 * Hot-reload a mode configuration (development only)
 */
export async function reloadModeConfig(modeName, config) {
  try {
    const reloadedConfig = await configLoader.reloadConfig(modeName, config);
    phraseManager.registerMode(modeName, reloadedConfig);
    console.log(`Reloaded configuration for ${modeName}`);
    return true;
  } catch (error) {
    console.error(`Failed to reload ${modeName}:`, error);
    return false;
  }
}

/**
 * Get current context information
 */
export function getCurrentContext(cycleDay, phase, isFirstDay = false) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  return {
    currentTime: now,
    cycleDay,
    phase,
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    isFirstDay,
    isLastDay: false, // Would need phase length info
    timePeriod: phraseManager.getTimePeriod(now)
  };
}

/**
 * Export/import phrase history for persistence
 */
export function exportPhraseHistory() {
  return phraseManager.exportHistory();
}

export function importPhraseHistory(historyData) {
  phraseManager.importHistory(historyData);
}

// Export types and constants
export { TIME_PERIODS, SPECIAL_EVENTS } from './types';

// Export services for advanced usage
export { phraseManager, configLoader };

// Default export with main API
export default {
  initialize: initializePhraseSystem,
  getPhrase,
  getSpecialPhrase,
  getUIText,
  clearHistory: clearPhraseHistory,
  reloadConfig: reloadModeConfig,
  getCurrentContext,
  exportHistory: exportPhraseHistory,
  importHistory: importPhraseHistory
};