// Color tokens
export type ColorToken =
  | 'background' | 'foreground'
  | 'card' | 'card-foreground'
  | 'popover' | 'popover-foreground'
  | 'primary' | 'primary-foreground'
  | 'secondary' | 'secondary-foreground'
  | 'muted' | 'muted-foreground'
  | 'accent' | 'accent-foreground'
  | 'destructive' | 'destructive-foreground'
  | 'border' | 'input' | 'ring'
  | 'success' | 'success-foreground'
  | 'warning' | 'warning-foreground'
  | 'info' | 'info-foreground';

// Spacing tokens
export type SpacingToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

// Border radius tokens
export type RadiusToken = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

// Shadow tokens
export type ShadowToken = 'sm' | 'md' | 'lg' | 'xl' | 'primary';
