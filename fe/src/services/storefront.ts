import request from '@/lib/api';
import { LayoutComponent } from '@/types/layout-component';
import { PageLayout } from '@/types/page-layout';
import { Storefront, StorefrontRelease } from '@/types/storefront';

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
          (child) =>
            typeof child === 'object' &&
            child !== null &&
            normalizeComponent(child),
        )
      ) {
        component.children = component.children.map(
          (child) => child as LayoutComponent,
        );
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

export async function getMyStorefront(abortSignal?: AbortSignal) {
  const { data: storefront } = await request<{ data: Storefront | null }>(
    '/storefronts/mine',
    {
      signal: abortSignal,
    },
  );
  return storefront;
}

export async function getStorefrontActiveRelease(
  storeId: string,
  abortSignal?: AbortSignal,
): Promise<StorefrontRelease> {
  const { data: release } = await request<{ data: StorefrontRelease }>(
    `/storefronts/${storeId}/releases/active`,
    { signal: abortSignal },
  );

  release.layouts?.forEach((layout) => normalizeComponent(layout.root));
  return release;
}

export async function getStorefrontRelease(
  releaseId: string,
  abortSignal?: AbortSignal,
): Promise<StorefrontRelease> {
  const { data: release } = await request<{ data: StorefrontRelease }>(
    `/storefronts/releases/${releaseId}`,
    { signal: abortSignal },
  );

  release.layouts?.forEach((layout) => normalizeComponent(layout.root));
  return release;
}

export async function getStorefrontReleaseLayouts(
  releaseId: string,
  abortSignal?: AbortSignal,
) {
  const { data: layouts } = await request<{ data: PageLayout[] }>(
    `/storefronts/releases/${releaseId}/layouts`,
    { signal: abortSignal },
  );

  layouts.forEach((layout) => normalizeComponent(layout.root));
  return layouts;
}
