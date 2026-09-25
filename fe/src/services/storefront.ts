import request from '@/lib/api';
import { LayoutComponent } from '@/types/layout-component';
import { StorefrontRelease } from '@/types/storefront';

const normalizeComponent = (value: unknown): value is LayoutComponent => {
	if (typeof value !== 'object' || value === null || Array.isArray(value))
		return false;
	const component = value as Record<string, unknown>;
	if (typeof component.id !== 'string') return false;
	if (typeof component.name !== 'string') return false;
	if (typeof component.type !== 'string') return false;
	if (typeof component.componentType !== 'string') return false;
	if (
		typeof component.config !== 'object' ||
		(component.config === null && Array.isArray(component.config))
	)
		return false;

	switch (component.type) {
		case 'COMPOSITE': {
			if (
				Array.isArray(component.children) &&
				component.children.every(
					([bp, map]) =>
						typeof bp === 'string' &&
						Array.isArray(map) &&
						map.length === 2 &&
						typeof map[0] === 'number' &&
						normalizeComponent(map[1]),
				)
			) {
				component.children = new Map(component.children);
			} else return false;
			break;
		}
		case 'REPEATER': {
			return normalizeComponent(component.itemTemplate);
		}
		case 'LEAF':
		case 'COMMERCE': {
			return true;
		}
		default: {
			return false;
		}
	}
	return true;
};

export async function getStorefrontActiveRelease(
	storeId: string,
	abortSignal?: AbortSignal,
): Promise<StorefrontRelease> {
	const { data: release } = await request<{ data: StorefrontRelease }>(
		`/storefronts/${storeId}/releases/active`,
		{ signal: abortSignal },
	);

	release.layouts.forEach((layout) => normalizeComponent(layout.root));
	return release;
}

export async function getStorefrontRelease(
	storeId: string,
	releaseId: string,
	abortSignal?: AbortSignal,
): Promise<StorefrontRelease> {
	const { data: release } = await request<{ data: StorefrontRelease }>(
		`/storefronts/${storeId}/releases/${releaseId}`,
		{ signal: abortSignal },
	);

	release.layouts.forEach((layout) => normalizeComponent(layout.root));
	return release;
}
