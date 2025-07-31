/**
 * Application Constants
 * 
 * Centralizes all hardcoded values used throughout the React application
 * to improve maintainability and make configuration changes easier.
 */

// Window and Layout
export const LAYOUT = {
  CONTAINER_WIDTH: 420,
  CONTAINER_MIN_WIDTH: 320,
  CONTAINER_MAX_WIDTH: 384,
  PADDING: {
    SMALL: 8,
    MEDIUM: 16,
    LARGE: 24
  },
  BORDER_RADIUS: {
    SMALL: 4,
    MEDIUM: 8,
    LARGE: 12
  }
};

// Touch Target Sizes (Accessibility)
export const TOUCH_TARGETS = {
  MINIMUM: 44, // iOS Human Interface Guidelines minimum
  RECOMMENDED: 48 // Material Design recommendation
};

// Animation Timings
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  VERY_SLOW: 500
};

// Cycle Configuration
export const CYCLE = {
  MIN_LENGTH: 21,
  MAX_LENGTH: 35,
  DEFAULT_LENGTH: 28,
  PHASES: {
    MENSTRUAL: 'menstrual',
    FOLLICULAR: 'follicular',
    OVULATION: 'ovulation',
    LUTEAL: 'luteal',
    LATE_LUTEAL: 'lateLuteal',
    PREMENSTRUAL: 'premenstrual'
  },
  PHASE_DAYS: {
    MENSTRUAL_END: 5,
    FOLLICULAR_END: 13,
    OVULATION_END: 16,
    LUTEAL_END: 20,
    LATE_LUTEAL_END: 24
  }
};

// Fertility Levels
export const FERTILITY = {
  LEVELS: {
    VERY_HIGH: { min: 85, max: 100, name: 'Very High' },
    HIGH: { min: 60, max: 85, name: 'High' },
    MEDIUM: { min: 30, max: 60, name: 'Medium' },
    LOW: { min: 10, max: 30, name: 'Low' },
    VERY_LOW: { min: 0, max: 10, name: 'Very Low' }
  },
  PEAK_DAYS: [13, 14, 15], // Days with highest fertility
  SAFETY_THRESHOLDS: {
    SAFE: 20,    // <= 20% fertility is safe
    CAUTION: 50  // 20-50% is caution, >50% is danger
  }
};

// Mode System
export const MODES = {
  QUEEN: 'queen',
  KING: 'king',
  DEFAULT: 'queen'
};

// Tab Navigation
export const TABS = {
  MOOD: 'mood',
  CALENDAR: 'calendar',
  HISTORY: 'history',
  SETTINGS: 'settings'
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  INPUT: 'yyyy-MM-dd',
  STORAGE: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'',
  MONTH_YEAR: 'MMMM yyyy',
  SHORT_MONTH: 'MMM',
  DAY_OF_WEEK: 'EEE'
};

// Storage Keys
export const STORAGE_KEYS = {
  CYCLE_DATA: 'cycleData',
  PREFERENCES: 'preferences',
  CYCLE_HISTORY: 'cycleHistory',
  PHRASE_TRACKING: 'phraseTracking'
};

// Test Mode
export const TEST_MODE = {
  MIN_DAYS: 0,
  MAX_DAYS: 35,
  DEFAULT_DAYS: 0
};

// Debounce Timings
export const DEBOUNCE = {
  PHASE_UPDATE: 300, // Prevents re-render loops
  MODE_SWITCH: 200,
  SEARCH: 500,
  WINDOW_RESIZE: 100
};

// Icon Sizes
export const ICON_SIZES = {
  TINY: 12,
  SMALL: 16,
  MEDIUM: 20,
  LARGE: 24,
  XLARGE: 32
};

// Z-Index Layers
export const Z_INDEX = {
  BASE: 0,
  DROPDOWN: 10,
  MODAL_BACKDROP: 100,
  MODAL: 101,
  TOOLTIP: 200,
  NOTIFICATION: 300
};

// Error Messages
export const ERROR_MESSAGES = {
  LOAD_FAILED: 'Failed to load data',
  SAVE_FAILED: 'Failed to save changes',
  INVALID_DATE: 'Please enter a valid date',
  INVALID_CYCLE_LENGTH: 'Cycle length must be between 21 and 35 days',
  NETWORK_ERROR: 'Network connection error'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SETTINGS_SAVED: 'Settings saved successfully',
  PERIOD_MARKED: 'Period start date updated',
  DATA_EXPORTED: 'Data exported successfully',
  DATA_IMPORTED: 'Data imported successfully'
};

// Default Preferences
export const DEFAULT_PREFERENCES = {
  notifications: true,
  theme: 'auto',
  testMode: false,
  mode: MODES.QUEEN
};