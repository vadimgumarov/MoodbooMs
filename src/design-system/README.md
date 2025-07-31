# MoodBooMs Design System

A lightweight, modular design token system for the MoodBooMs menubar app.

## Overview

This design system provides:
- **Design tokens** for consistent styling
- **Theme support** for Queen and King modes
- **Platform adaptability** for future mobile support
- **CSS variables** for performance and flexibility

## Structure

```
design-system/
├── tokens/
│   ├── base/          # Core design tokens
│   ├── themes/        # Mode-specific themes
│   └── platforms/     # Platform adjustments
├── DesignSystemProvider.jsx
└── tailwind-tokens.js
```

## Usage

### Using Tailwind Classes

The design system extends Tailwind with custom tokens:

```jsx
// Using token-based colors
<div className="bg-primary text-text-primary">
  <h1 className="text-title font-semibold">Title</h1>
  <p className="text-body text-text-secondary">Body text</p>
</div>

// Using spacing tokens
<div className="p-md space-y-sm">
  <button className="px-lg py-sm">Button</button>
</div>
```

### Using CSS Variables

All tokens are available as CSS variables:

```css
.custom-component {
  color: var(--color-primary);
  padding: var(--spacing-md);
  font-size: var(--text-heading);
}
```

### Available Tokens

#### Colors
- `primary`, `primary-light`, `primary-dark` - Mode-specific primary colors
- `text-primary`, `text-secondary`, `text-muted` - Text hierarchy
- `background`, `surface`, `border` - UI surfaces
- `success`, `warning`, `error` - Semantic colors
- `accent` - Mode-specific accent color

#### Spacing
- `xs` (4px), `sm` (8px), `md` (16px), `lg` (24px), `xl` (32px), `2xl` (48px)

#### Typography
- `tiny` (12px), `small` (14px), `body` (16px)
- `heading` (20px), `title` (30px), `display` (40px)

#### Shadows
- `shadow-sm`, `shadow-md`, `shadow-lg`

## Theme Switching

Themes automatically switch based on the current mode (Queen/King):
- **Queen Mode**: Pink primary, feminine palette
- **King Mode**: Blue primary, masculine palette

## Example Component

```jsx
import { utils } from '../design-system';

function ExampleCard({ title, content }) {
  return (
    <div className="bg-surface rounded-lg shadow-md p-md">
      <h3 className={utils.textStyles.heading}>
        {title}
      </h3>
      <p className="text-text-secondary mt-sm">
        {content}
      </p>
      <button className="bg-primary text-white px-md py-sm rounded mt-md hover:bg-primary-dark">
        Action
      </button>
    </div>
  );
}
```

## Best Practices

1. **Use semantic tokens** instead of raw colors (e.g., `text-primary` not `gray-900`)
2. **Stick to the spacing scale** for consistent layouts
3. **Use text style utilities** for typography consistency
4. **Leverage CSS variables** for custom components

## Future Enhancements

- Dark mode support (already structured for it)
- Mobile platform adjustments
- Additional semantic color tokens
- Component-specific token sets