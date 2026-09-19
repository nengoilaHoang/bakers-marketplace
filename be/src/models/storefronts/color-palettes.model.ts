import { z } from 'zod';
import { HexColorSchema } from '../layout-components/base-layout-components.model.js';

export const ColorPaletteTableSchema = z.object({
	id: z.uuidv4().readonly(),
	colorBackground: HexColorSchema,
	colorSurface: HexColorSchema,
	colorBorder: HexColorSchema,
	colorTextPrimary: HexColorSchema,
	colorTextSecondary: HexColorSchema,
	colorPrimary: HexColorSchema,
	colorPrimaryForeground: HexColorSchema,
	colorSecondary: HexColorSchema,
	colorSecondaryForeground: HexColorSchema,
	colorAccent: HexColorSchema,
	colorAccentForeground: HexColorSchema,
});

export const ColorPaletteSchema = ColorPaletteTableSchema;

export type ColorPaletteRow = z.infer<typeof ColorPaletteTableSchema>;
export type ColorPalette = z.infer<typeof ColorPaletteSchema>;
