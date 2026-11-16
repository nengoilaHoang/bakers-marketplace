import NodeRenderer, {
  NodeRendererMode,
} from '@/components/storefront/NodeRenderer';
import { StorefrontNavPage } from '@/hooks/storefront/StorefrontRenderContext';
import StorefrontRenderProvider from '@/hooks/storefront/StorefrontRenderProvider';
import { readString } from '@/hooks/useUrlFilters';
import { ApiError } from '@/lib/api';
import { getPublicStorefrontPage } from '@/services/storefront';
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
  routeParams: Record<string, string>;
  navPages: StorefrontNavPage[];
};

export const getServerSideProps: GetServerSideProps<
  StorefrontPageProps
> = async ({ params, res }) => {
  const domain = readString(params?.domain);
  const slugSegments = Array.isArray(params?.slug) ? params.slug : [];

  if (!domain) return { notFound: true };

  const slugPath = slugSegments.join('/');

  try {
    // GET /storefronts/domain/:domain/page?slug=:slugPath
    const data = await getPublicStorefrontPage(domain, slugPath);

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
        routeParams: data.routeParams ?? {},
        navPages: data.navPages ?? [],
      },
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
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
  routeParams,
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
      routeParams,
      navPages,
    }),
    [brand, layout, components, basePath, routeParams, navPages],
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
