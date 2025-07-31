/**
 * Platform-specific adjustments
 * Minimal for now, expandable for future mobile needs
 */

export const platforms = {
  desktop: {
    scale: 1.0,
    minTouchTarget: '32px', // Smaller for mouse interaction
  },
  mobile: {
    scale: 1.1, // Slightly larger for touch
    minTouchTarget: '44px', // iOS/Android recommendation
  },
};