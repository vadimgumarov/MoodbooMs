// Queen Mode Theme Configuration
// BadAss personality with bold, sarcastic styling

export const queenTheme = {
  // Color palette for Queen mode
  colors: {
    // Primary colors
    primary: '#FF1744',        // Bold red for BadAss energy
    secondary: '#D500F9',      // Electric purple for sass
    accent: '#FF6E40',         // Fiery orange for attitude
    
    // Phase-specific colors (calendar and UI)
    phases: {
      menstrual: '#B71C1C',      // Deep blood red
      follicular: '#4CAF50',     // Vibrant green for energy
      ovulation: '#FF4081',      // Hot pink for peak fertility
      luteal: '#FF9800',         // Burnt orange for exhaustion
      lateLuteal: '#9C27B0',     // Moody purple
      premenstrual: '#D32F2F'    // Warning red
    },
    
    // Fertility indicator colors
    fertility: {
      veryLow: '#424242',        // Dark gray
      low: '#616161',            // Medium gray
      medium: '#FFC107',         // Amber
      high: '#8BC34A',           // Light green
      veryHigh: '#4CAF50'        // Vibrant green
    },
    
    // UI colors
    background: '#1A1A1A',       // Dark background for drama
    surface: '#2D2D2D',          // Slightly lighter surface
    text: {
      primary: '#FFFFFF',        // White text for contrast
      secondary: '#B0B0B0',      // Gray for secondary text
      accent: '#FF1744'          // Red for emphasis
    },
    
    // Status colors
    error: '#F44336',
    warning: '#FF9800',
    success: '#4CAF50',
    info: '#2196F3'
  },
  
  // Typography
  typography: {
    // Font families
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: '"Bebas Neue", "Impact", sans-serif',  // Bold display font
      mono: '"Courier New", monospace'
    },
    
    // Font sizes
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '2rem',    // 32px
      '4xl': '2.5rem'   // 40px
    },
    
    // Font weights
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900        // Extra bold for attitude
    }
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem'     // 64px
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px'
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glow: '0 0 20px rgba(255, 23, 68, 0.5)'  // Red glow for drama
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
    slower: '500ms ease-in-out'
  },
  
  // Component-specific styles
  components: {
    // Button styles
    button: {
      primary: {
        background: '#FF1744',
        color: '#FFFFFF',
        hover: '#F50057',
        active: '#C51162'
      },
      secondary: {
        background: 'transparent',
        color: '#FF1744',
        border: '2px solid #FF1744',
        hover: '#FF17441A',
        active: '#FF174433'
      }
    },
    
    // Card styles
    card: {
      background: '#2D2D2D',
      border: '1px solid #3D3D3D',
      hover: {
        border: '1px solid #FF1744',
        shadow: '0 0 20px rgba(255, 23, 68, 0.3)'
      }
    },
    
    // Badge styles for phases
    badge: {
      menstrual: {
        background: '#B71C1C',
        color: '#FFFFFF'
      },
      follicular: {
        background: '#4CAF50',
        color: '#FFFFFF'
      },
      ovulation: {
        background: '#FF4081',
        color: '#FFFFFF'
      },
      luteal: {
        background: '#FF9800',
        color: '#FFFFFF'
      },
      lateLuteal: {
        background: '#9C27B0',
        color: '#FFFFFF'
      },
      premenstrual: {
        background: '#D32F2F',
        color: '#FFFFFF'
      }
    }
  },
  
  // Animations
  animations: {
    // Pulse animation for important elements
    pulse: {
      keyframes: {
        '0%': { opacity: 1 },
        '50%': { opacity: 0.5 },
        '100%': { opacity: 1 }
      },
      duration: '2s',
      timing: 'ease-in-out',
      iteration: 'infinite'
    },
    
    // Shake animation for attitude
    shake: {
      keyframes: {
        '0%, 100%': { transform: 'translateX(0)' },
        '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
        '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
      },
      duration: '0.5s',
      timing: 'ease-in-out'
    },
    
    // Glow animation for emphasis
    glow: {
      keyframes: {
        '0%': { boxShadow: '0 0 5px rgba(255, 23, 68, 0.5)' },
        '50%': { boxShadow: '0 0 20px rgba(255, 23, 68, 0.8)' },
        '100%': { boxShadow: '0 0 5px rgba(255, 23, 68, 0.5)' }
      },
      duration: '2s',
      timing: 'ease-in-out',
      iteration: 'infinite'
    }
  }
};

// Export theme utilities
export const getPhaseColor = (phase) => {
  return queenTheme.colors.phases[phase] || queenTheme.colors.primary;
};

export const getFertilityColor = (fertilityLevel) => {
  if (fertilityLevel >= 85) return queenTheme.colors.fertility.veryHigh;
  if (fertilityLevel >= 60) return queenTheme.colors.fertility.high;
  if (fertilityLevel >= 30) return queenTheme.colors.fertility.medium;
  if (fertilityLevel >= 10) return queenTheme.colors.fertility.low;
  return queenTheme.colors.fertility.veryLow;
};

// Export CSS variables for easy use in components
export const queenCSSVariables = {
  '--queen-primary': queenTheme.colors.primary,
  '--queen-secondary': queenTheme.colors.secondary,
  '--queen-accent': queenTheme.colors.accent,
  '--queen-bg': queenTheme.colors.background,
  '--queen-surface': queenTheme.colors.surface,
  '--queen-text-primary': queenTheme.colors.text.primary,
  '--queen-text-secondary': queenTheme.colors.text.secondary,
  '--queen-text-accent': queenTheme.colors.text.accent,
  '--queen-font-display': queenTheme.typography.fontFamily.display
};