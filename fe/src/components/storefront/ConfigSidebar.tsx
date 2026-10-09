import { BaseLayoutComponentConfig } from '@/types/layout-component';
import { useEffect, useState } from 'react';
import DimensionSection from './config-sections/DimensionSection';
import PaddingSection from './config-sections/PaddingSection';
import AlignmentSection from './config-sections/AlignmentSection';
import ThemeSection from './config-sections/ThemeSection';

export type SectionId = 'dimensions' | 'alignment' | 'padding' | 'theme';

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
  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>({
    dimensions: true,
    padding: true,
    alignment: true,
    theme: true,
  });

  const [activeSectionId, setActiveSectionId] = useState<SectionId | null>(
    null,
  );

  const toggleSection = (id: SectionId) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getSectionZIndex = (id: SectionId) => {
    if (activeSectionId === id) return 100;
    const sectionIds = Object.keys(openSections);
    return (sectionIds.length - sectionIds.indexOf(id)) * 10;
  };

  useEffect(() => {
    console.log('ConfigSidebar rendered with config:', config);
  }, [config]);

  return (
    <aside
      aria-label='Configuration Panel'
      className={`absolute top-0 bottom-0 right-0 z-50 min-w-0 w-[360px] ${isOpen ? 'translate-x-0' : 'translate-x-full'} bg-white border-l border-zinc-200 transition-transform duration-200 ease-out`}
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
          id='dimensions'
          title='Dimensions'
          description='Adjust the width and height of the component.'
          isOpen={openSections.dimensions}
          toggleSection={toggleSection}
          dimensions={{ w: config.w, h: config.h }}
          onUpdate={onUpdate}
          onActiveSectionChange={(isActive) =>
            setActiveSectionId(isActive ? 'dimensions' : null)
          }
          zIndex={getSectionZIndex('dimensions')}
        />
        <PaddingSection
          id='padding'
          title='Padding'
          description='Adjust the padding of the component.'
          isOpen={openSections.padding}
          toggleSection={toggleSection}
          padding={config.padding}
          onUpdate={onUpdate}
          onActiveSectionChange={(isActive) =>
            setActiveSectionId(isActive ? 'padding' : null)
          }
          zIndex={getSectionZIndex('padding')}
        />
        <AlignmentSection
          id='alignment'
          title='Alignment'
          description='Set the horizontal and vertical alignment of the component.'
          isOpen={openSections.alignment}
          toggleSection={toggleSection}
          alignment={{ horizontal: config.alignX, vertical: config.alignY }}
          onUpdate={onUpdate}
          onActiveSectionChange={(isActive) =>
            setActiveSectionId(isActive ? 'alignment' : null)
          }
          zIndex={getSectionZIndex('alignment')}
        />
        <ThemeSection
          id='theme'
          title='Theme'
          description='Adjust the theme of the component.'
          isOpen={openSections.theme}
          toggleSection={toggleSection}
          theme={{
            colorScheme: config.colorScheme,
            colorPalette: config.colorPalette,
          }}
          onUpdate={onUpdate}
          onActiveSectionChange={(isActive) =>
            setActiveSectionId(isActive ? 'theme' : null)
          }
          zIndex={getSectionZIndex('theme')}
        />
      </div>
    </aside>
  );
};

export default ConfigSidebar;
