import { CanvasIframe } from '@/components/storefront/canvas/CanvasIframe';
import NodeRenderer, {
  NodeRendererMode,
} from '@/components/storefront/NodeRenderer';
import StorefrontCanvasProvider from '@/hooks/storefront/StorefrontCanvasProvider';
import { StorefrontRenderContextValue } from '@/hooks/storefront/StorefrontRenderContext';
import StorefrontRenderProvider from '@/hooks/storefront/StorefrontRenderProvider';
import { BrandPublicView } from '@/types/brand';
import { StorefrontRelease } from '@/types/storefront';
import { buildThemeStyle } from '@/utils/buildThemeStyle';
import flattenLayout from '@/utils/flattenLayout';
import { useMemo, useRef } from 'react';

const DESKTOP_HEIGHT = 1280;

const StorefrontReleasePreview = ({
  currentRelease,
  brand,
  pageSlug,
}: {
  currentRelease: StorefrontRelease;
  brand: BrandPublicView;
  pageSlug: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pick the HOME layout from the currently selected release
  const homeLayout = useMemo(() => {
    if (!currentRelease.layouts.length) return null;
    return (
      currentRelease.layouts.find((l) => l.name === pageSlug) ??
      currentRelease.layouts.find((l) => l.type === 'HOME') ??
      currentRelease.layouts[0]
    );
  }, [currentRelease, pageSlug]);

  const components = useMemo(() => {
    if (!homeLayout) return null;
    const flattened = flattenLayout(homeLayout.root);
    return Object.fromEntries(flattened.map((c) => [c.id, c]));
  }, [homeLayout]);

  const root = homeLayout && components ? components[homeLayout.root.id] : null;

  const renderValue: StorefrontRenderContextValue | null = useMemo(() => {
    if (!brand || !homeLayout || !components) return null;
    return {
      brand,
      layout: homeLayout,
      basePath: `/store/${encodeURIComponent(brand.domain)}`,
      rootId: homeLayout.root.id,
      components,
    };
  }, [brand, components, homeLayout]);

  const themeStyle = useMemo(
    () => buildThemeStyle(currentRelease.themeSettings),
    [currentRelease.themeSettings],
  );

  if (!renderValue || !root) return null;

  return (
    <div
      ref={containerRef}
      style={{
        maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
      }}
      className='relative w-full overflow-hidden rounded-lg border border-zinc-200 bg-white select-none'
    >
      <div
        style={{
          maxHeight: `${DESKTOP_HEIGHT}px`,
          transform: `scale(${1})`,
          transformOrigin: 'top left',
        }}
        className='pointer-events-none overflow-hidden'
      >
        <StorefrontCanvasProvider
          initialBreakpoint='desktop'
          initialZoom={1}
          initialIsPreview={true}
        >
          <StorefrontRenderProvider value={renderValue}>
            <CanvasIframe className='h-full w-full border-0'>
              {() => (
                <div style={themeStyle} className='min-h-full w-full bg-white'>
                  <NodeRenderer
                    component={root}
                    mode={NodeRendererMode.Active}
                  />
                </div>
              )}
            </CanvasIframe>
          </StorefrontRenderProvider>
        </StorefrontCanvasProvider>
      </div>
    </div>
  );
};

export default StorefrontReleasePreview;
