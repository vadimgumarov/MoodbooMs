/**
 * King Mode Theme
 * 
 * Professional, subtle, and informative theme for the King mode
 * Features muted colors, clean typography, and smooth transitions
 */

import { 
  DEFAULT_SPACING, 
  DEFAULT_TYPOGRAPHY_SIZES, 
  DEFAULT_FONT_WEIGHTS,
  DEFAULT_BORDER_RADIUS,
  DEFAULT_TRANSITIONS 
} from '../../core/themes/types';

export const kingTheme = {
  name: 'King Mode',
  mode: 'king',
  
  colors: {
    // Primary palette - Professional and muted
    primary: '#1976D2', // Professional blue
    secondary: '#424242', // Dark gray
    tertiary: '#0D47A1', // Deep blue
    
    // Backgrounds
    background: '#F5F5F5',
    surface: '#FFFFFF',
    surfaceAlt: '#FAFAFA',
    
    // Text colors
    text: '#212121',
    textSecondary: '#757575',
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    
    // Borders and dividers
    border: '#E0E0E0',
    borderLight: '#F5F5F5',
    
    // States
    error: '#D32F2F',
    warning: '#F57C00',
    success: '#388E3C',
    info: '#1976D2',
    
    // Phase-specific colors - Professional and informative
    phases: {
      menstrual: '#B71C1C', // Dark red
      follicular: '#F57F17', // Dark yellow
      ovulation: '#1B5E20', // Dark green
      luteal: '#4527A0', // Deep purple
      lateLuteal: '#311B92', // Deeper purple
      premenstrual: '#880E4F' // Dark rose
    },
    
    // Interactive states
    hover: {
      primary: '#1565C0',
      secondary: '#303030'
    },
    
    // Gradients for headers and accents - Subtle and professional
    gradients: {
      primary: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
      secondary: 'linear-gradient(135deg, #616161 0%, #424242 100%)',
      hero: 'linear-gradient(135deg, #1976D2 0%, #1565C0 50%, #0D47A1 100%)'
    }
  },
  
  typography: {
    // Clean, professional fonts
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
    headingFontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    
    sizes: DEFAULT_TYPOGRAPHY_SIZES,
    
    weights: DEFAULT_FONT_WEIGHTS,
    
    // Line heights
    lineHeights: {
      tight: 1.3,
      normal: 1.6,
      relaxed: 1.8
    }
  },
  
  spacing: DEFAULT_SPACING,
  
  borderRadius: {
    ...DEFAULT_BORDER_RADIUS,
    button: '0.5rem', // More conservative button radius
    card: '0.75rem'
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
    md: '0 4px 6px rgba(0, 0, 0, 0.16)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.19)',
    glow: 'none', // No glow effects in professional theme
    button: '0 2px 4px rgba(0, 0, 0, 0.2)'
  },
  
  transitions: DEFAULT_TRANSITIONS,
  
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

// Dark mode variant for King
export const kingThemeDark = {
  ...kingTheme,
  name: 'King Mode (Dark)',
  variant: 'dark',
  
  colors: {
    ...kingTheme.colors,
    
    // Dark mode adjustments
    background: '#0A0A0A',
    surface: '#1A1A1A',
    surfaceAlt: '#252525',
    
    text: '#FFFFFF',
    textSecondary: '#BDBDBD',
    
    border: '#333333',
    borderLight: '#2A2A2A',
    
    // Adjusted phase colors for dark mode
    phases: {
      menstrual: '#E53935', // Brighter red
      follicular: '#FDD835', // Brighter yellow
      ovulation: '#43A047', // Brighter green
      luteal: '#5E35B1', // Brighter purple
      lateLuteal: '#4527A0', // Medium purple
      premenstrual: '#AD1457' // Brighter rose
    },
    
    // Adjusted gradients for dark mode
    gradients: {
      primary: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
      secondary: 'linear-gradient(135deg, #757575 0%, #616161 100%)',
      hero: 'linear-gradient(135deg, #1E88E5 0%, #1976D2 50%, #1565C0 100%)'
    }
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.5)',
    glow: 'none',
    button: '0 2px 4px rgba(0, 0, 0, 0.4)'
  }
};