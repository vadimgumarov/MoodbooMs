/**
 * Queen Mode Plugin
 * 
 * Plugin wrapper for Queen mode to work with the mode plugin system
 */

import { queenPhrases, queenPhaseNames, queenUIText } from './config/phrases';
import { queenTheme } from './theme';
import { queenPersonality } from './config/personality';
import QueenModeWrapper from './components/QueenModeWrapper';
import QueenPhaseDisplay from './components/QueenPhaseDisplay';

export const QueenModePlugin = {
  // Metadata
  id: 'queen',
  name: 'Queen Mode',
  description: 'Bold, empowering, and unapologetically honest - for those who own their cycle',
  version: '1.0.0',
  author: 'MoodBooMs Team',
  
  // Configuration
  config: {
    phaseNames: queenPhaseNames,
    uiText: queenUIText,
    features: {
      showMoodMessages: true,
      showCravings: true,
      showFertilityInfo: true,
      enableAnimations: true,
      enableSounds: false
    }
  },
  
  // Theme
  theme: queenTheme,
  darkTheme: {
    ...queenTheme,
    name: 'Queen Mode (Dark)',
    variant: 'dark',
    colors: {
      ...queenTheme.colors,
      background: '#121212',
      surface: '#1E1E1E',
      surfaceAlt: '#2C1B2E',
      text: '#FFFFFF',
      textSecondary: '#B3B3B3',
      border: '#333333',
      borderLight: '#2A2A2A'
    }
  },
  
  // Phrases
  phrases: {
    phrases: queenPhrases,
    minPhrasesPerPhase: 30
  },
  
  // Components
  components: {
    Wrapper: QueenModeWrapper,
    PhaseDisplay: QueenPhaseDisplay
  },
  
  // Lifecycle hooks
  onActivate: async () => {
    console.log('[Queen Mode] Activated - Long may she reign! 👑');
  },
  
  onDeactivate: async () => {
    console.log('[Queen Mode] Deactivated');
  },
  
  // Custom settings
  settings: {
    personalityIntensity: {
      type: 'slider',
      label: 'Sass Level',
      min: 1,
      max: 10,
      default: 7,
      description: 'How much attitude do you want?'
    },
    enableProfanity: {
      type: 'toggle',
      label: 'Adult Language',
      default: true,
      description: 'Allow strong language in messages'
    }
  },
  
  // Utility functions
  utils: {
    getPersonalityResponse: (phase, intensity) => {
      return queenPersonality.getResponse(phase, intensity);
    },
    getMoodLevel: (phase) => {
      return queenPersonality.getMoodLevel(phase);
    }
  },
  
  // Requirements
  requirements: {
    minAppVersion: '1.0.0',
    dependencies: []
  }
};