/**
 * Component Mode Configuration
 * 
 * Centralized configuration for mode-specific component behaviors,
 * text mappings, and styling rules.
 */

/**
 * Phase name mappings for each mode
 */
export const PHASE_NAME_MAPPINGS = {
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

/**
 * Component-specific text mappings
 */
export const COMPONENT_TEXT_MAPPINGS = {
  HistoryView: {
    queen: {
      title: "My Stats",
      averageLabel: "My Average",
      patternLabel: "My Pattern", 
      shortestLabel: "Quickest Hell",
      longestLabel: "Longest Nightmare",
      nextPeriodLabel: "My Next Hell Week",
      recentTitle: "My History",
      noHistoryMessage: "No drama logged yet",
      startTrackingMessage: "Start tracking this sh*t",
      predictablePattern: "Pretty Predictable",
      mostlyRegular: "Kinda Predictable",
      variablePattern: "Kinda Wonky",
      unpredictable: "Total Chaos",
      calculating: "Still figuring this sh*t out..."
    },
    king: {
      title: "Her Cycle Stats",
      averageLabel: "Average Duration",
      patternLabel: "Predictability",
      shortestLabel: "Shortest Cycle",
      longestLabel: "Longest Cycle",
      nextPeriodLabel: "Next Code Red Alert",
      recentTitle: "Recent Incidents",
      noHistoryMessage: "No history recorded",
      startTrackingMessage: "Track her cycles here",
      predictablePattern: "Predictable Pattern",
      mostlyRegular: "Mostly Regular",
      variablePattern: "Variable Pattern",
      unpredictable: "Unpredictable",
      calculating: "Calculating..."
    }
  },
  
  StatusCard: {
    queen: {
      phasePrefix: "Currently in",
      fertilitySuffix: "chance of baby-making",
      daysUntilNext: "days until next phase",
      peakFertilityAlert: "Peak baby-making time!",
      cycleDay: "Day",
      ofCycle: "of cycle"
    },
    king: {
      phasePrefix: "She's in",
      fertilitySuffix: "fertility risk",
      daysUntilNext: "days until phase change", 
      peakFertilityAlert: "Maximum fertility warning!",
      cycleDay: "Cycle day",
      ofCycle: "of her cycle"
    }
  },
  
  Calendar: {
    queen: {
      monthNavAriaLabel: "Navigate calendar months",
      dayAriaLabel: "Select date",
      todayLabel: "Today",
      selectedLabel: "Selected"
    },
    king: {
      monthNavAriaLabel: "Navigate tracking calendar",
      dayAriaLabel: "View cycle day",
      todayLabel: "Current day",
      selectedLabel: "Viewing"
    }
  }
};

/**
 * Component styling configurations
 */
export const COMPONENT_STYLES = {
  queen: {
    primaryColor: 'pink',
    accentColor: 'purple',
    bgGradient: 'from-pink-500 to-purple-600',
    headerBg: 'bg-gradient-to-r from-pink-500 to-purple-600',
    buttonStyle: 'bg-pink-500 hover:bg-pink-600',
    toggleOn: 'bg-pink-500',
    toggleOff: 'bg-gray-300'
  },
  king: {
    primaryColor: 'blue',
    accentColor: 'gray',
    bgGradient: 'from-blue-900 to-gray-900',
    headerBg: 'bg-gradient-to-r from-blue-900 to-gray-900',
    buttonStyle: 'bg-blue-700 hover:bg-blue-800',
    toggleOn: 'bg-blue-700',
    toggleOff: 'bg-gray-600'
  }
};

/**
 * Get component-specific text for a given mode
 * @param {string} componentName - Name of the component
 * @param {string} mode - Current mode (queen/king)
 * @param {string} key - Text key to retrieve
 * @param {string} fallback - Fallback text if key not found
 * @returns {string} The mode-specific text
 */
export const getComponentText = (componentName, mode, key, fallback = '') => {
  const componentTexts = COMPONENT_TEXT_MAPPINGS[componentName];
  if (!componentTexts) return fallback;
  
  const modeTexts = componentTexts[mode] || componentTexts.queen;
  return modeTexts[key] || fallback;
};

/**
 * Get mode-specific styles
 * @param {string} mode - Current mode (queen/king)
 * @param {string} styleKey - Style key to retrieve
 * @returns {string} The mode-specific style class
 */
export const getModeStyle = (mode, styleKey) => {
  const modeStyles = COMPONENT_STYLES[mode] || COMPONENT_STYLES.queen;
  return modeStyles[styleKey] || '';
};

/**
 * Transform legacy badassMode prop to current mode system
 * @param {boolean} isBadassMode - Legacy badass mode flag
 * @returns {string} Current mode name
 */
export const legacyModeToCurrentMode = (isBadassMode) => {
  // In the old system: badassMode true = casual language (now Queen mode)
  // badassMode false = professional language (now King mode)
  return isBadassMode ? 'queen' : 'king';
};