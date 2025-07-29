/**
 * King Mode Plugin
 * 
 * Plugin wrapper for King mode to work with the mode plugin system
 */

import { kingPhrases, kingPhaseNames, kingUIText } from './config/phrases';
import { kingTheme } from './theme';
import { kingPersonality } from './config/personality';
import KingModeWrapper from './components/KingModeWrapper';
import KingPhaseDisplay from './components/KingPhaseDisplay';

export const KingModePlugin = {
  // Metadata
  id: 'king',
  name: 'King Mode',
  description: 'Strategic intel and tactical advice for partners navigating the cycle',
  version: '1.0.0',
  author: 'MoodBooMs Team',
  
  // Configuration
  config: {
    phaseNames: kingPhaseNames,
    uiText: kingUIText,
    features: {
      showMoodMessages: true,
      showCravings: true,
      showFertilityInfo: true,
      enableAnimations: false, // More subtle for King mode
      enableSounds: false
    }
  },
  
  // Theme
  theme: kingTheme,
  darkTheme: {
    ...kingTheme,
    name: 'King Mode (Dark)',
    variant: 'dark',
    colors: {
      ...kingTheme.colors,
      background: '#0A0A0A',
      surface: '#1A1A1A',
      surfaceAlt: '#252525',
      text: '#FFFFFF',
      textSecondary: '#BDBDBD',
      border: '#333333',
      borderLight: '#2A2A2A'
    }
  },
  
  // Phrases
  phrases: {
    phrases: kingPhrases,
    minPhrasesPerPhase: 30
  },
  
  // Components
  components: {
    Wrapper: KingModeWrapper,
    PhaseDisplay: KingPhaseDisplay
  },
  
  // Lifecycle hooks
  onActivate: async () => {
    console.log('[King Mode] Activated - Strategic intelligence online 👑');
  },
  
  onDeactivate: async () => {
    console.log('[King Mode] Deactivated');
  },
  
  // Custom settings
  settings: {
    alertLevel: {
      type: 'select',
      label: 'Alert Sensitivity',
      options: [
        { value: 'low', label: 'Subtle Hints' },
        { value: 'medium', label: 'Clear Warnings' },
        { value: 'high', label: 'Red Alerts' }
      ],
      default: 'medium',
      description: 'How obvious should the warnings be?'
    },
    showSurvivalTips: {
      type: 'toggle',
      label: 'Survival Tips',
      default: true,
      description: 'Show tactical advice for each phase'
    }
  },
  
  // Utility functions
  utils: {
    getThreatLevel: (phase) => {
      const threatLevels = {
        menstrual: 'CRITICAL',
        follicular: 'LOW',
        ovulation: 'MODERATE',
        luteal: 'ELEVATED',
        lateLuteal: 'HIGH',
        premenstrual: 'SEVERE'
      };
      return threatLevels[phase] || 'UNKNOWN';
    },
    getSurvivalTip: (phase) => {
      return kingPersonality.getSurvivalTip(phase);
    }
  },
  
  // Requirements
  requirements: {
    minAppVersion: '1.0.0',
    dependencies: []
  }
};