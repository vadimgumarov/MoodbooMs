/**
 * Mode Plugin Template
 * 
 * Use this template as a starting point for creating new mode plugins
 * Replace all placeholder values with your mode-specific content
 */

// Import your mode's configuration files
// import { myModePhrases, myModePhaseNames, myModeUIText } from './config/phrases';
// import { myModeTheme } from './config/theme';
// import { myModePersonality } from './config/personality';
// import MyModeWrapper from './components/MyModeWrapper';
// import MyPhaseDisplay from './components/MyPhaseDisplay';

export const MyModePlugin = {
  // === REQUIRED METADATA ===
  // Unique identifier for your mode (lowercase, no spaces)
  id: 'mymode',
  
  // Display name for your mode
  name: 'My Custom Mode',
  
  // Brief description of your mode's personality
  description: 'A brief description of what makes this mode unique',
  
  // Semantic version (major.minor.patch)
  version: '1.0.0',
  
  // Your name or organization
  author: 'Your Name',
  
  // === REQUIRED CONFIGURATION ===
  config: {
    // Custom names for each phase
    phaseNames: {
      menstrual: 'Phase 1 Name',
      follicular: 'Phase 2 Name',
      ovulation: 'Phase 3 Name',
      luteal: 'Phase 4 Name',
      lateLuteal: 'Phase 5 Name',
      premenstrual: 'Phase 6 Name'
    },
    
    // UI text customization
    uiText: {
      moodLabel: 'Current Mood',
      cravingLabel: 'Craving',
      calendarTitle: 'My Calendar',
      calendarDescription: 'Track your cycle',
      historyTitle: 'History',
      settingsTitle: 'Settings'
    },
    
    // Feature toggles
    features: {
      showMoodMessages: true,
      showCravings: true,
      showFertilityInfo: true,
      enableAnimations: true,
      enableSounds: false
    }
  },
  
  // === REQUIRED THEME ===
  theme: {
    name: 'My Mode Theme',
    mode: 'mymode',
    
    colors: {
      // Primary colors
      primary: '#3B82F6',      // Main brand color
      secondary: '#8B5CF6',    // Accent color
      tertiary: '#EC4899',     // Additional accent
      
      // Base colors
      background: '#FFFFFF',
      surface: '#F9FAFB',
      surfaceAlt: '#F3F4F6',
      
      // Text colors
      text: '#111827',
      textSecondary: '#6B7280',
      textOnPrimary: '#FFFFFF',
      textOnSecondary: '#FFFFFF',
      
      // Borders
      border: '#E5E7EB',
      borderLight: '#F3F4F6',
      
      // States
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#10B981',
      info: '#3B82F6',
      
      // Phase-specific colors
      phases: {
        menstrual: '#DC2626',
        follicular: '#F59E0B',
        ovulation: '#10B981',
        luteal: '#8B5CF6',
        lateLuteal: '#6366F1',
        premenstrual: '#EC4899'
      },
      
      // Interactive states
      hover: {
        primary: '#2563EB',
        secondary: '#7C3AED'
      },
      
      // Gradients
      gradients: {
        primary: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        secondary: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        hero: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)'
      }
    },
    
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      headingFontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        xxl: '1.5rem',
        xxxl: '2rem'
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },
    
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      xxl: '3rem'
    },
    
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
      button: '0.5rem',
      card: '0.75rem'
    },
    
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      glow: '0 0 15px rgba(59, 130, 246, 0.3)',
      button: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    
    transitions: {
      fast: '150ms ease-in-out',
      normal: '300ms ease-in-out',
      slow: '500ms ease-in-out',
      bounce: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    },
    
    animations: {
      modeSwitch: 'fadeIn 400ms ease-in-out',
      fadeIn: 'fadeIn 300ms ease-in',
      slideIn: 'slideInBottom 400ms ease-out',
      pulse: 'pulse 2s infinite',
      bounce: 'bounce 1s infinite'
    }
  },
  
  // === OPTIONAL: Dark theme variant ===
  darkTheme: {
    // ... dark theme configuration
    // Copy the theme structure above and adjust colors for dark mode
  },
  
  // === REQUIRED PHRASES ===
  phrases: {
    phrases: {
      menstrual: {
        moods: [
          // Add at least 10 mood messages per phase
          "Mood message 1 for menstrual phase",
          "Mood message 2 for menstrual phase",
          // ... more messages
        ],
        cravings: [
          // Add at least 10 craving messages per phase
          "Craving message 1 for menstrual phase",
          "Craving message 2 for menstrual phase",
          // ... more messages
        ]
      },
      follicular: {
        moods: [
          // Add mood messages
        ],
        cravings: [
          // Add craving messages
        ]
      },
      ovulation: {
        moods: [
          // Add mood messages
        ],
        cravings: [
          // Add craving messages
        ]
      },
      luteal: {
        moods: [
          // Add mood messages
        ],
        cravings: [
          // Add craving messages
        ]
      },
      lateLuteal: {
        moods: [
          // Add mood messages
        ],
        cravings: [
          // Add craving messages
        ]
      },
      premenstrual: {
        moods: [
          // Add mood messages
        ],
        cravings: [
          // Add craving messages
        ]
      }
    },
    minPhrasesPerPhase: 10 // Minimum required phrases per phase
  },
  
  // === OPTIONAL COMPONENTS ===
  components: {
    // Custom wrapper component (optional)
    // Wrapper: MyModeWrapper,
    
    // Custom phase display component (optional)
    // PhaseDisplay: MyPhaseDisplay,
    
    // Other custom components
    // CalendarView: MyCalendarView,
    // SettingsPanel: MySettingsPanel
  },
  
  // === LIFECYCLE HOOKS (Optional) ===
  onActivate: async () => {
    console.log('[My Mode] Activated');
    // Perform any initialization needed when mode is activated
  },
  
  onDeactivate: async () => {
    console.log('[My Mode] Deactivated');
    // Cleanup when mode is deactivated
  },
  
  // === CUSTOM SETTINGS (Optional) ===
  settings: {
    // Example setting
    mySetting: {
      type: 'toggle', // 'toggle', 'slider', 'select', 'text'
      label: 'My Custom Setting',
      default: true,
      description: 'Description of what this setting does'
    }
  },
  
  // === UTILITY FUNCTIONS (Optional) ===
  utils: {
    // Add any utility functions your mode needs
    myUtilityFunction: (param) => {
      // Custom logic
      return param;
    }
  },
  
  // === REQUIREMENTS (Optional) ===
  requirements: {
    minAppVersion: '1.0.0',
    dependencies: [] // List of other mode IDs this mode depends on
  }
};

// === DEVELOPMENT CHECKLIST ===
// [ ] Set unique mode ID
// [ ] Create phase names that match your mode's personality
// [ ] Design a color scheme that reflects your mode
// [ ] Write at least 10 mood messages per phase (60 total minimum)
// [ ] Write at least 10 craving messages per phase (60 total minimum)
// [ ] Create custom components if needed
// [ ] Test mode switching and activation
// [ ] Validate your mode with the validator
// [ ] Create a README.md for your mode
// [ ] Package and distribute your mode