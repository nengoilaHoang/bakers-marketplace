import { z } from 'zod';
import { ColorSchema } from '../layout-components/base-layout-components.model.js';

export const ColorPaletteTableSchema = z.object({
	id: z.uuidv4().readonly(),
	colorBackground: ColorSchema,
	colorSurface: ColorSchema,
	colorBorder: ColorSchema,
	colorTextPrimary: ColorSchema,
	colorTextSecondary: ColorSchema,
	colorPrimary: ColorSchema,
	colorPrimaryForeground: ColorSchema,
	colorSecondary: ColorSchema,
	colorSecondaryForeground: ColorSchema,
	colorAccent: ColorSchema,
	colorAccentForeground: ColorSchema,
});

export const ColorPaletteSchema = ColorPaletteTableSchema;

export type ColorPaletteRow = z.infer<typeof ColorPaletteTableSchema>;
export type ColorPalette = z.infer<typeof ColorPaletteSchema>;
