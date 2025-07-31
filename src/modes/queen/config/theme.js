/**
 * Queen Mode Theme (Light Mode)
 * 
 * Modern, clean light theme with purple accent colors
 * 
 * COLOR SYSTEM:
 * - Primary: Violet (#8B5CF6) - Main brand color
 * - Secondary: Purple (#7C3AED) - Darker accent
 * - Tertiary: Deep Purple (#6D28D9) - Darkest accent
 * 
 * - States: Red (error), Amber (warning), Emerald (success), Blue (info)
 * - Phases: Red, Green, Amber, Violet, Indigo, Pink
 * 
 * Total unique colors: ~12-15 colors used consistently across both modes
 * Queen = Light backgrounds, King = Dark backgrounds, same accent colors
 */

export const queenTheme = {
  name: 'Queen Mode',
  mode: 'queen',
  
  colors: {
    // Primary palette - Modern purple/violet
    primary: '#8B5CF6', // Violet
    secondary: '#7C3AED', // Purple
    tertiary: '#6D28D9', // Deep purple
    
    // Backgrounds - Light mode
    background: '#FFFFFF', // Pure white
    surface: '#F9FAFB', // Light gray
    surfaceAlt: '#F3F4F6', // Slightly darker gray
    
    // Text colors - Dark for light mode
    text: '#111827', // Almost black
    textSecondary: '#6B7280', // Gray
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    
    // Borders and dividers
    border: '#E5E7EB', // Light gray
    borderLight: '#F3F4F6', // Very light gray
    
    // States - Consistent across modes
    error: '#DC2626', // Red
    warning: '#F59E0B', // Amber
    success: '#10B981', // Emerald
    info: '#3B82F6', // Blue
    
    // Phase-specific colors - Medical/informative
    phases: {
      menstrual: '#DC2626', // Red
      follicular: '#10B981', // Green (growth/safe)
      ovulation: '#F59E0B', // Amber (peak/caution)
      luteal: '#8B5CF6', // Violet
      lateLuteal: '#6366F1', // Indigo
      premenstrual: '#EC4899' // Pink
    },
    
    // Fertility indicator colors (for calendar)
    fertility: {
      veryLow: '#F3F4F6', // Very light gray
      low: '#E5E7EB', // Light gray
      medium: '#FCD34D', // Yellow
      high: '#86EFAC', // Light green
      veryHigh: '#34D399' // Bright green
    },
    
    // Interactive states
    hover: {
      primary: '#7C3AED', // Darker violet
      secondary: '#6D28D9' // Even darker
    },
    
    // Gradients - Subtle for light mode
    gradients: {
      primary: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      secondary: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
      hero: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)'
    }
  },
  
  typography: {
    // Playful, modern fonts
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    headingFontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    
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
      tight: 1.2,
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
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    xxl: '1.5rem',
    full: '9999px',
    button: '2rem', // Rounded buttons
    card: '1rem'
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    glow: '0 0 15px rgba(139, 92, 246, 0.3)',
    button: '0 4px 6px rgba(139, 92, 246, 0.2)'
  },
  
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
    bounce: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  
  animations: {
    modeSwitch: 'queenModeSwitch 600ms ease-in-out',
    fadeIn: 'fadeIn 300ms ease-in',
    slideIn: 'slideInBottom 400ms ease-out',
    pulse: 'pulse 2s infinite',
    bounce: 'bounce 1s infinite'
  },
  
  // Component-specific styles
  components: {
    button: {
      primary: {
        background: 'var(--color-primary)',
        color: 'var(--color-text-on-primary)',
        borderRadius: 'var(--radius-button)',
        fontWeight: 'var(--font-weight-semibold)',
        transition: 'var(--transition-fast)',
        boxShadow: 'var(--shadow-button)',
        '&:hover': {
          background: 'var(--color-hover-primary)',
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-lg)'
        }
      }
    },
    
    card: {
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--color-border-light)',
      '&:hover': {
        boxShadow: 'var(--shadow-lg)',
        transform: 'translateY(-2px)'
      }
    },
    
    header: {
      background: 'var(--gradient-primary)',
      color: 'var(--color-text-on-primary)',
      boxShadow: 'var(--shadow-lg)'
    }
  }
};

// For now, dark mode variant is the same as light
// In the future, we might want a true dark variant of Queen mode
export const queenThemeDark = queenTheme;

// Theme CSS variables for Queen mode
export const queenCSSVariables = {
  '--color-primary': queenTheme.colors.primary,
  '--color-secondary': queenTheme.colors.secondary,
  '--color-tertiary': queenTheme.colors.tertiary,
  '--color-background': queenTheme.colors.background,
  '--color-surface': queenTheme.colors.surface,
  '--color-text': queenTheme.colors.text,
  '--color-text-secondary': queenTheme.colors.textSecondary,
  '--color-border': queenTheme.colors.border
};

// Export phase colors for calendar
export const getPhaseColor = (phase) => {
  const phaseKey = phase.toLowerCase().replace(/\s+/g, '');
  return queenTheme.colors.phases[phaseKey] || queenTheme.colors.primary;
};

// Export fertility colors for calendar
export const getFertilityColor = (level) => {
  return queenTheme.colors.fertility[level] || queenTheme.colors.fertility.low;
};