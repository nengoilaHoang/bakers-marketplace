import { HeroBannerCommerceComponent } from '@/types/layout-component/commerce-component';
import HeroContentSection from '../config-sections/hero-banner/HeroContentSection';
import HeroOverlaySection from '../config-sections/hero-banner/HeroOverlaySection';
import { InspectorProps } from './registry';

type HeroBannerInspectorProps = InspectorProps<HeroBannerCommerceComponent>;

const HeroBannerInspector = ({
  component,
  openSections,
  toggleSection,
  onUpdate,
  onActiveSectionChange,
  getSectionZIndex,
}: HeroBannerInspectorProps) => {
  const { config } = component;

  return (
    <>
      <HeroOverlaySection
        isOpen={Boolean(openSections['hero-overlay'])}
        toggleSection={toggleSection}
        overlay={config.overlay}
        onUpdate={onUpdate}
        onActiveSectionChange={(active) =>
          onActiveSectionChange(active ? 'hero-overlay' : null)
        }
        zIndex={getSectionZIndex('hero-overlay')}
      />
      <HeroContentSection
        isOpen={Boolean(openSections['hero-content'])}
        toggleSection={toggleSection}
        content={{
          title: config.title,
          subtitle: config.subtitle,
          eyebrow: config.eyebrow,
          contentPosition: config.contentPosition,
          contentSize: config.contentSize,
        }}
        onUpdate={onUpdate}
        onActiveSectionChange={(active) =>
          onActiveSectionChange(active ? 'hero-content' : null)
        }
        zIndex={getSectionZIndex('hero-content')}
      />
    </>
  );
};

export default HeroBannerInspector;
