// King Mode Configuration-Only Export
// Safe to import in any environment (no React components)

// Export only configurations (no React components)
export { 
  kingPhrases, 
  getRandomKingPhrase, 
  kingPhaseNames, 
  kingUIText 
} from './config/phrases';

export { 
  kingTheme, 
  getPhaseColor, 
  getDangerLevel, 
  kingThemeClasses 
} from './config/theme';

export { 
  kingPersonality, 
  getAlertLevel, 
  getSurvivalTip, 
  getMoodIndicator 
} from './config/personality';

// King Mode Configuration Object (without components)
export const KingModeConfig = {
  name: 'King Mode',
  id: 'king',
  description: 'Partner warning system with tactical survival guide',
  
  // Get all configurations
  getConfig: () => ({
    phrases: require('./config/phrases').kingPhrases,
    theme: require('./config/theme').kingTheme,
    personality: require('./config/personality').kingPersonality,
    phaseNames: require('./config/phrases').kingPhaseNames,
    uiText: require('./config/phrases').kingUIText
  }),
  
  // Get specific phase data
  getPhaseData: (phase) => {
    const { kingPhrases, kingPhaseNames } = require('./config/phrases');
    const { getPhaseColor, getDangerLevel } = require('./config/theme');
    const { getAlertLevel } = require('./config/personality');
    
    return {
      name: kingPhaseNames[phase],
      data: kingPhrases[phase],
      color: getPhaseColor(phase),
      dangerLevel: getDangerLevel(phase),
      alertLevel: getAlertLevel(phase)
    };
  },
  
  // Get random content
  getRandomContent: (phase, type) => {
    const { getRandomKingPhrase } = require('./config/phrases');
    return getRandomKingPhrase(phase, type);
  },
  
  // Survival utilities
  survival: {
    getTip: (phase, category) => {
      const { getSurvivalTip } = require('./config/personality');
      return getSurvivalTip(phase, category);
    },
    
    getAlertLevel: (phase) => {
      const { getAlertLevel } = require('./config/personality');
      return getAlertLevel(phase);
    },
    
    getMoodIndicator: (phase) => {
      const { getMoodIndicator } = require('./config/personality');
      return getMoodIndicator(phase);
    }
  }
};

// Default export
export default KingModeConfig;