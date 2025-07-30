/**
 * King mode theme tokens
 * Masculine, informative color palette
 */

import { baseColors } from '../base/colors.js';

export const kingTheme = {
  name: 'king',
  
  colors: {
    // Simple primary - muted blue-gray
    primary: baseColors.gray[400],
    primaryLight: baseColors.gray[700],
    primaryDark: baseColors.gray[300],
    
    // Dark gray UI
    background: baseColors.gray[800],
    surface: baseColors.gray[700],
    border: baseColors.gray[600],
    
    // Text colors for dark mode
    text: {
      primary: baseColors.gray[100],
      secondary: baseColors.gray[300],
      muted: baseColors.gray[500],
      inverse: baseColors.gray[900],
    },
    
    // Muted semantic colors
    success: baseColors.green[400],
    warning: baseColors.amber[400],
    error: baseColors.red[400],
    info: baseColors.blue[400],
    
    // Accent same as primary
    accent: baseColors.gray[400],
  },
};