# Mullai Kitchen - Design System

This document defines the design system and patterns used across Mullai Kitchen frontend application. All UI components should follow these guidelines for consistency.

---

## Design System Location

The design system is located in `src/lib/design-system/` and contains:

### Files
- **`src/lib/design-system/index.ts`** - Public API entry point
- **`src/lib/design-system/types.ts`** - TypeScript type definitions
- **`src/lib/design-system/tokens.ts`** - Helper functions for accessing tokens
- **`src/lib/design-system/constants.ts`** - Design constants

---

## Design Tokens

### Color Tokens

Use semantic color tokens from the design system instead of hardcoded colors.

| Element | Token | Tailwind Class | Description |
|---------|--------|----------------|----------------|
| Primary actions | `primary` | `text-primary`, `bg-primary`, `border-primary` |
| Primary hover | `primary/90` | `hover:bg-primary/90`, `hover:text-primary/90` |
| Foreground | `foreground` | `text-foreground` |
| Card | `card` | `bg-card`, `text-card-foreground` |
| Secondary | `secondary` | `bg-secondary`, `text-secondary-foreground` |
| Muted | `muted` | `bg-muted`, `text-muted-foreground` |
| Accent | `accent` | `bg-accent`, `text-accent-foreground` |
| Destructive | `destructive` | `bg-destructive`, `text-destructive-foreground` |
| Success | `success` | `bg-success`, `text-success-foreground` |
| Warning | `warning` | `bg-warning`, `text-warning-foreground` |
| Info | `info` | `bg-info`, `text-info-foreground` |
| Border | `border` | `border-border` |
| Input | `input` | `bg-input` |
| Ring | `ring` | `focus:ring-ring` |

### Spacing Tokens

| Context | Token | Tailwind Class | Value |
|---------|--------|----------------|-------|
| Extra small | `xs` | `p-xs`, `m-xs`, `gap-xs` | 0.25rem (4px) |
| Small | `sm` | `p-sm`, `m-sm`, `gap-sm` | 0.5rem (8px) |
| Medium | `md` | `p-md`, `m-md`, `gap-md` | 1rem (16px) |
| Large | `lg` | `p-lg`, `m-lg`, `gap-lg` | 1.5rem (24px) |
| Extra large | `xl` | `p-xl`, `m-xl`, `gap-xl` | 2rem (32px) |
| 2XL | `2xl` | `p-2xl`, `m-2xl`, `gap-2xl` | 2.5rem (40px) |

### Border Radius Tokens

| Element | Token | Tailwind Class | Value |
|---------|--------|----------------|-------|
| Small | `sm` | `rounded-sm` | 0.5rem (8px) |
| Medium | `md` | `rounded-md` | 0.75rem (12px) |
| Large | `lg` | `rounded-lg` | 1rem (16px) |
| Extra large | `xl` | `rounded-xl` | 1.5rem (24px) |
| 2XL | `2xl` | `rounded-2xl` | 2rem (32px) |
| Full | `full` | `rounded-full` | 9999px |

**Current standard**: All UI components use `rounded-sm` (8px) for minimal rounded corners.

### Shadow Tokens

| Context | Token | Tailwind Class |
|---------|--------|----------------|
| Small | `sm` | `shadow-sm` |
| Medium | `md` | `shadow-md` |
| Large | `lg` | `shadow-lg` |
| Extra large | `xl` | `shadow-xl` |
| Primary brand | `primary` | `shadow-primary` |

---

## Using the Design System

### Importing Tokens

```tsx
// Import from design system
import {
  getColorToken,
  getColorTokenValue,
  getSpacingToken,
  getRadiusToken,
  getShadowToken,
  BRAND_COLORS,
} from '@/lib/design-system';

// Or import specific types
import type { ColorToken, SpacingToken, RadiusToken, ShadowToken } from '@/lib/design-system';
```

### Using Color Tokens

**DO NOT** use hardcoded colors like `#FF6B35`, `text-[#FF6B35]`, etc.

**DO** use semantic tokens:

```tsx
// ❌ Bad - Hardcoded color
<div className="bg-[#FF6B35] text-[#666666]">

// ✅ Good - Using design tokens
<div className="bg-primary text-foreground">
```

### Using Spacing Tokens

```tsx
// ❌ Bad - Arbitrary values
<div className="p-[1.5rem] gap-[0.5rem]">

// ✅ Good - Using Tailwind scale
<div className="p-6 gap-2">
```

### Using Border Radius

```tsx
// ❌ Bad - Arbitrary values
<div className="rounded-[1.5rem] rounded-[8px]">

// ✅ Good - Using Tailwind tokens
<div className="rounded-sm rounded-lg">
```

### Using Shadows

```tsx
// ❌ Bad - Arbitrary shadow
<div className="shadow-[0_1px_3px_rgba(0,0,0,0.08)]">

// ✅ Good - Using design token or Tailwind
<div className="shadow-md shadow-primary">
```

---

## How to Add New Design Tokens

### Step 1: Define the CSS Custom Property

Edit `app/globals.css` and add the new token to `:root`:

```css
:root {
  /* New semantic color token */
  --my-new-color: 24 90% 50%;

  /* New spacing token */
  --spacing-4xl: 4rem;

  /* New radius token */
  --radius-4xl: 3rem;

  /* New shadow token */
  --shadow-custom: 0 4px 20px rgba(0, 0, 0, 0.15);
}
```

Add the same tokens to the dark mode section (`@media (prefers-color-scheme: light)`).

### Step 2: Map in Theme

Add the mapping in `@theme inline` section:

```css
@theme inline {
  --color-my-new-color: hsl(var(--my-new-color));
  --spacing-4xl: var(--spacing-4xl);
  --radius-4xl: var(--radius-4xl);
  --shadow-custom: var(--shadow-custom);
}
```

### Step 3: Define TypeScript Type (Optional)

Edit `src/lib/design-system/types.ts`:

```typescript
export type ColorToken =
  // ... existing tokens
  | 'my-new-color';
```

### Step 4: Use in Components

Now use the new token:

```tsx
<div className="bg-my-new-color p-4xl rounded-4xl shadow-custom">
```

---

## How to Change Design Tokens

### To Change Border Radius (Current: rounded-sm)

Edit `app/globals.css` and update the radius tokens:

```css
:root {
  --radius-sm: 0.5rem;    /* 8px */
  --radius-md: 0.75rem;   /* 12px */
  --radius-lg: 1rem;      /* 16px */
  --radius-xl: 1.5rem;    /* 24px */
  --radius-2xl: 2rem;     /* 32px */
}
```

Then use Tailwind class throughout components:
- `rounded-sm` - Current standard (8px, minimal)
- `rounded-md` - Slightly more (12px)
- `rounded-lg` - Moderate (16px)
- `rounded-xl` - More rounded (24px)
- `rounded-2xl` - Very rounded (32px)

### To Change Colors

Edit `app/globals.css` and update the color HSL values:

```css
:root {
  --primary: 24 90% 55%;  /* Change hue/saturation/lightness */
}
```

Then restart dev server to see changes.

### To Add Custom Shadows

Edit `app/globals.css`:

```css
:root {
  --shadow-custom: 0 4px 20px rgba(0, 0, 0, 0.15);
}

@theme inline {
  --shadow-custom: var(--shadow-custom);
}
```

Then use `shadow-custom` in components.

---

## CSS Custom Properties Reference

All design tokens are defined as HSL (Hue, Saturation, Lightness) colors in CSS.

### Example Color Values

```css
--primary: 24 90% 50%;       /* Orange */
--foreground: 30 20% 15%;     /* Dark gray */
--background: 30 50% 96%;    /* Light cream */
--success: 142 76% 36%;       /* Green */
--warning: 38 92% 50%;        /* Amber */
--info: 199 89% 48%;          /* Blue */
--destructive: 0 70% 44%;    /* Red */
```

### How to Create Custom Colors

Pick an HSL color:
- **Hue**: 0-360 (color wheel position)
- **Saturation**: 0-100% (0 = gray, 100% = pure color)
- **Lightness**: 0-100% (0 = black, 100% = white)

Example:
```css
--my-color: 180 80% 50%;  /* Medium teal */
```

---

## Typography

### Font Sizes

| Element | Size | Tailwind Class |
|---------|------|----------------|
| Page titles | 2xl/3xl | `text-2xl sm:text-3xl` |
| Card titles | xl | `text-xl` |
| Section headers | lg | `text-lg` |
| Body text | base/sm | `text-base`, `text-sm` |
| Small text | xs | `text-xs` |
| Labels | sm | `text-sm` |

### Font Weights

| Element | Weight | Tailwind Class |
|---------|--------|----------------|
| Headings | Bold | `font-bold` |
| Emphasized text | Semibold | `font-semibold` |
| Labels | Medium | `font-medium` |
| Body | Regular | `font-normal` |

---

## Buttons

### Primary Button

```tsx
<Button
  className="bg-primary text-primary-foreground rounded-sm shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-primary active:scale-[0.98]"
>
  Button Text
</Button>
```

### Secondary/Outline Button

```tsx
<Button
  variant="outline"
  className="border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground rounded-sm transition-all duration-300 active:scale-[0.98]"
>
  Button Text
</Button>
```

### Button Properties
- **Height**: `h-11` (44px)
- **Border radius**: `rounded-sm` (8px)
- **Transition**: `duration-300` for all states
- **Active state**: `scale-[0.98]` for press feedback

---

## Form Inputs

### Standard Input

```tsx
<Input
  className="h-11 rounded-sm border-input bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-ring/20"
  placeholder="Placeholder text"
/>
```

### Input Properties
- **Height**: `h-11` (44px)
- **Border radius**: `rounded-sm` (8px)
- **Border**: `border-input` (semantic token)
- **Background**: `bg-card` (semantic token)
- **Focus state**: Primary border ring

---

## Cards

### Standard Card

```tsx
<article
  className="rounded-sm bg-card border-border shadow-md transition-all duration-500 hover:shadow-primary"
>
  {/* Content */}
</article>
```

### Card Properties
- **Border radius**: `rounded-sm` (8px) - Current standard
- **Shadow**: Subtle shadow using `shadow-md`
- **Hover shadow**: Brand-tinted using `shadow-primary`
- **Transition**: `duration-500`

---

## Links

### Standard Link

```tsx
<Link
  className="font-semibold text-primary hover:text-primary/90 transition-colors"
  href="/path"
>
  Link Text
</Link>
```

---

## Icons

Use Lucide React icons throughout the application. Common icons:

```tsx
import {
  Check,
  Sparkles,
  Calendar,
  UtensilsCrossed,
  Flame,
  ArrowRight,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  PenLine,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Leaf,
  Headphones,
} from "lucide-react";
```

### Icon Usage
- Standard size: `h-4 w-4` or `h-5 w-5`
- In buttons: `h-4 w-4`
- Feature icons: `h-5 w-5`

---

## Animations & Transitions

### Standard Transitions

```tsx
// All properties
"transition-all duration-300"

// Specific properties
"transition-colors duration-300"
"transition-transform duration-500"
```

### Hover Effects
- **Scale**: `hover:scale-105` for images
- **Active press**: `active:scale-[0.98]` for buttons
- **Shadow**: Add shadow on hover

---

## Responsive Design

### Breakpoints

| Breakpoint | Tailwind Prefix | Common Use |
|------------|----------------|------------|
| sm (640px) | `sm:` | Mobile-first adjustments |
| lg (1024px) | `lg:` | Desktop layout changes |

### Common Patterns

```tsx
// Responsive text
"text-2xl sm:text-3xl"

// Responsive padding
"p-4 sm:p-8"

// Responsive layout
"flex-col sm:flex-row"

// Hide on mobile/desktop
"hidden lg:block" / "lg:hidden"
```

---

## Alerts

### Error Alert

```tsx
<Alert variant="destructive" className="border-destructive/50 bg-destructive/10 text-destructive">
  <AlertTitle>Error Title</AlertTitle>
  <AlertDescription>Error description text.</AlertDescription>
</Alert>
```

### Success Alert

```tsx
<Alert className="border-success/50 bg-success/10 text-success">
  <AlertTitle>Success Title</AlertTitle>
  <AlertDescription>Success description text.</AlertDescription>
</Alert>
```

---

## Selection States

### Selected/Active Card

```tsx
className={cn(
  "ring-2 ring-primary ring-offset-2 ring-offset-background",
  "shadow-md shadow-primary"
)}
```

### Selection Indicator

```tsx
<div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary shadow-lg">
  <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
</div>
```

---

## Decorative Elements

### Background Blurs

```tsx
<div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
```

---

## Checklist for New Components

- [ ] Use `primary` token for brand actions instead of hardcoded `#FF6B35`
- [ ] Use `rounded-sm` (8px) for standard border radius
- [ ] Apply `shadow-md` for cards and containers
- [ ] Apply `shadow-primary` on hover states
- [ ] Use semantic color tokens (foreground, muted, border, etc.)
- [ ] Include hover states with `hover:bg-primary/90`
- [ ] Use consistent spacing (`space-y-5`, `gap-2`)
- [ ] Apply `transition-all duration-300` for smooth animations
- [ ] Test responsive behavior with `sm:` and `lg:` prefixes
- [ ] Use Lucide icons, not emojis

---

## Spacing

### Component Spacing

| Context | Gap | Tailwind Class |
|---------|-----|----------------|
| Form fields | 1.25rem | `space-y-5` |
| Card sections | 1.25rem | `space-y-5` |
| Button groups | 0.625rem | `gap-2.5` |
| Inline elements | 0.5rem | `gap-2` |

### Padding

| Element | Padding | Tailwind Class |
|---------|---------|----------------|
| Cards | 1.25rem | `p-5` |
| Form containers | 1.5rem-2rem | `p-6` to `p-8` |
| Buttons (horizontal) | 2rem | `px-8` |

---

## Important Design Rules

### DO NOT Use Hardcoded Values

```tsx
// ❌ Never do this
className="bg-[#FF6B35] text-[#666666] rounded-[1.5rem]"
style={{ color: "#333333", backgroundColor: "#F8F3E9" }}
```

### ALWAYS Use Design Tokens

```tsx
// ✅ Always use this
className="bg-primary text-foreground rounded-sm"
style={{ color: 'hsl(var(--primary))' }}
```

### DO NOT Use Arbitrary Values

```tsx
// ❌ Never do this
className="p-[1.5rem] m-3 gap-[0.5rem] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
```

### ALWAYS Use Tailwind Scale

```tsx
// ✅ Always use this
className="p-6 m-3 gap-2 rounded-lg shadow-md"
```

---

## Quick Reference

### Color Classes to Use

- Primary actions: `bg-primary`, `text-primary`, `border-primary`, `hover:bg-primary/90`
- Text: `text-foreground`, `text-muted-foreground`
- Backgrounds: `bg-background`, `bg-card`, `bg-accent`, `bg-muted`
- Borders: `border-border`, `border-input`
- Success: `bg-success`, `text-success`
- Error: `bg-destructive`, `text-destructive`

### Border Radius to Use

- **Current standard**: `rounded-sm` (8px) - minimal rounded corners
- Use `rounded-md` for slightly more
- Use `rounded-lg` for moderate
- Use `rounded-xl` for more

### Shadow Classes to Use

- Standard: `shadow-md`
- Large: `shadow-lg`
- Brand: `shadow-primary`
- Small: `shadow-sm`

---

## How the Design System Works

1. **CSS Variables** are defined in `app/globals.css` in the `:root` block
2. **Theme Mapping** connects CSS variables to Tailwind classes in `@theme inline`
3. **TypeScript Types** provide type safety in `src/lib/design-system/types.ts`
4. **Helper Functions** provide programmatic access in `src/lib/design-system/tokens.ts`
5. **Public API** is exported from `src/lib/design-system/index.ts`

When you add a token:
1. Add to `:root` in `app/globals.css`
2. Add to dark mode section
3. Map in `@theme inline`
4. (Optional) Add TypeScript type
5. Use in components via Tailwind class

When you change a token:
1. Edit the value in `app/globals.css`
2. Restart dev server or rebuild

---
