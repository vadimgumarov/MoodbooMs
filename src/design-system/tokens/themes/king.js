/**
 * King mode theme tokens
 * Masculine, informative color palette
 */

import { baseColors } from '../base/colors';

export const kingTheme = {
  name: 'king',
  
  colors: {
    // Primary palette
    primary: baseColors.blue[600],
    primaryLight: baseColors.blue[500],
    primaryDark: baseColors.blue[700],
    
    // UI colors
    background: baseColors.white,
    surface: baseColors.gray[50],
    border: baseColors.gray[200],
    
    // Text colors
    text: {
      primary: baseColors.gray[900],
      secondary: baseColors.gray[600],
      muted: baseColors.gray[400],
      inverse: baseColors.white,
    },
    
    // Semantic colors
    success: baseColors.green[600],
    warning: baseColors.yellow[600],
    error: baseColors.red[600],
    info: baseColors.blue[600],
    
    // Mode-specific accent
    accent: baseColors.gray[700],
  },
};