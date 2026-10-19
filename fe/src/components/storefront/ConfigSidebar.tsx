import { BaseLayoutComponentConfig } from '@/types/layout-component';
import { useState } from 'react';
import AlignmentSection from './config-sections/AlignmentSection';
import BentoSection from './config-sections/BentoSection';
import DimensionSection from './config-sections/DimensionSection';
import PaddingSection from './config-sections/PaddingSection';
import ThemeSection from './config-sections/ThemeSection';

export type SectionId =
  | 'dimensions'
  | 'alignment'
  | 'padding'
  | 'surfaceTheme'
  | 'bento';

type ConfigSidebarProps<T extends BaseLayoutComponentConfig<unknown>> = {
  isOpen: boolean;
  toggleConfig: () => void;
  config: T;
  onUpdate: (pathname: string, value: unknown) => void;
};

const ConfigSidebar = <T extends BaseLayoutComponentConfig<unknown>>({
  isOpen,
  toggleConfig,
  config,
  onUpdate,
}: ConfigSidebarProps<T>) => {
  const hadPadding = 'padding' in config;
  const hasSurfaceTheme = 'surfaceTheme' in config;
  const hasBentoConfig = !!config.colSpan && !!config.rowSpan;

  const [openSections, setOpenSections] = useState({
    dimensions: true,
    alignment: true,
    surfaceTheme: hasSurfaceTheme ? true : undefined,
    padding: hadPadding ? true : undefined,
    bento: hasBentoConfig ? true : undefined,
  });

  const [activeSectionId, setActiveSectionId] = useState<SectionId | null>(
    null,
  );

  const toggleSection = (id: SectionId) => {
    setOpenSections((prev) => {
      if (prev[id] === undefined) return prev;
      return { ...prev, [id]: !prev[id] };
    });
  };

  const getSectionZIndex = (id: SectionId) => {
    if (activeSectionId === id) return 100;
    const sectionIds = Object.keys(openSections).filter(
      (key) => openSections[key as SectionId] !== undefined,
    );
    return (sectionIds.length - sectionIds.indexOf(id)) * 10;
  };

  return (
    <aside
      aria-label='Configuration Panel'
      className={`absolute top-0 bottom-0 right-0 z-50 min-w-0 w-90 ${isOpen ? 'translate-x-0' : 'translate-x-full'} bg-white border-l border-zinc-200 transition-transform duration-200 ease-out`}
    >
      <button
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

      <div className='flex flex-col h-full min-h-0 gap-3 p-6 flex-1 divide-y divide-zinc-100 overflow-y-auto scroll-smooth scroll-m-0 scroll-p-0 scrollbar-thin scrollbar-gutter-both'>
        <DimensionSection
          isOpen={openSections.dimensions}
          toggleSection={toggleSection}
          dimensions={{ w: config.w, h: config.h }}
          onUpdate={onUpdate}
          onActiveSectionChange={(isActive) =>
            setActiveSectionId(isActive ? 'dimensions' : null)
          }
          zIndex={getSectionZIndex('dimensions')}
          isBento={hasBentoConfig}
        />
        {hadPadding && openSections.padding && (
          <PaddingSection
            isOpen={openSections.padding}
            toggleSection={toggleSection}
            padding={config.padding}
            onUpdate={onUpdate}
            onActiveSectionChange={(isActive) =>
              setActiveSectionId(isActive ? 'padding' : null)
            }
            zIndex={getSectionZIndex('padding')}
          />
        )}
        <AlignmentSection
          isOpen={openSections.alignment}
          toggleSection={toggleSection}
          alignment={{
            horizontal: config.alignSelfX,
            vertical: config.alignSelfY,
          }}
          onUpdate={onUpdate}
          onActiveSectionChange={(isActive) =>
            setActiveSectionId(isActive ? 'alignment' : null)
          }
          zIndex={getSectionZIndex('alignment')}
        />
        {hasSurfaceTheme && openSections.surfaceTheme && (
          <ThemeSection
            isOpen={openSections.surfaceTheme}
            toggleSection={toggleSection}
            surfaceTheme={config.surfaceTheme}
            onUpdate={onUpdate}
            onActiveSectionChange={(isActive) =>
              setActiveSectionId(isActive ? 'surfaceTheme' : null)
            }
            zIndex={getSectionZIndex('surfaceTheme')}
          />
        )}
        {hasBentoConfig && openSections.bento && (
          <BentoSection
            isOpen={openSections.bento}
            toggleSection={toggleSection}
            span={{
              col: config.colSpan!,
              row: config.rowSpan!,
            }}
            onUpdate={onUpdate}
            onActiveSectionChange={(isActive) =>
              setActiveSectionId(isActive ? 'bento' : null)
            }
            zIndex={getSectionZIndex('bento')}
          />
        )}
      </div>
    </aside>
  );
};

export default ConfigSidebar;
