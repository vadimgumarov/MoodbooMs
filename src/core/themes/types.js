/**
 * Theme System Types and Constants
 * 
 * Defines the structure and types for the mode-specific theming system
 */

/**
 * Theme structure definition
 * @typedef {Object} Theme
 * @property {Object} colors - Color palette
 * @property {string} colors.primary - Primary brand color
 * @property {string} colors.secondary - Secondary accent color
 * @property {string} colors.background - Main background color
 * @property {string} colors.surface - Surface/card background color
 * @property {string} colors.text - Primary text color
 * @property {string} colors.textSecondary - Secondary text color
 * @property {string} colors.border - Border color
 * @property {string} colors.error - Error state color
 * @property {string} colors.warning - Warning state color
 * @property {string} colors.success - Success state color
 * @property {Object} colors.phases - Phase-specific colors
 * @property {string} colors.phases.menstrual - Menstrual phase color
 * @property {string} colors.phases.follicular - Follicular phase color
 * @property {string} colors.phases.ovulation - Ovulation phase color
 * @property {string} colors.phases.luteal - Luteal phase color
 * @property {string} colors.phases.lateLuteal - Late luteal phase color
 * @property {string} colors.phases.premenstrual - Pre-menstrual phase color
 * @property {Object} typography - Typography settings
 * @property {string} typography.fontFamily - Main font family
 * @property {string} typography.headingFontFamily - Heading font family
 * @property {Object} typography.sizes - Font size scale
 * @property {string} typography.sizes.xs - Extra small text
 * @property {string} typography.sizes.sm - Small text
 * @property {string} typography.sizes.base - Base text size
 * @property {string} typography.sizes.lg - Large text
 * @property {string} typography.sizes.xl - Extra large text
 * @property {string} typography.sizes.xxl - 2X large text
 * @property {Object} typography.weights - Font weight scale
 * @property {number} typography.weights.normal - Normal weight
 * @property {number} typography.weights.medium - Medium weight
 * @property {number} typography.weights.semibold - Semibold weight
 * @property {number} typography.weights.bold - Bold weight
 * @property {Object} spacing - Spacing scale
 * @property {string} spacing.xs - Extra small spacing
 * @property {string} spacing.sm - Small spacing
 * @property {string} spacing.md - Medium spacing
 * @property {string} spacing.lg - Large spacing
 * @property {string} spacing.xl - Extra large spacing
 * @property {Object} borderRadius - Border radius scale
 * @property {string} borderRadius.sm - Small radius
 * @property {string} borderRadius.md - Medium radius
 * @property {string} borderRadius.lg - Large radius
 * @property {string} borderRadius.full - Full radius (circular)
 * @property {Object} shadows - Shadow definitions
 * @property {string} shadows.sm - Small shadow
 * @property {string} shadows.md - Medium shadow
 * @property {string} shadows.lg - Large shadow
 * @property {Object} transitions - Transition configurations
 * @property {string} transitions.fast - Fast transition
 * @property {string} transitions.normal - Normal transition
 * @property {string} transitions.slow - Slow transition
 * @property {Object} animations - Animation configurations
 * @property {string} animations.modeSwitch - Mode switch animation
 * @property {string} animations.fadeIn - Fade in animation
 * @property {string} animations.slideIn - Slide in animation
 */

/**
 * Available theme modes
 */
export const THEME_MODES = {
  QUEEN: 'queen',
  KING: 'king'
};

/**
 * Dark mode variants
 */
export const THEME_VARIANTS = {
  LIGHT: 'light',
  DARK: 'dark'
};

/**
 * Default spacing scale (in rem units)
 */
export const DEFAULT_SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem'
};

/**
 * Default typography sizes (in rem units)
 */
export const DEFAULT_TYPOGRAPHY_SIZES = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  xxl: '1.5rem',
  xxxl: '2rem'
};

/**
 * Default font weights
 */
export const DEFAULT_FONT_WEIGHTS = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700
};

/**
 * Default border radius scale
 */
export const DEFAULT_BORDER_RADIUS = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px'
};

/**
 * Default transition timings
 */
export const DEFAULT_TRANSITIONS = {
  fast: '150ms ease-in-out',
  normal: '300ms ease-in-out',
  slow: '500ms ease-in-out'
};