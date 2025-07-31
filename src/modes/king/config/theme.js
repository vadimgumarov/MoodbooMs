/**
 * King Mode Theme (Dark Mode)
 * 
 * Modern dark theme using the same color system as Queen mode
 * Only backgrounds and text colors are inverted for dark mode
 * 
 * Uses exact same accent colors as Queen mode for consistency
 */

export const kingTheme = {
  name: 'King Mode',
  mode: 'king',
  
  colors: {
    // Primary palette - Same as Queen but adapted for dark
    primary: '#8B5CF6', // Violet
    secondary: '#7C3AED', // Purple
    tertiary: '#6D28D9', // Deep purple
    
    // Backgrounds - Dark mode
    background: '#111827', // Very dark gray
    surface: '#1F2937', // Dark gray
    surfaceAlt: '#374151', // Medium dark gray
    
    // Text colors - Light for dark mode
    text: '#F9FAFB', // Almost white
    textSecondary: '#D1D5DB', // Light gray
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    
    // Borders and dividers
    border: '#374151', // Dark gray
    borderLight: '#4B5563', // Medium gray
    
    // States - Same as Queen mode
    error: '#DC2626', // Red
    warning: '#F59E0B', // Amber
    success: '#10B981', // Emerald
    info: '#3B82F6', // Blue
    
    // Phase-specific colors - Same as Queen mode
    phases: {
      menstrual: '#DC2626', // Red
      follicular: '#10B981', // Green (growth/safe)
      ovulation: '#F59E0B', // Amber (peak/caution)
      luteal: '#8B5CF6', // Violet
      lateLuteal: '#6366F1', // Indigo
      premenstrual: '#EC4899' // Pink
    },
    
    // Fertility indicator colors (for calendar) - Darker versions
    fertility: {
      veryLow: '#374151', // Dark gray
      low: '#4B5563', // Medium gray
      medium: '#F59E0B', // Amber
      high: '#10B981', // Green
      veryHigh: '#34D399' // Bright green
    },
    
    // Interactive states
    hover: {
      primary: '#7C3AED', // Darker violet
      secondary: '#6D28D9' // Even darker
    },
    
    // Gradients - Adapted for dark mode
    gradients: {
      primary: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
      secondary: 'linear-gradient(135deg, #374151 0%, #1F2937 100%)',
      hero: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)'
    }
  },
  
  typography: {
    // Clean, professional fonts
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
    headingFontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    
    sizes: {
      display: '3rem',
      hero: '2.5rem',
      title: '2rem',
      heading: '1.5rem',
      body: '1rem',
      small: '0.875rem',
      tiny: '0.75rem'
    },
    
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    
    // Line heights
    lineHeights: {
      tight: 1.3,
      normal: 1.6,
      relaxed: 1.8
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
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    xxl: '1.5rem',
    full: '9999px',
    button: '0.5rem', // More conservative button radius
    card: '0.75rem'
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    glow: '0 0 15px rgba(139, 92, 246, 0.4)',
    button: '0 4px 6px rgba(0, 0, 0, 0.3)'
  },
  
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
    bounce: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  
  animations: {
    modeSwitch: 'kingModeSwitch 400ms ease-in-out',
    fadeIn: 'fadeIn 200ms ease-in',
    slideIn: 'slideInLeft 300ms ease-out',
    pulse: 'none', // No pulse animations
    bounce: 'none' // No bounce animations
  },
  
  // Component-specific styles
  components: {
    button: {
      primary: {
        background: 'var(--color-primary)',
        color: 'var(--color-text-on-primary)',
        borderRadius: 'var(--radius-button)',
        fontWeight: 'var(--font-weight-medium)',
        transition: 'var(--transition-fast)',
        boxShadow: 'var(--shadow-button)',
        '&:hover': {
          background: 'var(--color-hover-primary)',
          boxShadow: 'var(--shadow-md)'
        }
      }
    },
    
    card: {
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--color-border)',
      '&:hover': {
        boxShadow: 'var(--shadow-md)'
      }
    },
    
    header: {
      background: 'var(--gradient-primary)',
      color: 'var(--color-text-on-primary)',
      boxShadow: 'var(--shadow-md)'
    }
  }
};

// King mode is already dark, so dark variant is the same
export const kingThemeDark = kingTheme;

// King mode CSS classes and mappings
export const kingThemeClasses = {
  'bg-gray-900': 'bg-king-surface',
  'bg-gray-800': 'bg-king-surface-alt',
  'text-gray-100': 'text-king-text',
  'text-gray-400': 'text-king-text-secondary',
  'border-gray-700': 'border-king-border'
};

// Export phase colors
export const getPhaseColor = (phase) => {
  const phaseKey = phase.toLowerCase().replace(/\s+/g, '');
  return kingTheme.colors.phases[phaseKey] || kingTheme.colors.primary;
};

// Export danger level for King mode
export const getDangerLevel = (phase) => {
  const dangerMap = {
    'codered': 'critical',
    'defcon1': 'extreme',
    'volatilityalert': 'high',
    'patiencelevellow': 'moderate',
    'safezoneactive': 'low',
    'highenergywarning': 'caution'
  };
  const key = phase.toLowerCase().replace(/\s+/g, '');
  return dangerMap[key] || 'unknown';
};