// King Mode Module Entry Point
// Partner warning system with survival guide mentality

// Export all King mode configurations
export { kingPhrases, getRandomKingPhrase, kingPhaseNames, kingUIText } from './config/phrases';
export { kingTheme, getPhaseColor, getDangerLevel, kingThemeClasses } from './config/theme';
export { kingPersonality, getAlertLevel, getSurvivalTip, getMoodIndicator } from './config/personality';

// Export King mode components
export { default as KingModeWrapper } from './components/KingModeWrapper';
export { default as KingPhaseDisplay } from './components/KingPhaseDisplay';

// King Mode Configuration Object
export const KingMode = {
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
  
  // Get UI components
  getComponents: () => ({
    Wrapper: require('./components/KingModeWrapper').default,
    PhaseDisplay: require('./components/KingPhaseDisplay').default
  }),
  
  // Theme utilities
  theme: {
    applyTheme: () => {
      const { kingTheme } = require('./config/theme');
      // Apply King mode theme
      document.documentElement.classList.add('king-mode');
      
      // Add CSS variables
      const style = document.createElement('style');
      style.innerHTML = kingTheme.cssVariables;
      style.id = 'king-theme-variables';
      document.head.appendChild(style);
    },
    
    removeTheme: () => {
      document.documentElement.classList.remove('king-mode');
      const themeStyle = document.getElementById('king-theme-variables');
      if (themeStyle) {
        themeStyle.remove();
      }
    }
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
  },
  
  // Initialize King mode
  initialize: () => {
    console.log('🤴 King Mode: Partner warning system activated');
    console.log('📊 Survival guide loaded');
    console.log('🚨 Alert systems online');
    return true;
  }
};

// Default export
export default KingMode;