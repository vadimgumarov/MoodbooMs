/**
 * Mode Plugin System Types and Interfaces
 * 
 * Defines the contract for creating extensible mode plugins
 */

/**
 * Mode Configuration Interface
 */
export const ModeConfigSchema = {
  // Phase names mapping
  phaseNames: {
    menstrual: String,
    follicular: String,
    ovulation: String,
    luteal: String,
    lateLuteal: String,
    premenstrual: String
  },
  
  // UI text customization
  uiText: {
    moodLabel: String,
    cravingLabel: String,
    calendarTitle: String,
    calendarDescription: String,
    historyTitle: String,
    settingsTitle: String
  },
  
  // Feature flags
  features: {
    showMoodMessages: Boolean,
    showCravings: Boolean,
    showFertilityInfo: Boolean,
    enableAnimations: Boolean,
    enableSounds: Boolean
  }
};

/**
 * Mode Theme Interface
 */
export const ModeThemeSchema = {
  name: String,
  mode: String,
  variant: String, // 'light' or 'dark'
  
  colors: {
    primary: String,
    secondary: String,
    tertiary: String,
    background: String,
    surface: String,
    text: String,
    textSecondary: String,
    border: String,
    
    // Phase-specific colors
    phases: {
      menstrual: String,
      follicular: String,
      ovulation: String,
      luteal: String,
      lateLuteal: String,
      premenstrual: String
    }
  },
  
  typography: {
    fontFamily: String,
    headingFontFamily: String,
    sizes: Object,
    weights: Object
  },
  
  spacing: Object,
  borderRadius: Object,
  shadows: Object,
  transitions: Object,
  animations: Object
};

/**
 * Mode Phrases Interface
 */
export const ModePhrasesSchema = {
  // Phrases by phase
  phrases: {
    menstrual: {
      moods: [String],
      cravings: [String]
    },
    follicular: {
      moods: [String],
      cravings: [String]
    },
    ovulation: {
      moods: [String],
      cravings: [String]
    },
    luteal: {
      moods: [String],
      cravings: [String]
    },
    lateLuteal: {
      moods: [String],
      cravings: [String]
    },
    premenstrual: {
      moods: [String],
      cravings: [String]
    }
  },
  
  // Minimum phrase requirements
  minPhrasesPerPhase: Number
};

/**
 * Mode Components Interface
 */
export const ModeComponentsSchema = {
  // Optional custom components
  PhaseDisplay: Function, // React component
  MoodDisplay: Function,   // React component
  CalendarView: Function,  // React component
  SettingsPanel: Function, // React component
  
  // Component wrappers
  Wrapper: Function        // Main wrapper component
};

/**
 * Mode Plugin Interface
 */
export const ModePluginSchema = {
  // Required metadata
  id: String,           // Unique identifier (e.g., 'queen', 'king', 'zen')
  name: String,         // Display name
  description: String,  // Mode description
  version: String,      // Semantic version
  author: String,       // Plugin author
  
  // Required exports
  config: ModeConfigSchema,
  theme: ModeThemeSchema,
  phrases: ModePhrasesSchema,
  
  // Optional exports
  components: ModeComponentsSchema,
  darkTheme: ModeThemeSchema, // Dark variant of theme
  
  // Lifecycle hooks
  onActivate: Function,   // Called when mode is activated
  onDeactivate: Function, // Called when mode is deactivated
  
  // Optional features
  settings: Object,       // Custom settings schema
  hooks: Object,          // Custom React hooks
  utils: Object,          // Utility functions
  
  // Plugin requirements
  requirements: {
    minAppVersion: String,  // Minimum app version required
    dependencies: [String]  // Other plugin dependencies
  }
};

/**
 * Mode validation error types
 */
export const ValidationErrors = {
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FIELD_TYPE: 'INVALID_FIELD_TYPE',
  INSUFFICIENT_PHRASES: 'INSUFFICIENT_PHRASES',
  INVALID_THEME_COLORS: 'INVALID_THEME_COLORS',
  INVALID_VERSION: 'INVALID_VERSION',
  DUPLICATE_MODE_ID: 'DUPLICATE_MODE_ID',
  MISSING_DEPENDENCY: 'MISSING_DEPENDENCY',
  INCOMPATIBLE_VERSION: 'INCOMPATIBLE_VERSION'
};

/**
 * Mode plugin states
 */
export const PluginStates = {
  UNLOADED: 'UNLOADED',
  LOADING: 'LOADING',
  LOADED: 'LOADED',
  ACTIVE: 'ACTIVE',
  ERROR: 'ERROR',
  DISABLED: 'DISABLED'
};

/**
 * Default mode plugin values
 */
export const ModeDefaults = {
  minPhrasesPerPhase: 10,
  features: {
    showMoodMessages: true,
    showCravings: true,
    showFertilityInfo: true,
    enableAnimations: true,
    enableSounds: false
  }
};