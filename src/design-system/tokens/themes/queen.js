/**
 * Queen mode theme tokens
 * Feminine, empowering color palette
 */

import { baseColors } from '../base/colors';

export const queenTheme = {
  name: 'queen',
  
  colors: {
    // Primary palette
    primary: baseColors.pink[500],
    primaryLight: baseColors.pink[400],
    primaryDark: baseColors.pink[600],
    
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
    success: baseColors.green[500],
    warning: baseColors.yellow[500],
    error: baseColors.red[500],
    info: baseColors.blue[500],
    
    // Mode-specific accent
    accent: baseColors.purple[500],
  },
};