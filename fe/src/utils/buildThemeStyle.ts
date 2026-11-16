import type { ThemeSettings } from '@/types/theme-settings';
import type { CSSProperties } from 'react';

export function buildThemeStyle(
  themeSettings?: ThemeSettings | null,
): CSSProperties {
  if (!themeSettings) return {};
  const { colorPalette, typography } = themeSettings;

  return {
    '--color-background': colorPalette.colorBackground,
    '--color-surface': colorPalette.colorSurface,
    '--color-border': colorPalette.colorBorder,
    '--color-text-primary': colorPalette.colorTextPrimary,
    '--color-text-secondary': colorPalette.colorTextSecondary,
    '--color-primary': colorPalette.colorPrimary,
    '--color-primary-foreground': colorPalette.colorPrimaryForeground,
    '--color-secondary': colorPalette.colorSecondary,
    '--color-secondary-foreground': colorPalette.colorSecondaryForeground,
    '--color-accent': colorPalette.colorAccent,
    '--color-accent-foreground': colorPalette.colorAccentForeground,
    '--font-heading': typography.headingFont,
    '--font-body': typography.bodyFont,
    '--font-heading-weight': typography.headingWeight,
    '--font-body-weight': typography.bodyWeight,
    '--font-heading-line-height': typography.headingLineHeight,
    '--font-body-line-height': typography.bodyLineHeight,
    '--font-heading-letter-spacing': `${typography.headingLetterSpacing}em`,
    '--font-body-letter-spacing': `${typography.bodyLetterSpacing}em`,
    fontFamily: typography.bodyFont,
    fontWeight: typography.bodyWeight,
    lineHeight: typography.bodyLineHeight,
    letterSpacing: `${typography.bodyLetterSpacing}em`,
  } as CSSProperties;
}
