/**
 * Queen mode theme tokens
 * Feminine, empowering color palette
 */

import { baseColors } from '../base/colors.js';

export const queenTheme = {
  name: 'queen',
  
  colors: {
    // Simple primary - neutral indigo
    primary: baseColors.indigo[500],
    primaryLight: baseColors.indigo[50],
    primaryDark: baseColors.indigo[600],
    
    // Clean light UI
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
    
    // Minimal semantic colors
    success: baseColors.green[500],
    warning: baseColors.yellow[500],
    error: baseColors.red[500],
    info: baseColors.blue[500],
    
    // Accent same as primary
    accent: baseColors.indigo[500],
  },
};