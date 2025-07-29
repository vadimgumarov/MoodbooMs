/**
 * Queen Mode Theme
 * 
 * Bold, vibrant, and empowering theme for the Queen mode
 * Features strong colors, playful typography, and energetic animations
 */

import { 
  DEFAULT_SPACING, 
  DEFAULT_TYPOGRAPHY_SIZES, 
  DEFAULT_FONT_WEIGHTS,
  DEFAULT_BORDER_RADIUS,
  DEFAULT_TRANSITIONS 
} from '../../core/themes/types';

export const queenTheme = {
  name: 'Queen Mode',
  mode: 'queen',
  
  colors: {
    // Primary palette - Bold and vibrant
    primary: '#E91E63', // Hot pink
    secondary: '#9C27B0', // Purple
    tertiary: '#FF4081', // Pink accent
    
    // Backgrounds
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceAlt: '#FFF0F5', // Lavender blush
    
    // Text colors
    text: '#212121',
    textSecondary: '#616161',
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    
    // Borders and dividers
    border: '#E0E0E0',
    borderLight: '#F5F5F5',
    
    // States
    error: '#F44336',
    warning: '#FF9800',
    success: '#4CAF50',
    info: '#2196F3',
    
    // Phase-specific colors - Vibrant and bold
    phases: {
      menstrual: '#D32F2F', // Deep red
      follicular: '#FFC107', // Amber
      ovulation: '#4CAF50', // Green
      luteal: '#9C27B0', // Purple
      lateLuteal: '#7B1FA2', // Dark purple
      premenstrual: '#C2185B' // Dark pink
    },
    
    // Interactive states
    hover: {
      primary: '#D81B60',
      secondary: '#8E24AA'
    },
    
    // Gradients for headers and accents
    gradients: {
      primary: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
      secondary: 'linear-gradient(135deg, #FF4081 0%, #F50057 100%)',
      hero: 'linear-gradient(135deg, #E91E63 0%, #FF4081 50%, #9C27B0 100%)'
    }
  },
  
  typography: {
    // Playful, modern fonts
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    headingFontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    
    sizes: {
      ...DEFAULT_TYPOGRAPHY_SIZES,
      hero: '2.5rem',
      display: '3rem'
    },
    
    weights: DEFAULT_FONT_WEIGHTS,
    
    // Line heights
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  
  spacing: DEFAULT_SPACING,
  
  borderRadius: {
    ...DEFAULT_BORDER_RADIUS,
    button: '2rem', // Rounded buttons
    card: '1rem'
  },
  
  shadows: {
    sm: '0 2px 4px rgba(233, 30, 99, 0.1)',
    md: '0 4px 12px rgba(233, 30, 99, 0.15)',
    lg: '0 8px 24px rgba(233, 30, 99, 0.2)',
    glow: '0 0 20px rgba(233, 30, 99, 0.3)',
    button: '0 4px 12px rgba(156, 39, 176, 0.3)'
  },
  
  transitions: {
    ...DEFAULT_TRANSITIONS,
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

// Dark mode variant for Queen
export const queenThemeDark = {
  ...queenTheme,
  name: 'Queen Mode (Dark)',
  variant: 'dark',
  
  colors: {
    ...queenTheme.colors,
    
    // Dark mode adjustments
    background: '#121212',
    surface: '#1E1E1E',
    surfaceAlt: '#2C1B2E', // Dark purple tint
    
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    
    border: '#333333',
    borderLight: '#2A2A2A',
    
    // Adjusted phase colors for dark mode
    phases: {
      menstrual: '#EF5350', // Lighter red
      follicular: '#FFD54F', // Lighter amber
      ovulation: '#66BB6A', // Lighter green
      luteal: '#AB47BC', // Lighter purple
      lateLuteal: '#9C27B0', // Medium purple
      premenstrual: '#EC407A' // Lighter pink
    },
    
    // Adjusted gradients for dark mode
    gradients: {
      primary: 'linear-gradient(135deg, #EC407A 0%, #AB47BC 100%)',
      secondary: 'linear-gradient(135deg, #FF80AB 0%, #FF4081 100%)',
      hero: 'linear-gradient(135deg, #EC407A 0%, #FF80AB 50%, #AB47BC 100%)'
    }
  },
  
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
    glow: '0 0 20px rgba(255, 64, 129, 0.4)',
    button: '0 4px 12px rgba(171, 71, 188, 0.4)'
  }
};