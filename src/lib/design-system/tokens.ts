import type { ColorToken, SpacingToken, RadiusToken, ShadowToken } from './types';

// Color access helpers
export const getColorToken = (token: ColorToken) => `hsl(var(--${token}))`;
export const getColorTokenValue = (token: ColorToken, opacity?: number) => {
  const base = getColorToken(token);
  return opacity ? `${base} / ${opacity}` : base;
};

// Spacing access helpers
export const getSpacingToken = (token: SpacingToken) => `var(--spacing-${token})`;

// Border radius access helpers
export const getRadiusToken = (token: RadiusToken) => `var(--radius-${token})`;

// Shadow access helpers
export const getShadowToken = (token: ShadowToken) => `var(--shadow-${token})`;

// Brand color constants (hex for reference)
export const BRAND_COLORS = {
  primary: '#39070F',
  primaryDark: '#230509',
  primaryLight: '#4F0D1A',
  primaryHover: '#2D0610',
  primaryHoverLight: '#3D0815',
} as const;
