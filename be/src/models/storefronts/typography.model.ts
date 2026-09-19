import { z } from 'zod';

export const SystemFontTypeSchema = z.enum([
	// Sans-Serif
	'Arial',
	'Helvetica',
	'Verdana',
	'Trebuchet MS',
	'Tahoma',
	'Segoe UI',
	'Calibri',
	'Candara',
	'Corbel',
	'Lucida Sans',
	'Lucida Grande',
	'Gill Sans',
	'Futura',
	'Century Gothic',
	'Optima',
	'Geneva',
	'Franklin Gothic Medium',
	'Impact',
	'Arial Black',

	// Serif
	'Times New Roman',
	'Times',
	'Georgia',
	'Garamond',
	'Cambria',
	'Baskerville',
	'Palatino',
	'Palatino Linotype',
	'Book Antiqua',
	'Didot',
	'Bodoni MT',
	'Constantia',
	'Big Caslon',

	// Monospace
	'Courier New',
	'Courier',
	'Lucida Console',
	'Monaco',
	'Consolas',
	'Menlo',
	'Andale Mono',

	// Display / Cursive / Fantasy
	'Comic Sans MS',
	'Brush Script MT',
	'Copperplate',
	'Papyrus',
]);

export const GoogleFontTypeSchema = z.enum([
	// Clean UI & Tech Sans-Serif
	'Inter',
	'Geist',
	'Plus Jakarta Sans',
	'Manrope',
	'Figtree',
	'DM Sans',
	'Roboto',
	'Open Sans',
	'Outfit',
	'Lexend',

	// Geometric, Heading & Neo-Grotesque
	'Montserrat',
	'Poppins',
	'Space Grotesk',
	'Bricolage Grotesque',
	'Syne',
	'Epilogue',
	'Cabinet Grotesk',
	'Albert Sans',

	// Modern Editorial & Display Serifs
	'Instrument Serif',
	'Playfair Display',
	'DM Serif Display',
	'Fraunces',
	'Merriweather',
	'Newsreader',
	'Bodoni Moda',
	'Lora',

	// Developer & Monospaced
	'JetBrains Mono',
	'Fira Code',
	'Geist Mono',
	'Space Mono',
	'IBM Plex Mono',
	'Source Code Pro',
]);

export const FontTypeSchema = z.union([
	SystemFontTypeSchema,
	GoogleFontTypeSchema,
]);

export const TypographyTableSchema = z.object({
	id: z.uuidv4().readonly(),
	headingFont: FontTypeSchema,
	bodyFont: FontTypeSchema,
	headingWeight: z.int32().min(100).max(900),
	bodyWeight: z.int32().min(100).max(900),
	headingLineHeight: z.float32(),
	bodyLineHeight: z.float32(),
	headingLetterSpacing: z.float32(),
	bodyLetterSpacing: z.float32(),
});

export const TypographySchema = TypographyTableSchema;

export type TypographyRow = z.infer<typeof TypographyTableSchema>;
export type Typography = z.infer<typeof TypographySchema>;
