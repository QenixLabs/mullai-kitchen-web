# Design System Documentation

## Overview

The Mullai Kitchen design system is built on top of Tailwind CSS and uses CSS custom properties for theming. All design tokens are defined in `app/globals.css` and can be accessed programmatically through utilities in `src/lib/design-system/`.

## Color Tokens

| Token | CSS Variable | Usage |
|--------|---------------|--------|
| primary | --primary | Primary actions, brand elements |
| primary-foreground | --primary-foreground | Text on primary backgrounds |
| secondary | --secondary | Secondary actions |
| secondary-foreground | --secondary-foreground | Text on secondary backgrounds |
| muted | --muted | Subtle backgrounds |
| muted-foreground | --muted-foreground | Secondary text |
| accent | --accent | Accent backgrounds |
| destructive | --destructive | Error states, destructive actions |
| success | --success | Success states |
| warning | --warning | Warning states |
| info | --info | Informational states |

## Spacing Tokens

| Token | Value | Usage |
|--------|--------|--------|
| xs | 0.25rem (4px) | Tight spacing |
| sm | 0.5rem (8px) | Small spacing |
| md | 1rem (16px) | Default spacing |
| lg | 1.5rem (24px) | Large spacing |
| xl | 2rem (32px) | Extra large spacing |

## Border Radius Tokens

| Token | Value | Usage |
|--------|--------|--------|
| sm | 0.5rem (8px) | Small elements |
| md | 0.75rem (12px) | Medium elements |
| lg | 1rem (16px) | Cards, buttons |
| xl | 1.5rem (24px) | Large cards |
| 2xl | 2rem (32px) | Hero sections |

## Usage Examples

### Colors
```tsx
// Using design tokens in Tailwind classes
className="bg-primary text-primary-foreground"
className="text-muted-foreground"
className="border-border"

// Using design tokens in inline styles
style={{ color: 'hsl(var(--primary))' }}
```

### Spacing
```tsx
// Using Tailwind scale
className="p-4 m-2 gap-3"

// Using design system helper
import { getSpacingToken } from '@/lib/design-system';
style={{ padding: getSpacingToken('lg') }}
```

## Best Practices

1. **Always use design tokens** instead of hardcoded colors
2. **Use Tailwind scale** for spacing, not arbitrary values
3. **Use semantic tokens** (primary, muted, destructive) not color names
4. **Use opacity modifiers** for hover states: `hover:bg-primary/90`
5. **Use `cn()` utility** from `@/lib/utils` for class combination
