// components/storefront/ConfigSidebar.tsx
import { FlattenComponent } from '@/utils/flattenLayout';
import { useMemo, useState } from 'react';
import BaseLayoutSections from './config-sections/BaseLayoutSections';
import { COMPONENT_INSPECTORS } from './inspectors/registry';

export type SectionId =
  | 'dimensions'
  | 'alignment'
  | 'padding'
  | 'surface-theme'
  | 'bento'
  | 'hero-overlay'
  | 'hero-content';

type ConfigSidebarProps = {
  isOpen: boolean;
  toggleConfig: () => void;
  component: FlattenComponent;
  onUpdate: (pathname: string, value: unknown) => void;
};

const ConfigSidebar = ({
  isOpen,
  toggleConfig,
  component,
  onUpdate,
}: ConfigSidebarProps) => {
  const isBentoItem =
    component.config.colSpan !== undefined ||
    component.config.rowSpan !== undefined;

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    dimensions: true,
    alignment: false,
    padding: false,
    'surface-theme': false,
    ...(isBentoItem && { bento: false }),
    ...(component.componentType === 'HERO_BANNER' && {
      'hero-overlay': false,
      'hero-content': false,
    }),
  });

  const [activeSectionId, setActiveSectionId] = useState<SectionId | null>(
    null,
  );

  const toggleSection = (id: SectionId) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sectionOrder: SectionId[] = useMemo(
    () =>
      [
        'dimensions',
        'alignment',
        'padding',
        'surface-theme',
        'bento',
        'hero-overlay',
        'hero-content',
      ].filter((id) => id in openSections) as SectionId[],
    [openSections],
  );

  const getSectionZIndex = (id: SectionId) => {
    if (activeSectionId === id) return 100;
    const index = sectionOrder.indexOf(id);
    return index !== -1 ? (sectionOrder.length - index) * 10 : 10;
  };

  // Lookup custom inspector for componentType
  const SpecificInspector = COMPONENT_INSPECTORS[component.componentType];

  return (
    <aside
      aria-label='Configuration Panel'
      className={`absolute top-0 bottom-0 right-0 z-50 min-w-0 w-90 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } bg-white border-l border-zinc-200 transition-transform duration-200 ease-out`}
    >
      <button
        aria-label={
          isOpen
            ? 'Collapse configuration sidebar'
            : 'Expand configuration sidebar'
        }
        className='absolute left-0 top-6 p-1 -translate-x-full flex items-center justify-center rounded-l-md border-l border-y border-zinc-200 bg-white shadow-md text-zinc-600 hover:text-zinc-950'
        onClick={toggleConfig}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='16'
          height='16'
          fill='currentColor'
          className={`transition-all duration-100 ${isOpen ? 'rotate-180' : ''}`}
          viewBox='0 0 16 16'
        >
          <path d='m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z' />
        </svg>
      </button>

      <div className='flex flex-col h-full min-h-0 gap-3 p-6 flex-1 divide-y divide-zinc-100 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-gutter-both'>
        <div className='pb-2'>
          <p className='text-[11px] font-bold tracking-wider uppercase text-zinc-400'>
            {component.type} &bull; {component.componentType}
          </p>
          <h2 className='text-sm font-semibold text-zinc-900'>
            {component.name}
          </h2>
        </div>

        {/* 1. Component-Specific Inspector */}
        {SpecificInspector && (
          <SpecificInspector
            component={component}
            openSections={openSections}
            toggleSection={toggleSection}
            onUpdate={onUpdate}
            onActiveSectionChange={setActiveSectionId}
            getSectionZIndex={getSectionZIndex}
          />
        )}

        {/* 2. Shared Base Layout Inspector */}
        <BaseLayoutSections
          config={component.config}
          openSections={openSections}
          toggleSection={toggleSection}
          onUpdate={onUpdate}
          onActiveSectionChange={setActiveSectionId}
          getSectionZIndex={getSectionZIndex}
        />
      </div>
    </aside>
  );
};

export default ConfigSidebar;
