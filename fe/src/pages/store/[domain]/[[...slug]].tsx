import NodeRenderer, {
  NodeRendererMode,
} from '@/components/storefront/NodeRenderer';
import {
  StorefrontNavPage,
  StorefrontPageContext,
} from '@/hooks/storefront/StorefrontRenderContext';
import StorefrontRenderProvider from '@/hooks/storefront/StorefrontRenderProvider';
import { readString } from '@/hooks/useUrlFilters';
import { ApiError } from '@/lib/api';
import {
  getPublicStorefrontNavPages,
  getPublicStorefrontPage,
} from '@/services/storefront';
import type { BrandPublicView } from '@/types/brand';
import type { PageLayout } from '@/types/page-layout';
import { ThemeSettings } from '@/types/theme-settings';
import { buildThemeStyle } from '@/utils/buildThemeStyle';
import flattenLayout, { type FlattenComponent } from '@/utils/flattenLayout';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useMemo } from 'react';

type StorefrontPageProps = {
  brand: BrandPublicView;
  themeSettings: ThemeSettings;
  layout: PageLayout;
  components: Record<string, FlattenComponent>;
  basePath: string;
  query: Record<string, string | string[] | undefined>;
  pageContext: StorefrontPageContext;
  navPages: StorefrontNavPage[];
};

type ClassifiedRoute = {
  /** Slug or layout identifier sent to getPublicStorefrontPage */
  targetPageSlug: string;
  /** Whether this slug must appear in navPages (false for dynamic catalog routes) */
  requiresNavMatch: boolean;
  pageContext: StorefrontPageContext;
};

function classifyStorefrontRoute(segments: string[]): ClassifiedRoute | null {
  // 1. Storefront Home: /store/[domain]
  if (segments.length === 0) {
    return {
      targetPageSlug: '',
      requiresNavMatch: false,
      pageContext: { kind: 'home' },
    };
  }

  const [head, second, ...rest] = segments;

  // 2. Collection routes: /store/[domain]/collections/[collectionSlug]
  if (head === 'collections') {
    if (!second || rest.length > 0) return null; // Reject /collections or /collections/a/b
    return {
      targetPageSlug: 'collections', // Tells backend to return the release's COLLECTION layout
      requiresNavMatch: false,
      pageContext: { kind: 'products_query' },
    };
  }

  // 3. Product routes: /store/[domain]/products or /store/[domain]/products/[productSlug]
  if (head === 'products') {
    if (rest.length > 0) return null;
    if (!second) {
      return {
        targetPageSlug: 'collections', // Uses the universal COLLECTION layout for /products?...
        requiresNavMatch: false,
        pageContext: { kind: 'products_query' },
      };
    }
    return {
      targetPageSlug: 'products', // Tells backend to return the release's PRODUCT layout
      requiresNavMatch: false,
      pageContext: { kind: 'product', productSlug: second },
    };
  }

  // 4. Custom CMS pages: /store/[domain]/about, /store/[domain]/contact, etc.
  const cmsSlug = segments.join('/');
  return {
    targetPageSlug: cmsSlug,
    requiresNavMatch: true,
    pageContext: { kind: 'custom' },
  };
}

export const getServerSideProps: GetServerSideProps<
  StorefrontPageProps
> = async ({ params, res, query }) => {
  const domain = readString(params?.domain);
  if (!domain) return { notFound: true };

  const segments = (
    Array.isArray(params?.slug) ? params.slug : [readString(params?.slug) ?? '']
  ).filter(Boolean);
  const route = classifyStorefrontRoute(segments);
  if (!route) return { notFound: true };

  const pageAbortController = new AbortController();
  try {
    // GET /storefronts/domain/:domain/pages/:slug
    // GET /storefronts/domain/:domain/pages
    const [data, navPages] = await Promise.all([
      getPublicStorefrontPage(
        domain,
        route.targetPageSlug,
        pageAbortController.signal,
      ),
      getPublicStorefrontNavPages(domain).then((navPages) => {
        if (route.requiresNavMatch) {
          const exists = navPages.some(
            (page) =>
              page.slug.replace(/^\/+|\/+$/g, '') === route.targetPageSlug,
          );
          if (!exists) {
            pageAbortController.abort();
          }
        }
        return navPages;
      }),
    ]);

    if (pageAbortController.signal.aborted) {
      return { notFound: true };
    }

    const flattened = flattenLayout(data.layout.root);
    const components = Object.fromEntries(flattened.map((c) => [c.id, c]));

    // Cache each storefront URL independently
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300',
    );

    return {
      props: {
        brand: data.brand,
        themeSettings: data.themeSettings,
        layout: data.layout,
        components,
        basePath: `/store/${encodeURIComponent(domain)}`,
        pageContext: route.pageContext,
        query: {
          ...query,
          ...(segments[0] === 'collections' && segments[1]
            ? { collection: segments[1] }
            : {}),
        },
        navPages,
      },
    };
  } catch (error) {
    if (
      pageAbortController.signal.aborted ||
      (error instanceof DOMException && error.name === 'AbortError') ||
      (error instanceof Error && error.name === 'AbortError') ||
      (error instanceof ApiError && error.status === 404)
    ) {
      return { notFound: true };
    }
    throw error;
  }
};

export default function CustomerStorefrontPage({
  brand,
  themeSettings,
  layout,
  components,
  basePath,
  query,
  pageContext,
  navPages,
}: Readonly<InferGetServerSidePropsType<typeof getServerSideProps>>) {
  const root = components[layout.root.id];
  const providerValue = useMemo(
    () => ({
      brand,
      layout,
      rootId: layout.root.id,
      components,
      basePath,
      query,
      pageContext,
      navPages,
    }),
    [brand, layout, components, basePath, query, pageContext, navPages],
  );

  const themeStyle = useMemo(
    () => buildThemeStyle(themeSettings),
    [themeSettings],
  );

  if (!root) return null;

  return (
    <StorefrontRenderProvider key={layout.id} value={providerValue}>
      <Head>
        <title>{`${layout.name} | ${brand.name}`}</title>
        {brand.faviconUrl && <link rel='icon' href={brand.faviconUrl} />}
      </Head>

      <main
        data-storefront-view
        style={themeStyle}
        className='min-h-screen w-full overflow-x-clip bg-white text-zinc-900'
      >
        <NodeRenderer component={root} mode={NodeRendererMode.Active} />
      </main>
    </StorefrontRenderProvider>
  );
}
