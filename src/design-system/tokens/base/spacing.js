/**
 * Spacing scale tokens
 * Based on 4px baseline for consistency
 */

export const spacing = {
  0: '0px',
  xs: '4px',    // 0.25rem
  sm: '8px',    // 0.5rem
  md: '16px',   // 1rem
  lg: '24px',   // 1.5rem
  xl: '32px',   // 2rem
  '2xl': '48px', // 3rem
  '3xl': '64px', // 4rem
  '4xl': '96px', // 6rem
};

// Layout-specific spacing
export const layout = {
  containerPadding: {
    mobile: spacing.md,
    desktop: spacing.lg,
  },
  sectionSpacing: {
    mobile: spacing.lg,
    desktop: spacing.xl,
  },
  componentSpacing: {
    mobile: spacing.sm,
    desktop: spacing.md,
  },
};

// Consistent gaps for flex/grid
export const gaps = {
  xs: spacing.xs,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
  xl: spacing.xl,
};