/**
 * Component Mode Adapter
 * 
 * Provides a clean abstraction layer for components to access mode-specific
 * content and behavior without directly depending on mode implementation details.
 */

import { useMode } from '../../contexts/SimpleModeContext';
import { getUIText } from '../../../content/modeContent';

/**
 * Custom hook that provides mode-aware component properties
 * @returns {Object} Mode-aware properties and utilities
 */
export const useModeAwareProps = () => {
  const { currentMode, isQueenMode, isKingMode } = useMode();
  
  return {
    // Current mode info
    currentMode,
    isQueenMode,
    isKingMode,
    
    // Legacy compatibility
    isBadassMode: isQueenMode, // Maps to Queen mode for backward compatibility
    
    // UI text getter
    getUIText: (key) => getUIText(currentMode, key),
    
    // Mode-specific class names
    getModeClass: (queenClass, kingClass) => isQueenMode ? queenClass : kingClass,
    
    // Mode-specific values
    getModeValue: (queenValue, kingValue) => isQueenMode ? queenValue : kingValue
  };
};

/**
 * Higher-order component that injects mode-aware props
 * @param {React.Component} Component - Component to wrap
 * @param {Object} options - Configuration options
 * @returns {React.Component} Wrapped component with mode props
 */
export const withModeAwareness = (Component, options = {}) => {
  const WrappedComponent = (props) => {
    const modeProps = useModeAwareProps();
    
    // Filter out props based on options
    const filteredProps = options.includeAll ? modeProps : {
      isBadassMode: modeProps.isBadassMode,
      currentMode: modeProps.currentMode,
      getUIText: modeProps.getUIText
    };
    
    return <Component {...props} {...filteredProps} />;
  };
  
  WrappedComponent.displayName = `withModeAwareness(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

/**
 * Component that conditionally renders based on mode
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.queen - Content to render in Queen mode
 * @param {React.ReactNode} props.king - Content to render in King mode
 * @param {React.ReactNode} props.fallback - Fallback content if mode not matched
 */
export const ModeConditional = ({ queen, king, fallback = null }) => {
  const { isQueenMode, isKingMode } = useMode();
  
  if (isQueenMode && queen) return queen;
  if (isKingMode && king) return king;
  return fallback;
};

/**
 * Text component that automatically switches between mode-specific text
 * @param {Object} props - Component props
 * @param {string} props.queenText - Text for Queen mode
 * @param {string} props.kingText - Text for King mode
 * @param {string} props.className - Optional CSS classes
 */
export const ModeText = ({ queenText, kingText, className }) => {
  const { getModeValue } = useModeAwareProps();
  const text = getModeValue(queenText, kingText);
  
  return className ? <span className={className}>{text}</span> : text;
};

/**
 * Utility to get phase-specific information based on mode
 * @param {string} medicalPhase - Medical phase name
 * @param {string} currentMode - Current mode (queen/king)
 * @returns {Object} Phase information with mode-specific names
 */
export const getModePhaseInfo = (medicalPhase, currentMode) => {
  const phaseMapping = {
    queen: {
      menstrual: 'Bloody Hell Week',
      follicular: 'Finally Got My Sh*t Together',
      ovulation: 'Horny AF',
      luteal: 'Getting Real Tired of This BS',
      lateLuteal: 'Pre-Chaos Mood Swings',
      premenstrual: 'Apocalypse Countdown'
    },
    king: {
      menstrual: 'Code Red Alert',
      follicular: 'Safe Zone Active',
      ovulation: 'High Energy Warning',
      luteal: 'Patience Level: Low',
      lateLuteal: 'Volatility Alert',
      premenstrual: 'DEFCON 1'
    }
  };
  
  const modePhases = phaseMapping[currentMode] || phaseMapping.queen;
  return {
    medicalPhase,
    displayName: modePhases[medicalPhase] || medicalPhase,
    isQueenMode: currentMode === 'queen',
    isKingMode: currentMode === 'king'
  };
};