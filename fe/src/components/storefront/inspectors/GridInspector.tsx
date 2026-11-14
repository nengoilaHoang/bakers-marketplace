import { FlattenCompositeComponent } from '@/utils/flattenLayout';
import GridLayoutSection from '../config-sections/grid/GridLayoutSection';
import GridTrackSection from '../config-sections/grid/GridTracksSection';
import { InspectorProps } from './registry';

export type GridSectionId = 'grid-layout' | 'grid-tracks';

type GridInspectorProps = InspectorProps<FlattenCompositeComponent>;

const GridInspector = ({
  component,
  openSections,
  toggleSection,
  onUpdate,
  onActiveSectionChange,
  getSectionZIndex,
  currentBp,
}: GridInspectorProps) => {
  const { config } = component;

  return (
    <>
      <GridLayoutSection
        isOpen={Boolean(openSections['grid-layout'])}
        toggleSection={() => toggleSection('grid-layout')}
        layout={config.layout ?? 'UNIFORM'}
        cols={config.cols ?? { desktop: 2, tablet: 2, mobile: 1 }}
        rows={config.rows}
        densePacking={Boolean(config.densePacking)}
        onUpdate={onUpdate}
        onActiveSectionChange={(active) =>
          onActiveSectionChange(active ? 'grid-layout' : null)
        }
        zIndex={getSectionZIndex('grid-layout')}
        currentBp={currentBp}
      />
      <GridTrackSection
        isOpen={Boolean(openSections['grid-tracks'])}
        toggleSection={() => toggleSection('grid-tracks')}
        rowHeight={config.rowHeight}
        gap={config.gap}
        onUpdate={onUpdate}
        onActiveSectionChange={(active) =>
          onActiveSectionChange(active ? 'grid-tracks' : null)
        }
        zIndex={getSectionZIndex('grid-tracks')}
        currentBp={currentBp}
      />
    </>
  );
};

export default GridInspector;
