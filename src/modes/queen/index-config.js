// Queen Mode Configuration Exports (without React components)
// This file exports only the configuration modules

// Import configurations
import { 
  queenPhrases, 
  getRandomQueenPhrase, 
  queenPhaseNames,
  queenUIText 
} from './config/phrases.js';

import { 
  queenTheme, 
  getPhaseColor, 
  getFertilityColor,
  queenCSSVariables 
} from './config/theme.js';

import { 
  queenPersonality, 
  getQueenResponse, 
  getQueenMoodLevel 
} from './config/personality.js';

// Re-export for convenience
export {
  queenPhrases, 
  getRandomQueenPhrase, 
  queenPhaseNames,
  queenUIText,
  queenTheme, 
  getPhaseColor, 
  getFertilityColor,
  queenCSSVariables,
  queenPersonality, 
  getQueenResponse, 
  getQueenMoodLevel
};

// Queen Mode Configuration Object (without components)
export const QueenModeConfig = {
  // Mode identifier
  id: 'queen',
  name: 'Queen',
  
  // Core configuration
  config: {
    phrases: () => import('./config/phrases.js'),
    theme: () => import('./config/theme.js'),
    personality: () => import('./config/personality.js')
  },
  
  // Helper functions
  helpers: {
    getRandomPhrase: getRandomQueenPhrase,
    getPhaseColor: getPhaseColor,
    getFertilityColor: getFertilityColor,
    getMoodLevel: getQueenMoodLevel,
    getResponse: getQueenResponse
  },
  
  // Mode-specific features
  features: [
    'sarcastic-humor',
    'dark-comedy',
    'first-person-perspective',
    'brutal-honesty',
    'mood-indicators',
    'warning-system'
  ],
  
  // Initialize Queen mode
  initialize: () => {
    console.log('👑 Queen Mode Activated - Zero F*cks Given Mode Engaged');
    return {
      status: 'active',
      message: 'Queen mode is ready to reign',
      personality: queenPersonality.traits
    };
  },
  
  // Cleanup Queen mode
  cleanup: () => {
    console.log('👑 Queen Mode Deactivated - Back to giving a damn');
    return {
      status: 'inactive',
      message: 'Queen mode has abdicated'
    };
  }
};

// Default export for easy importing
export default QueenModeConfig;