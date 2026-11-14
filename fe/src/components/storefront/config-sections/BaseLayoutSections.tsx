// components/storefront/config-sections/BaseLayoutSections.tsx
import { DeviceBreakpoint } from '@/types/canvas';
import { BaseLayoutComponentConfig } from '@/types/layout-component';
import { SectionId } from '../ComponentInspector';
import AlignmentSection from './AlignmentSection';
import BentoSection from './BentoSection';
import DimensionSection from './DimensionSection';
import PaddingSection from './PaddingSection';
import ThemeSection from './ThemeSection';

type BaseLayoutSectionsProps = {
  config: BaseLayoutComponentConfig<unknown>;
  openSections: Record<string, boolean | undefined>;
  toggleSection: (id: SectionId) => void;
  onUpdate: (pathname: string, value: unknown, bp?: string) => void;
  onActiveSectionChange: (id: SectionId | null) => void;
  getSectionZIndex: (id: SectionId) => number;
  currentBp: DeviceBreakpoint;
};

const BaseLayoutSections = ({
  config,
  openSections,
  toggleSection,
  onUpdate,
  onActiveSectionChange,
  getSectionZIndex,
  currentBp,
}: BaseLayoutSectionsProps) => {
  const hasPadding = 'padding' in config && config.padding !== undefined;
  const hasSurfaceTheme =
    'surfaceTheme' in config && config.surfaceTheme !== undefined;
  const colSpan = config.colSpan?.[currentBp];
  const rowSpan = config.rowSpan?.[currentBp];
  const hasBentoConfig = colSpan !== undefined && rowSpan !== undefined;

  return (
    <>
      <DimensionSection
        isOpen={Boolean(openSections.dimensions)}
        toggleSection={() => toggleSection('dimensions')}
        dimensions={{ w: config.w, h: 'h' in config ? config.h : undefined }}
        onUpdate={onUpdate}
        onActiveSectionChange={(active) =>
          onActiveSectionChange(active ? 'dimensions' : null)
        }
        zIndex={getSectionZIndex('dimensions')}
        isBento={hasBentoConfig}
      />

      <AlignmentSection
        isOpen={Boolean(openSections.alignment)}
        toggleSection={() => toggleSection('alignment')}
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
          toggleSection={() => toggleSection('padding')}
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
          isOpen={Boolean(openSections['theme'])}
          toggleSection={() => toggleSection('theme')}
          surfaceTheme={config.surfaceTheme!}
          onUpdate={onUpdate}
          onActiveSectionChange={(active) =>
            onActiveSectionChange(active ? 'theme' : null)
          }
          zIndex={getSectionZIndex('theme')}
        />
      )}

      {hasBentoConfig && (
        <BentoSection
          isOpen={Boolean(openSections.bento)}
          toggleSection={() => toggleSection('bento')}
          span={{
            col: colSpan,
            row: rowSpan,
          }}
          onUpdate={(pathname, value) => onUpdate(pathname, value, currentBp)}
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
