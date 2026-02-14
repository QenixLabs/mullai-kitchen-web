# Mullai Kitchen - Design System

This document defines the design system and patterns used across the Mullai Kitchen frontend application. All UI components should follow these guidelines for consistency.

## Brand Colors

### Primary Brand Color
```
#FF6B35 - Primary Orange (Mullai Orange)
```

### Color Usage
| Element | Color | Tailwind Class |
|---------|-------|----------------|
| Primary actions | `#FF6B35` | `text-[#FF6B35]`, `bg-[#FF6B35]` |
| Primary hover | `#E85A25` | `hover:text-[#E85A25]`, `hover:bg-[#E85A25]` |
| Gradient start | `#FF6B35` | `from-[#FF6B35]` |
| Gradient end | `#FF8555` | `to-[#FF8555]` |
| Focus ring | `#FF6B35` at 20% opacity | `ring-[#FF6B35]/20` |

### Text Colors
| Element | Color | Tailwind Class |
|---------|-------|----------------|
| Primary text | `#111827` (gray-900) | `text-gray-900` |
| Secondary text | `#6B7280` (gray-500) | `text-gray-500` |
| Muted text | `#9CA3AF` (gray-400) | `text-gray-400` |
| Links | `#FF6B35` | `text-[#FF6B35]` |

### Background Colors
| Element | Color | Tailwind Class |
|---------|-------|----------------|
| Card backgrounds | White | `bg-white` |
| Input backgrounds | `#F9FAFB` (gray-50) | `bg-gray-50` |
| Page backgrounds | Gradient | `bg-gradient-to-br from-orange-50 via-amber-50 to-stone-100` |
| Muted backgrounds | `#F3F4F6` (gray-100) | `bg-gray-100` |

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

## Border Radius

Consistent border radius across all components:

| Element | Radius | Tailwind Class |
|---------|--------|----------------|
| Buttons | 0.75rem | `rounded-xl` |
| Inputs | 0.75rem | `rounded-xl` |
| Cards | 1.5rem | `rounded-2xl` |
| Large containers | 1.5rem | `rounded-3xl` |
| Badges/Pills | Full | `rounded-full` |
| Icon containers | 0.5rem | `rounded-lg` |

---

## Buttons

### Primary Button
```tsx
<Button
  className={cn(
    "h-11 rounded-xl font-semibold text-white shadow-md transition-all duration-300",
    "bg-gradient-to-r from-[#FF6B35] to-[#FF8555]",
    "hover:from-[#E85A25] hover:to-[#FF7545] hover:shadow-lg hover:shadow-orange-200/50",
    "active:scale-[0.98]",
    "disabled:opacity-70 disabled:cursor-not-allowed"
  )}
>
  Button Text
</Button>
```

### Secondary/Outline Button
```tsx
<Button
  variant="outline"
  className={cn(
    "h-11 rounded-xl font-medium transition-all duration-300",
    "border-2 border-gray-200 bg-white text-gray-600",
    "hover:border-[#FF6B35]/30 hover:bg-orange-50 hover:text-[#FF6B35]",
    "active:scale-[0.98]"
  )}
>
  Button Text
</Button>
```

### Button Properties
- **Height**: `h-11` (44px)
- **Padding**: Default or `px-8` for wider buttons
- **Transition**: `duration-300` for all states
- **Active state**: `scale-[0.98]` for press feedback

---

## Form Inputs

### Standard Input
```tsx
<Input
  className={cn(
    "h-11 rounded-xl border-gray-200 bg-gray-50 text-gray-900",
    "placeholder:text-gray-400",
    "focus:border-[#FF6B35] focus:bg-white focus:ring-[#FF6B35]/20"
  )}
  placeholder="Placeholder text"
/>
```

### Input Properties
- **Height**: `h-11` (44px)
- **Border**: `border-gray-200` (light gray)
- **Background**: `bg-gray-50` (very light gray)
- **Focus state**: Orange border, white background, subtle ring
- **Placeholder**: `text-gray-400`

### Form Labels
```tsx
<FormLabel className="text-sm font-medium text-gray-700">
  Label Text
</FormLabel>
```

---

## Cards

### Standard Card
```tsx
<article
  className={cn(
    "relative flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-500",
    "shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)]",
    "hover:shadow-[0_4px_20px_rgba(255,107,53,0.15),0_8px_40px_rgba(0,0,0,0.1)]"
  )}
>
  {/* Content */}
</article>
```

### Card Properties
- **Border radius**: `rounded-2xl` (1rem)
- **Shadow**: Subtle multi-layer shadow
- **Hover shadow**: Orange-tinted glow
- **Transition**: `duration-500`

---

## Links

### Standard Link
```tsx
<Link
  className="font-semibold text-[#FF6B35] hover:text-[#E85A25] transition-colors"
  href="/path"
>
  Link Text
</Link>
```

---

## Shadows

### Standard Shadow (Cards/Containers)
```css
shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)]
```

### Hover Shadow (with brand tint)
```css
hover:shadow-[0_4px_20px_rgba(255,107,53,0.15),0_8px_40px_rgba(0,0,0,0.1)]
```

### Button Shadow
```css
shadow-md
hover:shadow-lg hover:shadow-orange-200/50
```

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

## Icons

Use Lucide React icons throughout the application. Common icons:

```tsx
import {
  Check,
  Sparkles,
  Calendar,
  UtensilsCrossed,
  Flame,
  RefreshCw,
  Truck
} from "lucide-react";
```

### Icon Usage
- Standard size: `h-4 w-4` or `h-5 w-5`
- In buttons: `h-4 w-4`
- Feature icons: `h-5 w-5`
- Brand icons: `h-6 w-6`

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
- **Scale**: `hover:scale-110` for images
- **Active press**: `active:scale-[0.98]` for buttons
- **Shadow**: Add orange-tinted shadow on hover

---

## Responsive Design

### Breakpoints
| Breakpoint | Tailwind Prefix | Common Use |
|------------|-----------------|------------|
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
<Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
  <AlertTitle>Error Title</AlertTitle>
  <AlertDescription>Error description text.</AlertDescription>
</Alert>
```

### Success Alert
```tsx
<Alert className="border-green-200 bg-green-50 text-green-800">
  <AlertTitle>Success Title</AlertTitle>
  <AlertDescription>Success description text.</AlertDescription>
</Alert>
```

---

## Selection States

### Selected/Active Card
```tsx
className={cn(
  "ring-2 ring-[#FF6B35] ring-offset-2 ring-offset-white",
  "shadow-[0_4px_20px_rgba(255,107,53,0.2),0_8px_40px_rgba(0,0,0,0.1)]"
)}
```

### Selection Indicator
```tsx
<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF6B35] shadow-lg">
  <Check className="h-4 w-4 text-white" strokeWidth={3} />
</div>
```

---

## Decorative Elements

### Background Blurs
```tsx
<div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-[#FF6B35]/5 blur-3xl" />
<div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />
```

### Gradient Overlays
```tsx
// On images
<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

// Brand gradient background
<div className="bg-gradient-to-br from-[#FF6B35] via-[#FF7A45] to-[#FF8F65]" />
```

---

## Checklist for New Components

- [ ] Use brand color `#FF6B35` for primary actions
- [ ] Apply `rounded-xl` for buttons and inputs
- [ ] Apply `rounded-2xl` for cards
- [ ] Include hover states with color transitions
- [ ] Add subtle shadows with orange tint on hover
- [ ] Use consistent spacing (`space-y-5`, `gap-2.5`)
- [ ] Use Lucide icons, not emojis
- [ ] Apply `transition-all duration-300` for smooth animations
- [ ] Test responsive behavior with `sm:` and `lg:` prefixes
