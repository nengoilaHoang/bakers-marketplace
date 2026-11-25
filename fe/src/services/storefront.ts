import { StorefrontNavPage } from '@/hooks/storefront/StorefrontRenderContext';
import request from '@/lib/api';
import { BrandPublicView } from '@/types/brand';
import { LayoutComponent } from '@/types/layout-component';
import { CreateCompositeComponent } from '@/types/layout-component/composite-component';
import {
	PageLayout,
	PageLayoutSummary,
	PageLayoutType,
} from '@/types/page-layout';
import { Storefront, StorefrontRelease } from '@/types/storefront';
import {
	ColorPalette,
	ThemeSettings,
	Typography,
} from '@/types/theme-settings';
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

export async function getStorefrontReleasePages(
  releaseId: string,
  abortSignal?: AbortSignal,
) {
  const { data: layouts } = await request<{ data: PageLayout[] }>(
    `/storefronts/releases/${releaseId}/pages`,
    { signal: abortSignal },
  );

  layouts.forEach((layout) => normalizeComponent(layout.root));
  return layouts;
}

export async function getStorefrontReleaseSummaryPages(
  releaseId: string,
  abortSignal?: AbortSignal,
): Promise<PageLayoutSummary[]> {
  const { data } = await request<{ data: PageLayoutSummary[] }>(
    `/storefronts/releases/${releaseId}/pages/summary`,
    { signal: abortSignal },
  );
  return data;
}

export type CreatePagePayload = {
  name: string;
  slug: string;
  type: PageLayoutType;
  root?: CreateCompositeComponent | null;
};

export async function createStorefrontReleasePage(
  releaseId: string,
  payload: CreatePagePayload,
): Promise<PageLayout> {
  const { data } = await request<{ data: PageLayout }>(
    `/storefronts/releases/${releaseId}/pages`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
  if (data?.root) {
    normalizeComponent(data.root);
  }
  return data;
}

function buildLayoutBatchFormData(
  payload: BatchLayoutComponentPayload,
): FormData {
  const formData = new FormData();

  const extractBlobs = (value: unknown, path: string): unknown => {
    if (value instanceof Blob) {
      const ext = value.type.split('/')[1] || 'bin';
      const filename = value instanceof File ? value.name : `${path}.${ext}`;
      formData.append(path, value, filename);
      return undefined; // so that qs doesn't merge the filename and File into an array
    }

    if (Array.isArray(value)) {
      return value.map((item, idx) => extractBlobs(item, `${path}.${idx}`));
    }

    if (value !== null && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [
          k,
          extractBlobs(v, path ? `${path}.${k}` : k),
        ]),
      );
    }

    return value;
  };

  const serializedComponents = extractBlobs(payload.components, 'components');
  formData.append('components', JSON.stringify(serializedComponents));
  if (payload.deleteIds.length > 0) {
    formData.append('deleteIds', JSON.stringify(payload.deleteIds));
  }

  return formData;
}

export async function saveLayoutComponentsBatch(
  payload: BatchLayoutComponentPayload,
): Promise<void> {
  const formData = buildLayoutBatchFormData(payload);
  await request<void>('/layout-components/batch', {
    method: 'PUT',
    body: formData,
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
  const targetSlug = slug?.replace(/^\/+|\/+$/g, '') || 'home';
  const { data } = await request<{ data: PublicStorefrontPageResponse }>(
    `/storefronts/domain/${encodeURIComponent(domain)}/pages/${encodeURIComponent(targetSlug)}`,
    { signal: abortSignal },
  );

  if (data.layout?.root) {
    normalizeComponent(data.layout.root);
  }
  return data;
}

export async function getPublicStorefrontNavPages(
  domain: string,
  abortSignal?: AbortSignal,
): Promise<StorefrontNavPage[]> {
  const { data } = await request<{ data: StorefrontNavPage[] }>(
    `/storefronts/domain/${encodeURIComponent(domain)}/pages`,
    { signal: abortSignal },
  );
  return data;
}

export type UpdateThemeSettingsPayload = {
  typography?: Partial<Omit<Typography, 'id'>>;
  colorPalette?: Partial<Omit<ColorPalette, 'id'>>;
};

export async function updateReleaseThemeSettings(
  releaseId: string,
  payload: UpdateThemeSettingsPayload,
): Promise<ThemeSettings> {
  const { data } = await request<{ data: ThemeSettings }>(
    `/storefronts/releases/${releaseId}/theme-settings`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
  return data;
}
