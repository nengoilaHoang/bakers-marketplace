import { z } from 'zod';

export const HexColorSchema = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);
export const ColorSchema = z.union([z.string(), HexColorSchema]);
const TextAlignmentTypeSchema = z.enum(['left', 'center', 'right', 'justify']);
export const TextStyle = z.object({
  textAlign: TextAlignmentTypeSchema.default('left'),
  decoration: z.enum(['strikethrough', 'underline']),
  txtColor: ColorSchema,
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

export const SurfaceThemeSchema = z.enum([
  'default',
  'surface',
  'primary',
  'secondary',
  'accent',
]);

export type SurfaceTheme = z.infer<typeof SurfaceThemeSchema>;

export const BentoCellConfig = z.object({
  colSpan: z.uint32().min(1).max(50),
  rowSpan: z.uint32().min(1).max(50),
});

export const SlotPlacementConfigSchema = z.object({
  h: DimensionTypeSchema,
  w: DimensionTypeSchema,
  alignSelfX: HorizontalAlignTypeSchema.default('left'),
  alignSelfY: VerticalAlignTypeSchema.default('top'),
  ...BentoCellConfig.partial().shape,
});

export const BoxStyleConfigSchema = z.object({
  padding: z
    .object({
      top: PaddingTypeSchema.default('none'),
      bottom: PaddingTypeSchema.default('none'),
      left: PaddingTypeSchema.default('none'),
      right: PaddingTypeSchema.default('none'),
    })
    .default({
      top: 'none',
      bottom: 'none',
      left: 'none',
      right: 'none',
    }),
  surfaceTheme: SurfaceThemeSchema.default('default'),
});

export const BaseLayoutComponentConfigSchema = SlotPlacementConfigSchema;

export type SlotPlacementConfig = z.infer<typeof SlotPlacementConfigSchema>;
export type BoxStyleConfig = z.infer<typeof BoxStyleConfigSchema>;
export type BaseLayoutComponentConfig = z.infer<
  typeof BaseLayoutComponentConfigSchema
>;

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
