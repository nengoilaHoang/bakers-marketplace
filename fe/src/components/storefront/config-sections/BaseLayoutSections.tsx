// components/storefront/config-sections/BaseLayoutSections.tsx
import { BaseLayoutComponentConfig } from '@/types/layout-component';
import { SectionId } from '../ConfigSidebar';
import AlignmentSection from './AlignmentSection';
import BentoSection from './BentoSection';
import DimensionSection from './DimensionSection';
import PaddingSection from './PaddingSection';
import ThemeSection from './ThemeSection';

type BaseLayoutSectionsProps = {
  config: BaseLayoutComponentConfig<unknown>;
  openSections: Record<string, boolean | undefined>;
  toggleSection: (id: SectionId) => void;
  onUpdate: (pathname: string, value: unknown) => void;
  onActiveSectionChange: (id: SectionId | null) => void;
  getSectionZIndex: (id: SectionId) => number;
};

const BaseLayoutSections = ({
  config,
  openSections,
  toggleSection,
  onUpdate,
  onActiveSectionChange,
  getSectionZIndex,
}: BaseLayoutSectionsProps) => {
  const hasPadding = 'padding' in config && config.padding !== undefined;
  const hasSurfaceTheme =
    'surfaceTheme' in config && config.surfaceTheme !== undefined;
  const hasBentoConfig = Boolean(config.colSpan && config.rowSpan);

  return (
    <>
      <DimensionSection
        isOpen={Boolean(openSections.dimensions)}
        toggleSection={toggleSection}
        dimensions={{ w: config.w, h: config.h }}
        onUpdate={onUpdate}
        onActiveSectionChange={(active) =>
          onActiveSectionChange(active ? 'dimensions' : null)
        }
        zIndex={getSectionZIndex('dimensions')}
        isBento={hasBentoConfig}
      />

      <AlignmentSection
        isOpen={Boolean(openSections.alignment)}
        toggleSection={toggleSection}
        alignment={{
          horizontal: config.alignSelfX,
          vertical: config.alignSelfY,
        }}
        onUpdate={onUpdate}
        onActiveSectionChange={(active) =>
          onActiveSectionChange(active ? 'alignment' : null)
        }
        zIndex={getSectionZIndex('alignment')}
      />

      {hasPadding && (
        <PaddingSection
          isOpen={Boolean(openSections.padding)}
          toggleSection={toggleSection}
          paddings={config.padding!}
          onUpdate={onUpdate}
          onActiveSectionChange={(active) =>
            onActiveSectionChange(active ? 'padding' : null)
          }
          zIndex={getSectionZIndex('padding')}
        />
      )}

      {hasSurfaceTheme && (
        <ThemeSection
          isOpen={Boolean(openSections['surface-theme'])}
          toggleSection={toggleSection}
          surfaceTheme={config.surfaceTheme!}
          onUpdate={onUpdate}
          onActiveSectionChange={(active) =>
            onActiveSectionChange(active ? 'surface-theme' : null)
          }
          zIndex={getSectionZIndex('surface-theme')}
        />
      )}

      {hasBentoConfig && (
        <BentoSection
          isOpen={Boolean(openSections.bento)}
          toggleSection={toggleSection}
          span={{
            col: config.colSpan!,
            row: config.rowSpan!,
          }}
          onUpdate={onUpdate}
          onActiveSectionChange={(active) =>
            onActiveSectionChange(active ? 'bento' : null)
          }
          zIndex={getSectionZIndex('bento')}
        />
      )}
    </>
  );
};

export default BaseLayoutSections;
