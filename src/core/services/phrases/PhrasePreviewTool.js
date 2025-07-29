/**
 * PhrasePreviewTool - Development tool for testing phrase configurations
 * 
 * Provides utilities to:
 * - Preview phrases by context
 * - Test phrase distribution
 * - Validate phrase coverage
 * - Debug phrase selection
 */

import phraseManager from './PhraseManager';
import { TIME_PERIODS } from './types';

class PhrasePreviewTool {
  /**
   * Preview all phrases for a specific phase
   */
  previewPhase(modeName, phase) {
    const config = phraseManager.configs[modeName];
    if (!config || !config.phases[phase]) {
      console.error(`No configuration found for ${modeName}/${phase}`);
      return null;
    }

    const phaseConfig = config.phases[phase];
    const preview = {
      phase: phase,
      name: phaseConfig.name,
      description: phaseConfig.description,
      totalMoods: 0,
      totalCravings: phaseConfig.cravings?.length || 0,
      moodsByContext: {},
      cravings: phaseConfig.cravings || []
    };

    // Count moods by context
    if (Array.isArray(phaseConfig.moods)) {
      preview.totalMoods = phaseConfig.moods.length;
      preview.moodsByContext.default = phaseConfig.moods.length;
    } else if (phaseConfig.moods) {
      // New format with contextual moods
      Object.entries(phaseConfig.moods).forEach(([context, phrases]) => {
        if (Array.isArray(phrases)) {
          preview.moodsByContext[context] = phrases.length;
          preview.totalMoods += phrases.length;
        }
      });
    }

    return preview;
  }

  /**
   * Test phrase distribution over multiple calls
   */
  testDistribution(modeName, phase, type = 'moods', iterations = 100) {
    const distribution = {};
    const contexts = [
      { timePeriod: TIME_PERIODS.MORNING },
      { timePeriod: TIME_PERIODS.AFTERNOON },
      { timePeriod: TIME_PERIODS.EVENING },
      { timePeriod: TIME_PERIODS.NIGHT },
      { isWeekend: true },
      { isFirstDay: true }
    ];

    // Clear history to get fresh distribution
    phraseManager.clearHistory(modeName);

    for (let i = 0; i < iterations; i++) {
      // Rotate through different contexts
      const context = contexts[i % contexts.length];
      const phrase = phraseManager.getPhrase(modeName, phase, type, context);
      
      const key = type === 'cravings' ? phrase.text : phrase;
      distribution[key] = (distribution[key] || 0) + 1;
    }

    return {
      totalUnique: Object.keys(distribution).length,
      distribution: Object.entries(distribution)
        .sort((a, b) => b[1] - a[1])
        .map(([phrase, count]) => ({
          phrase,
          count,
          percentage: ((count / iterations) * 100).toFixed(1) + '%'
        }))
    };
  }

  /**
   * Validate phrase coverage for all phases
   */
  validateCoverage(modeName) {
    const config = phraseManager.configs[modeName];
    if (!config) {
      return { valid: false, error: 'Mode not found' };
    }

    const issues = [];
    const requiredPhases = ['menstrual', 'follicular', 'ovulation', 'luteal', 'lateLuteal', 'premenstrual'];
    
    requiredPhases.forEach(phase => {
      if (!config.phases[phase]) {
        issues.push(`Missing phase: ${phase}`);
        return;
      }

      const phaseConfig = config.phases[phase];
      
      // Check minimum phrase count
      const moodCount = Array.isArray(phaseConfig.moods) 
        ? phaseConfig.moods.length 
        : Object.values(phaseConfig.moods).flat().length;
        
      if (moodCount < 10) {
        issues.push(`${phase}: Only ${moodCount} mood phrases (minimum 10 recommended)`);
      }

      if (!phaseConfig.cravings || phaseConfig.cravings.length < 5) {
        issues.push(`${phase}: Only ${phaseConfig.cravings?.length || 0} cravings (minimum 5 recommended)`);
      }
    });

    // Check UI text
    if (!config.ui || Object.keys(config.ui).length === 0) {
      issues.push('Missing UI text configuration');
    }

    return {
      valid: issues.length === 0,
      issues,
      summary: {
        phases: Object.keys(config.phases).length,
        hasSpecialPhrases: !!config.special,
        hasUIText: !!config.ui
      }
    };
  }

  /**
   * Debug phrase selection for a specific context
   */
  debugPhraseSelection(modeName, phase, context = {}) {
    console.log('=== Phrase Selection Debug ===');
    console.log('Mode:', modeName);
    console.log('Phase:', phase);
    console.log('Context:', context);

    // Get phrase with detailed logging
    const originalLog = console.log;
    const logs = [];
    console.log = (...args) => logs.push(args.join(' '));

    const phrase = phraseManager.getPhrase(modeName, phase, 'moods', context);
    
    console.log = originalLog;

    return {
      selectedPhrase: phrase,
      debugLogs: logs,
      context: {
        ...context,
        computedTimePeriod: phraseManager.getTimePeriod(context.currentTime),
        isWeekend: phraseManager.isWeekend(context.currentTime)
      }
    };
  }

  /**
   * Get all available contexts for a phase
   */
  getAvailableContexts(modeName, phase) {
    const config = phraseManager.configs[modeName];
    if (!config || !config.phases[phase]) {
      return [];
    }

    const phaseConfig = config.phases[phase];
    const contexts = [];

    if (phaseConfig.moods && typeof phaseConfig.moods === 'object' && !Array.isArray(phaseConfig.moods)) {
      Object.keys(phaseConfig.moods).forEach(context => {
        if (context !== 'default' && Array.isArray(phaseConfig.moods[context])) {
          contexts.push(context);
        }
      });
    }

    return contexts;
  }

  /**
   * Generate sample phrases for documentation
   */
  generateSamples(modeName, sampleCount = 3) {
    const config = phraseManager.configs[modeName];
    if (!config) return null;

    const samples = {};
    
    Object.entries(config.phases).forEach(([phase, phaseConfig]) => {
      samples[phase] = {
        name: phaseConfig.name,
        moodSamples: [],
        cravingSamples: []
      };

      // Get mood samples
      const moods = Array.isArray(phaseConfig.moods) 
        ? phaseConfig.moods 
        : Object.values(phaseConfig.moods).flat();
      
      samples[phase].moodSamples = moods.slice(0, sampleCount);

      // Get craving samples
      samples[phase].cravingSamples = phaseConfig.cravings
        ?.slice(0, sampleCount)
        .map(c => `${c.icon}: ${c.text}`);
    });

    return samples;
  }
}

// Create singleton instance
const previewTool = new PhrasePreviewTool();

export default previewTool;