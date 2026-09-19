import { z } from 'zod';

export const HexColorSchema = z
	.string()
	.regex(/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);

export const TextStyle = z.object({
	decoration: z.enum(['strikethrough', 'underline']),
	txtColor: HexColorSchema,
	fontWeight: z
		.union([
			z.enum(['bold', 'semi-bold', 'extra-bold']),
			z.int32().min(100).max(900),
		])
		.default(300),
	fontStyle: z.enum(['normal', 'italic', 'oblique']),
});

const DYNAMIC_PLACEHOLDER_REGEX = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
const TOKEN_ALLOWLIST_REGEX = /^[a-zA-Z0-9]+(\.[a-zA-Z0-0]+)*$/;
const URL_REGEX =
	/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
const FORBIDDEN_WORDS = ['__proto__', 'constructor', 'prototype'];

export const InterpolatedStringSchema = z
	.string()
	.min(1)
	.max(500)
	.superRefine((value, ctx) => {
		/* logic */
	});

export const ComponentTypeSchema = z.enum([
	'COMPOSITE',
	'LEAF',
	'REPEATER',
	'COMMERCE',
]);
export type ComponentType = z.infer<typeof ComponentTypeSchema>;

const AlignmentTypeSchema = z.enum(['left', 'center', 'right', 'justify']);
const DimensionTypeSchema = z.union([
	z.enum(['auto', 'sm,', 'md', 'lg', 'full']),
	z.uint32(),
]);
const PaddingTypeSchema = z.union([
	z.enum(['none', 'sm', 'md', 'lg']),
	z.uint32(),
]);
const ColorSchemeTypeSchema = z.enum(['default', 'inverted', 'accent']);
const ColorPaletteSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('palette'),
		token: z.enum(['background', 'surface', 'primary', 'secondary', 'accent']),
	}),
	z.object({
		type: z.literal('custom'),
		bgColor: HexColorSchema,
		TextStyle: TextStyle,
	}),
]);

export const BentoCellConfig = z.object({
	wSpan: z.uint32().min(1).max(50),
	hSpan: z.uint32().min(1).max(50),
});

export const BaseLayoutComponentConfigSchema = z.object({
	h: DimensionTypeSchema,
	w: DimensionTypeSchema,
	alignment: AlignmentTypeSchema,
	padding: z.object({
		top: PaddingTypeSchema.default('none'),
		bottom: PaddingTypeSchema.default('none'),
		left: PaddingTypeSchema.default('none'),
		right: PaddingTypeSchema.default('none'),
	}),
	colorScheme: ColorSchemeTypeSchema.default('default'),
	colorPalette: ColorPaletteSchema.default({
		type: 'palette',
		token: 'background',
	}),
	...BentoCellConfig.partial().shape,
});

export const BaseLayoutComponentSchema = z.object({
	id: z.uuidv4().readonly(),
	name: z.string().min(1).max(255),
	description: z.string().nullable(),
	type: ComponentTypeSchema.readonly(),
	config: BaseLayoutComponentConfigSchema.readonly(),
});

export type BaseLayoutComponent = z.infer<typeof BaseLayoutComponentSchema>;

export const UpdateBaseLayoutComponentSchema = BaseLayoutComponentSchema.extend(
	{
		id: z.uuidv4().optional(),
		name: z.string().min(1).max(255).optional(),
		description: z.string().nullable().optional(),
	},
);

export const CreateBaseLayoutComponentSchema = BaseLayoutComponentSchema.extend(
	{
		id: z.uuidv4().optional(),
		name: z.string().min(1).max(255).optional(),
		description: z.string().nullable().optional(),
	},
);
