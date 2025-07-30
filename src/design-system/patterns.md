# CSS Patterns & Best Practices

## Overview
This document outlines CSS patterns and utilities for the MoodBooMs design system.

## Core Principles

1. **Use Design Tokens** - Always use token-based values instead of hardcoded values
2. **Semantic Naming** - Use semantic color names (primary, text-secondary) not literal (pink-500)
3. **Utility-First** - Leverage Tailwind utilities before writing custom CSS
4. **Responsive by Default** - Design mobile-first, enhance for larger screens

## Common Patterns

### Layout Patterns

```jsx
// Container with consistent padding
<div className="p-lg">

// Section spacing
<div className="py-xl px-lg">

// Component spacing
<div className="space-y-md">

// Flex layouts
<div className="flex items-center justify-between gap-md">

// Grid layouts
<div className="grid grid-cols-2 md:grid-cols-4 gap-md">
```

### Component Patterns

#### Buttons
```jsx
// Primary button
<button className="px-md py-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">

// Secondary button
<button className="px-md py-sm bg-surface text-text-primary border border-border rounded-md hover:bg-background transition-colors">

// Icon button
<button className="p-sm rounded-full hover:bg-surface transition-colors">
```

#### Cards
```jsx
// Basic card
<div className="bg-surface p-md rounded-lg shadow-sm border border-border">

// Interactive card
<div className="bg-surface p-md rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
```

#### Form Elements
```jsx
// Text input
<input className="w-full px-sm py-xs border border-border rounded bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary">

// Label
<label className="text-small font-medium text-text-primary block mb-xs">
```

### Text Patterns

```jsx
// Headings
<h1 className="text-display font-bold text-text-primary">
<h2 className="text-title font-semibold text-text-primary">
<h3 className="text-heading font-medium text-text-primary">

// Body text
<p className="text-body text-text-primary">
<p className="text-small text-text-secondary">
<p className="text-tiny text-text-muted">

// Emphasis
<span className="font-semibold">
<span className="text-primary">
```

### State Patterns

```jsx
// Hover states
hover:bg-primary-dark
hover:text-primary
hover:shadow-md
hover:border-primary

// Focus states
focus:outline-none focus:ring-2 focus:ring-primary
focus:border-primary

// Disabled states
disabled:opacity-50 disabled:cursor-not-allowed

// Active states
active:scale-95
```

## Utility Classes

### Custom Utilities (from design-system/index.js)

```javascript
// Text styles
utils.textStyles.display  // Large display text
utils.textStyles.title    // Section titles
utils.textStyles.heading  // Component headings
utils.textStyles.body     // Body text
utils.textStyles.small    // Small text
utils.textStyles.tiny     // Tiny text

// Spacing
utils.spacing.section     // Section padding
utils.spacing.component   // Component padding
utils.spacing.compact     // Compact padding

// Components
utils.components.button   // Button base styles
utils.components.input    // Input base styles
utils.components.card     // Card base styles
```

## Responsive Design

### Breakpoints
- Mobile first approach
- `sm:` 640px and up
- `md:` 768px and up  
- `lg:` 1024px and up
- `xl:` 1280px and up

### Common Responsive Patterns

```jsx
// Hide on mobile, show on desktop
<div className="hidden md:block">

// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Responsive text
<h1 className="text-title md:text-display">
```

## Theme-Specific Styling

### Mode-Based Styling
```jsx
// Using body class
.theme-queen .special-element {
  /* Queen mode specific styles */
}

.theme-king .special-element {
  /* King mode specific styles */
}

// Using CSS variables (automatically switches)
.element {
  color: var(--color-primary); // Pink in Queen, Blue in King
}
```

## Performance Best Practices

1. **Avoid inline styles** - Use utility classes instead
2. **Minimize custom CSS** - Leverage existing utilities
3. **Use CSS variables** - They update without re-renders
4. **Avoid complex selectors** - Keep specificity low
5. **Group related utilities** - Use component pattern utilities

## Accessibility Patterns

```jsx
// Focus indicators
focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2

// Screen reader only
<span className="sr-only">

// Reduced motion
motion-reduce:transition-none

// High contrast support
// Use semantic color tokens that can be adjusted for contrast
```

## Do's and Don'ts

### Do's ✅
- Use design tokens for all values
- Follow mobile-first approach
- Use semantic class names
- Maintain consistent spacing
- Test in both Queen and King modes

### Don'ts ❌
- Don't use arbitrary values (e.g., `p-[17px]`)
- Don't use color literals (e.g., `text-pink-500`)
- Don't mix spacing scales
- Don't override design tokens
- Don't use `!important`