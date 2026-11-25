import { ProductCardCommerceComponent } from '@/types/layout-component/commerce-component';
import ProductCardBodySection from '../config-sections/product-card/ProductCardBodySection';
import ProductCardHeaderSection from '../config-sections/product-card/ProductCardHeaderSection';
import ProductCardThumbnailSection from '../config-sections/product-card/ProductCardThumbnailSection';
import { InspectorProps } from './registry';

export type ProductCardSectionId =
  | 'product-card-thumbnail'
  | 'product-card-header'
  | 'product-card-body';

type ProductCardInspectorProps = InspectorProps<ProductCardCommerceComponent>;

const ProductCardInspector = ({
  component,
  openSections,
  toggleSection,
  onUpdate,
  onActiveSectionChange,
  getSectionZIndex,
}: ProductCardInspectorProps) => {
  const { config } = component;
  const { header, body } = config.content;

  return (
    <>
      <ProductCardThumbnailSection
        isOpen={Boolean(openSections['product-card-thumbnail'])}
        toggleSection={() => toggleSection('product-card-thumbnail')}
        thumbnail={{
          url: config.thumbnail.url,
          ratio: config.thumbnail.ratio,
          fit: config.thumbnail.fit,
        }}
        onUpdate={onUpdate}
        onActiveSectionChange={(active) =>
          onActiveSectionChange(active ? 'product-card-thumbnail' : null)
        }
        zIndex={getSectionZIndex('product-card-thumbnail')}
      />
      <ProductCardHeaderSection
        isOpen={Boolean(openSections['product-card-header'])}
        toggleSection={() => toggleSection('product-card-header')}
        title={header.title}
        subtitle={header.subtitle}
        onUpdate={onUpdate}
        onActiveSectionChange={(active) =>
          onActiveSectionChange(active ? 'product-card-header' : null)
        }
        zIndex={getSectionZIndex('product-card-header')}
      />
      <ProductCardBodySection
        isOpen={Boolean(openSections['product-card-body'])}
        toggleSection={() => toggleSection('product-card-body')}
        body={body}
        onUpdate={onUpdate}
        onActiveSectionChange={(active) =>
          onActiveSectionChange(active ? 'product-card-body' : null)
        }
        zIndex={getSectionZIndex('product-card-body')}
      />
    </>
  );
};

export default ProductCardInspector;
