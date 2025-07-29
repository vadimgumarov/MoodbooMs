/**
 * Main design system export
 * Single source of truth for all design-related imports
 */

export { tokens } from './tokens';
export { DesignSystemProvider } from './DesignSystemProvider';
export { tailwindTokens } from './tailwind-tokens';

// Utility classes for common patterns
export const utils = {
  // Text styles using CSS variables
  textStyles: {
    display: 'text-display font-bold',
    title: 'text-title font-semibold',
    heading: 'text-heading font-semibold',
    body: 'text-body font-normal',
    small: 'text-small font-normal',
    tiny: 'text-tiny font-normal',
  },
  
  // Spacing utilities
  spacing: {
    section: 'py-lg px-md',
    component: 'p-md',
    compact: 'p-sm',
  },
  
  // Common component patterns
  components: {
    button: 'px-md py-sm rounded-md font-medium',
    input: 'px-sm py-xs border border-border rounded',
    card: 'bg-surface p-md rounded-lg shadow-sm',
  },
};