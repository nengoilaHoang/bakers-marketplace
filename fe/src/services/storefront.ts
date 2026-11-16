import { StorefrontNavPage } from '@/hooks/storefront/StorefrontRenderContext';
import request from '@/lib/api';
import { BrandPublicView } from '@/types/brand';
import { LayoutComponent } from '@/types/layout-component';
import { PageLayout } from '@/types/page-layout';
import { Storefront, StorefrontRelease } from '@/types/storefront';
import { ThemeSettings } from '@/types/theme-settings';
import { BatchLayoutComponentPayload } from '@/utils/pageLayoutMutation';

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

export async function saveLayoutComponentsBatch(
  payload: BatchLayoutComponentPayload,
): Promise<void> {
  await request<void>('/layout-components/batch', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export type PublicStorefrontPageResponse = {
  brand: BrandPublicView;
  themeSettings: ThemeSettings;
  layout: PageLayout;
  routeParams?: Record<string, string>;
  navPages?: StorefrontNavPage[];
};

export async function getPublicStorefrontPage(
  domain: string,
  slug?: string,
  abortSignal?: AbortSignal,
): Promise<PublicStorefrontPageResponse> {
  const { data } = await request<{ data: PublicStorefrontPageResponse }>(
    `/storefronts/domain/${encodeURIComponent(domain)}/page`,
    { signal: abortSignal },
    slug ? { slug } : undefined,
  );

  if (data.layout?.root) {
    normalizeComponent(data.layout.root);
  }
  return data;
}
