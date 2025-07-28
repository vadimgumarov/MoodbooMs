// Queen Mode Module Entry Point
// Exports all Queen mode functionality

// Components
export { default as QueenModeWrapper } from './components/QueenModeWrapper.jsx';
export { default as QueenPhaseDisplay } from './components/QueenPhaseDisplay.jsx';

// Configuration
export { 
  queenPhrases, 
  getRandomQueenPhrase, 
  queenPhaseNames,
  queenUIText 
} from './config/phrases';

export { 
  queenTheme, 
  getPhaseColor, 
  getFertilityColor,
  queenCSSVariables 
} from './config/theme';

export { 
  queenPersonality, 
  getQueenResponse, 
  getQueenMoodLevel 
} from './config/personality';

// Queen Mode Configuration Object
export const QueenMode = {
  // Mode identifier
  id: 'queen',
  name: 'Queen',
  
  // Core configuration
  config: {
    phrases: () => import('./config/phrases'),
    theme: () => import('./config/theme'),
    personality: () => import('./config/personality')
  },
  
  // Components
  components: {
    Wrapper: QueenModeWrapper,
    PhaseDisplay: QueenPhaseDisplay
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
export default QueenMode;