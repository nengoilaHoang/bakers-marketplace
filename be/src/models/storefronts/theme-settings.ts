import { z } from 'zod';
import { TypographySchema } from './typography.model.js';
import { ColorPaletteSchema } from './color-palettes.model.js';

export const ThemeSettingsTableSchema = z.object({
	id: z.uuidv4().readonly(),
});

export const ThemeSettingsSchema = z.object({
	id: z.uuidv4().readonly(),
	typography: TypographySchema,
	colorPalette: ColorPaletteSchema,
});

export type ThemeSettingsRow = z.infer<typeof ThemeSettingsTableSchema>;
export type ThemeSettings = z.infer<typeof ThemeSettingsSchema>;
