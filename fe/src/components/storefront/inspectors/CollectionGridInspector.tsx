import { FlattenCollectionGridRepeaterComponent } from '@/utils/flattenLayout';
import CollectionGridDataSourceSection from '../config-sections/collection-grid/CollectionGridDataSourceSection';
import CollectionGridLayoutSection from '../config-sections/collection-grid/CollectionGridLayoutSection';
import { InspectorProps } from './registry';

export type CollectionGridSectionId =
  | 'collection-grid-data-source'
  | 'collection-grid-layout';

type CollectionGridInspectorProps =
  InspectorProps<FlattenCollectionGridRepeaterComponent>;

const CollectionGridInspector = ({
  component,
  openSections,
  toggleSection,
  onUpdate,
  onActiveSectionChange,
  getSectionZIndex,
  currentBp,
}: CollectionGridInspectorProps) => {
  const { config } = component;

  return (
    <>
      <CollectionGridDataSourceSection
        isOpen={Boolean(openSections['collection-grid-data-source'])}
        toggleSection={() => toggleSection('collection-grid-data-source')}
        dataSource={config.dataSource}
        onUpdate={onUpdate}
        onActiveSectionChange={(active) =>
          onActiveSectionChange(active ? 'collection-grid-data-source' : null)
        }
        zIndex={getSectionZIndex('collection-grid-data-source')}
      />
      <CollectionGridLayoutSection
        isOpen={Boolean(openSections['collection-grid-layout'])}
        toggleSection={() => toggleSection('collection-grid-layout')}
        layout={config.layout ?? 'pagination'}
        pageSize={'pageSize' in config ? config.pageSize : 8}
        cols={config.cols ?? { desktop: 4, tablet: 2, mobile: 1 }}
        gap={config.gap ?? { desktop: 16, tablet: 16, mobile: 12 }}
        onUpdate={onUpdate}
        onActiveSectionChange={(active) =>
          onActiveSectionChange(active ? 'collection-grid-layout' : null)
        }
        zIndex={getSectionZIndex('collection-grid-layout')}
        currentBp={currentBp}
      />
    </>
  );
};

export default CollectionGridInspector;
