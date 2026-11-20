import { z } from 'zod';
import {
	ColorPaletteSchema,
	ColorPaletteTableSchema,
} from './color-palettes.model.js';
import { TypographySchema, TypographyTableSchema } from './typography.model.js';

export const ThemeSettingsTableSchema = z.object({
  id: z.uuidv4().readonly(),
});

export const ThemeSettingsSchema = z.object({
  id: z.uuidv4().readonly(),
  typography: TypographySchema,
  colorPalette: ColorPaletteSchema,
});

export const UpdateThemeSettingsSchema = z.object({
  typography: TypographyTableSchema.omit({ id: true }).partial().optional(),
  colorPalette: ColorPaletteTableSchema.omit({ id: true }).partial().optional(),
});

export type ThemeSettingsRow = z.infer<typeof ThemeSettingsTableSchema>;
export type ThemeSettings = z.infer<typeof ThemeSettingsSchema>;
export type UpdateThemeSettings = z.infer<typeof UpdateThemeSettingsSchema>;
