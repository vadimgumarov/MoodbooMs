/**
 * PhraseManager - Core service for managing mode-specific phrases
 * 
 * Features:
 * - Contextual phrase selection based on time/day
 * - Phrase history tracking to avoid repetition
 * - Fallback system for missing phrases
 * - Support for special events (first day, ovulation, etc.)
 */

import { TIME_PERIODS, SPECIAL_EVENTS } from './types';

class PhraseManager {
  constructor() {
    this.configs = {};
    this.history = {};
    this.maxHistorySize = 10; // Remember last 10 phrases per category
  }

  /**
   * Register a mode configuration
   */
  registerMode(modeName, config) {
    this.configs[modeName] = config;
    this.history[modeName] = {};
  }

  /**
   * Get current time period
   */
  getTimePeriod(date = new Date()) {
    const hour = date.getHours();
    
    if (hour >= 5 && hour < 12) return TIME_PERIODS.MORNING;
    if (hour >= 12 && hour < 17) return TIME_PERIODS.AFTERNOON;
    if (hour >= 17 && hour < 22) return TIME_PERIODS.EVENING;
    return TIME_PERIODS.NIGHT;
  }

  /**
   * Check if date is weekend
   */
  isWeekend(date = new Date()) {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  /**
   * Get a random phrase with context awareness
   */
  getPhrase(modeName, phase, type, context = {}) {
    const config = this.configs[modeName];
    if (!config || !config.phases[phase]) {
      return this.getFallbackPhrase(type);
    }

    const phaseConfig = config.phases[phase];
    let phrasePool = [];

    // Handle different phrase types
    if (type === 'moods') {
      phrasePool = this.getMoodPhrases(phaseConfig, context);
    } else if (type === 'cravings') {
      // Cravings are objects, not strings
      return this.getRandomCraving(phaseConfig.cravings, modeName, phase);
    } else {
      // Custom phrase types
      phrasePool = phaseConfig[type] || [];
    }

    if (phrasePool.length === 0) {
      return this.getFallbackPhrase(type);
    }

    return this.selectRandomPhrase(phrasePool, modeName, phase, type);
  }

  /**
   * Get mood phrases based on context
   */
  getMoodPhrases(phaseConfig, context) {
    let phrasePool = [];
    const currentTime = context.currentTime || new Date();
    
    // Check for special events first
    if (context.isFirstDay && phaseConfig.contextual?.firstDay) {
      phrasePool = [...phaseConfig.contextual.firstDay];
    } else if (context.isLastDay && phaseConfig.contextual?.lastDay) {
      phrasePool = [...phaseConfig.contextual.lastDay];
    } else {
      // Start with default phrases
      if (phaseConfig.moods.default) {
        phrasePool = [...phaseConfig.moods.default];
      } else if (Array.isArray(phaseConfig.moods)) {
        // Legacy format - moods is an array
        phrasePool = [...phaseConfig.moods];
      }

      // Add time-specific phrases
      const timePeriod = this.getTimePeriod(currentTime);
      if (phaseConfig.moods[timePeriod]) {
        phrasePool.push(...phaseConfig.moods[timePeriod]);
      }

      // Add weekend phrases if applicable
      if (this.isWeekend(currentTime) && phaseConfig.moods.weekend) {
        phrasePool.push(...phaseConfig.moods.weekend);
      }

      // Add mood-specific phrases if mood is specified
      if (context.mood && phaseConfig.moods.moods?.[context.mood]) {
        phrasePool.push(...phaseConfig.moods.moods[context.mood]);
      }
    }

    return phrasePool;
  }

  /**
   * Get a random craving
   */
  getRandomCraving(cravings, modeName, phase) {
    if (!cravings || cravings.length === 0) {
      return { icon: 'Cookie', text: 'something comforting' };
    }

    const historyKey = `${modeName}_${phase}_cravings`;
    if (!this.history[modeName][historyKey]) {
      this.history[modeName][historyKey] = [];
    }

    const history = this.history[modeName][historyKey];
    const availableCravings = cravings.filter((_, index) => 
      !history.includes(index)
    );

    if (availableCravings.length === 0) {
      // Reset history if all cravings have been used
      this.history[modeName][historyKey] = [];
      return cravings[Math.floor(Math.random() * cravings.length)];
    }

    const selectedIndex = cravings.indexOf(
      availableCravings[Math.floor(Math.random() * availableCravings.length)]
    );
    
    history.push(selectedIndex);
    if (history.length > this.maxHistorySize) {
      history.shift();
    }

    return cravings[selectedIndex];
  }

  /**
   * Select a random phrase avoiding recent repetitions
   */
  selectRandomPhrase(phrasePool, modeName, phase, type) {
    const historyKey = `${modeName}_${phase}_${type}`;
    
    if (!this.history[modeName][historyKey]) {
      this.history[modeName][historyKey] = [];
    }

    const history = this.history[modeName][historyKey];
    const availablePhrases = phrasePool.filter(phrase => 
      !history.includes(phrase)
    );

    let selectedPhrase;
    if (availablePhrases.length === 0) {
      // All phrases have been used recently, reset history
      this.history[modeName][historyKey] = [];
      selectedPhrase = phrasePool[Math.floor(Math.random() * phrasePool.length)];
    } else {
      selectedPhrase = availablePhrases[Math.floor(Math.random() * availablePhrases.length)];
    }

    // Add to history
    history.push(selectedPhrase);
    if (history.length > this.maxHistorySize) {
      history.shift(); // Remove oldest
    }

    return selectedPhrase;
  }

  /**
   * Get special event phrase
   */
  getSpecialPhrase(modeName, eventType) {
    const config = this.configs[modeName];
    if (!config || !config.special || !config.special[eventType]) {
      return null;
    }

    const phrases = config.special[eventType];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  /**
   * Get fallback phrase when specific phrases aren't available
   */
  getFallbackPhrase(type) {
    const fallbacks = {
      moods: "Today's a day, that's for sure",
      cravings: { icon: 'Cookie', text: 'something comforting' }
    };
    return fallbacks[type] || "...";
  }

  /**
   * Clear phrase history for a mode or all modes
   */
  clearHistory(modeName = null) {
    if (modeName) {
      this.history[modeName] = {};
    } else {
      Object.keys(this.history).forEach(mode => {
        this.history[mode] = {};
      });
    }
  }

  /**
   * Get UI text for a mode
   */
  getUIText(modeName, category, key) {
    return this.configs[modeName]?.ui?.[category]?.[key] || '';
  }

  /**
   * Check if a mode is registered
   */
  hasMode(modeName) {
    return !!this.configs[modeName];
  }

  /**
   * Get all registered mode names
   */
  getModes() {
    return Object.keys(this.configs);
  }

  /**
   * Export current history (for persistence)
   */
  exportHistory() {
    return { ...this.history };
  }

  /**
   * Import history (from persistence)
   */
  importHistory(historyData) {
    if (historyData && typeof historyData === 'object') {
      this.history = { ...historyData };
    }
  }
}

// Create singleton instance
const phraseManager = new PhraseManager();

export default phraseManager;