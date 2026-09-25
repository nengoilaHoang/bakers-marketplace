import {
	DimensionType,
	HorizontalAlignType,
	PaddingType,
	VerticalAlignType,
} from '@/types/layout-component';
import { CSSProperties } from 'react';
import { FlattenComponent } from './flattenLayout';

const DIMENSION_MAP: Record<'h' | 'w', Record<DimensionType, string>> = {
	w: { full: 'w-full', auto: 'w-auto', sm: 'w-1/4', md: 'w-1/2', lg: 'w-3/4' },
	h: { full: 'h-full', auto: 'h-auto', sm: 'h-1/4', md: 'h-1/2', lg: 'h-3/4' },
};

const getDimensionClass = (
	prefix: 'h' | 'w',
	value?: DimensionType,
): string | CSSProperties => {
	if (!value) return '';

	if (typeof value === 'number') {
		switch (prefix) {
			case 'h':
				return {
					width: `${value}px`,
				};
			case 'w':
				return {
					height: `${value}px`,
				};
			default:
				return '';
		}
	}

	return DIMENSION_MAP[prefix][value] ?? '';
};

const PADDING_MAP: Record<
	't' | 'l' | 'r' | 'b',
	Record<'none' | 'sm' | 'md' | 'lg', string>
> = {
	t: { none: 'pt-0', sm: 'pt-2', md: 'pt-4', lg: 'pt-8' },
	l: { none: 'pl-0', sm: 'pl-2', md: 'pl-4', lg: 'pl-8' },
	r: { none: 'pr-0', sm: 'pr-2', md: 'pr-4', lg: 'pr-8' },
	b: { none: 'pb-0', sm: 'pb-2', md: 'pb-4', lg: 'pb-8' },
};

function getPaddingClass(
	side: 't' | 'b' | 'l' | 'r',
	padding?: PaddingType,
): string | CSSProperties {
	if (padding === undefined) return '';

	if (typeof padding === 'number') {
		switch (side) {
			case 't':
				return {
					paddingTop: `${padding}px`,
				};
			case 'b':
				return {
					paddingBottom: `${padding}px`,
				};
			case 'l':
				return {
					paddingLeft: `${padding}px`,
				};
			case 'r':
				return {
					paddingRight: `${padding}px`,
				};
			default:
				return '';
		}
	}

	return PADDING_MAP[side][padding] ?? '';
}

function getAlignXClass(alignX?: HorizontalAlignType): string {
	switch (alignX) {
		case 'left':
			return 'justify-self-start';
		case 'center':
			return 'justify-self-center';
		case 'right':
			return 'justify-self-end';
		case 'stretch':
			return 'justify-self-stretch';
		default:
			return '';
	}
}

function getAlignYClass(alignY?: VerticalAlignType): string {
	switch (alignY) {
		case 'top':
			return 'self-start';
		case 'center':
			return 'self-center';
		case 'bottom':
			return 'self-end';
		case 'stretch':
			return 'self-stretch';
		default:
			return '';
	}
}

// TODO: function getColorSchemeClass

export function getBaseLayoutClassesAndStyles(
	config: FlattenComponent['config'],
): [string, CSSProperties] | null {
	if (!config) return null;

	let style: CSSProperties = {};
	const classes: (string | undefined)[] = [];

	const objects = [
		// Dimensions
		getDimensionClass('w', config.w),
		getDimensionClass('h', config.h),

		// Grid Spans
		config.wSpan ? `col-span-${config.wSpan}` : undefined,
		config.hSpan ? `row-span-${config.hSpan}` : undefined,

		// Alignments
		getAlignXClass(config.alignX),
		getAlignYClass(config.alignY),

		// Paddings
		config.padding && getPaddingClass('t', config.padding.top),
		config.padding && getPaddingClass('b', config.padding.bottom),
		config.padding && getPaddingClass('l', config.padding.left),
		config.padding && getPaddingClass('r', config.padding.right),
	];

	objects.forEach((element) => {
		if (typeof element === 'string') classes.push(element);
		else
			style = {
				...style,
				...element,
			};
	});

	return [classes.filter(Boolean).join(' ').trim(), style];
}
