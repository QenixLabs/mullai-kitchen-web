# Claude Instructions for Mullai Kitchen Client

## Project Overview

Mullai Kitchen is a modern food delivery platform built with Next.js 15, TypeScript, and Tailwind CSS. The design system is built on top of Tailwind with CSS custom properties for theming.

**Tech Stack:**
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Hook Form + Zod for forms
- NextAuth.js for authentication

## Design System

The design system is located in `src/lib/design-system/` and documented in `docs/design-system.md`.

### Location of Design Tokens

All design tokens are defined in:
- **CSS Variables**: `app/globals.css`
- **TypeScript Helpers**: `src/lib/design-system/tokens.ts`
- **Constants**: `src/lib/design-system/constants.ts`
- **Types**: `src/lib/design-system/types.ts`

### Available Color Tokens

| Token | Usage |
|-------|-------|
| `background`, `foreground` | Page background and primary text |
| `card`, `card-foreground` | Card backgrounds and text |
| `popover`, `popover-foreground` | Popover/dropdown backgrounds |
| `primary`, `primary-foreground` | Primary actions, brand elements |
| `secondary`, `secondary-foreground` | Secondary actions |
| `muted`, `muted-foreground` | Subtle backgrounds and secondary text |
| `accent`, `accent-foreground` | Accent highlights |
| `destructive`, `destructive-foreground` | Error states, delete actions |
| `border`, `input`, `ring` | Borders, inputs, focus rings |
| `success`, `success-foreground` | Success states |
| `warning`, `warning-foreground` | Warning states |
| `info`, `info-foreground` | Informational states |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 0.25rem (4px) | Tight spacing |
| `sm` | 0.5rem (8px) | Small spacing |
| `md` | 1rem (16px) | Default spacing |
| `lg` | 1.5rem (24px) | Large spacing |
| `xl` | 2rem (32px) | Extra large spacing |
| `2xl` | 2.5rem (40px) | XXL spacing |
| `3xl` | 3rem (48px) | XXXL spacing |

### Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 0.5rem (8px) | Small elements |
| `md` | 0.75rem (12px) | Medium elements |
| `lg` | 1rem (16px) | Cards, buttons |
| `xl` | 1.5rem (24px) | Large cards |
| `2xl` | 2rem (32px) | Hero sections |
| `full` | 9999px | Fully rounded |

## Design System Usage Guidelines

### Using Design Tokens in Tailwind Classes

**PREFERRED: Use Tailwind's color utilities directly**
```tsx
// ✅ Good - Use Tailwind's built-in utilities
className="bg-primary text-primary-foreground"
className="text-muted-foreground"
className="border-border hover:bg-accent"
```

**Using Helper Functions (when needed)**
```tsx
import { getColorToken, getSpacingToken, getRadiusToken, getShadowToken } from '@/lib/design-system';

// For inline styles or dynamic values
style={{ color: getColorToken('primary') }}
style={{ padding: getSpacingToken('lg') }}
style={{ borderRadius: getRadiusToken('md') }}
style={{ boxShadow: getShadowToken('primary') }}
```

### Using Color Tokens with Opacity

```tsx
import { getColorTokenValue } from '@/lib/design-system';

// With opacity modifier
style={{ backgroundColor: getColorTokenValue('primary', 0.5) }}

// Or using Tailwind's opacity syntax
className="bg-primary/50 hover:bg-primary/90"
```

### Using TypeScript Types

```tsx
import type { ColorToken, SpacingToken, RadiusToken, ShadowToken } from '@/lib/design-system';

// For type-safe component props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'destructive';
  size: 'sm' | 'md' | 'lg';
  radius?: RadiusToken;
}
```

### Using Constants Directly

```tsx
import { SPACING, RADIUS, SHADOWS, FONT_SIZES } from '@/lib/design-system';

// When you need the actual values
style={{ padding: SPACING.lg }}
style={{ borderRadius: RADIUS.md }}
style={{ boxShadow: SHADOWS.primary }}
style={{ fontSize: FONT_SIZES.lg }}
```

## Best Practices

### ✅ DO

1. **Always use design tokens** instead of hardcoded colors
   ```tsx
   // ✅ Good
   className="bg-primary text-primary-foreground"

   // ❌ Bad
   className="bg-[#FF6B35] text-white"
   ```

2. **Use Tailwind scale for spacing**, not arbitrary values
   ```tsx
   // ✅ Good
   className="p-4 m-2 gap-3"

   // ❌ Bad
   className="p-[17px] m-[9px]"
   ```

3. **Use semantic tokens**, not color names
   ```tsx
   // ✅ Good
   className="bg-destructive text-destructive-foreground"

   // ❌ Bad
   className="bg-red-600 text-white"
   ```

4. **Use opacity modifiers for hover states**
   ```tsx
   // ✅ Good
   className="hover:bg-primary/90"
   ```

5. **Use the `cn()` utility** from `@/lib/utils` for class combination
   ```tsx
   import { cn } from '@/lib/utils';

   className={cn('bg-primary', isActive && 'ring-2')}
   ```

6. **Use shadcn/ui components** when possible instead of building from scratch

### ❌ DON'T

1. **Don't use hardcoded colors** - always use design tokens
2. **Don't use arbitrary spacing values** - use the defined scale
3. **Don't use color names** (red, blue, green) - use semantic tokens
4. **Don't duplicate shadcn/ui components** - import and use them
5. **Don't inline styles for static values** - use Tailwind classes

## Component Patterns

### Button Pattern

```tsx
import { cn } from '@/lib/utils';
import { getColorToken } from '@/lib/design-system';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) => {
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  const sizeStyles = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-11 px-8 text-lg',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
};
```

### Card Pattern

```tsx
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = ({ className, ...props }: CardProps) => (
  <div
    className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);
```

## File Structure

```
client/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (protected)/       # Protected pages
│   ├── globals.css        # Global styles and design token CSS variables
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
├── src/
│   ├── lib/              # Utilities and helpers
│   │   ├── design-system/ # Design system tokens and helpers
│   │   └── utils.ts      # cn() utility and other helpers
│   └── features/         # Feature-specific code
├── docs/                 # Documentation
│   └── design-system.md  # Design system documentation
└── CLAUDE.md            # This file
```

## Brand Colors

The primary brand color is **Orange** (`#FF6B35`).

Available as:
- `primary` - Main brand color
- `primaryDark` - Darker shade (`#FF5C00`)
- `primaryLight` - Lighter shade (`#FF8555`)
- `primaryHover` - Hover state (`#E85A25`)
- `primaryHoverLight` - Light hover (`#FF7545`)

Use via design token: `bg-primary` or via constant: `BRAND_COLORS.primary`

## Testing

- Use `@testing-library/react` for component testing
- Test design token usage when applicable
- Ensure responsive behavior using Tailwind's responsive prefixes (`md:`, `lg:`)

## Accessibility

- Use semantic HTML elements
- Ensure sufficient color contrast
- Use ARIA attributes when needed
- Test keyboard navigation

## When in Doubt

1. Check `docs/design-system.md` for detailed design system docs
2. Look at existing components in `components/` for patterns
3. Use shadcn/ui components as a reference
4. Import helpers from `@/lib/design-system` when you need programmatic access to tokens
