// components/storefront/ComponentLibrary.tsx
import {
  HeroBannerCommerceComponent,
  ProductCardCommerceComponent,
} from '@/types/layout-component/commerce-component';
import { RichTextLeafComponent } from '@/types/layout-component/leaf-component';
import {
  FlattenComponent,
  FlattenCompositeComponent,
  FlattenRepeaterComponent,
} from '@/utils/flattenLayout';
import Icon from '../ui/Icon';
import NodeRenderer, { NodeRendererMode } from './NodeRenderer';

type ComponentLibraryProps = {
  isOpen: boolean;
  toggleConfig: () => void;
};

type ComponentPreviewMeta = {
  category: string;
  description: string;
  previewHeightClass?: string;
};

const HERO_PLACEHOLDER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" fill="none">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="800" y2="450" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#78350F"/>
        <stop offset="50%" stop-color="#92400E"/>
        <stop offset="100%" stop-color="#451A03"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.5" cy="0.4" r="0.6">
        <stop offset="0%" stop-color="#FDE68A" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#FDE68A" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="800" height="450" fill="url(#bg)"/>
    <rect width="800" height="450" fill="url(#glow)"/>
    <circle cx="140" cy="90" r="120" fill="#F59E0B" fill-opacity="0.12"/>
    <circle cx="680" cy="370" r="150" fill="#FBBF24" fill-opacity="0.1"/>
  </svg>`,
)}`;

// 1. COMPOSITE: GRID
export const DEFAULT_GRID_PREVIEW: FlattenCompositeComponent = {
  id: 'preview-grid',
  name: 'Grid Layout',
  type: 'COMPOSITE',
  componentType: 'GRID',
  children: [],
  slots: {
    desktop: {},
    tablet: {},
    mobile: {},
  },
  config: {
    w: 'full',
    alignSelfX: 'stretch',
    alignSelfY: 'stretch',
    padding: { top: 'none', bottom: 'none', left: 'none', right: 'none' },
    surfaceTheme: 'default',
    layout: 'UNIFORM',
    cols: { desktop: 2, tablet: 2, mobile: 1 },
    rows: { desktop: 1, tablet: 1, mobile: 2 },
    gap: { desktop: 12, tablet: 10, mobile: 8 },
    borderRadius: 8,
    densePacking: false,
    rowHeight: {
      desktop: { mode: 'auto', minHeightPx: 96 },
      tablet: { mode: 'auto', minHeightPx: 96 },
      mobile: { mode: 'auto', minHeightPx: 88 },
    },
  },
};

// 2. COMMERCE: HERO_BANNER
export const DEFAULT_HERO_BANNER_PREVIEW: HeroBannerCommerceComponent = {
  id: 'preview-hero-banner',
  name: 'Hero Banner',
  type: 'COMMERCE',
  componentType: 'HERO_BANNER',
  config: {
    w: 'full',
    alignSelfX: 'stretch',
    alignSelfY: 'stretch',
    padding: { top: 'none', bottom: 'none', left: 'none', right: 'none' },
    surfaceTheme: 'default',
    mediaType: 'image',
    desktopMediaUrl: HERO_PLACEHOLDER_SVG,
    mobileMediaUrl: null,
    altText: 'Artisan Breads & Pastries',
    aspect: { desktop: '16:9', tablet: '16:9', mobile: '4:3' },
    fit: 'cover',
    focalPoint: { x: 0.5, y: 0.5 },
    overlay: { type: 'gradient', color: '#18181B', opacity: 55 },
    contentPosition: {
      desktop: 'middle-center',
      tablet: 'middle-center',
      mobile: 'middle-center',
    },
    contentSize: 'compact',
    eyebrow: {
      value: 'HANDCRAFTED DAILY',
      textColor: '#FDE68A',
      textAlign: 'center',
      fontWeight: 'semi-bold',
      fontStyle: 'normal',
      decoration: 'none',
    },
    title: {
      value: 'Artisan Bakery',
      textColor: '#FFFFFF',
      textAlign: 'center',
      fontWeight: 'bold',
      fontStyle: 'normal',
      decoration: 'none',
    },
    subtitle: {
      value:
        'Freshly baked sourdough and pastries made with local ingredients.',
      textColor: '#E4E4E7',
      textAlign: 'center',
      fontWeight: 400,
      fontStyle: 'normal',
      decoration: 'none',
    },
  },
};

// 3. COMMERCE: PRODUCT_CARD
export const DEFAULT_PRODUCT_CARD_PREVIEW: ProductCardCommerceComponent = {
  id: 'preview-product-card',
  name: 'Product Card',
  type: 'COMMERCE',
  componentType: 'PRODUCT_CARD',
  config: {
    w: 'full',
    alignSelfX: 'stretch',
    alignSelfY: 'stretch',
    padding: { top: 'sm', bottom: 'sm', left: 'sm', right: 'sm' },
    surfaceTheme: 'surface',
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80',
      ratio: '1:1',
      scale: 'cover',
    },
    content: {
      layout: 'simple',
      header: {
        title: {
          value: 'Classic Butter Croissant',
          style: {
            textColor: '#18181B',
            textAlign: 'left',
            fontWeight: 'bold',
            fontStyle: 'normal',
            decoration: 'none',
          },
        },
        subtitle: {
          display: true,
          value: 'Flaky layers with French butter',
          style: {
            textColor: '#71717A',
            textAlign: 'left',
            fontWeight: 400,
            fontStyle: 'normal',
            decoration: 'none',
          },
        },
      },
      body: [
        {
          type: 'priceTag',
          display: true,
          value: '45.000',
          currency: 'VND',
          unit: 'cái',
          format: {
            showUnit: true,
            showCurrency: true,
            unitSeparator: '/',
          },
        },
        {
          type: 'ratings',
          display: true,
          value: '4.9',
          style: {
            textColor: '#EAB308',
            textAlign: 'left',
            fontWeight: 'semi-bold',
            fontStyle: 'normal',
            decoration: 'none',
          },
          ratingType: 'stars',
        },
      ],
    },
  },
};

// 4. LEAF: RICH_TEXT
export const DEFAULT_RICH_TEXT_PREVIEW: RichTextLeafComponent = {
  id: 'preview-rich-text',
  name: 'Rich Text Block',
  type: 'LEAF',
  componentType: 'RICH_TEXT',
  config: {
    w: 'full',
    alignSelfX: 'stretch',
    alignSelfY: 'stretch',
    padding: { top: 'sm', bottom: 'sm', left: 'sm', right: 'sm' },
    surfaceTheme: 'surface',
    content: {
      body: '<h3 style="font-size: 15px; font-weight: 700; color: #18181b; margin-bottom: 4px;">Our Baking Philosophy</h3><p style="font-size: 12px; color: #52525b; line-height: 1.45;">Every batch is naturally fermented for 24 hours to develop rich flavor, crisp crust, and an open crumb.</p>',
      format: 'html',
    },
  },
};

// 5. REPEATER: COLLECTION_GRID
export const DEFAULT_COLLECTION_GRID_PREVIEW: FlattenRepeaterComponent = {
  id: 'preview-collection-grid',
  name: 'Collection Grid',
  type: 'REPEATER',
  componentType: 'COLLECTION_GRID',
  itemTemplate: null,
  config: {
    w: 'full',
    alignSelfX: 'stretch',
    alignSelfY: 'stretch',
    padding: { top: 'none', bottom: 'none', left: 'none', right: 'none' },
    surfaceTheme: 'default',
    layout: 'pagination',
    pageSize: 8,
  },
};

export const COMPONENT_PREVIEWS: FlattenComponent[] = [
  DEFAULT_GRID_PREVIEW,
  DEFAULT_HERO_BANNER_PREVIEW,
  // DEFAULT_PRODUCT_CARD_PREVIEW,
  DEFAULT_RICH_TEXT_PREVIEW,
  // DEFAULT_COLLECTION_GRID_PREVIEW,
];

const COMPONENT_META: Record<string, ComponentPreviewMeta> = {
  'preview-grid': {
    category: 'Layout',
    description:
      'Multi-column container for organizing nested components into responsive rows and slots.',
    previewHeightClass: 'h-30',
  },
  'preview-hero-banner': {
    category: 'Commerce',
    description:
      'Full-width focal banner with background media, tinted overlay, and aligned headline copy.',
    previewHeightClass: 'h-38',
  },
  'preview-product-card': {
    category: 'Commerce',
    description:
      'Merchandising card displaying product thumbnail, title, pricing, and customer rating.',
    previewHeightClass: 'h-44',
  },
  'preview-rich-text': {
    category: 'Content',
    description:
      'Formatted editorial text block supporting headings, paragraphs, and inline styles.',
    previewHeightClass: 'h-28',
  },
  'preview-collection-grid': {
    category: 'Repeater',
    description:
      'Dynamic paginated grid that automatically repeats a template across storefront items.',
    previewHeightClass: 'h-36',
  },
};

const ComponentLibrary = ({ isOpen, toggleConfig }: ComponentLibraryProps) => {
  return (
    <aside
      aria-label='Component Library'
      className={`absolute top-0 bottom-0 left-0 z-50 flex flex-col min-w-0 w-90 pointer-events-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } bg-white border-r border-zinc-200 shadow-sm transition-transform duration-200 ease-out`}
    >
      <button
        type='button'
        aria-label={
          isOpen ? 'Collapse component library' : 'Expand component library'
        }
        className='absolute right-0 top-6 p-1 translate-x-full flex items-center justify-center rounded-r-md border-r border-y border-zinc-200 bg-white shadow-md text-zinc-600 hover:text-zinc-950'
        onClick={toggleConfig}
      >
        <Icon
          name='triangle-left'
          className={`transition-all duration-100 ${isOpen ? '' : 'rotate-180'}`}
        />
      </button>
      {/* Sidebar Header */}
      <div className='shrink-0 border-b border-zinc-100 px-5 py-4'>
        <h2 className='text-sm font-semibold text-zinc-900'>Components</h2>
        <p className='mt-0.5 text-xs text-zinc-500'>
          Drag a component onto any empty slot in the canvas.
        </p>
      </div>
      {/* Component Cards */}
      <div className='flex flex-col flex-1 min-h-0 gap-4 p-5 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-gutter-both'>
        {COMPONENT_PREVIEWS.map((c) => {
          const meta = COMPONENT_META[c.id];
          return (
            <div
              key={c.id}
              className='group flex flex-col gap-2 rounded-xl border border-zinc-200/90 bg-white p-3.5 shadow-2xs transition-all hover:border-zinc-300 hover:shadow-sm'
            >
              {/* Top: Component Name & Category */}
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-1.5 min-w-0'>
                  <Icon
                    name='grip-vertical'
                    width={14}
                    height={14}
                    className='shrink-0 text-zinc-400 transition-colors group-hover:text-zinc-600'
                  />
                  <span className='truncate text-xs font-semibold text-zinc-900'>
                    {c.name}
                  </span>
                </div>
                <span className='shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600'>
                  {meta?.category ?? c.type}
                </span>
              </div>

              {/* Middle: Framed Live Preview */}
              <div
                className={`relative w-full ${meta?.previewHeightClass ?? 'aspect-video'} overflow-hidden rounded-lg border border-zinc-200/80 bg-zinc-50 p-2 cursor-grab active:cursor-grabbing`}
                style={{
                  backgroundImage:
                    'radial-gradient(#d4d4d8 0.75px, transparent 0.75px)',
                  backgroundSize: '10px 10px',
                }}
              >
                <div className='relative h-full w-full overflow-hidden rounded-md'>
                  <NodeRenderer component={c} mode={NodeRendererMode.Preview} />
                </div>
              </div>

              {/* Bottom: Description */}
              {meta?.description && (
                <p className='text-[11px] leading-relaxed text-zinc-500'>
                  {meta.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default ComponentLibrary;
