import { HeroBannerCommerceComponent } from '@/types/layout-component/commerce-component';
import HeroContentSection from '../config-sections/hero-banner/HeroContentSection';
import HeroOverlaySection from '../config-sections/hero-banner/HeroOverlaySection';
import { InspectorProps } from './registry';

export type HeroBannerSectionId = 'hero-overlay' | 'hero-content';

type HeroBannerInspectorProps = InspectorProps<HeroBannerCommerceComponent>;

const HeroBannerInspector = ({
  component,
  openSections,
  toggleSection,
  onUpdate,
  onActiveSectionChange,
  getSectionZIndex,
  currentBp,
}: HeroBannerInspectorProps) => {
  const { config } = component;

  return (
    <>
      <HeroOverlaySection
        isOpen={Boolean(openSections['hero-overlay'])}
        toggleSection={toggleSection}
        overlay={config.overlay}
        onUpdate={onUpdate}
        onActiveSectionChange={(active) => {
          if (active) onActiveSectionChange('hero-overlay');
        }}
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
        onActiveSectionChange={(active) => {
          if (active) onActiveSectionChange('hero-content');
        }}
        zIndex={getSectionZIndex('hero-content')}
        currentBp={currentBp}
      />
    </>
  );
};

export default HeroBannerInspector;
