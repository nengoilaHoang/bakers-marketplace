import { z } from 'zod';

export const HexColorSchema = z
	.string()
	.regex(/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
const TextAlignmentTypeSchema = z.enum(['left', 'center', 'right', 'justify']);
export const TextStyle = z.object({
	textAlign: TextAlignmentTypeSchema.default('left'),
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

const DimensionTypeSchema = z.union([
	z.enum(['auto', 'sm,', 'md', 'lg', 'full']),
	z.uint32(),
]);
const PaddingTypeSchema = z.union([
	z.enum(['none', 'sm', 'md', 'lg']),
	z.uint32(),
]);
const HorizontalAlignTypeSchema = z.enum([
	'left',
	'center',
	'right',
	'stretch',
]);
const VerticalAlignTypeSchema = z.enum(['top', 'center', 'bottom', 'stretch']);

const DYNAMIC_PLACEHOLDER_REGEX = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
const TOKEN_ALLOWLIST_REGEX = /^[a-zA-Z0-9]+(\.[a-zA-Z0-0]+)*$/;
const CONTAINS_URL_REGEX =
	/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
const FORBIDDEN_WORDS = new Set(['__proto__', 'constructor', 'prototype']);

export const InterpolatedStringSchema = z
	.string()
	.min(1)
	.max(500)
	.superRefine((value, ctx) => {
		if (CONTAINS_URL_REGEX.test(value)) {
			ctx.addIssue({
				code: 'custom',
				message: 'Interpolated strings cannot contain any URls.',
			});
		}

		const matches = Array.from(value.matchAll(DYNAMIC_PLACEHOLDER_REGEX));
		if (matches) {
			for (const match of matches) {
				const extracted = match[1]; // take group 1
				if (!TOKEN_ALLOWLIST_REGEX.test(extracted)) {
					ctx.addIssue({
						code: 'custom',
						message:
							'Interpolated strings can only contain alphanumeric characters and dots.',
					});
				}

				if ([...FORBIDDEN_WORDS].some((word) => extracted.includes(word))) {
					ctx.addIssue({
						code: 'custom',
						message: `Interpolated strings cannot contain the word '${extracted}'.`,
					});
				}
			}
		}
	});

export const ComponentTypeSchema = z.enum([
	'COMPOSITE',
	'LEAF',
	'REPEATER',
	'COMMERCE',
]);
export type ComponentType = z.infer<typeof ComponentTypeSchema>;

const ColorSchemeTypeSchema = z.enum(['default', 'inverted', 'accent']);
const ColorPaletteSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('palette'),
		token: z.enum(['background', 'surface', 'primary', 'secondary', 'accent']),
	}),
	z.object({
		type: z.literal('custom'),
		bgColor: HexColorSchema,
		txtColor: HexColorSchema,
	}),
]);

export const BentoCellConfig = z.object({
	wSpan: z.uint32().min(1).max(50),
	hSpan: z.uint32().min(1).max(50),
});

export const BaseLayoutComponentConfigSchema = z.object({
	h: DimensionTypeSchema,
	w: DimensionTypeSchema,
	alignX: HorizontalAlignTypeSchema.default('left'),
	alignY: VerticalAlignTypeSchema.default('top'),
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

type config = z.infer<typeof BaseLayoutComponentConfigSchema>

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
