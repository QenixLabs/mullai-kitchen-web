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

