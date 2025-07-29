// King Mode Theme Configuration
// Partner-focused design with warning colors and clear status indicators

export const kingTheme = {
  name: 'King Mode',
  description: 'Partner warning system with survival guide aesthetics',
  
  // Color palette - Warning/Alert focused
  colors: {
    // Primary colors - Warning tones
    primary: '#FF6B6B',        // Alert red
    secondary: '#4ECDC4',      // Safe teal
    accent: '#FFE66D',         // Caution yellow
    
    // Status colors matching danger levels
    danger: '#DC2626',         // Code red
    warning: '#F59E0B',        // Orange alert
    safe: '#10B981',           // Green safe zone
    caution: '#6366F1',        // Blue caution
    
    // Background colors
    background: '#1F2937',     // Dark tactical
    surface: '#374151',        // Elevated surface
    card: '#4B5563',          // Card background
    
    // Text colors
    text: {
      primary: '#F9FAFB',      // High contrast white
      secondary: '#D1D5DB',    // Muted gray
      danger: '#FCA5A5',       // Light red
      warning: '#FCD34D',      // Light yellow
      safe: '#86EFAC',         // Light green
    },
    
    // Phase-specific colors
    phases: {
      menstrual: '#DC2626',    // Code Red Alert
      follicular: '#10B981',   // Safe Zone Active
      ovulation: '#FFE66D',    // High Energy Warning
      luteal: '#F59E0B',       // Patience Level: Low
      lateLuteal: '#7C3AED',   // Volatility Alert
      premenstrual: '#991B1B'  // DEFCON 1
    },
    
    // UI element colors
    ui: {
      border: '#6B7280',
      divider: '#4B5563',
      hover: '#6366F1',
      active: '#8B5CF6',
      disabled: '#4B5563',
      overlay: 'rgba(0, 0, 0, 0.7)'
    }
  },
  
  // Typography - Clear and bold
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      mono: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  
  // Spacing system
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  
  // Border radius - Sharp, tactical feel
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    base: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px'
  },
  
  // Shadows - Strong definition
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  
  // Component-specific styles
  components: {
    button: {
      primary: {
        background: '#FF6B6B',
        color: '#FFFFFF',
        hover: '#DC2626',
        active: '#991B1B'
      },
      secondary: {
        background: '#4ECDC4',
        color: '#1F2937',
        hover: '#06B6D4',
        active: '#0891B2'
      },
      danger: {
        background: '#DC2626',
        color: '#FFFFFF',
        hover: '#991B1B',
        active: '#7F1D1D'
      }
    },
    
    card: {
      background: '#374151',
      border: '#4B5563',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
    },
    
    input: {
      background: '#1F2937',
      border: '#4B5563',
      focus: '#FF6B6B',
      text: '#F9FAFB',
      placeholder: '#9CA3AF'
    },
    
    toggle: {
      background: '#4B5563',
      active: '#FF6B6B',
      handle: '#FFFFFF'
    },
    
    badge: {
      danger: {
        background: '#DC2626',
        text: '#FFFFFF'
      },
      warning: {
        background: '#F59E0B',
        text: '#1F2937'
      },
      safe: {
        background: '#10B981',
        text: '#1F2937'
      }
    }
  },
  
  // CSS variables for easy access
  cssVariables: `
    --king-primary: #FF6B6B;
    --king-secondary: #4ECDC4;
    --king-accent: #FFE66D;
    --king-danger: #DC2626;
    --king-warning: #F59E0B;
    --king-safe: #10B981;
    --king-caution: #6366F1;
    --king-bg: #1F2937;
    --king-surface: #374151;
    --king-card: #4B5563;
    --king-text: #F9FAFB;
    --king-text-secondary: #D1D5DB;
    --king-border: #6B7280;
  `
};

// Export theme utilities
export const getPhaseColor = (phase) => {
  return kingTheme.colors.phases[phase] || kingTheme.colors.primary;
};

export const getDangerLevel = (phase) => {
  const dangerMap = {
    menstrual: 'danger',
    follicular: 'safe',
    ovulation: 'safe',
    luteal: 'warning',
    lateLuteal: 'caution',
    premenstrual: 'danger'
  };
  return dangerMap[phase] || 'warning';
};

// Export theme class names for King mode
export const kingThemeClasses = {
  container: 'king-mode-container',
  phaseCard: 'king-phase-card',
  dangerBadge: 'king-danger-badge',
  statusIndicator: 'king-status-indicator',
  warningAlert: 'king-warning-alert'
};